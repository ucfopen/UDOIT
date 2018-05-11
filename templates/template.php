<?php
/**
*	Copyright (C) 2014 University of Central Florida, created by Jacob Bates, Eric Colon, Fenel Joseph, and Emily Sachs.
*
*	This program is free software: you can redistribute it and/or modify
*	it under the terms of the GNU General Public License as published by
*	the Free Software Foundation, either version 3 of the License, or
*	(at your option) any later version.
*
*	This program is distributed in the hope that it will be useful,
*	but WITHOUT ANY WARRANTY; without even the implied warranty of
*	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*	GNU General Public License for more details.
*
*	You should have received a copy of the GNU General Public License
*	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
*	Primary Author Contact:  Jacob Bates <jacob.bates@ucf.edu>
*/
?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title>UDOIT Accessibility Checker</title>
		<link rel="icon" type="image/png" href="favicon.ico">
		<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css">
		<link href='//fonts.googleapis.com/css?family=Sonsie+One' rel='stylesheet' type='text/css'>
		<link href="assets/css/main.css?v=<?= UDOIT_VERSION ?>" type="text/css" rel="stylesheet" media="screen">
		<link href="assets/css/print.css?v=<?= UDOIT_VERSION ?>" type="text/css" rel="stylesheet" media="print">
	</head>
	<body>
		<div class="container">
			<header id="mainHeader" class="navbar navbar-default center">
				<h1 class="logo">UDOIT</h1>
				<div class="udoit-version">v.<?= UDOIT_VERSION ?></div>
			</header>

			<?= $this->section('content'); ?>

		</div>


		<?php if ($footer_scripts): ?>
			<?php foreach($footer_scripts as $script): ?>
				<script src="<?= $script; ?>"></script>
			<?php endforeach ?>
		<?php endif; ?>

		<?php if (trim(GA_TRACKING_CODE) !== ''): ?>
			<script>
				(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
				(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
				m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
				})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

				ga('create', '<?= GA_TRACKING_CODE; ?>', 'auto');
				ga('send', 'pageview');
			</script>
		<?php endif; ?>
	</body>
</html>