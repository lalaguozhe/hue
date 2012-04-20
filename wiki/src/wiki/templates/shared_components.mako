<%!
#declare imports here, for example:
#import datetime
%>

<%!
import datetime
from django.template.defaultfilters import urlencode, escape
%>
<%def name="header(title='wiki', toolbar=True)">
  <!DOCTYPE html>
  <html>
    <head>
      <title>${title}</title>
    </head>
    <body>
      % if toolbar:
      <div class="toolbar">
        <a href="${url('wiki.views.index')}"><img src="/wiki/static/art/wiki.png" class="wiki_icon"/></a>
      </div>
      % endif
</%def>

<%def name="footer()">
    </body>
  </html>
</%def>