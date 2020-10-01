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

$settings = [
	'footer_scripts' => [
		"//code.jquery.com/jquery-2.1.1.min.js",
		"//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js",
		"assets/js/vendor/jscolor/jscolor.js",
		"assets/js/resize.js?v=" . UDOIT_VERSION,
		"assets/js/default.js?v=" . UDOIT_VERSION,
		"assets/js/contrast.js",
		"assets/js/results_filter.js?v=" . UDOIT_VERSION
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
			<div class="panel panel-default welcome-panel">
				<div class="panel-body">
					<button class="btn btn-xs btn-default pull-right no-print margin-right-small welcome-toggle-btn">
						<span class="glyphicon glyphicon-minus"></span>
						<span class="sr-only">Toggle Welcome Message</span>
					</button>
					<div class="welcome-toggle">
						<h2>Welcome to <span style="font-weight: normal;">U</span><span style="font-weight: bold;">DO</span><span style="font-weight: normal;">IT</span>!</h2>
						<p class="welcome-message"><?= $welcome_message; ?></p>
						<p class="disclaimer-message"><?= $disclaimer_message; ?></p>
					</div>
					<p class="no-margin"><a href="#udoitInfo" class="btn btn-sm btn-default no-print" data-toggle="modal" data-target="#udoitInfo">What does UDOIT look for?</a></p>
				</div>
			</div>
			<form class="form-horizontal no-print" id="udoitForm" action="#" role="form">
				<input type="hidden" name="main_action" value="udoit">
				<input type="hidden" name="base_url" value="<?= $this->escape($base_url); ?>/">
				<input type="hidden" name="session_course_id" value="<?= $this->escape($launch_params['custom_canvas_course_id']); ?>">
				<input type="hidden" name="session_context_label" value="<?= $this->escape($launch_params['context_label']); ?>">
				<input type="hidden" name="session_context_title" value="<?= $this->escape($launch_params['context_title']); ?>">

				<div class="row">
					<div class="col-sm-12 col-md-8 col-md-offset-2 course_submit_container">
						<button type="submit" id="course_submit" name="course_submit" class="btn btn-block btn-lg btn-success submit">Scan This Course</button>

						<div id="waitMsg" class="alert alert-warning" style="display: none;">
							<p><span class="glyphicon glyphicon-warning-sign"></span> Please stay on this page while UDOIT scans your course content.</p>
						</div>

						<div class="alert alert-danger no-margin margin-top" id="failMsg" style="display: none;">
							<span class="glyphicon glyphicon-exclamation-sign"></span> <span class="msg">UDOIT failed to scan this course.</span><span class="custom-msg"></span>
						</div>
					</div>
				</div>
				<div class="panel">
					<div class="row panel-body">
						<div class="col-sm-12 col-md-8 col-md-offset-2">
							<div class="row">
								<div class="col-sm-6">
									<div class="form-group welcome-toggle">
										<span class="col-sm-4 control-label"><strong>Content:</strong></span>

										<div class="col-sm-8">
											<div class="checkbox">
												<label><input id="allContent" type="checkbox" value="all" id="allContent" class="content" name="content[]" checked>Select All</label>
											</div>

											<br />

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
												<label><input id="moduleUrls" type="checkbox" value="module_urls" class="content" name="content[]" checked> Module URLs</label>
											</div>

											<br />

											<div class="checkbox">
												<label><input id="unpubCheckbox" type="checkbox" checked>Include unpublished content</label>
											</div>

											<br />

										</div>

									</div>
								</div>

								<div class="col-sm-6">
									<div class="form-group welcome-toggle">
										<span class="col-sm-4 control-label"><strong>Scan for:</strong></span>

										<div class="col-sm-8">

											<div class="checkbox">
												<label><input id="allReport" type="checkbox" value="all" id="allReport" class="report" name="report[]" checked>Select All</label>
											</div>

											<br />

											<div class="checkbox">
												<label><input id="errors" type="checkbox" value="errors" class="report" name="report[]" checked> Errors</label>
											</div>

											<div class="checkbox">
												<label><input id="suggestions" type="checkbox" value="suggestions" class="report" name="report[]" checked> Suggestions</label>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
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
					<?= $this->fetch('partials/look_for_modal_list', ['style_classes' => 'errorItem panel panel-danger', 'title' => 'Errors', 'tests' => $udoit_tests['severe']]); ?>

					<?= $this->fetch('partials/look_for_modal_list', ['style_classes' => 'panel panel-info no-margin', 'title' => 'Suggestions', 'tests' => $udoit_tests['suggestion']]); ?>

				</div>
			</div>
		</div>
	</div>
</main>