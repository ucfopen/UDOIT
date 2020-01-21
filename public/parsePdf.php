<?php
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
require_once('../config/settings.php');

ini_set('max_execution_time', 300);

// Write to the session now so we can check pdf completion status
session_start();
UdoitUtils::$canvas_base_url = $_SESSION['base_url'];
$_SESSION['pdf_generated'] = false;
global $logger;

$title = filter_input(INPUT_POST, 'context_title', FILTER_SANITIZE_STRING);
$result_html = filter_input(INPUT_POST, 'result_html', FILTER_UNSAFE_RAW);

// Write the pdf
$pdf = new \Mpdf\Mpdf();
$html = zz\Html\HTMLMinify::minify($result_html);
$logger->addError($result_html);
$logger->addError($html);
$pdf->SetHeader("Scanned on ".date("m/d/Y")." at ".date("g:i a"));
$pdf->SetFooter("Page {PAGENO} / {nb}");
$pdf->WriteHTML('<link rel="stylesheet" href="assets/css/pdf.css" type="text/css">', 1);
@$pdf->WriteHTML($html, 2);

$pdf->Output($title.'_'.date("Y-m-d_g:i-a").'.pdf', 'D');

// mark pdf generation as complete
$_SESSION['pdf_generated'] = true;
