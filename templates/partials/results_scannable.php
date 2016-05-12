<h2 class="content-title"><?= ucfirst($content_group->title); ?> <small> <b><?= count($content_group->items) ?><b> of <?= $content_group->amount ?> have issues.</small> <span class="proc-time">precess time: <?= $content_group->time ?>s</span></h2>

<?php if (empty($content_group->items)): ?>
	<div class="alert alert-success"><span class="glyphicon glyphicon-ok"></span> No problems were detected in <?= ucfirst($content_group->title); ?>!</div>
<?php else: ?>
	<?php foreach ($content_group->items as $item): ?>
		<?php if ($item->amount > 0): ?>
			<div class="errorItem panel panel-default">
				<div class="panel-heading clearfix">
					<button class="btn btn-xs btn-default btn-toggle pull-left no-print margin-right-small"><span class="glyphicon glyphicon-plus"></span></button>

					<h3 class="plus pull-left"><a href="<?= $item->url; ?>" target="_blank"><?= $item->name; ?>&nbsp;<small><span class ="glyphicon glyphicon-new-window"></span></small></a></h3>

					<div class="pull-right">
						<?php if ( ! empty($item->error)): ?>
							<span class="label label-danger"><span class="glyphicon glyphicon-ban-circle"></span> <?= count($item->error); ?> Errors</span>
						<?php endif; ?>

						<?php if ( ! empty($item->warning)): ?>
							<span class="label label-warning"><span class="glyphicon glyphicon-warning-sign"></span> <?= count($item->warning); ?> Warnings</span>
						<?php endif; ?>

						<?php if ( ! empty($item->suggestion)): ?>
							<span class="label label-primary"><span class="glyphicon glyphicon-info-sign"></span> <?= count($item->suggestion); ?> Suggestions</span>
						<?php endif; ?>
					</div>
				</div>

				<div class="errorSummary panel-body">
					<?php if ( ! empty($item->error)): ?>
						<?= $this->fetch('partials/results_items_errors', ['item' => $item, 'fixable_error_types' => $fixable_error_types]) ?>
					<?php endif; ?>

					<?php if ( ! empty($item->warning)): ?>
						<?= $this->fetch('partials/results_items_warnings', ['item' => $item, 'fixable_error_types' => $fixable_error_types]) ?>
					<?php endif; ?>

					<?php if ( ! empty ($item->suggestion)): ?>
						<?= $this->fetch('partials/results_items_suggestions', ['item' => $item, 'fixable_error_types' => $fixable_error_types]) ?>
					<?php endif; ?>
				</div>

			</div>
		<?php endif; ?>
	<?php endforeach; ?>
<?php endif; ?>
