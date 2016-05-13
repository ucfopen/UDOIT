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
<div id="resultsTable" class="table-responsive">
	<table class="table table-bordered table-hover no-margin">
		<caption>Saved reports for this course</caption>
		<thead>
			<tr>
				<th scope="col">Date &amp; Time</th>
				<th scope="col">Errors</th>
				<th scope="col">Suggestions</th>
			</tr>
		</thead>

		<tbody>
			<?php foreach ($reports as $report): ?>
				<tr id="<?= $this->e($report['id']); ?>">
					<td><?= $this->e($report['date_run']); ?></td>
					<td><?= $this->e($report['errors']); ?></td>
					<td><?= $this->e($report['suggestions']); ?></td>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
</div>
