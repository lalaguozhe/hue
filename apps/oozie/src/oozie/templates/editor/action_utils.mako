## Licensed to Cloudera, Inc. under one
## or more contributor license agreements.  See the NOTICE file
## distributed with this work for additional information
## regarding copyright ownership.  Cloudera, Inc. licenses this file
## to you under the Apache License, Version 2.0 (the
## "License"); you may not use this file except in compliance
## with the License.  You may obtain a copy of the License at
##
##     http://www.apache.org/licenses/LICENSE-2.0
##
## Unless required by applicable law or agreed to in writing, software
## distributed under the License is distributed on an "AS IS" BASIS,
## WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
## See the License for the specific language governing permissions and
## limitations under the License.

<%!
  from django.utils.translation import ugettext as _
%>

<%namespace name="utils" file="../utils.inc.mako" />


<%def name="action_form(action_form, node_type, template=True)">
% if template:
  <script type="text/html" id="${node_type}EditTemplate">
% endif
  <div data-bind="with: context">
    <form class="form-horizontal" id="${node_type}-action-form" method="POST">
      <div class="modal-header">
        <a href="#" class="close" data-dismiss="modal">&times;</a>
        <h3 class="message" data-bind="text: '${_('Edit Node: ')}' + name()"></h3>
      </div>

      <div class="modal-content">
        <fieldset class="span12">
          % for field in action_form:
            % if field.html_name in ('name', 'description'):
              ${ utils.render_field(field, extra_attrs={'data-bind': 'value: %s' % field.name}) }
            % endif
          % endfor

          ${ utils.render_constant(_('Action type'), node_type) }

          <hr/>

          <div class="control-group">
            <label class="control-label"></label>
            <div class="controls">
            <p class="alert alert-info span5">
              ${ _('All the paths are relative to the deployment directory. They can be absolute but this is not recommended.') }
              <br/>
              ${ _('You can parameterize values using case sensitive') } <code>${"${"}PARAMETER}</code>.
            </p>
            % if node_type == 'ssh':
              <p class="alert alert-warn span5">
                ${ _('The ssh server requires passwordless login') }.
              </p>
            % endif
            </div>
          </div>

          % for field in action_form:
            % if field.html_name not in ('name', 'description', 'node_type', 'job_xml'):
              ${ utils.render_field(field, extra_attrs={'data-bind': 'value: %s' % field.name}) }
            % endif
          % endfor

          % if 'prepares' in action_form.fields:
            <%
              prepares_field(action_form['prepares'], {
                'name': 'prepares',
                'add': [
                  {'label': _('Add delete'), 'method': 'addPrepareDelete'},
                  {'label': _('Add mkdir'), 'method': 'addPrepareMkdir'},
                ],
                'remove': '$parent.removePrepare'
              })
            %>
          % endif

          % if 'params' in action_form.fields:
            % if node_type == 'pig':
              <%
              params_field(action_form['params'], {
                'name': 'params',
                'add': [
                  {'label': _('Add Param'), 'method': 'addParam'},
                  {'label': _('Add Argument'), 'method': 'addArgument'},
                ],
                'remove': '$parent.removeParam'
              })
              %>
            % endif

            % if node_type == 'shell':
              <%
              params_field(action_form['params'], {
                'name': 'params',
                'add': [
                  {'label': _('Add Argument'), 'method': 'addArgument'},
                  {'label': _('Add Env-Var'), 'method': 'addEnvVar'},
                ],
                'remove': '$parent.removeParam'
              })
              %>
            % endif

            % if node_type == 'hive':
              <%
              params_field(action_form['params'], {
                'name': 'params',
                'add': [
                  {'label': _('Add Param'), 'method': 'addParam'},
                ],
                'remove': '$parent.removeParam'
              })
              %>
            % endif

            % if node_type == 'distcp':
              <%
              params_field(action_form['params'], {
                'name': 'params',
                'add': [
                  {'label': _('Add Argument'), 'method': 'addArgument'},
                ],
                'remove': '$parent.removeParam'
              })
              %>
            % endif

            % if node_type in ('sqoop', 'ssh'):
              <%
              params_field(action_form['params'], {
                'name': 'params',
                'add': [
                  {'label': _('Add Arg'), 'method': 'addArg'},
                ],
                'remove': '$parent.removeParam'
              })
              %>
            % endif
          % endif

          % if 'job_properties' in action_form.fields:
            <%
            job_properties_field(action_form['job_properties'], {
              'name': 'job_properties',
              'add': 'addProp',
              'remove': '$parent.removeProp'
            })
            %>
          % endif

          % if 'files' in action_form.fields:
            <%
            file_field(action_form['files'], {
              'name': 'files',
              'add': 'addFile',
              'remove': '$parent.removeFile'
            })
            %>
          % endif

          % if 'archives' in action_form.fields:
            <%
            archives_field(action_form['archives'], {
              'name': 'archives',
              'add': 'addArchive',
              'remove': '$parent.removeArchive'
            })
            %>
          % endif

          % if 'job_xml' in action_form.fields:
            ${ utils.render_field(action_form['job_xml'], extra_attrs={'data-bind': 'value: %s' % field.name}) }
          % endif

        </fieldset>
      </div>

      <div class="modal-footer">
        <button data-dismiss="modal" class="btn">${ _('Cancel')}</button>
        <button data-dismiss="modal" class="btn btn-primary doneButton">${ _('Done')}</button>
      </div>

    </form>
  </div>
