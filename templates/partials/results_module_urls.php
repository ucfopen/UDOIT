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
<h2 class="content-title">Module URLs <small> <strong><?= count($items); ?> of <?= $out_of_items; ?> have issues.</strong></small> <span class="proc-time">process time: <?= $time; ?>s</span></h2>

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
					<a href="<?= $item->url; ?>" target="_blank" class="list-group-item"><?= $item->title; ?> (<?= $item->external_url; ?>)</a>
				<?php endforeach; ?>

			</div>
		</div>
	</div>
<?php endif; ?>
