<?php

$settings = [
	'footer_scripts' => [
		"//code.jquery.com/jquery-2.1.1.min.js",
		"//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js",
		"assets/js/vendor/jscolor/jscolor.js",
		"assets/js/default.js?cachebuster=".time(),
		"assets/js/ufixit-input-validation.js?cachebuster=".time(),
		"assets/js/ufixit-preview.js?cachebuster=".time(),
		"assets/js/contrast.js",
	]
];

$this->layout('template', $settings);

?>
<ul class="nav nav-tabs nav-justified" role="tablist">
	<li role="presentation" class="active"><a href="#scanner" role="tab" data-toggle="tab">Scan Course</a></li>
	<li role="presentation"><a href="#cached" role="tab" data-toggle="tab">View Old Reports</a></li>
</ul>
<main id="contentWrapper" role="main">
	<div class="tab-content">
		<div class="tab-pane active" id="scanner" role="tabpanel">
			<div class="panel panel-default">
				<div class="panel-body">
					<h2>Welcome to <span style="font-weight: normal;">U</span><span style="font-weight: bold;">DO</span><span style="font-weight: normal;">IT</span>!</h2>

					<p><?=$welcome_message?></p>

					<p><?=$disclaimer_message?></p>

					<p class="no-margin"><a href="#udoitInfo" class="btn btn-sm btn-default no-print" data-toggle="modal" data-target="#udoitInfo">What does UDOIT look for?</a></p>
				</div>
			</div>
			<form class="form-horizontal no-print" id="udoitForm" method="post" action="lib/process.php" role="form">
				<input type="hidden" name="main_action" value="udoit">
				<input type="hidden" name="base_url" value="https://<?=$_POST['custom_canvas_api_domain']?>/">
				<input type="hidden" name="session_course_id" value="<?=$launch_params['custom_canvas_course_id']?>">
				<input type="hidden" name="session_context_label" value="<?=$launch_params['context_label']?>">
				<input type="hidden" name="session_context_title" value="<?=$launch_params['context_title']?>">

				<div class="form-group">
					<span class="col-sm-2 control-label"><strong>Select content:</strong></span>

					<div class="col-sm-10">
						<div class="checkbox">
							<label><input id="allContent" type="checkbox" value="all" id="allContent" class="content" name="content[]" checked> All</label>
						</div>

						<hr />

						<div class="checkbox">
							<label><input id="courseAnnouncements" type="checkbox" value="announcements" class="content" name="content[]" checked> Announcements</label>
						</div>

						<div class="checkbox">
							<label><input id="courseAssignments" type="checkbox" value="assignments" class="content" name="content[]" checked> Assignments</label>
						</div>

						<div class="checkbox">
							<label><input id="courseDiscussions" type="checkbox" value="discussions" class="content" class="content" name="content[]" checked> Discussions</label>
						</div>

						<div class="checkbox">
							<label><input id="courseFiles" type="checkbox" value="files" class="content" name="content[]" checked> Files</label>
						</div>

						<div class="checkbox">
							<label><input id="coursePages" type="checkbox" value="pages" class="content" name="content[]" checked> Pages</label>
						</div>

						<div class="checkbox">
							<label><input id="courseSyllabus" type="checkbox" value="syllabus" class="content" name="content[]" checked> Syllabus</label>
						</div>

						<div class="checkbox">
							<label><input id="moduleUrls" type="checkbox" value="modules" class="content" name="content[]" checked> Module URLs</label>
						</div>
					</div>
				</div>

				<hr />

				<div id="waitMsg" class="alert alert-warning" style="display: none;">
					<p><span class="glyphicon glyphicon-warning-sign"></span> Please stay on this page while UDOIT scans your course content.</p>
				</div>

				<button id="submit" type="submit" name="course_submit"  class="btn btn-block btn-lg btn-success">Run scanner</button>

				<div class="alert alert-danger no-margin margin-top" id="failMsg" style="display: none;"><span class="glyphicon glyphicon-exclamation-sign"></span> UDOIT failed to scan this course.</div>
			</form>
		</div>
		<div class="tab-pane" id="cached" role="tabpanel">

		</div>
	</div>

	<div class="modal fade" id="udoitInfo" tabindex="-1" role="dialog" aria-labelledby="udoitModalLabel" aria-hidden="true">
		<div class="modal-dialog modal-lg">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>

					<h4 class="modal-title" id="udoitModalLabel">What accessibility issues does UDOIT look for?</h4>
				</div>
				<div class="modal-body">
					<div class="errorItem panel panel-danger">
						<div class="panel-heading clearfix"><span class="glyphicon glyphicon-ban-circle"></span> Errors</div>

						<ul class="list-group no-margin">
							<?php foreach ($udoit_tests['severe'] as $severe): ?>
								<li class="list-group-item">
									<p class="list-group-item-text "><?=$severe['title']?> <button type="button" class="btn btn-xs btn-default" data-toggle="collapse" data-target="#<?=$severe['name']?>">More info</button></p>

									<div class="list-group-item-text collapse" id="<?=$severe['name']?>">
										<hr>

										<?=$severe['desc']?>

										<?php if ($severe['resources']): ?>
											<p>Resources:</p>
											<ul>
												<?php foreach ($severe['resources'] as $resource): ?>
													<li><?=$resource?></li>
												<?php endforeach ?>
											</ul>
										<?php endif ?>

										<?php if ($severe['example']): ?>
											<hr>
											<?=$severe['example']?>
										<?php endif ?>
									</div>
								</li>
							<?php endforeach ?>
						</ul>
					</div>

					<div class="panel panel-info no-margin">
						<div class="panel-heading clearfix"><span class="glyphicon glyphicon-info-sign"></span> Suggestions</div>

						<ul class="list-group">
							<?php foreach ($udoit_tests['suggestion'] as $suggestion): ?>
								<li class="list-group-item">
									<p class="list-group-item-text "><?=$suggestion['title']?> <button type="button" class="btn btn-xs btn-default" data-toggle="collapse" data-target="#<?=$suggestion['name']?>">More info</button></p>

									<div class="list-group-item-text collapse" id="<?=$suggestion['name']?>">
										<hr>

										<?=$suggestion['desc']?>

										<?php if ($suggestion['resources']): ?>
											<p>Resources:</p>
											<ul>
												<?php foreach ($suggestion['resources'] as $resource): ?>
													<li><?=$resource?></li>
												<?php endforeach ?>
											</ul>
										<?php endif ?>

										<?php if ($suggestion['example']): ?>
											<hr>
											<?=$suggestion['example']?>
										<?php endif ?>
									</div>
								</li>
							<?php endforeach ?>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>
