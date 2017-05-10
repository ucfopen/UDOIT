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
<div class="form-group no-margin margin-bottom">
	<label for="<?= $this->e($item_id); ?>-input" class="control-label sr-only">Enter New Text For This Heading</label>
	<input class="{hash:true,caps:false} form-control" type="text" name="newcontent" placeholder="New heading text" id="<?= $this->e($item_id); ?>-input">
	<label><input class="remove-heading" type="checkbox" />&nbsp;Delete this Header completely instead</label><br />
	<button class="submit-content inactive btn btn-default" type="submit">Submit</button>
	<div class="validmessage instance">Please check that you've entered text for this header</div>
</div>
