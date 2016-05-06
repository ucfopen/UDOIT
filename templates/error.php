<?php
$this->layout('template');
echo $this->fetch('partials/error', ['error' => $error]);
