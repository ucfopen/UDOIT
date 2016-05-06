<h2 class="content-title">Unscannable <small><?= count($items) ?> files</small></h2>

<div class="errorItem panel panel-default">
	<div class="panel-heading clearfix">
		<button class="btn btn-xs btn-default btn-toggle pull-left no-print margin-right-small"><span class="glyphicon glyphicon-plus"></span></button>

		<h3 class="plus pull-left">UDOIT is unable to scan these files</h3>
	</div>

	<div class="errorSummary panel-body">
		<div class="panel panel-info">
			<div class="panel-body">
				<p>Due to the nature of UDOIT, the content in these files cannot be scanned for accessibility problems. Please visit the following resources to read about accessibility for these file types.</p>

				<ul class="list-unstyled no-margin">
					<li><a href="http://webaim.org/techniques/word/" target="blank">http://webaim.org/techniques/word/</a></li>
					<li><a href="http://webaim.org/techniques/powerpoint/" target="blank">http://webaim.org/techniques/powerpoint/</a></li>
					<li><a href="http://webaim.org/techniques/acrobat/" target="blank">http://webaim.org/techniques/acrobat/</a></li>
				</ul>

			</div>
		</div>

		<div class="list-group no-margin">

			<?php foreach ($items as $item): ?>
				<a href="<?= $item->url; ?>" class="list-group-item"><?= $item->title; ?></a>
			<?php endforeach; ?>

		</div>
	</div>
</div>
