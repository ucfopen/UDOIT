<div id="header">
	<h1>Mal</h1>
	<?php if(isset($_SESSION['loggedIn'])) { ?>
	<p><a href="./?page=logout" id="logout">Logout</a></p>
	<?php } ?>
</div>