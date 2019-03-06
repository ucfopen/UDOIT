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
		"assets/js/admin.js?cachebuster=1",//.time(),
	]
];

$this->layout('template', $settings);

?>
<ul class="nav nav-tabs nav-justified" role="tablist">
	<li role="presentation" class="active"><a href="#scans-all" role="tab" data-toggle="tab">Scans</a></li>
	<li role="presentation"><a href="#errors-common" role="tab" data-toggle="tab">Errors</a></li>
	<li role="presentation"><a href="#user-admin" role="tab" data-toggle="tab">Users</a></li>
	<li role="presentation"><a href="#user-growth" role="tab" data-toggle="tab">User Growth</a></li>
</ul>
<main id="contentWrapper" role="main">
	<div class="tab-content">
		<div class="tab-pane active" id="scans-all" role="tabpanel">
			<div class="panel panel-default">
				<div class="panel-body">
					<div class="container">
						<form id="scans-pull" role="form">
							<div class="form-group col-md-12">
								<h2>Scans</h2>
							</div>
							<div class="form-group col-md-3">
								<label for="scans-start-date">Start Date</label>
								<input type="date" class="form-control" id="scans-start-date" name="startdate" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" />
							</div>
							<div class="form-group col-md-3">
								<label for="scans-end-date">End Date</label>
								<input type="date" class="form-control" id="scans-end-date" name="enddate" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" />
							</div>
							<div class="form-group col-md-6">
								<label for="order-by">Order By</label>
								<select class="form-control" id="order-by" name="orderby">
									<option value="mostrecent">Most Recent</option>
									<option value="leastrecent">Least Recent</option>
									<option value="mosterrors">Most Errors</option>
									<option value="leasterrors">Least Errors</option>
								</select>
							</div>
							<div class="form-group col-md-2">
								<label class="sr-only" for="scans-term-id">Term</label>
								<select class="form-control" id="scans-term-id" name="termid">
									<option selected value="">All Terms</option>
								</select>
							</div>
							<div class="form-group col-md-2">
								<label class="sr-only" for="scans-course-id">Course ID</label>
								<input type="number" class="form-control" id="scans-course-id" name="courseid" placeholder="Course ID" />
							</div>
							<div class="form-group col-md-2">
								<label class="sr-only" for="scans-user-id">User ID</label>
								<input type="number" class="form-control" id="scans-user-id" name="userid" placeholder="User ID" />
							</div>
							<div class="col-md-6 checkbox">
								<label for="scans-latest-only" class="form-check-label">
									<input type="checkbox" id="scans-latest-only" name="latestonly">Only include the most recent scan per course
								</label>
							</div>
							<div class="col-md-12">
								<button type="submit" class="btn btn-success pull-left" id="scans-submit" name="scans-submit">Display Results</button>
								<select name="number_items" id="scans-pagination-number">
									<option value="10">10</option>
									<option value="25">25</option>
									<option value="50">50</option>
								</select>
								<button type="button" class="btn btn-primary pull-right hidden" id="scans-csv">Get .csv</button>
							</div>
						</form>
					</div>
				</div>
			</div>
			<div id="scans-results" class="stat-results">
				<div class="scans-navigation pull-right hidden">
					<button type="button" class="scans-page-right pull-right">></button>
					<div class="scans-navigation-links pull-right"></div>
					<button type="button" class="scans-page-left pull-right"><</button>
				</div>
				<div class="scans-navigation pull-right hidden">
					<button type="button" class="scans-page-right pull-right">></button>
					<div class="scans-navigation-links pull-right"></div>
					<button type="button" class="scans-page-left pull-right"><</button>
				</div>
			</div>
		</div>
		<div class="tab-pane" id="errors-common" role="tabpanel">
			<div class="panel panel-default">
				<div class="panel-body">
					<div class="container">
						<h2>Most Common Errors</h2>
						<button class="btn btn-success" id="errors-common-submit">Display Results</button>
						<button type="button" class="btn btn-primary pull-right hidden" id="errors-common-csv">Get .csv</button>
					</div>
				</div>
			</div>
			<div id="errors-common-results" class="stat-results"></div>
		</div>
		<div class="tab-pane" id="user-admin" role="tabpanel">
			<div class="panel panel-default">
				<div class="panel-body">
					<div class="container">
						<h2>Users</h2>
						<button class="btn btn-success" id="user-submit">Display Results</button>
						<select name="number_items" id="user-pagination-number">
							<option value="10">10</option>
							<option value="25">25</option>
							<option value="50">50</option>
						</select>
						<button type="button" class="btn btn-primary pull-right hidden" id="user-csv">Get .csv</button>
					</div>
				</div>
			</div>
			<div id="user-results" class="stat-results">
				<div class="user-navigation pull-right hidden">
					<button type="button" class="user-page-right pull-right">></button>
					<div class="user-navigation-links pull-right"></div>
					<button type="button" class="user-page-left pull-right"><</button>
				</div>
				<div class="user-navigation pull-right hidden">
					<button type="button" class="user-page-right pull-right">></button>
					<div class="user-navigation-links pull-right"></div>
					<button type="button" class="user-page-left pull-right"><</button>
				</div>
			</div>
		</div>
		<div class="tab-pane" id="user-growth" role="tabpanel">
			<div class="panel panel-default">
				<div class="panel-body">
					<div class="container">
						<form id="user-growth-pull" role="form">
							<div class="form-group col-md-12">
								<h2>User Growth</h2>
							</div>
							<div class="form-group col-md-6">
								<label for="user-growth-start-date">Start Date</label>
								<input type="date" class="form-control" id="user-growth-start-date" name="startdate" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" />
							</div>
							<div class="form-group col-md-6">
								<label for="user-growth-end-date">End Date</label>
								<input type="date" class="form-control" id="user-growth-end-date" name="enddate" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" />
							</div>
							<div class="form-group col-md-12">
								<label for="user-growth-grain">Granularity</label>
								<select class="form-control" id="user-growth-grain" name="grain">
									<option value="day" selected>Day</option>
									<option value="week">Week</option>
									<option value="month">Month</option>
									<option value="year">Year</option>
								</select>
							</div>
							<div class="col-md-12">
								<button class="btn btn-success" id="user-growth-submit">Display Results</button>
								<select name="number_items" id="user-growth-pagination-number">
									<option value="10">10</option>
									<option value="25">25</option>
									<option value="50">50</option>
								</select>
								<button type="button" class="btn btn-primary pull-right hidden" id="user-growth-csv">Get .csv</button>
							</div>
						</form>
					</div>
				</div>
			</div>
			<div id="user-growth-results" class="stat-results">
				<div class="user-growth-navigation pull-right hidden">
					<button type="button" class="user-growth-page-right pull-right">></button>
					<div class="user-growth-navigation-links pull-right"></div>
					<button type="button" class="user-growth-page-left pull-right"><</button>
				</div>
				<div class="user-growth-navigation pull-right hidden">
					<button type="button" class="user-growth-page-right pull-right">></button>
					<div class="user-growth-navigation-links pull-right"></div>
					<button type="button" class="user-growth-page-left pull-right"><</button>
				</div>
			</div>
		</div>
	</div>
</main>
