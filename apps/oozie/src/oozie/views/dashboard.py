#!/usr/bin/env python
# Licensed to Cloudera, Inc. under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  Cloudera, Inc. licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

try:
  import json
except ImportError:
  import simplejson as json
import logging

from django.forms.formsets import formset_factory
from django.http import HttpResponse
from django.utils.functional import wraps
from django.utils.translation import ugettext as _
from django.core.urlresolvers import reverse
from django.shortcuts import redirect

from desktop.lib.django_util import render
from desktop.lib.exceptions_renderable import PopupException
from desktop.lib.rest.http_client import RestException
from desktop.log.access import access_warn
from liboozie.oozie_api import get_oozie
from liboozie.submittion import Submission
from oozie.forms import RerunForm, ParameterForm


from oozie.conf import OOZIE_JOBS_COUNT
from oozie.models import History, Job
from oozie.settings import DJANGO_APPS


LOG = logging.getLogger(__name__)


"""
Permissions:

A Workflow/Coordinator can:
  * be accessed only by its owner or a superuser or by a user with 'dashboard_jobs_access' permissions
  * be submitted/modified only by its owner or a superuser

Permissions checking happens by calling:
  * check_job_access_permission()
  * check_job_edition_permission()
"""


def manage_oozie_jobs(request, job_id, action):
  if request.method != 'POST':
    raise PopupException(_('Use a POST request to manage an Oozie job.'))

  job = check_job_access_permission(request, job_id)
  check_job_edition_permission(job, request.user)

  response = {'status': -1, 'data': ''}

  try:
    response['data'] = get_oozie().job_control(job_id, action)
    response['status'] = 0
    if 'notification' in request.POST:
      request.info(_(request.POST.get('notification')))
  except RestException, ex:
    response['data'] = _("Error performing %s on Oozie job %s: %s.") % (action, job_id, ex.message)

  return HttpResponse(json.dumps(response), mimetype="application/json")


def show_oozie_error(view_func):
  def decorate(request, *args, **kwargs):
    try:
      return view_func(request, *args, **kwargs)
    except RestException, ex:
      detail = ex._headers.get('oozie-error-message', ex)
      if 'urlopen error' in str(detail):
        detail = '%s: %s' % (_('The Oozie server is not running'), detail)
      raise PopupException(_('An error with Oozie occurred.'), detail=detail)
  return wraps(view_func)(decorate)


@show_oozie_error
def list_oozie_workflows(request):
  kwargs = {'cnt': OOZIE_JOBS_COUNT.get(),}
  if not has_dashboard_jobs_access(request.user):
    kwargs['user'] = request.user.username

  workflows = get_oozie().get_workflows(**kwargs)

  return render('dashboard/list_oozie_workflows.mako', request, {
    'user': request.user,
    'jobs': split_oozie_jobs(workflows.jobs),
    'has_job_edition_permission':  has_job_edition_permission,
  })


@show_oozie_error
def list_oozie_coordinators(request):
  kwargs = {'cnt': OOZIE_JOBS_COUNT.get(),}
  if not has_dashboard_jobs_access(request.user):
    kwargs['user'] = request.user.username

  coordinators = get_oozie().get_coordinators(**kwargs)

  return render('dashboard/list_oozie_coordinators.mako', request, {
    'jobs': split_oozie_jobs(coordinators.jobs),
    'has_job_edition_permission': has_job_edition_permission,
  })


@show_oozie_error
def list_oozie_workflow(request, job_id, coordinator_job_id=None):
  oozie_workflow = check_job_access_permission(request, job_id)

  oozie_coordinator = None
  if coordinator_job_id is not None:
    oozie_coordinator = check_job_access_permission(request, coordinator_job_id)

  history = History.cross_reference_submission_history(request.user, job_id, coordinator_job_id)

  hue_coord = history and history.get_coordinator() or History.get_coordinator_from_config(oozie_workflow.conf_dict)
  hue_workflow = (hue_coord and hue_coord.workflow) or (history and history.get_workflow()) or History.get_workflow_from_config(oozie_workflow.conf_dict)

  if hue_coord: Job.objects.is_accessible_or_exception(request, hue_coord.workflow.id)
  if hue_workflow: Job.objects.is_accessible_or_exception(request, hue_workflow.id)

  parameters = oozie_workflow.conf_dict.copy()

  return render('dashboard/list_oozie_workflow.mako', request, {
    'history': history,
    'oozie_workflow': oozie_workflow,
    'oozie_coordinator': oozie_coordinator,
    'hue_workflow': hue_workflow,
    'hue_coord': hue_coord,
    'parameters': parameters,
    'has_job_edition_permission': has_job_edition_permission,
  })


@show_oozie_error
def list_oozie_coordinator(request, job_id):
  oozie_coordinator = check_job_access_permission(request, job_id)

  # Cross reference the submission history (if any)
  coordinator = None
  try:
    coordinator = History.objects.get(oozie_job_id=job_id).job.get_full_node()
  except History.DoesNotExist:
    pass

  return render('dashboard/list_oozie_coordinator.mako', request, {
    'oozie_coordinator': oozie_coordinator,
    'coordinator': coordinator,
    'has_job_edition_permission': has_job_edition_permission,
  })


