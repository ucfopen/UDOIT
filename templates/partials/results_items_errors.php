
<div class="panel panel-danger">
	<div class="panel-heading">
		<h4 class="panel-title"><span class="badge"><?= count($item->error); ?></span> Errors</h4>
	</div>
	<ul class="list-group">
		<?
			$tmp_items = $item->error;
			$fixable_types = $fixable_error_types;
			// group the error types together
			$tmp_types = [];
			foreach ($tmp_items as $tmp_item) {
				if ( ! isset($tmp_types[$tmp_item->type])) {
					$tmp_types[$tmp_item->type] = [];
				}
				$tmp_types[$tmp_item->type][] = $tmp_item;
			}
		?>
		<? foreach ($tmp_types as $type => $type_group): ?>
			<? $heading_data = $type_group[0]; ?>
			<li class="list-group-item">

				<!-- Error group header -->
				<div class="collapse-header" data-toggle="collapse" data-target="#collapse-<?= $item->id ?>-<?= $type; ?>">
					<h5 class="text-danger title-line">
						<span class="badge badge-error"><?= count($type_group) ?> x </span> <?= $heading_data->title; ?>
					</h5>
				</div>
				<? if (isset($heading_data->description)): ?>
					<div class="error-desc"><p><?= $heading_data->description ?></p></div>
				<? endif; ?>
				<!-- End Error group header -->

				<div id="collapse-<?= $item->id ?>-<?= $type; ?>" class="collapse in fade margin-top-small">
					<ol>
					<? foreach ($type_group as $index => $group_item): ?>
						<? $li_id = "error-{$item->id}-{$type}-{$index}"; ?>
						<li id="<?= $li_id ?>">

							<? if ( in_array($group_item->type, $fixable_types) ): ?>
								<p class="fix-success hidden"><?= $index; ?>. <span class="label label-success margin-left-small" style="margin-top: -2px;">Done!</span></p>
							<? endif; ?>

							<!-- Print Report -->
							<? if ($group_item->html): ?>
								<a class="viewError btn" href="#viewError" data-error="<?= $li_id ?>">View the source of this issue</a>
								<div class="more-info hidden instance">
									<a class="closeError btn" href="#closeError" data-error="<?= $li_id ?>">Close Issue Source</a>
									<div class="error-preview">
										<? if ($group_item->type == "videosEmbeddedOrLinkedNeedCaptions"): ?>
											<iframe width="100%" height="300px" src="https://www.youtube.com/embed/<?= isYoutubeVideo($group_item->html, $regex); ?>" frameborder="0" allowfullscreen></iframe>
										<? else: ?>
											<?= $group_item->html; ?>
										<? endif; ?>
									</div>
									<pre class="error-source"><code class="html"><strong>Line <?= $group_item->lineNo; ?></strong>: <?= htmlspecialchars($group_item->html); ?></code></pre>
									<a class="closeError btn" href="#closeError" data-error="<?= $li_id ?>">Close Issue Source</a>
								</div>
							<? endif; ?>

							<? if (empty($post_path) && in_array($group_item->type, $fixable_types)): ?>
								<div>
									<button class="fix-this no-print btn btn-success instance" value="<?= $group_item->type ?>">U FIX IT!</button>
									<div class="toolmessage instance">UFIXIT is disabled because this is an old report. Rescan the course to use UFIXIT.</div>
								</div>
								<form class="ufixit-form form-horizontal no-print hidden instance" action="#" role="form">
									<input type="hidden" name="main_action" value="ufixit">
									<input type="hidden" name="contenttype" value="<?= $content_group->title; ?>">
									<input type="hidden" name="contentid" value="<?= $item->id; ?>">
									<input type="hidden" name="errorhtml" value="<?= htmlspecialchars($group_item->html); ?>">
									<input type="hidden" name="errortype" value="<?= $group_item->type; ?>">
									<input type="hidden" name="reporttype" value="error">
									<input type="hidden" name="reporttype" value="suggestion">
									<input type="hidden" name="errortype" value="<?= $group_item->type; ?>">
									<input type="hidden" name="submittingagain" value="">

									<?php
										switch ($group_item->type){
											case "cssTextHasContrast":
											?>

											<? for ($i = 0; $i < count($group_item->colors); $i++): ?>
												<input type="hidden" name="errorcolor[<?= $i; ?>]" value="<?= $group_item->colors[$i]; ?>">
											<? endfor; ?>

											<div class="holder">
												<div class="left">
													<div class="form-group no-margin margin-bottom">
														<? if ( isset($group_item->back_color) ): ?>
															<label for="newcontent[1]">Replace Background Color <?= $group_item->back_color; ?></label>
															<input class="color {hash:true,caps:false} form-control back-color" type="text" name="newcontent[1]" value="<?= $group_item->back_color; ?>" placeholder="Replacement for Background Color <?= $group_item->back_color; ?>">
														<? endif; ?>

														<label for="newcontent[0]">Replace Foreground Color <?= $group_item->fore_color; ?></label>&nbsp;<span class="contrast-invalid hidden red"><span class="glyphicon glyphicon-remove"></span>&nbsp;Ratio Invalid (<span class="contrast-ratio"></span>:1)</span>
														<input class="color {hash:true,caps:false} form-control fore-color" type="text" name="newcontent[0]" value="<?= $group_item->fore_color; ?>" placeholder="Replacement for Foreground Color <?= $group_item->fore_color; ?>">
														<label><input name="add-bold" type="checkbox" value="bold" />&nbsp;Make this text bold</label>&nbsp;<label><input name="add-italic" type="checkbox" value="italic" />&nbsp;Make this text <span style="font-style: italics;">italicized</span></label><br />
														<input type="text" name="threshold" class="threshold hidden" value="<?= $group_item->text_type ?>">
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
														<? $colors = ['888888','F5EB32','70B538','178E3E','225E9D','163D76','202164','6A1C68','CA1325','D44A25','DF7A2A']; ?>
														<? foreach ($colors as $color): ?>
															<li class="color" value="#<?= $color ?>"><span class="hidden invalid-color">X </span>#<?= $color ?></li>
														<? endforeach; ?>
													</ul>
													<ul class="color-picker short margin-bottom">
														<? $colors = ['000000','99962F','4B7631','155F2E','183F6A','1B294C','1A1A40','451843','7D1820','843322','8A5126']; ?>
														<? foreach ($colors as $color): ?>
															<li class="color" value="#<?= $color ?>"><span class="hidden invalid-color">X </span>#<?= $color ?></li>
														<? endforeach; ?>
													</ul>
												</div>
											</div>
											<button class="submit-content btn btn-default" type="submit">Submit</button>
											<? break; ?>

										<?php case "headersHaveText": ?>
											<div class="form-group no-margin margin-bottom">
												<input class="{hash:true,caps:false} form-control" type="text" name="newcontent" placeholder="New heading text">
												<label><input class="remove-heading" type="checkbox" />&nbsp;Delete this Header completely instead</label><br />
												<button class="submit-content btn btn-default" type="submit">Submit</button>
											</div>
											<? break; ?>

										<?php case "aMustContainText": ?>
										<?php case "aSuspiciousLinkText": ?>
										<?php case "aLinkTextDoesNotBeginWithRedundantWord": ?>
											<div class="form-group no-margin margin-bottom">
												<input class="{hash:true,caps:false} form-control" type="text" name="newcontent" placeholder="New link text">
												<label><input class="remove-link" type="checkbox" />&nbsp;Delete this Link completely instead</label><br />
												<button class="submit-content btn btn-default" type="submit">Submit</button>
											</div>
											<? break; ?>

										<?php case "imgHasAlt": ?>
										<?php case "imgNonDecorativeHasAlt": ?>
										<?php case "imgAltIsDifferent": ?>
										<?php case "imgAltIsTooLong": ?>
											<div class="fix-alt input-group">
												<span class="counter">100</span>
												<input class="form-control" type="text" name="newcontent" maxlength="100" placeholder="New alt text">
												<span class="input-group-btn">
													<button class="submit-content btn btn-default" type="submit">Submit</button>
												</span>
											</div>
											<? break; ?>

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
											<? break; ?>

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
											<? break; ?>

										<?php case "aSuspiciousLinkText": ?>
											<div class="input-group">
												<input class="form-control" type="text" name="newcontent" placeholder="New link description">
												<span class="input-group-btn">
													<button class="submit-content btn btn-default" type="submit">Submit</button>
												</span>
											</div>
											<? break; ?>

									<? } ?>
								</form>
							<? endif; # if (empty($post_path) && in_array($group_item->type, $fixable_types)): ?>
						</li>
					<? endforeach; # foreach ($type_group as $group_item):  ?>
					</ol>
				</div>
			</li>
		<? endforeach; # foreach ($error_types as $type_group):?>
	</ul>
</div>
