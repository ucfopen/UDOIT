<?php
require '../vendor/autoload.php';

use zz\Html\HTMLMinify;

ini_set('max_execution_time', 300);

$pdf = new mPDF();

$stylesheet = <<<EOD
<link rel="stylesheet" href="../assets/css/pdf.css" type="text/css">
EOD;

session_start();
$title = $_SESSION['launch_params']['context_title'];
session_write_close();

$html = HTMLMinify::minify($_POST['result_html']);

$pdf->SetHeader("Scanned on ".date("m/d/Y")." at ".date("g:i a"));
$pdf->SetFooter("Page {PAGENO} / {nb}");

$pdf->WriteHTML($stylesheet, 1);
$pdf->WriteHTML($html, 2);

$pdf->Output($title.'_'.date("Y-m-d_g:i-a").'.pdf', 'D');

exit();