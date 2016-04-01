<!DOCTYPE html>
<html lang="en">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title>UDOIT Accessibility Checker</title>
		<link rel="icon" type="image/png" href="favicon.ico">
		<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css">
		<link href='//fonts.googleapis.com/css?family=Sonsie+One' rel='stylesheet' type='text/css'>
		<link href="assets/css/main.css?cachebuster=<?= time() ?>" type="text/css" rel="stylesheet" media="screen">
		<link href="assets/css/print.css" type="text/css" rel="stylesheet" media="print">
	</head>
	<body>
		<div class="container">
			<header id="mainHeader" class="navbar navbar-default center">
				<h1 class="logo">UDOIT</h1>
			</header>

			<?=$this->section('content')?>

		</div>

		<?php if($footer_scripts): ?>
			<?php foreach($footer_scripts as $script): ?>
				<script src="<?=$script?>"></script>
			<?php endforeach ?>
		<?php endif ?>
	</body>
</html>