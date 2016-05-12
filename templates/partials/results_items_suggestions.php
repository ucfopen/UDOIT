<div class="panel panel-info no-margin">
	<div class="panel-heading">
		<h4 class="panel-title"><span class="badge"><?= count($item->suggestion); ?></span> Suggestions</h4>
	</div>
	<ul class="list-group">
		<?
			$tmp_items = $item->suggestion;
			$fixable_types = ["aSuspiciousLinkText", "aLinkTextDoesNotBeginWithRedundantWord", "cssTextStyleEmphasize"];
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
			<? $collapse_id = "collapse-{$item->id}-{$type}"; ?>
			<li class="list-group-item">

				<!-- Error group header -->
				<div class="collapse-header" data-toggle="collapse" data-target="#<?= $collapse_id; ?>">
					<h5 class="text-danger title-line">
						<span class="badge badge-error"><?= count($type_group) ?> x </span> <?= $heading_data->title; ?>
					</h5>
				</div>
				<? if (isset($heading_data->description)): ?>
					<div class="error-desc"><p><?= $heading_data->description ?></p></div>
				<? endif; ?>
				<!-- End Error group header -->

				<div id="<?= $collapse_id; ?>" class="collapse in fade margin-top-small">
					<ol>
						<? foreach ($type_group as $index => $group_item): ?>
							<? $li_id = "error-{$item->id}-{$type}-{$index}"; ?>
							<li id="<?= $li_id ?>">

								<? if ( in_array($group_item->type, $fixable_types) ): ?>
									<p class="fix-success hidden"><?= $index; ?>. <span class="label label-success margin-left-small" style="margin-top: -2px;">Done!</span></p>
								<? endif; ?>


								<?php if ($group_item->html): ?>
									<a class="viewError btn" href="#viewError" data-error="<?= $li_id ?>">View the source of this issue</a>
									<div class="more-info hidden instance">
										<a class="closeError btn" href="#closeError" data-error="<?= $li_id ?>">Close Issue Source</a>
										<div class="error-preview">
											<?= $group_item->html; ?>
										</div>
										<pre class="error-source"><code class="html"><strong>Line <?= $group_item->lineNo; ?></strong>: <?= htmlspecialchars($group_item->html); ?></code></pre>
										<a class="closeError btn" href="#closeError" data-error="<?= $li_id ?>">Close Issue Source</a>
									</div>
								<?php endif; ?>

								<?php if (empty($post_path) && in_array($group_item->type, $fixable_types)): ?>
									<div>
										<button class="fix-this no-print btn btn-success instance" value="<?= $group_item->type; ?>">U FIX IT!</button>
										<div class="toolmessage instance">UFIXIT is disabled because this is an old report. Rescan the course to use UFIXIT.</div>
									</div>
									<form class="ufixit-form form-horizontal no-print hidden instance" action="#" role="form">
										<input type="hidden" name="main_action" value="ufixit">
										<input type="hidden" name="contenttype" value="<?= $content_group->title; ?>">
										<input type="hidden" name="contentid" value="<?= $group_item->id; ?>">
										<input type="hidden" name="errorhtml" value="<?= htmlspecialchars($group_item->html); ?>">
										<input type="hidden" name="errortype" value="<?= $group_item->type; ?>">
										<input type="hidden" name="reporttype" value="suggestion">
										<input type="hidden" name="submittingagain" value="">

										<?php
											switch ($group_item->type){
												case "aSuspiciousLinkText":
												case "aLinkTextDoesNotBeginWithRedundantWord":
												?>
													<div class="form-group no-margin margin-bottom">
														<input class="{hash:true,caps:false} form-control" type="text" name="newcontent" placeholder="New link text">
														<label><input class="remove-link" type="checkbox" />&nbsp;Delete this Link completely instead</label><br />
														<button class="submit-content btn btn-default" type="submit">Submit</button>
													</div>
													<?php break; ?>

											<?php case "cssTextStyleEmphasize": ?>
												<div>
													<?php if ( isset($group_item->back_color) ): ?>
														<input class="hidden back-color" type="text" name="newcontent[1]" value="<?= $group_item->back_color; ?>">
													<?php endif; ?>
													<input class="hidden fore-color" type="text" name="newcontent[0]" value="<?= $group_item->fore_color; ?>">

													<label><input name="add-bold" type="checkbox" value="bold" />&nbsp;Make this text <span style="font-weight: 900;">bold</span></label>
													&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
													<label><input name="add-italic" type="checkbox" value="italic" />&nbsp;Make this text <span style="font-style: italic;">italicized</span></label>
												</div>
												<div class="ufixit-preview">
													<div class="ufixit-preview-canvas" name="load-preview">
														<p>Text</p>
													</div>
												</div>
												<button class="submit-content btn btn-default clear" type="submit" value="<?= $group_item->type ?>">Submit</button>
												<?php break; ?>
										<?php } ?>
									</form>
								<?php endif; # if (empty($post_path) && in_array($group_item->type, $fixable_types)): ?>
							</li>
						<? endforeach; # foreach ($type_group as $index => $group_item): ?>
					</ol>
				</div>
			</li>
		<?php endforeach; # foreach ($tmp_types as $type => $type_group): ?>
	</ul>
</div>
