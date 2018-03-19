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
global $file_scan_size_limit;
?>
<h1 class="text-center">
	Report for <?= $this->e($course); ?><br>
	<small><?= $this->e($error_count); ?> errors, <?= $suggestion_count; ?> suggestions, <?= $unscannable_count; ?> unscannable files</small>
</h1>

<div id="errorTotalSummary">
	<div id="summaryContainer" class="panel panel-default">
		<div class="panel-heading clearfix">
			<button class="btn btn-xs btn-default btn-toggle pull-left no-print margin-right-small"><span class="glyphicon glyphicon-plus"></span></button>
			<h2>Error Summary</h2>
		</div>
		<div class="errorSummary panel-body">
			<table>
				<?php foreach($error_summary as $item => $data): ?>
					<tr>
						<th scope="row"><span class="label <?= $data->severity ?>"><?= $data->count ?></span></th><td><?= $item ?></td>
					</tr>
				<?php endforeach; ?>
			</table>
		</div>
	</div>
</div>

<p>
	<?php if ( ! empty($post_path)): ?>
		<button class="btn btn-default btn-xs no-print" id="backToResults">Back to cached reports</button>
	<?php endif; ?>
	<button class="btn btn-default btn-s no-print" id="savePdf"><div class="circle-black hidden"></div><span class="glyphicon glyphicon-save"></span> Save report as PDF</button>
<p>

<div class="errorWrapper">
	<?php
		foreach ($report_groups as $group) {
			// skip if the title is missing
			if (empty($group->title)) {
				continue;
			}

			switch ($group->title) {
				case "announcements":
				case "assignments":
				case "discussions":
				case "files":
				case "pages":
				case "syllabus":
					echo($this->fetch('partials/results_scannable', ['content_group' => $group, 'fixable_error_types' => $fixable_error_types, 'fixable_suggestions' => $fixable_suggestions, 'time' => $group->time, 'out_of_items' => $group->amount]));
					break;
				case "module_urls":
					echo($this->fetch('partials/results_module_urls', ['items' => $group->items, 'time' => $group->time, 'out_of_items' => $group->amount]));
					break;
				case "unscannable":
					$base = log($file_scan_size_limit, 1024);
					$suffixes = array('', 'k', 'm', 'g', 't');
					$size_str = round(pow(1024, $base - floor($base)), 2) . ' ' . $suffixes[floor($base)] . "b";

					echo($this->fetch('partials/results_unscannable', ['items' => $group->items, 'out_of_items' => $group->amount, 'size_limit' =>  $size_str]));
					break;
			}
		}
	?>
</div>
