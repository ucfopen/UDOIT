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
	<label><input name="add-bold" type="checkbox" value="<?= $group_item->font_weight; ?>" <?php echo ($group_item->font_weight == "bold" ? 'checked' : '');?>/>&nbsp;Make this text <span style="font-weight: 900;">bold</span></label>
	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
	<label><input name="add-italic" type="checkbox" value="<?= $group_item->font_style; ?>" <?php echo ($group_item->font_style == "italic" ? 'checked' : '');?>/>&nbsp;Make this text <span style="font-style: italic;">italicized</span></label>
</div>
<div class="ufixit-preview">
	<div class="ufixit-preview-canvas" name="load-preview">
		<p>Text</p>
	</div>
</div>
<input type="hidden" class="back-color" value="<?= $group_item->back_color; ?>"></input>
<input type="hidden" class="fore-color" value="<?= $group_item->fore_color; ?>"></input>
<button class="submit-content btn btn-default clear" type="submit" value="<?= $group_item->type; ?>">Submit</button>
