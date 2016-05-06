<h1 class="text-center">
	Report for <?=$this->e($course)?><br>
	<small><?=$this->e($error_count)?> errors, <?=$suggestion_count?> suggestions</small>
</h1>

<p>
	<?php if(!empty($post_path)): ?>
		<button class="btn btn-default btn-xs no-print" id="backToResults">Back to cached reports</button>
	<?php endif; ?>
	<button class="btn btn-default btn-s no-print" id="savePdf"><div class="circle-black hidden"></div><span class="glyphicon glyphicon-save"></span> Save report as PDF</button>
<p>

<div id="errorWrapper">
	<?php
		foreach ($report_content as $report) {
			switch ($report->title) {
				case "announcements":
				case "assignments":
				case "discussions":
				case "files":
				case "pages":
				case "syllabus":
					echo $this->fetch('partials/results_scannable', ['items' => $report->items, 'module_count' => $report->amount, 'time' => $report->time]);
					break;
				case "module_urls":
					echo $this->fetch('partials/results_module_urls', ['items' => $report->items]);
					break;
				case "unscannable":
					echo $this->fetch('partials/results_unscannable', ['items' => $report->items]);
					break;
			}
		}
	?>
</div>
