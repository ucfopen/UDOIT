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
		foreach ($report_groups as $group) {
			switch ($group->title) {
				case "announcements":
				case "assignments":
				case "discussions":
				case "files":
				case "pages":
				case "syllabus":
					echo $this->fetch('partials/results_scannable', ['content_group' => $group, 'module_count' => $group->amount, 'time' => $group->time, 'fixable_error_types' => $fixable_error_types]);
					break;
				case "module_urls":
					echo $this->fetch('partials/results_module_urls', ['content_group' => $group]);
					break;
				case "unscannable":
					echo $this->fetch('partials/results_unscannable', ['content_group' => $group]);
					break;
			}
		}
	?>
</div>
