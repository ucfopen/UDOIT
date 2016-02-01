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

session_start();
$_SESSION['pdf_generated'] = false; 
session_write_close();

require '../vendor/autoload.php';
require_once('../config/settings.php');

use zz\Html\HTMLMinify;

ini_set('max_execution_time', 300);

$pdf = new mPDF();

$stylesheet = <<<EOD
<link rel="stylesheet" href="../assets/css/pdf.css" type="text/css">
EOD;

session_start();
$title = $_POST['context_title'];
session_write_close();

$html = HTMLMinify::minify($_POST['result_html']);

$pdf->SetHeader("Scanned on ".date("m/d/Y")." at ".date("g:i a"));
$pdf->SetFooter("Page {PAGENO} / {nb}");

$pdf->WriteHTML($stylesheet, 1);
$pdf->WriteHTML($html, 2);

$pdf->Output($title.'_'.date("Y-m-d_g:i-a").'.pdf', 'D');

session_start();
$_SESSION['pdf_generated'] = true; 
session_write_close();

exit();
