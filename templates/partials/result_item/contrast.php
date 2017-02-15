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
<?php for ($i = 0; $i < count($group_item->colors); $i++): ?>
	<input type="hidden" name="errorcolor[<?= $i; ?>]" value="<?= $group_item->colors[$i]; ?>">
<?php endfor; ?>

<div class="holder">
	<div class="left">
		<div class="form-group no-margin margin-bottom">
			<?php if ( isset($group_item->back_color) ): ?>
				<label for="newcontent[0]">Replace Background Color <?= $group_item->back_color; ?></label>
				<input class="color {hash:true,caps:false} form-control back-color" type="text" name="newcontent[0]" value="<?= $group_item->back_color; ?>" placeholder="Replacement for Background Color <?= $group_item->back_color; ?>">
			<?php endif; ?>

			<label for="newcontent[1]">Replace Foreground Color <?= $group_item->fore_color; ?></label>&nbsp;<span class="contrast-invalid hidden red"><span class="glyphicon glyphicon-remove"></span>&nbsp;Ratio Invalid (<span class="contrast-ratio"></span>:1)</span>
			<input class="color {hash:true,caps:false} form-control fore-color" type="text" name="newcontent[1]" value="<?= $group_item->fore_color; ?>" placeholder="Replacement for Foreground Color <?= $group_item->fore_color; ?>">
			<label><input name="add-bold" type="checkbox" value="<?= $group_item->font_weight; ?>" <?php echo ($group_item->font_weight == "bold" ? 'checked' : '');?>/>&nbsp;Make this text <span style="font-weight: 900;">bold</span></label>&nbsp;
			<label><input name="add-italic" type="checkbox" value="<?= $group_item->font_style; ?>" <?php echo ($group_item->font_style == "italic" ? 'checked' : '');?>/>&nbsp;Make this text <span style="font-style: italic;">italicized</span></label><br />
			<input type="text" name="threshold" class="threshold hidden" value="<?= $group_item->text_type; ?>">
		</div>
	</div>
	<div class="right ufixit-preview">
		<div class="ufixit-preview-canvas" name="load-preview">
			<p>Text</p>
		</div>
	</div>
	<div class="clear">
		<label for="newcontent[0]">Foreground Color Palette</label>
		<ul class="color-picker regular">
			<?php $colors = ['888888','F5EB32','70B538','178E3E','225E9D','163D76','202164','6A1C68','CA1325','D44A25','DF7A2A']; ?>
			<?php foreach ($colors as $color): ?>
				<li class="color" value="#<?= $color; ?>"><span class="hidden invalid-color">X </span>#<?= $color; ?></li>
			<?php endforeach; ?>
		</ul>
		<ul class="color-picker short margin-bottom">
			<?php $colors = ['000000','99962F','4B7631','155F2E','183F6A','1B294C','1A1A40','451843','7D1820','843322','8A5126']; ?>
			<?php foreach ($colors as $color): ?>
				<li class="color" value="#<?= $color; ?>"><span class="hidden invalid-color">X </span>#<?= $color; ?></li>
			<?php endforeach; ?>
		</ul>
	</div>
</div>
<button class="submit-content inactive btn btn-default" type="submit">Submit</button>
