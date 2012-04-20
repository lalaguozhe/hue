<%!
from desktop.views import commonheader, commonfooter
%>

${commonheader("Wiki", "wiki", "100px")}
${subnav}

## use double hashes for a mako template comment

## this id in the div below ("index") is stripped by Hue.JFrame
## and passed along as the "view" argument in its onLoad event

## the class 'jframe_padded' will give the contents of your window a standard padding

<div class="container-fluid">
    <h2>Wiki</h2>
    % for post in posts:
    <p>
        <b>${post.title}</b><br>
        ${post.body}
        <br>
        <i>Posted at ${post.posted_at}</i>
    </p>

    %endfor
</div>

${commonfooter()}
