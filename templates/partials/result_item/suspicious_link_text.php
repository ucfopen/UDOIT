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
<div class="input-group">
	<label for="<?= $this->e($item_id); ?>" class="control-label sr-only">Enter a New Description for This Link</label>
	<input class="form-control" type="text" name="newcontent" placeholder="New link description" id="<?= $this->e($item_id); ?>">
	<span class="input-group-btn">
		<button class="submit-content inactive btn btn-default" type="submit">Submit</button>
	</span>
</div>
