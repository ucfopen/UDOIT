<?php

include_once('../config/localConfig.php');

if (isset($_POST['cached_id'])) {
	// saves the report to the database
	$dsn = "mysql:dbname=$db_name;host=$db_host";

	try {
	    $dbh = new PDO($dsn, $db_user, $db_password);
	} catch (PDOException $e) {
	    echo 'Connection failed: ' . $e->getMessage();
	}

	$sth = $dbh->prepare("
	    SELECT * FROM
	        $db_reports_table
	    WHERE
			id=:cachedid
	");

	$sth->bindParam(':cachedid', $_POST['cached_id'], PDO::PARAM_INT);

	if (!$sth->execute()) {
	    die('Ya done goof\'d');
	}

	$the_json     = file_get_contents($sth->fetchAll(PDO::FETCH_OBJ)[0]->file_path);
	$udoit_report = json_decode($the_json);
} elseif ($_POST['main_action'] === "cahced") {
	die('<div class="alert alert-danger no-margin">Cannot parse this report. JSON file not found.</div>');
}

// saving headaches here...
$issue_count = 0;

?>

<h1 class="text-center">
	Report for <?= $udoit_report->course ?>
	<br>
	<small><?= $udoit_report->total_results->errors; ?> errors, <?= $udoit_report->total_results->suggestions; ?> suggestions</small>
</h1>

<p>
	<?php if(!empty($_POST['path'])): ?>
		<button class="btn btn-default btn-xs no-print" id="backToResults">Back to cached reports</button>
	<?php endif; ?>
	<button class="btn btn-default btn-xs no-print" id="savePdf"><span class="glyphicon glyphicon-save"></span> Save report as PDF</button>
<p>

<div id="errorWrapper">
<?php foreach ($udoit_report->content as $bad): ?>
	<?php switch ($bad->title):
	case "announcements":
	case "assignments":
	case "discussions":
	case "files":
	case "pages":
	case "syllabus": ?>
		<h2 class="content-title"><?= ucfirst($bad->title); ?> <small><?= count($bad->items) ?> with issues from <?= $bad->amount ?> total in <?= $bad->time ?> seconds</small></h2>

		<?php if (!$bad->items): ?>
			<div class="alert alert-success"><span class="glyphicon glyphicon-ok"></span> No problems were detected for this type of content!</div>
		<?php else: ?>
			<?php foreach ($bad->items as $report): ?>
				<?php if ($report->amount > 0): ?>
					<div class="errorItem panel panel-default">
						<div class="panel-heading clearfix">
							<button class="btn btn-xs btn-default btn-toggle pull-left no-print margin-right-small"><span class="glyphicon glyphicon-plus"></span></button>

							<h3 class="plus pull-left"><a href="<?= $report->url; ?>" target="_blank"><?= $report->name; ?></a></h3>

							<div class="pull-right">
								<?php if (count($report->error) > 0): ?>
									<span class="label label-danger"><span class="glyphicon glyphicon-ban-circle"></span> <?= count($report->error); ?> Errors</span>
								<?php endif; ?>

								<?php if (count($report->warning) > 0): ?>
									<span class="label label-warning"><span class="glyphicon glyphicon-warning-sign"></span> <?= count($report->warning); ?> Warnings</span>
								<?php endif; ?>

								<?php if (count($report->suggestion) > 0): ?>
									<span class="label label-primary"><span class="glyphicon glyphicon-info-sign"></span> <?= count($report->suggestion); ?> Suggestions</span>  
								<?php endif; ?>
							</div>
						</div>

						<div class="errorSummary panel-body">
							<?php if (count($report->error) > 0): ?>
								<div class="panel panel-danger">
									<div class="panel-heading">
										<h4 class="panel-title">Errors <span class="badge"><?= count($report->error); ?></span></h4>
									</div>

									<ul class="list-group">
										<?php foreach ($report->error as $item): ?>
											<?php $issue_count++; ?>
											<li class="list-group-item">
												<div class="clearfix">
													<a href="#collapse-<?= $report->id; ?>-<?= $issue_count; ?>" data-toggle="collapse"><h5 class="text-danger pull-left"><span class="glyphicon glyphicon-remove-sign"></span> <?= $item->title; ?></h5></a>

													<?php if ($item->type == "cssTextHasContrast" || $item->type == "imgHasAlt" || $item->type == "imgNonDecorativeHasAlt" || $item->type == "tableDataShouldHaveTh" || $item->type == "tableThShouldHaveScope"): ?>
														<span class="label label-success margin-left-small hidden" style="margin-top: -2px;">Fixed!</span>
													<?php endif; ?>
												</div>

												<div id="collapse-<?= $report->id; ?>-<?= $issue_count; ?>" class="collapse in fade margin-top-small">
													<?php if (isset($item->description)): ?>
														<div class="error-desc">
															<?= $item->description ?>
														</div>
													<?php endif; ?>

													<?php if ($item->html): ?>
														<p><a class="viewError" href="#viewError">View the source of this issue</a></p>
														<div class="more-info hidden">
															<div class="error-preview">
																<?= $item->html; ?>
															</div>
															<pre class="error-source"><code class="html"><strong>Line <?= $item->lineNo; ?></strong>: <?= htmlspecialchars($item->html); ?></code></pre>
														</div>
													<?php endif; ?>

													<?php if (empty($_POST['path'])): ?>
														<?php if ($item->type === "cssTextHasContrast" || $item->type === "imgHasAlt" || $item->type === "imgNonDecorativeHasAlt" || $item->type === "tableDataShouldHaveTh" || $item->type === "tableThShouldHaveScope"): ?>
															<button class="fix-this no-print btn btn-success">U FIX IT!</button>

															<form class="ufixit-form form-horizontal no-print hidden" action="lib/process.php" method="post" role="form">
																<input type="hidden" name="main_action" value="ufixit">
																<input type="hidden" name="contenttype" value="<?= $bad->title; ?>">
																<input type="hidden" name="contentid" value="<?= $report->id; ?>">
																<input type="hidden" name="errorhtml" value="<?= htmlspecialchars($item->html); ?>">
																<?php if ($item->type == "cssTextHasContrast"): ?>
																	<?php for ($i = 0; $i < count($item->colors); $i++): ?>
																		<input type="hidden" name="errorcolor[<?= $i; ?>]" value="<?= $item->colors[$i]; ?>">
																	<?php endfor; ?>
																<?php endif; ?>
																<input type="hidden" name="errortype" value="<?= $item->type; ?>">
																<input type="hidden" name="submittingagain" value="">

																<?php switch ($item->type):
																case "cssTextHasContrast": ?>
																	<?php for ($i = 0; $i < count($item->colors); $i++): ?>
																		<div class="form-group no-margin margin-bottom">
																			<label for="newcontent[<?= $i; ?>]">Replacement color for <?= $item->colors[$i]; ?></label>
																			<input class="color {hash:true,caps:false} form-control" type="text" name="newcontent[<?= $i; ?>]" value="<?= $item->colors[$i]; ?>" placeholder="Replacement for <?= $item->colors[$i]; ?>">
																		</div>
																	<?php endfor; ?>
																	<button class="submit-content btn btn-default" type="submit">Submit</button>
																	<?php break; ?>
																<?php case "imgHasAlt": ?>
																<?php case "imgNonDecorativeHasAlt": ?>
																	<div class="fix-alt input-group">
																		<span class="counter">100</span>
																		<input class="form-control" type="text" name="newcontent" maxlength="100" placeholder="New alt text">
																		<span class="input-group-btn">
																			<button class="submit-content btn btn-default" type="submit">Submit</button>
																		</span>
																	</div>
																	<?php break; ?>
																<?php case "tableDataShouldHaveTh": ?>
																	<hr>
																	<p>Select which part of the table to convert to a header</p>
																	<div class="input-group">
																		<select class="form-control" name="newcontent">
																			<option value="row">The first row</option>
																			<option value="col">The first column</option>
																			<option value="both">Both the first row and column</option>
																		</select>
																		<span class="input-group-btn">
																			<button class="submit-content btn btn-default" type="submit">Submit</button>
																		</span>
																	</div>
																	<?php break; ?>
																<?php case "tableThShouldHaveScope": ?>
																	<div class="input-group">
																		<select class="form-control" name="newcontent">
																			<option value="col">col</option>
																			<option value="row">row</option>
																		</select>
																		<span class="input-group-btn">
																			<button class="submit-content btn btn-default" type="submit">Submit</button>
																		</span>
																	</div>
																	<?php break; ?>
																<?php endswitch; ?>
															</form>
														<?php endif; ?>
													<?php endif; ?>
												</div>
											</li>
										<?php endforeach; ?>
									</ul>
								</div>
							<?php endif; ?>

							<?php if(count($report->warning) > 0): ?>
								<div class="panel panel-warning">
									<div class="panel-heading">
										<h4 class="panel-title">Warnings <span class="badge"><?= count($report->warning); ?></span></h4>
									</div>

									<ul class="list-group">
										<?php foreach ($report->warning as $item): ?>
											<li class="list-group-item">
												<div class="clearfix margin-bottom-small">
													<h5 class="text-warning pull-left"><span class="glyphicon glyphicon-remove-sign"></span> <?= $item->title; ?></h5>
												</div>

												<?php if (isset($item->description)): ?>
													<div class="error-desc">
														<?= $item->description ?>
													</div>
												<?php endif; ?>

												<?php if ($item->html): ?>
													<p><a class="viewError" href="#viewError">View the source of this issue</a></p>
													<pre class="hidden"><code class="html"><strong>Line <?= $item->lineNo; ?></strong>: <?= htmlspecialchars($item->html); ?></code></pre>
												<?php endif; ?>
											</li>
										<?php endforeach; ?>
									</ul>
								</div>
							<?php endif; ?>

							<?php if (count($report->suggestion) > 0): ?>
								<div class="panel panel-info no-margin">
									<div class="panel-heading">
										<h4 class="panel-title">Suggestions <span class="badge"><?= count($report->suggestion); ?></span></h4>
									</div>

									<ul class="list-group">
										<?php foreach ($report->suggestion as $item): ?>
											<li class="list-group-item">
												<div class="clearfix margin-bottom-small">
													<h5 class="text-info pull-left"><span class="glyphicon glyphicon-remove-sign"></span> <?= $item->title; ?></h5>
												</div>

												<?php if (isset($item->description)): ?>
													<div class="error-desc">
														<?= $item->description ?>
													</div>
												<?php endif; ?>

												<?php if ($item->html): ?>
													<p><a class="viewError" href="#viewError">View the source of this issue</a></p>
													<div class="more-info hidden">
														<div class="error-preview">
															<?= $item->html; ?>
														</div>
														<pre class="error-source"><code class="html"><strong>Line <?= $item->lineNo; ?></strong>: <?= htmlspecialchars($item->html); ?></code></pre>
													</div>
												<?php endif; ?>
											</li>
										<?php endforeach; ?>
									</ul>
								</div>
							<?php endif; ?>
						</div>
					</div>
				<?php endif; ?>
			<?php endforeach; ?>
		<?php endif; ?>
		<?php break; ?>
	<?php case "module_urls": ?>
		<h2 class="content-title">Module URLs <small><?= count($bad->items) ?> with issues from <?= $bad->amount ?> total in <?= $bad->time ?> seconds</small></h2>

		<?php if (!$bad->items): ?>
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

						<?php foreach ($bad->items as $item): ?>
							<a href="<?= $item->url; ?>" class="list-group-item"><?= $item->title; ?> (<?= $item->external_url; ?>)</a>
						<?php endforeach; ?>

					</div>
				</div>
			</div>
		<?php endif; ?>
		<?php break; ?>
	<?php case "unscannable": ?>
		<h2 class="content-title">Unscannable <small><?= count($bad->items) ?> files</small></h2>

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
							<li><a href="<?= $resource_link['doc']; ?>" target="blank"><?= $resource_link['doc']; ?></a></li>
							<li><a href="<?= $resource_link['ppt']; ?>" target="blank"><?= $resource_link['ppt']; ?></a></li>
							<li><a href="<?= $resource_link['pdf']; ?>" target="blank"><?= $resource_link['pdf']; ?></a></li>
						</ul>
					</div>
				</div>

				<div class="list-group no-margin">

					<?php foreach ($bad->items as $item): ?>
						<a href="<?= $item->url; ?>" class="list-group-item"><?= $item->title; ?></a>
					<?php endforeach; ?>

				</div>
			</div>
		</div>
		<?php break; ?>
	<?php endswitch; ?>
<?php endforeach; ?>