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
<h2 class="content-title"><?= ucfirst($content_group->title); ?> <small> <b><?= count($content_group->items); ?><b> of <?= $content_group->amount; ?> have issues.</small> <span class="proc-time">precess time: <?= $content_group->time; ?>s</span></h2>

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
					<?php
					if ( ! empty($item->error)) {
						$args = ['title' => 'Errors', 'panel_style' => 'panel-danger', 'id' => $item->id, 'items' => $item->error, 'fixable_types' => $fixable_error_types];
						echo $this->fetch('partials/results_items', $args);
					}

					if ( ! empty ($item->suggestion)) {
						$args = ['title' => 'Suggestions', 'panel_style' => 'panel-info', 'id' => $item->id, 'items' => $item->suggestion, 'fixable_types' => $fixable_suggestions];
						echo $this->fetch('partials/results_items', $args);
					}
					?>
				</div>

			</div>
		<?php endif; ?>
	<?php endforeach; ?>
<?php endif; ?>
