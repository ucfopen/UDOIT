/**
*   Copyright (C) 2014 University of Central Florida, created by Jacob Bates, Eric Colon, Fenel Joseph, and Emily Sachs.
*
*   This program is free software: you can redistribute it and/or modify
*   it under the terms of the GNU General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.
*
*   This program is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU General Public License for more details.
*
*   You should have received a copy of the GNU General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
*   Primary Author Contact:  Jacob Bates <jacob.bates@ucf.edu>
*/

function json_tableify(data) {
	let table = document.createElement('table');
	let tbody = document.createElement('tbody');
	let columns = addAllColumnHeaders(data, table);
	for (let i=0, maxi=data.length; i < maxi; ++i) {
		let tr = document.createElement('tr');
		for (let j=0, maxj=columns.length; j < maxj ; ++j) {
			let td = document.createElement('td');
			cellValue = data[i][columns[j]];
			td.appendChild(document.createTextNode(data[i][columns[j]] || ''));
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	}

	table.appendChild(tbody);

	return table;
}

function addAllColumnHeaders(data, table){
	let columnSet = [],
	thead = document.createElement('thead');
	tr = document.createElement('tr');
	for (let key in data[0]) {
		if (data[0].hasOwnProperty(key) && columnSet.indexOf(key)===-1) {
			columnSet.push(key);
			let th = document.createElement('th');
			th.appendChild(document.createTextNode(key));
			tr.appendChild(th);
		}
	}
	thead.appendChild(tr);
	table.appendChild(thead);
	return columnSet;
}

$('#user-growth-pull').on('submit', function(evt){
	evt.preventDefault();
	let formvals = $(this).serialize();
	
	let request = $.ajax({
		url: 'pullStat.php?stat=usergrowth&'+formvals,
		method: 'GET',
		dataType: 'json',
		success: function(msg){
			let table = json_tableify(msg.data);
			$(table).addClass('table table-striped');

			$('#user-growth-results').append(table);
		},
		error: function(xhr, status, error){
			response = JSON.parse(xhr.responseText);
			$('#user-growth-results').html(response.data);
		}
	});
});

$('#user-pull').click( function(){
	// TODO: Add throbber
	$('#user-results').empty();

	let request = $.ajax({
		url: 'pullStat.php?stat=users',
		method: 'GET',
		dataType: 'json',
		success: function(msg){
			console.log(msg);
			let table = json_tableify(msg.data);
			$(table).addClass('table table-striped');

			$('#user-results').append(table);
		},
		error: function(xhr, status, error){
			response = JSON.parse(xhr.responseText);
			$('#user-results').html(response.data);
		}
	});
});