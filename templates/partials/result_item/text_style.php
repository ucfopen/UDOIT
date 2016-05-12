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
<div>
	<?php if ( isset($group_item->back_color) ): ?>
		<input class="hidden back-color" type="text" name="newcontent[1]" value="<?= $group_item->back_color; ?>">
	<?php endif; ?>
	<input class="hidden fore-color" type="text" name="newcontent[0]" value="<?= $group_item->fore_color; ?>">

	<label><input name="add-bold" type="checkbox" value="bold" />&nbsp;Make this text <span style="font-weight: 900;">bold</span></label>
	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	<label><input name="add-italic" type="checkbox" value="italic" />&nbsp;Make this text <span style="font-style: italic;">italicized</span></label>
</div>
<div class="ufixit-preview">
	<div class="ufixit-preview-canvas" name="load-preview">
		<p>Text</p>
	</div>
</div>
<button class="submit-content btn btn-default clear" type="submit" value="<?= $group_item->type ?>">Submit</button>
