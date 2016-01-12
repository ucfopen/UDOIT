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
} elseif ($_POST['main_action'] === "cached") {
	die('<div class="alert alert-danger no-margin">Cannot parse this report. JSON file not found.</div>');
}

$issue_count = 0;

$regex = array(
	'@youtube\.com/embed/([^"\& ]+)@i',
	'@youtube\.com/v/([^"\& ]+)@i',
	'@youtube\.com/watch\?v=([^"\& ]+)@i',
	'@youtube\.com/\?v=([^"\& ]+)@i',
	'@youtu\.be/([^"\& ]+)@i',
	'@youtu\.be/v/([^"\& ]+)@i',
	'@youtu\.be/watch\?v=([^"\& ]+)@i',
	'@youtu\.be/\?v=([^"\& ]+)@i',
	);

function isYouTubeVideo($link_url, $regex)
{
	$matches = null;
	foreach($regex as $pattern) {
		if(preg_match($pattern, $link_url, $matches)) {
			return $matches[1];
		}
	}
	return null;
}

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

							<h3 class="plus pull-left"><a href="<?= $report->url; ?>" target="_blank"><?= $report->name; ?>&nbsp;<small><span class ="glyphicon glyphicon-new-window"></span></small></a></h3>

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
										<h4 class="panel-title"><span class="badge"><?= count($report->error); ?></span> Errors</h4>
									</div>
									<ul class="list-group">
										<?php $instanceIndices = []; $indice = 0; $previtemtype = ''; $instance = 1;?>
										<?php foreach ($report->error as $item): ?>
											<?php $issue_count++; $currtype = $item->type; ?>
											<?php if ($currtype != $previtemtype): ?>
												<?php $instanceIndices[$indice] = $instance - 1; ?>
												<?php $newItemType = true; $instance = 1; $indice++;?>
											<?php endif; ?>
											<?php $previtemtype = $currtype; $newItemType = false; $instance++;?>
										<?php endforeach; ?>
										<?php $instanceIndices[$indice] = $instance - 1; ?>
										<?php $previtemtype = ''; $instance = 1; $indice = 0; ?>
										<?php foreach ($report->error as $item): ?>
											<?php $issue_count++; $currtype = $item->type; ?>
											<?php if ($currtype != $previtemtype): ?>
												</li>
												<li class="list-group-item">
												<?php $newItemType = true; $instance = 1; $indice++; ?>
											<?php endif; ?>
											<div>
												<?php if($newItemType): ?>
													<a href="#collapse-<?= $report->id; ?>-<?= $issue_count; ?>" data-toggle="collapse"><h5 class="text-danger pull-left title-line"><span class="badge badge-error"><?= $instanceIndices[$indice]; ?></span>&nbsp;<?= $item->title; ?></h5></a>
													<?php if ((isset($item->description)) && $newItemType): ?>
														<div class="error-desc">
															<p><?= $item->description ?></p>
														</div>
													<?php endif; ?>
												<?php endif; ?>
												<?php if ($item->type == "cssTextHasContrast" || $item->type == "imgHasAlt" || $item->type == "imgNonDecorativeHasAlt" || $item->type == "tableDataShouldHaveTh" || $item->type == "tableThShouldHaveScope" || $item->type === "headersHaveText" || $item->type == "aMustContainText" || $item->type == "imgAltIsDifferent"): ?>
													<p class="fix-success hidden"><?= $instance; ?>. <span class="label label-success margin-left-small" style="margin-top: -2px;">Fixed!</span></p>
												<?php endif; ?>
												
												<div id="collapse-<?= $report->id; ?>-<?= $issue_count; ?>" class="collapse in fade margin-top-small">
														<?php if ($item->html): ?>
															<p class="instance"><?= $instance; ?>. <a class="viewError" href="#viewError">View the source of this issue</a><a class="closeError hidden" href="#closeError">&nbsp;Close this view&nbsp;</a></p>
															<div class="more-info hidden instance">
																<div class="error-preview">
																	<?php if ($item->type == "videosEmbeddedOrLinkedNeedCaptions"): ?>
																		<?php $video_id = isYoutubeVideo($item->html, $regex); ?>
																		<iframe width="100%" height="300px" src="https://www.youtube.com/embed/<?= $video_id; ?>" frameborder="0" allowfullscreen></iframe>
																	<?php else: ?>
																		<?= $item->html; ?>
																	<?php endif; ?>
																</div>
																<pre class="error-source"><code class="html"><strong>Line <?= $item->lineNo; ?></strong>: <?= htmlspecialchars($item->html); ?></code></pre>
																<p><a class="closeError" href="#closeError">&nbsp;Close this view&nbsp;</a></p>
															</div>
														<?php endif; ?>

														<?php if (empty($_POST['path'])): ?>
															<?php if ($item->type === "cssTextHasContrast" || $item->type === "imgHasAlt" || $item->type === "imgNonDecorativeHasAlt" || $item->type === "tableDataShouldHaveTh" || $item->type === "tableThShouldHaveScope" || $item->type === "headersHaveText" || $item->type == "aMustContainText" || $item->type == "imgAltIsDifferent"): ?>
																<button class="fix-this no-print btn btn-success instance" value="<?= $item->type ?>">U FIX IT!</button>
																<div class="toolmessage instance">UFIXIT is disabled because this is an old report. Rescan the course to use UFIXIT.</div>
																<form class="ufixit-form form-horizontal no-print hidden instance" action="lib/process.php" method="post" role="form">
																	<input type="hidden" name="main_action" value="ufixit">
																	<input type="hidden" name="contenttype" value="<?= $bad->title; ?>">
																	<input type="hidden" name="contentid" value="<?= $report->id; ?>">
																	<input type="hidden" name="errorhtml" value="<?= htmlspecialchars($item->html); ?>">
																	<input type="hidden" name="reporttype" value="error">
																	<?php if ($item->type == "cssTextHasContrast"): ?>
																		<?php for ($i = 0; $i < count($item->colors); $i++): ?>
																			<input type="hidden" name="errorcolor[<?= $i; ?>]" value="<?= $item->colors[$i]; ?>">
																		<?php endfor; ?>
																	<?php endif; ?>
																	<input type="hidden" name="errortype" value="<?= $item->type; ?>">
																	<input type="hidden" name="submittingagain" value="">

																	<?php switch ($item->type):
																	case "cssTextHasContrast": ?>
																	<div class="holder">
																		<div class="left">
																			<div class="form-group no-margin margin-bottom">
																				<?php if ( isset($item->back_color) ): ?>
																					<label for="newcontent[1]">Replacement for Background Color <?= $item->back_color; ?></label>
																					<input class="color {hash:true,caps:false} form-control back-color" type="text" name="newcontent[1]" value="<?= $item->back_color; ?>" placeholder="Replacement for Background Color <?= $item->back_color; ?>">
																				<?php endif; ?>

																				<label for="newcontent[0]">Replacement for Foreground Color <?= $item->fore_color; ?></label>&nbsp;<span class="contrast-invalid hidden red"><span class="glyphicon glyphicon-remove"></span>&nbsp;Ratio Invalid (<span class="contrast-ratio"></span>:1)</span>
																				<input class="color {hash:true,caps:false} form-control fore-color" type="text" name="newcontent[0]" value="<?= $item->fore_color; ?>" placeholder="Replacement for Foreground Color <?= $item->fore_color; ?>">
																			</div>
																		</div>
																		<div class="right ufixit-preview">
																			<div class="ufixit-preview-canvas" name="load-preview">
																				<p>Text</p>
																			</div>
																		</div>
																		<div class="clear">
																			<label for="newcontent[0]">Foreground Color Palette</label>
																			<ul class="color-picker regular">
																				<li class="color" value="#888888"><span class="hidden invalid-color">X </span>#888888</li>
																				<li class="color" value="#F5EB32"><span class="hidden invalid-color">X </span>#F5EB32</li>
																				<li class="color" value="#70B538"><span class="hidden invalid-color">X </span>#70B538</li>
																				<li class="color" value="#178E3E"><span class="hidden invalid-color">X </span>#178E3E</li>
																				<li class="color" value="#225E9D"><span class="hidden invalid-color">X </span>#225E9D</li>
																				<li class="color" value="#163D76"><span class="hidden invalid-color">X </span>#163D76</li>
																				<li class="color" value="#202164"><span class="hidden invalid-color">X </span>#202164</li>
																				<li class="color" value="#6A1C68"><span class="hidden invalid-color">X </span>#6A1C68</li>
																				<li class="color" value="#CA1325"><span class="hidden invalid-color">X </span>#CA1325</li>
																				<li class="color" value="#D44A25"><span class="hidden invalid-color">X </span>#D44A25</li>
																				<li class="color" value="#DF7A2A"><span class="hidden invalid-color">X </span>#DF7A2A</li>
																			</ul>
																			<ul class="color-picker short margin-bottom">
																				<li class="color" value="#000000"><span class="hidden invalid-color">X </span>#000000</li>
																				<li class="color" value="#99962F"><span class="hidden invalid-color">X </span>#99962F</li>
																				<li class="color" value="#4B7631"><span class="hidden invalid-color">X </span>#4B7631</li>
																				<li class="color" value="#155F2E"><span class="hidden invalid-color">X </span>#155F2E</li>
																				<li class="color" value="#183F6A"><span class="hidden invalid-color">X </span>#183F6A</li>
																				<li class="color" value="#1B294C"><span class="hidden invalid-color">X </span>#1B294C</li>
																				<li class="color" value="#1A1A40"><span class="hidden invalid-color">X </span>#1A1A40</li>
																				<li class="color" value="#451843"><span class="hidden invalid-color">X </span>#451843</li>
																				<li class="color" value="#7D1820"><span class="hidden invalid-color">X </span>#7D1820</li>
																				<li class="color" value="#843322"><span class="hidden invalid-color">X </span>#843322</li>
																				<li class="color" value="#8A5126"><span class="hidden invalid-color">X </span>#8A5126</li>
																			</ul>
																		</div>
																	</div>
																		<button class="submit-content btn btn-default" type="submit">Submit</button>
																		<?php break; ?>
																	<?php case "headersHaveText": ?>
																		<div class="form-group no-margin margin-bottom">
																			<input class="{hash:true,caps:false} form-control" type="text" name="newcontent" placeholder="New heading text">
																			<label><input class="remove-heading" type="checkbox" />&nbsp;Delete this Header completely instead</label><br />
																			<button class="submit-content btn btn-default" type="submit">Submit</button>
																		</div>
																		<?php break; ?>
																	<?php case "aMustContainText": ?>
																	<?php case "aSuspiciousLinkText": ?>
																	<?php case "aLinkTextDoesNotBeginWithRedundantWord": ?>
																		<div class="form-group no-margin margin-bottom">
																			<input class="{hash:true,caps:false} form-control" type="text" name="newcontent" placeholder="New link text">
																			<label><input class="remove-link" type="checkbox" />&nbsp;Delete this Link completely instead</label><br />
																			<button class="submit-content btn btn-default" type="submit">Submit</button>
																		</div>
																		<?php break; ?>
																	<?php case "imgHasAlt": ?>
																	<?php case "imgNonDecorativeHasAlt": ?>
																	<?php case "imgAltIsDifferent": ?>
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
																	<?php case "aSuspiciousLinkText": ?>
																		<div class="input-group">
																			<input class="form-control" type="text" name="newcontent" placeholder="New link description">
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
											</div>
											<?php $previtemtype = $currtype; $newItemType = false; $instance++;?>
										<?php endforeach; ?>
									</ul>
								</div>
							<?php endif; ?>

							<?php if(count($report->warning) > 0): ?>
								<div class="panel panel-warning">
									<div class="panel-heading">
										<h4 class="panel-title"><span class="badge"><?= count($report->warning); ?></span> Warnings</h4>
									</div>

									<ul class="list-group">
										<?php foreach ($report->warning as $item): ?>
											<li class="list-group-item">
												<div class="clearfix margin-bottom-small">
													<h5 class="text-warning pull-left"><?= $item->title; ?></h5>
												</div>

												<?php if (isset($item->description)): ?>
													<div class="error-desc">
														<?= $item->description ?>
													</div>
												<?php endif; ?>

												<?php if ($item->html): ?>
													<p class="instance"><?= $instance; ?>. <a class="viewError" href="#viewError">View the source of this issue</a><a class="closeError hidden" href="#closeError">&nbsp;Close this view&nbsp;</a></p>
													<div class="more-info hidden">
														<pre class="hidden">
															<code class="html"><strong>Line <?= $item->lineNo; ?></strong>: <?= htmlspecialchars($item->html); ?></code>
														</pre>
														<p><a class="closeError" href="#closeError">Close this view</a></p>
													</div>
												<?php endif; ?>
											</li>
										<?php endforeach; ?>
									</ul>
								</div>
							<?php endif; ?>

							<?php if (count($report->suggestion) > 0): ?>
								<div class="panel panel-info no-margin">
									<div class="panel-heading">
										<h4 class="panel-title"><span class="badge"><?= count($report->suggestion); ?></span> Suggestions</h4>
									</div>
									<ul class="list-group">
										<?php $instanceIndices = []; $indice = 0; $previtemtype = ''; $instance = 1;?>
										<?php foreach ($report->suggestion as $item): ?>
											<?php $issue_count++; $currtype = $item->type; ?>
											<?php if ($currtype != $previtemtype): ?>
												<?php $instanceIndices[$indice] = $instance - 1; ?>
												<?php $newItemType = true; $instance = 1; $indice++;?>
											<?php endif; ?>
											<?php $previtemtype = $currtype; $newItemType = false; $instance++;?>
										<?php endforeach; ?>
										<?php $instanceIndices[$indice] = $instance - 1; ?>
										<?php $previtemtype = ''; $instance = 1; $indice = 0; ?>
										<?php foreach ($report->suggestion as $item): ?>
											<?php $issue_count++; $currtype = $item->type; ?>
											<?php if ($currtype != $previtemtype): ?>
												</li>
												<li class="list-group-item">
												<?php $newItemType = true; $instance = 1; $indice++; ?>
																								
											<?php endif; ?>
											<div class="clearfix margin-bottom-small title-line">
												<?php if($newItemType): ?>
													<h5 class="text-info pull-left"><span class="badge badge-suggestion"><?= $instanceIndices[$indice]; ?></span>&nbsp;<?= $item->title; ?></h5>
												<?php endif ?>
											</div>
											<div>
												<?php if ((isset($item->description)) && $newItemType): ?>
													<div class="error-desc">
														<?= $item->description ?>
													</div>
												<?php endif; ?>
												<?php if ($item->type === "aSuspiciousLinkText" || $item->type === "aLinkTextDoesNotBeginWithRedundantWord"): ?>
													<p class="fix-success hidden"><?= $instance; ?>. <span class="label label-success margin-left-small" style="margin-top: -2px;">Fixed!</span></p>
												<?php endif; ?>
												<div id="collapse-<?= $report->id; ?>-<?= $issue_count; ?>" class="collapse in fade margin-top-small">
													<?php if ($item->html): ?>
														<p class="instance"><?= $instance; ?>. <a class="viewError" href="#viewError">View the source of this issue</a><a class="closeError hidden" href="#closeError">&nbsp;Close this view&nbsp;</a></p>
														<div class="more-info hidden instance">
															<div class="error-preview">
																<?= $item->html; ?>
															</div>
															<pre class="error-source"><code class="html"><strong>Line <?= $item->lineNo; ?></strong>: <?= htmlspecialchars($item->html); ?></code></pre>
															<p><a class="closeError" href="#closeError">Close this view</a></p>
														</div>
													<?php endif; ?>

													<?php if (empty($_POST['path'])): ?>
															<?php if ($item->type === "aSuspiciousLinkText" || $item->type === "aLinkTextDoesNotBeginWithRedundantWord"): ?>
																<button class="fix-this no-print btn btn-success instance"  value="<?= $item->type ?>">U FIX IT!</button>
																<div class="toolmessage instance">UFIXIT is disabled because this is an old report. Rescan the course to use UFIXIT.</div>
																<form class="ufixit-form form-horizontal no-print hidden instance" action="lib/process.php" method="post" role="form">
																	<input type="hidden" name="main_action" value="ufixit">
																	<input type="hidden" name="contenttype" value="<?= $bad->title; ?>">
																	<input type="hidden" name="contentid" value="<?= $report->id; ?>">
																	<input type="hidden" name="errorhtml" value="<?= htmlspecialchars($item->html); ?>">
																	<input type="hidden" name="errortype" value="<?= $item->type; ?>">
																	<input type="hidden" name="reporttype" value="suggestion">
																	<input type="hidden" name="submittingagain" value="">

																	<?php switch ($item->type):
																case "aSuspiciousLinkText": ?>
																	<?php case "aLinkTextDoesNotBeginWithRedundantWord": ?>
																		<div class="form-group no-margin margin-bottom">
																			<input class="{hash:true,caps:false} form-control" type="text" name="newcontent" placeholder="New link text">
																			<label><input class="remove-link" type="checkbox" />&nbsp;Delete this Link completely instead</label><br />
																			<button class="submit-content btn btn-default" type="submit">Submit</button>
																		</div>
																		<?php break; ?>
																	<?php break; ?>
																<?php endswitch; ?>
															</form>
														<?php endif; ?>
													<?php endif; ?>
												</div>
											</div>
											<?php $previtemtype = $currtype; $newItemType = false; $instance++;?>
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