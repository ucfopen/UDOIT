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

global $unscannable_suggestion_on;
global $unscannable_suggestion;
?>

<h2 class="content-title">Unscannable <small><?= $out_of_items; ?> files</small></h2>
<div class="errorItem panel panel-default">
	<div class="panel-heading clearfix">
		<button class="btn btn-xs btn-default btn-toggle pull-left no-print margin-right-small"><span class="glyphicon glyphicon-plus"></span></button>

		<h3 class="plus pull-left">UDOIT is unable to scan these files</h3>
	</div>

	<div class="errorSummary panel-body">
		<div class="panel panel-info">
			<div class="panel-body">
				<?php if($unscannable_suggestion_on): ?>
					<p><strong><?= $unscannable_suggestion; ?></strong></p>
				<?php endif; ?>

				<p>Due to the nature of UDOIT, the content in these files cannot be scanned for accessibility problems. Please visit the following resources to read about accessibility for these file types.</p>

				<ul class="list-unstyled">
					<li><a href="http://webaim.org/techniques/word/" target="blank">http://webaim.org/techniques/word/</a></li>
					<li><a href="http://webaim.org/techniques/powerpoint/" target="blank">http://webaim.org/techniques/powerpoint/</a></li>
					<li><a href="http://webaim.org/techniques/acrobat/" target="blank">http://webaim.org/techniques/acrobat/</a></li>
				</ul>

			</div>
		</div>

		<ul id="filters">
		    <li>
		        <input type="checkbox" value="pdf" id="filter-pdf" checked/>
		        <label for="filter-pdf">PDF</label>
		    </li>
		    <li>
		        <input type="checkbox" value="doc" id="filter-doc" checked/>
		        <label for="filter-doc">DOC</label>
		    </li>
		    <li>
		        <input type="checkbox" value="ppt" id="filter-ppt" checked/>
		        <label for="filter-ppt">PPT</label>
		    </li>
		</ul>

		<div id="unscannable" class="list-group no-margin">

			<?php foreach ($items as $item): ?>
				<div class="item-container <?= $item->extension; ?>">
					<div class="list-group-item">
						<a target="_blank" href="<?= $item->path; ?>">Folder</a> - 
						<a class="download" href="<?= $item->url; ?>"><?= $item->title; ?></a>
						<span class="module-location"><?= $item->module; ?></span>
					</div>
					<?php if($item->big == true): ?>
					<hr>
					<a class="unscannable-warning view-warning">
						<span class="glyphicon glyphicon-info-sign"></span>
						Warning: Large File (> <?= $size_limit; ?>)
					</a>
					<div class="warning-info hidden">
						Users with slow internet connections (such as modem or 2G cellular data) may have trouble downloading files larger than 50mb in a reasonable amount of time. Consider reducing the size of this file.
					</div>
					<?php endif; ?>
				</div>
			<?php endforeach; ?>

		</div>
	</div>
</div>