% if template:
  </script>
% endif
</%def>

<%def name="file_field(field, javascript_attrs={})">
<div class="control-group" rel="popover" data-original-title="${ field.label }" data-content="${ field.help_text }">
  <label class="control-label">${ _('Files') }</label>
  <div class="controls">
    % if 'name' in javascript_attrs:
      <table class="table-condensed designTable" data-bind="visible: ${ javascript_attrs['name'] }().length > 0">
        <tbody data-bind="foreach: ${ javascript_attrs['name'] }">
          <tr>
            <td>
              <input type="text" class="span5 required pathChooserKo" data-bind="fileChooser: $data, value: name, uniqueName: false" />
            </td>
            <td>
              % if 'remove' in javascript_attrs:
                <a class="btn" href="#" data-bind="click: ${ javascript_attrs['remove'] }">${ _('Delete') }</a>
              % endif
            </td>
          </tr>
        </tbody>
      </table>

      % if 'add' in javascript_attrs:
        <button class="btn" data-bind="click: ${ javascript_attrs['add'] }">${ _('Add File') }</button>
      % endif
    % endif
  </div>
</div>
</%def>

<%def name="archives_field(field, javascript_attrs={})">
<div class="control-group" rel="popover" data-original-title="${ field.label }" data-content="${ field.help_text }">
  <label class="control-label">${ _('Archives') }</label>
  <div class="controls">
    % if 'name' in javascript_attrs:
      <table class="table-condensed designTable" data-bind="visible: ${ javascript_attrs['name'] }().length > 0">
        <tbody data-bind="foreach: ${ javascript_attrs['name'] }">
          <tr>
            <td>
              <input type="text" class="span5 required pathChooserKo" data-bind="fileChooser: $data, value: name, uniqueName: false" />
            </td>
            <td>
              % if 'remove' in javascript_attrs:
                <a class="btn" href="#" data-bind="click: ${ javascript_attrs['remove'] }">${ _('Delete') }</a>
              % endif
            </td>
          </tr>
        </tbody>
      </table>

      % if 'add' in javascript_attrs:
        <button class="btn" data-bind="click: ${ javascript_attrs['add'] }">${ _('Add Archive') }</button>
      % endif
    % endif
  </div>
</div>
</%def>

