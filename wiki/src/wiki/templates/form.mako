<%!from desktop.views import commonheader, commonfooter %>

${commonheader("Wiki", "wiki", "100px")}

## use double hashes for a mako template comment

## this id in the div below ("index") is stripped by Hue.JFrame
## and passed along as the "view" argument in its onLoad event

## the class 'jframe_padded' will give the contents of your window a standard padding
<div class="subnav subnav-fixed">
	<div class="container-fluid">
	<ul class="nav nav-pills">
		<li></li>
	</ul>
	</div>
</div>

<div class="container-fluid">
    <form action="/wiki/">
        <label for="titleTextInput">Title:</label>
        <input id="titleTextInput" name="title"/>
        <label for="bodyTextArea">Body:</label>
        <textarea rows="10" cols="25" id="bodyTextArea" name="body">
        </textarea>
        <br>
        <input type="submit"/>
    </form>
</div>

${commonfooter()}