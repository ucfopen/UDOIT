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
			<? foreach ($reports as $report): ?>
				<tr id="<?=$this->e($report['id'])?>">
					<td><?=$this->e($report['date_run'])?></td>
					<td><?=$this->e($report['errors'])?></td>
					<td><?=$this->e($report['suggestions'])?></td>
				</tr>
			<? endforeach; ?>
		</tbody>
	</table>
</div>
