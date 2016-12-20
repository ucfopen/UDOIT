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
<div class="<?= $style_classes; ?>">
	<div class="panel-heading clearfix"><span class="glyphicon glyphicon-ban-circle"></span> <?= $title; ?></div>

	<ul class="list-group no-margin">
		<?php foreach ($tests as $test): ?>
			<li class="list-group-item">
				<p class="list-group-item-text "><?= $test['title']; ?> <button type="button" class="btn btn-xs btn-default" data-toggle="collapse" data-target="#<?= $this->escape($test['name']); ?>">More info</button></p>

				<div class="list-group-item-text collapse" id="<?= $this->escape($test['name']); ?>">
					<hr>

					<?= $test['desc']; ?>

					<?php if ($test['resources']): ?>
						<p>Resources:</p>
						<ul>
							<?php foreach ($test['resources'] as $resource): ?>
								<li><?= $resource; ?></li>
							<?php endforeach ?>
						</ul>
					<?php endif ?>

					<?php if ($test['example']): ?>
						<hr>
						<?= $test['example']; ?>
					<?php endif ?>
				</div>
			</li>
		<?php endforeach ?>
	</ul>
</div>
