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

var tableData;
var scans_page_index = 1;
var user_page_index = 1;
var user_growth_page_index = 1;

function json_tableify(data) {
	let table = document.createElement('table');
	let tbody = document.createElement('tbody');
	let columns = addAllColumnHeaders(data, table);
	for (let i=0, maxi=data.length; i < maxi; ++i) {
		let tr = document.createElement('tr');
		for (let j=0, maxj=columns.length; j < maxj ; ++j) {
			let td = document.createElement('td');
			cellValue = data[i][columns[j]];
			td.appendChild(document.createTextNode(data[i][columns[j]]));
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

var loadCourses = function(i) {
	if(tableData.length == i) {
		return;
	}

	$.ajax({
		url: 'api/stats.php?stat=courseinfo&id='+tableData[i]['Course (ID)'],
		method: 'GET',
		dataType: 'json',
		success: function(msg2){
			tableData[i]['Term'] = msg2.data['Term'];
			tableData[i]['Course (ID)'] = msg2.data['Course'] + ' (' + tableData[i]['Course (ID)'] + ')';
			$('#scans-results').empty();
			table = json_tableify(tableData);
			$(table).addClass('table table-striped');
			$('#scans-results').append(table);
		},
		error: function(xhr, status, error){
			response = JSON.parse(xhr.responseText);
			console.log(response);
		},
		complete: function(){
			loadCourses(++i);
		}
	});
}

var loadUsers = function(i) {
	if(tableData.length == i) {
		return;
	}

	$.ajax({
		url: 'api/stats.php?stat=username&id='+tableData[i]['User (ID)'],
		method: 'GET',
		dataType: 'json',
		success: function(msg2){
			tableData[i]['User (ID)'] = msg2.data + ' (' + tableData[i]['User (ID)'] + ')';
			$('#scans-results').empty();
			table = json_tableify(tableData);
			$(table).addClass('table table-striped');
			$('#scans-results').append(table);
		},
		error: function(xhr, status, error){
			response = JSON.parse(xhr.responseText);
			console.log(response);
		},
		complete: function(){
			loadUsers(++i);
		}
	});
}

function addDeauthButton(data, table){
	// Append header
	let th = document.createElement('th');
	th.innerHTML = "Force Reauthorization";
	table.tHead.rows[0].appendChild(th);
	// Append body
	for(i = 1; i < table.rows.length; i++) {
		let td = document.createElement('td');
		let button = document.createElement('button');
		button.className = "btn btn-danger btn-sm";
		button.innerHTML = 'Force Reauthorize';
		button.value = data[i - 1]["User ID"];
		button.onclick = function() {
			let request = $.ajax({
				url: 'api/users.php?action=deauth&user_id='+button.value,
				method: 'GET',
				dataType: 'json',
				success: function(msg){
					button.disabled = "disabled";
					button.innerHTML = "Deauthorized";
				},
				error: function(xhr, status, error){
					response = JSON.parse(xhr.responseText);
					$('#user-results').html(response.data);
				}
			});
		};
		td.appendChild(button);

		table.rows[i].appendChild(td);
	}

	return table;
}

function downloadCSV(csv, filename) {
    let csvFile;
    let downloadLink;
    csvFile = new Blob([csv], {type: "text/csv"});
    downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
}

function tableToCSV(html, filename) {
	let csv = [];
	let rows = document.querySelectorAll(html + " table tr");
    for (var i = 0; i < rows.length; i++) {
		var row = [], cols = rows[i].querySelectorAll("td, th");
        for (var j = 0; j < cols.length; j++)
            row.push(cols[j].innerText);
		csv.push(row.join(","));
	}
    downloadCSV(csv.join("\n"), filename);
}

function gotoPage(index, target) {
	switch(target) {
		case "user":
			user_page_index = index;
			populateTable(0, 'user');

		case "user-growth":
			user_growth_page_index = index;
			populateTable(0, 'user-growth');

		case "scans":
			scans_page_index = index;
			populateTable(0, 'scans');

		default:
			return;
	}
}

function makeLinks(start_index, stop_index, element, target) {
	for(let i=start_index; i<=stop_index; i++) {
		let text = i.toString();
		if(i==users_page_index) {
			text = '<strong>' + text + '</strong>';
		}
		let link = "<a class=\"btn-xs\" href=\"#\">" + text + "</a>";
		element.append(link);
		element.each(function(j, obj) {
			$(this).children().last().click(function(e){e.preventDefault();gotoPage(i, target);return false;});
		});
	}
}

function makeLinksBeginning(dot_index, element, target) {
	element.append("<a class=\"btn-xs\" href=\"#\">1</a>");
	element.each(function(j, obj) {
		$(this).children().last().click(function(e){e.preventDefault();gotoPage(1, target);return false;});
	});
	element.append("<a class=\"btn-xs\" href=\"#\">...</a>");
	element.each(function(j, obj) {
		$(this).children().last().click(function(e){e.preventDefault();gotoPage(dot_index, target);return false;});
	});
}

function makeLinksEnd(dot_index, end_index, element, target) {
	element.append("<a class=\"btn-xs\" href=\"#\">...</a>");
	element.each(function(j, obj) {
		$(this).children().last().click(function(e){e.preventDefault();gotoPage(dot_index, target);return false;});
	});
	element.append("<a class=\"btn-xs\" href=\"#\">" + end_index.toString() + "</a>");
	element.each(function(j, obj) {
		$(this).children().last().click(function(e){e.preventDefault();gotoPage(end_index, target);return false;});
	});
}

function generateLinks(total_pages, target) {
	switch(target) {
		case "user":
			let parent = $('.user-navigation');
			let navigation = parent.$('.user-navigation-links');

		case "user-growth":
			let parent = $('.user-growth-navigation');
			let navigation = parent.$('.user-growth-navigation-links');

		case "scans":
			let parent = $('.scans-navigation');
			let navigation = parent.$('.scans-navigation-links');

		default:
			return;
	}
	navigation.empty();
	if(total_pages < 10) {
		makeLinks(1, total_pages, navigation, target);
	} else {
		let link_page = Math.ceil(users_page_index / 7) - 1;
		if(link_page == 0) {
			makeLinks(1, 7,  navigation, target);
			makeLinksEnd(8, total_pages, navigation, target);
		} else {
			if(users_page_index > (total_pages - 7)) {
				makeLinksBeginning(total_pages - 7, navigation, target);
				makeLinks(total_pages - 6, total_pages, navigation, target);
			} else {
				makeLinksBeginning(link_page * 7, navigation, target);
				makeLinks((link_page * 7) + 1, (link_page + 1) * 7, navigation, target);
				makeLinksEnd((link_page * 7) + 8, total_pages, navigation, target);
			}
		}
	}

	parent.removeClass('hidden');
}

function populateTable(button_offset, target, formvals=null) {
	switch(target) {
		case 'user':
			let api1 = 'api/users.php?action=user_count';
			let api2 = function(number_items, offset) {
				return `api/users.php?action=list&number_items=${number_items}&offset=${offset}`;
			};
			let filename = 'Users';

		case 'user-growth':
			let api1 = 'api/stats.php?stat=usergrowthcount&'+formvals;
			let api2 = function(number_items, offset) {
				return `api/stats.php?stat=usergrowth&number_items=${number_items}&offset=${offset}&`+formvals;
			};
			let filename = 'User_Growth';

		case 'scans':
			let api1 = 'api/stats.php?stat=scanscount&'+formvals;
			let api2 = function(number_items, offset) {
				return `api/stats.php?stat=scans&number_items=${number_items}&offset=${offset}&`+formvals;
			};
			let filename = 'Scans';

		default:
			return;
	}

	let refresh_button = $('#' + target + '-pull');
	let csv = $('#' + target + '-csv');
	let result_element = $('#user-results');

	refresh_button.empty();
	refresh_button.append('<span class="circle-white" style="display: inline-block; height: 16px; width: 16px;"></span> Loading...');

	let request1 = $.ajax({
		url: api1,
		method: 'GET',
		dataType: 'json',
		success: function(msg){
			let number_items = parseInt($('#' + target + '-pagination-number :selected').val());
			let total_pages = Math.ceil(parseInt(msg.data[0]['count']) / number_items);

			let page = window[target + '_page_index'] + button_offset;
			if(page < 1) {
				refresh_button.empty();
				refresh_button.append('Update Results');
				return;
			}

			if(page > total_pages) page = total_pages;

			let offset = page - 1;
			if(offset < 1) {
				offset = 0;
			} else {
				offset *= number_items;
			}

			$('.' + target + '-navigation').addClass('hidden');
			$('#' + target + '-results table').remove();
			let request2 = $.ajax({
				url: api2(number_items, offset),
				method: 'GET',
				dataType: 'json',
				success: function(msg){
					let table = json_tableify(msg.data);
					if(target === 'user') table = addDeauthButton(msg.data, table);
					$(table).addClass('table table-striped');
					$('#' + target + '-results > div:nth-child(1)').after(table);
					csv.removeClass('hidden');
					csv.click(function(){
						tableToCSV('#' + target + '-results', "UDOIT_" + filename + ".csv");
					});

					refresh_button.empty();
					refresh_button.append('Update Results');

					window[target + '_page_index'] = page;
					generateLinks(total_pages, 'users');

					if(target === 'scans') {
						tableData = msg.data;
						loadCourses(0); // Lazy load term and course name
						loadUsers(0); // Lazy load User name
					}
				},
				error: function(xhr, status, error){
					response = JSON.parse(xhr.responseText);
					result_element.html(response.data);
				}
			});
		},
		error: function(xhr, status, error){
			response = JSON.parse(xhr.responseText);
			result_element.html(response.data);
		}
	});
}

$('#scans-pull').on('submit', function(evt){
	evt.preventDefault();
	let formvals = $(this).serialize();
	populateTable(0, 'scans', formvals);
});

$('.scans-page-left').click(function(){
	let formvals = $(this).serialize();
	populateTable(-1, 'scans', formvals);
});

$('.scans-page-right').click(function(){populateTable(1, 'scans')});

$('#errors-common-pull').click(function(){
	$('#errors-common-results').empty();

	$('#errors-common-pull').empty();
	$('#errors-common-pull').append('<span class="circle-white" style="display: inline-block; height: 16px; width: 16px;"></span> Loading...');

	let request = $.ajax({
		url: 'api/stats.php?stat=errors',
		method: 'GET',
		dataType: 'json',
		success: function(msg){
			let table = json_tableify(msg.data);
			$(table).addClass('table table-striped');

			$('#errors-common-results').append(table);
			$('#errors-common-csv').removeClass('hidden');
			$('#errors-common-csv').click(function(){
				tableToCSV('#errors-common-results', "UDOIT_Errors.csv");
			});

			$('#errors-common-pull').empty();
			$('#errors-common-pull').append('Update Results');
		},
		error: function(xhr, status, error){
			response = JSON.parse(xhr.responseText);
			$('#user-results').html(response.data);
		}
	});
});

$('#user-pull').click(function(){populateTable(0, 'user')});

$('.user-page-left').click(function(){populateTable(-1, 'user')});

$('.user-page-right').click(function(){populateTable(1, 'user')});

$('#user-growth-pull').on('submit', function(evt){
	evt.preventDefault();
	let formvals = $(this).serialize();
	populateTable(0, 'user-growth', formvals);
});

$('.user-growth-page-left').click(function(){
	let formvals = $(this).serialize();
	populateTable(-1, 'user-growth', formvals);
});

$('.user-growth-page-right').click(function(){
	let formvals = $(this).serialize();
	populateTable(1, 'user-growth', formvals);
});

$(document).ready(function(){
	let request = $.ajax({
		url: 'api/stats.php?stat=termslist',
		method: 'GET',
		dataType: 'json',
		success: function(msg){
			$.each(msg.data, function(i, term){
				let option = document.createElement('option');
				option.innerHTML = term.name;
				option.value = term.id;
				$('#scans-term-id').append(option);
			});
		},
		error: function(xhr, status, error){
			response = JSON.parse(xhr.responseText);
			$('#scans-results').html(response.data);
		}
	});
});
