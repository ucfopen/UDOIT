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
global $alt_text_length_limit;
?>
<div class="fix-alt input-group">
	<label for="<?= $this->e($item_id); ?>-input" class="control-label sr-only">Provide New Alt Text For This Image</label>
	<span class="counter"><?= $alt_text_length_limit; ?></span>
	<input class="form-control" type="text" name="newcontent" maxlength="<?= $alt_text_length_limit; ?>" placeholder="New alt text" id="<?= $this->e($item_id); ?>-input">
	<button class="submit-content inactive btn btn-default" type="submit">Submit</button>
	<div class="validmessage instance">Please check that you've entered new alt text and that it isn't a filename</div>
</div>
