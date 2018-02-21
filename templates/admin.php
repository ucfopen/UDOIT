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
	<li role="presentation"><a href="#numbycourse" role="tab" data-toggle="tab">Issues By Course</a></li>
	<li role="presentation"><a href="#activity" role="tab" data-toggle="tab">User Activity</a></li>
	<li role="presentation"><a href="#growth" role="tab" data-toggle="tab">User Growth</a></li>
	<li role="presentation"><a href="#useradmin" role="tab" data-toggle="tab">User Admin</a></li>
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
		<div class="tab-pane" id="numbycourse" role="tabpanel">
			<p>numerrors</p>
		</div>
		<div class="tab-pane" id="activity" role="tabpanel">
			<p>activity</p>
		</div>
		<div class="tab-pane" id="growth" role="tabpanel">
			<p>growth</p>
		</div>
		<div class="tab-pane" id="useradmin" role="tabpanel">
			<p>useradmin</p>
		</div>
	</div>
</main>
