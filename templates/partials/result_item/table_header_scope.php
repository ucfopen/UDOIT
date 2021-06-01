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
<label for="<?= $this->e($item_id); ?>-input" class="control-label sr-only">Select which part of the table to convert to a header</label>
<div class="input-group">
	<select class="form-control" name="newcontent" id="<?= $this->e($item_id); ?>-input">
		<option value="col">col</option>
		<option value="row">row</option>
	</select>
	<span class="input-group-btn">
		<button class="submit-content inactive btn btn-default" type="submit">Submit</button>
	</span>
</div>