<div class="panel panel-warning">
	<div class="panel-heading">
		<h4 class="panel-title"><span class="badge"><?= count($item->warning); ?></span> Warnings</h4>
	</div>

	<ul class="list-group">
		<?php foreach ($item->warning as $item): ?>
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
