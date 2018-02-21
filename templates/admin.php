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
		"assets/js/default.js?cachebuster=".time(),
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
			<p>Issues Per Course</p>
		</div>
		<div class="tab-pane" id="scans-per-user" role="tabpanel">
			<p>Scans per user</p>
		</div>
		<div class="tab-pane" id="user-growth" role="tabpanel">
			<p>User Growth</p>
		</div>
		<div class="tab-pane" id="user-admin" role="tabpanel">
			<p>User Admin</p>
			<?php
			// TODO:  Make this into an AJAX call with maybe a user name search field
			$results = UdoitStats::instance()->getAllUsers();
			print_r($results);
			?>
		</div>
	</div>
</main>
