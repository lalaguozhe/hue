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




<%def name="fork_form(node_type, template=True, javascript_attrs={})">
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
        <div class="alert alert-info">
          ${ _('Convert this fork into a decision?') }
        </div>
      </div>

      <div class="modal-footer">
        <button data-dismiss="modal" class="btn">${ _('No')}</button>
        % if 'convert' in javascript_attrs:
          <button data-dismiss="modal" class="btn btn-primary" data-bind="click: ${ javascript_attrs['convert'] }">${ _('Yes') }</button>
        % endif
      </div>

    </form>
  </div>

% if template:
  </script>
% endif
</%def>





<%def name="decision_form(link_form, default_link_form, node_type, template=True, javascript_attrs={})">
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
        <fieldset>

          <div class="control-group">
            <label class="control-label"></label>
            <div class="controls span8">
              <div>${ _('Examples of predicates:') }</div>
              <div class="well">
                ${"${"} fs:fileSize(secondjobOutputDir) gt 10 * GB }
                <br/>
                ${"${"} hadoop:counters('secondjob')[RECORDS][REDUCE_OUT] lt 1000000 }
              </div>
            </div>
          </div>

          <div class="control-group">
            <label class="control-label"></label>
            <div class="controls">
              <table class="table-condensed">
                <thead>
                  <tr>
                    <th>${ _('Predicate') }</th>
                    <th/>
                    <th>${ _('Action') }</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- ko foreach: links() -->
                  <tr>
                    <td>
                      ${ utils.render_field(link_form['comment'], extra_attrs={'data-bind': 'value: comment'}) }
                    </td>
                    <td class="center">
                      ${ _('go to') }
                    </td>
                    <td class="right">
                      % if 'name' in javascript_attrs:
                        <a class="span3" data-bind="text: ${ javascript_attrs['name'] }"></a>
                      % endif
                    </td>
                  </tr>
                  <!-- /ko -->

                  <!-- ko foreach: meta_links() -->
                    <!-- ko if: $data.name() == 'default' -->
                    <tr>
                      <td>
                       <div class="control-group">
                          <label class="control-label"></label>
                          <div class="controls span8">
                            <div>${ _('default') }</div>
                          </div>
                        </div>
                      </td>
                      <td class="center">
                        ${ _('go to') }
                      </td>
                      <td class="right">
                        ${ utils.render_field(default_link_form['child'], extra_attrs={'data-bind': 'value: child'}) }
                      </td>
                    </tr>
                    <!-- /ko -->
                  <!-- /ko -->
                </tbody>
              </table>
            </div>
          </div>

        </fieldset>
      </div>

      <div class="modal-footer">
        <button data-dismiss="modal" class="btn btn-primary">${ _('Done')}</button>
      </div>

    </form>
  </div>

% if template:
  </script>
% endif
</%def>

<%def name="links_form_fields(link_form, default_link_form, javascript_attrs={})">

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
              <input type="text" class="input span4 required" data-bind="fileChooser: $data, value: value, uniqueName: false" />
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
