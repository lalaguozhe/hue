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

from desktop.lib.django_util import render, render_to_string
import datetime

from desktop import appmanager

from wiki.models import WikiPost

def index(request):
    if "title" in request.REQUEST:
        wiki_post = WikiPost(title=request.REQUEST["title"], body=request.REQUEST["body"])
        wiki_post.save()

    posts = WikiPost.objects.all()
    return render('index.mako', request, dict(subnav=commonsubnav(),posts=posts,apps=appmanager.DESKTOP_APPS,date=datetime.datetime.now()))

def post_form(request):
    return render('form.mako', request, dict(subnav=commonsubnav(),apps=appmanager.DESKTOP_APPS,date=datetime.datetime.now()))

def commonsubnav():
    return render_to_string('subnav.mako', dict())
