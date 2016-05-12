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
?>
<h2 class="content-title">Unscannable <small><?= count($items) ?> files</small></h2>

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
					<li><a href="http://webaim.org/techniques/word/" target="blank">http://webaim.org/techniques/word/</a></li>
					<li><a href="http://webaim.org/techniques/powerpoint/" target="blank">http://webaim.org/techniques/powerpoint/</a></li>
					<li><a href="http://webaim.org/techniques/acrobat/" target="blank">http://webaim.org/techniques/acrobat/</a></li>
				</ul>

			</div>
		</div>

		<div class="list-group no-margin">

			<?php foreach ($items as $item): ?>
				<a href="<?= $item->url; ?>" class="list-group-item"><?= $item->title; ?></a>
			<?php endforeach; ?>

		</div>
	</div>
</div>