<%def name="job_properties_field(field, javascript_attrs={})">
<div class="control-group" rel="popover" data-original-title="${ field.label }" data-content="${ field.label }">
  <label class="control-label">${ _('Job Properties') }</label>
  <div class="controls">
    % if 'name' in javascript_attrs:
      <table class="table-condensed designTable" data-bind="visible: ${ javascript_attrs['name'] }().length > 0">
        <thead>
          <tr>
            <th>${ _('Property name') }</th>
            <th>${ _('Value') }</th>
            <th/>
          </tr>
        </thead>
        <tbody data-bind="foreach: ${ javascript_attrs['name'] }">
          <tr>
            <td><input type="text" class="span4 required propKey" data-bind="value: name, uniqueName: false" /></td>
            <td><input type="text" class="span4 required pathChooserKo" data-bind="fileChooser: $data, value: value, uniqueName: false" /></td>
            <td>
            % if 'remove' in javascript_attrs:
              <a class="btn" href="#" data-bind="click: ${ javascript_attrs['remove'] }">${ _('Delete') }</a>
            % endif
            </td>
          </tr>
        </tbody>
      </table>

      % if 'add' in javascript_attrs:
        <button class="btn" data-bind="click: ${ javascript_attrs['add'] }">${ _('Add Property') }</button>
      % endif
    % endif
  </div>
</div>
</%def>

<%def name="params_field(field, javascript_attrs={})">
<div class="control-group" rel="popover" data-original-title="${ field.label }" data-content="${ field.help_text }">
  <label class="control-label">${ _('Params') }</label>
  <div class="controls">
    % if 'name' in javascript_attrs:
      <table class="table-condensed designTable" data-bind="visible: ${ javascript_attrs['name'] }().length > 0">
        <thead>
          <tr>
            <th>${ _('Type') }</th>
            <th>${ _('Value') }</th>
            <th/>
          </tr>
        </thead>
        <tbody data-bind="foreach: ${ javascript_attrs['name'] }">
          <tr>
            <td>
              <span class="span4 required" data-bind="text: type" />
            </td>
            <td>
              <input type="text" class="input span4 required pathChooserKo" data-bind="fileChooser: $data, value: value, uniqueName: false" />
            </td>
            <td>
            % if 'remove' in javascript_attrs:
              <a class="btn" href="#" data-bind="click: ${ javascript_attrs['remove'] }">${ _('Delete') }</a>
            % endif
            </td>
          </tr>
        </tbody>
      </table>

      % if 'add' in javascript_attrs:
        % for method in javascript_attrs['add']:
          <button class="btn" data-bind="click: ${ method['method'] }">${ _(method['label']) }</button>
        % endfor
      % endif
    % endif
  </div>
</div>
</%def>

<%def name="prepares_field(field, javascript_attrs={})">
<div class="control-group" rel="popover" data-original-title="${ field.label }" data-content="${ field.help_text }">
  <label class="control-label">${ _('Prepare') }</label>
  <div class="controls">
    % if 'name' in javascript_attrs:
      <table class="table-condensed designTable" data-bind="visible: ${ javascript_attrs['name'] }().length > 0">
        <thead>
          <tr>
            <th>${ _('Type') }</th>
            <th>${ _('Value') }</th>
            <th/>
          </tr>
        </thead>
        <tbody data-bind="foreach: ${ javascript_attrs['name'] }">
          <tr>
            <td>
              <span class="span4 required" data-bind="text: type" />
            </td>
            <td>
              <input type="text" class="input span4 required pathChooserKo" data-bind="fileChooser: $data, value: value, uniqueName: false" />
            </td>
            <td>
              % if 'remove' in javascript_attrs:
                <a class="btn" href="#" data-bind="click: ${ javascript_attrs['remove'] }">${ _('Delete') }</a>
              % endif
            </td>
          </tr>
        </tbody>
      </table>

      % if 'add' in javascript_attrs:
        % for method in javascript_attrs['add']:
          <button class="btn" data-bind="click: ${ method['method'] }">${ _(method['label']) }</button>
        % endfor
      % endif
    % endif
  </div>
</div>
</%def>
