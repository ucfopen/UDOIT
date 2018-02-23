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

$settings = [
	'footer_scripts' => [
		"//code.jquery.com/jquery-2.1.1.min.js",
		"//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js",
		"assets/js/admin.js?cachebuster=".time(),
	]
];

$this->layout('template', $settings);

?>
<ul class="nav nav-tabs nav-justified" role="tablist">
	<li role="presentation" class="active"><a href="#all" role="tab" data-toggle="tab">All Reports</a></li>
	<li role="presentation"><a href="#issues-per-course" role="tab" data-toggle="tab">Issues Per Course</a></li>
	<li role="presentation"><a href="#scans-per-user" role="tab" data-toggle="tab">Scans Per User</a></li>
	<li role="presentation"><a href="#user-growth" role="tab" data-toggle="tab">User Growth</a></li>
	<li role="presentation"><a href="#user-admin" role="tab" data-toggle="tab">User Admin</a></li>
</ul>
<main id="contentWrapper" role="main">
	<div class="tab-content">
		<div class="tab-pane active" id="all" role="tabpanel">
			<div class="panel panel-default">
				<div class="panel-body">
					<h2>Viewing All Reports</h2>

					<p>form goes here</p>
				</div>
			</div>
		</div>
		<div class="tab-pane" id="issues-per-course" role="tabpanel">
			<div class="panel panel-default">
				<div class="panel-body">
					<h2>Issues Per Course</h2>
				</div>
			</div>
		</div>
		<div class="tab-pane" id="scans-per-user" role="tabpanel">
			<div class="panel panel-default">
				<div class="panel-body">
					<h2>Scans per user</h2>
				</div>
			</div>
		</div>
		<div class="tab-pane" id="user-growth" role="tabpanel">
			<div class="panel panel-default">
				<div class="panel-body">
					<h2>User Growth</h2>
					<form id="user-growth-pull" class="admin-form" action="#" role="form">
						<label for="user-growth-grain">Granularity: 
							<select id="user-growth-grain" name="grain">
								<option value="day" selected>Day</option>
								<option value="week">Week</option>
								<option value="month">Month</option>
								<option value="year">Year</option>
							</select>
						</label>
						<label for="user-growth-start-date">Start Date: 
							<input type="date" name="startdate" id="user-growth-start-date" required pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"/>
						</label>
						<label for="user-growth-end-date">End Date: 
							<input type="date" name="enddate" id="user-growth-end-date" required pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"/>
						</label>
						<input type="submit" class="btn btn-default" name="user-growth-submit" value="Generate Report" />
					</form>
				</div>
			</div>
			<div id="user-growth-results" class="stat-results"></div>
		</div>
		<div class="tab-pane" id="user-admin" role="tabpanel">
			<div class="panel panel-default">
				<div class="panel-body">
					<h2>User Admin</h2>
					<button id="user-pull" class="btn btn-default">Generate Report</button>
					<div id="user-results" class="stat-results"></div>
				</div>
			</div>
		</div>
	</div>
</main>