@show_oozie_error
def list_oozie_workflow_action(request, action):
  try:
    action = get_oozie().get_action(action)
    workflow = check_job_access_permission(request, action.id.split('@')[0])
  except RestException, ex:
    raise PopupException(_("Error accessing Oozie action %s.") % (action,),
                         detail=ex.message)

  return render('dashboard/list_oozie_workflow_action.mako', request, {
    'action': action,
    'workflow': workflow,
  })


@show_oozie_error
def rerun_oozie_job(request, job_id, app_path):
  ParametersFormSet = formset_factory(ParameterForm, extra=0)
  oozie_workflow = check_job_access_permission(request, job_id)

  if request.method == 'POST':
    rerun_form = RerunForm(request.POST, oozie_workflow=oozie_workflow)
    params_form = ParametersFormSet(request.POST)

    if sum([rerun_form.is_valid(), params_form.is_valid()]) == 2:
      args = {}

      if request.POST['rerun_form_choice'] == 'fail_nodes':
        args['fail_nodes'] = 'true'
      else:
        args['skip_nodes'] = ','.join(rerun_form.cleaned_data['skip_nodes'])
      args['deployment_dir'] = app_path

      mapping = dict([(param['name'], param['value']) for param in params_form.cleaned_data])

      _rerun_workflow(request, job_id, args, mapping)

      request.info(_('Workflow re-running.'))
      return redirect(reverse('oozie:list_oozie_workflow', kwargs={'job_id': job_id}))
    else:
      request.error(_('Invalid submission form: %s %s' % (rerun_form.errors, params_form.errors)))
  else:
    rerun_form = RerunForm(oozie_workflow=oozie_workflow)
    initial_params = ParameterForm.get_initial_params(oozie_workflow.conf_dict)
    params_form = ParametersFormSet(initial=initial_params)

  popup = render('dashboard/rerun_job_popup.mako', request, {
                   'rerun_form': rerun_form,
                   'params_form': params_form,
                   'action': reverse('oozie:rerun_oozie_job', kwargs={'job_id': job_id, 'app_path': app_path}),
                 }, force_template=True).content

  return HttpResponse(json.dumps(popup), mimetype="application/json")


def _rerun_workflow(request, oozie_id, run_args, mapping):
  try:
    submission = Submission(user=request.user, fs=request.fs, properties=mapping, oozie_id=oozie_id)
    job_id = submission.rerun(**run_args)
    return job_id
  except RestException, ex:
    raise PopupException(_("Error rerunning workflow %s") % (oozie_id,),
                         detail=ex._headers.get('oozie-error-message', ex))


def split_oozie_jobs(oozie_jobs):
  jobs = {}
  jobs_running = []
  jobs_completed = []

  for job in oozie_jobs:
    if job.is_running():
      if job.type == 'Workflow':
        job = get_oozie().get_job(job.id)
      else:
        job = get_oozie().get_coordinator(job.id)
      jobs_running.append(job)
    else:
      jobs_completed.append(job)

  jobs['running_jobs'] = sorted(jobs_running, key=lambda w: w.status)
  jobs['completed_jobs'] = sorted(jobs_completed, key=lambda w: w.status)

  return jobs


def check_job_access_permission(request, job_id):
  """
  Decorator ensuring that the user has access to the workflow or coordinator.

  Arg: 'workflow' or 'coordinator' oozie id.
  Return: the Oozie workflow of coordinator or raise an exception

  Notice: its gets an id in input and returns the full object in output (not an id).
  """
  if job_id is not None:
    if job_id.endswith('W'):
      get_job = get_oozie().get_job
    else:
      get_job = get_oozie().get_coordinator

    try:
      oozie_job = get_job(job_id)
    except RestException, ex:
      raise PopupException(_("Error accessing Oozie job %s.") % (job_id,),
                           detail=ex._headers['oozie-error-message'])

  if request.user.is_superuser \
      or oozie_job.user == request.user.username \
      or has_dashboard_jobs_access(request.user):
    return oozie_job
  else:
    message = _("Permission denied. %(username)s don't have the permissions to access job %(id)s.") % \
        {'username': request.user.username, 'id': oozie_job.id}
    access_warn(request, message)
    raise PopupException(message)


def check_job_edition_permission(oozie_job, user):
  if has_job_edition_permission(oozie_job, user):
    return oozie_job
  else:
    message = _("Permission denied. %(username)s don't have the permissions to modify job %(id)s.") % \
        {'username': user.username, 'id': oozie_job.id}
    raise PopupException(message)


def has_job_edition_permission(oozie_job, user):
  return user.is_superuser or oozie_job.user == user.username


def has_dashboard_jobs_access(user):
  return user.is_superuser or user.has_hue_permission(action="dashboard_jobs_access", app=DJANGO_APPS[0])
