/**
*	Copyright (C) 2019 University of Central Florida, created by Jacob Bates,
*   Eric Colon, Fenel Joseph, Emily Sachs, and others (see README for contributors)
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

function resizeFrame(){
	var default_height = $('body').height() + 50;
    default_height = default_height > 500 ? default_height : 500;

    // IE 8 & 9 only support string data, so send objects as string
    parent.postMessage(JSON.stringify({
      subject: "lti.frameResize",
      height: default_height
    }), "*");
}