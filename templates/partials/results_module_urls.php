<h2 class="content-title">Module URLs <small><?= count($items) ?> with issues from <?= $module_count ?> total in <?= $time ?> seconds</small></h2>

<?php if (!$items): ?>
	<div class="alert alert-success"><span class="glyphicon glyphicon-ok"></span> No problems were detected for this type of content!</div>
<?php else: ?>
	<div class="errorItem panel panel-default">
		<div class="panel-heading clearfix">
			<button class="btn btn-xs btn-default btn-toggle pull-left no-print margin-right-small"><span class="glyphicon glyphicon-plus"></span></button>

			<h3 class="plus pull-left">These module URLs link to external videos</h3>
		</div>

		<div class="errorSummary panel-body">
			<div class="panel panel-warning">
				<div class="panel-body">
					<p class="no-margin">Please make sure these videos have transcripts and proper closed captioning.</p>
				</div>
			</div>

			<div class="list-group no-margin">

				<?php foreach ($items as $item): ?>
					<a href="<?= $item->url; ?>" class="list-group-item"><?= $item->title; ?> (<?= $item->external_url; ?>)</a>
				<?php endforeach; ?>

			</div>
		</div>
	</div>
<?php endif; ?>
