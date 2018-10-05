<?php

/*
 * UDOIT Multitenancy Configuration
 *
 * UDOIT can be configured to work with multiple Canvas accounts. We call this multitenancy.
 */

require_once('form_handler.php');

$page_secure = multitenant_check_security();

if (!empty($_GET)) {
    multitenant_handle_request();
}

$rows = multitenant_get_institutes();

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Multitenant Configuration</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" crossorigin="anonymous">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" crossorigin="anonymous">
</head>
<body>
    <div class="main-container container">
        <?php if (!empty($_SESSION['messages'])) : ?>
            <div class="row">
                <div class="col-sm-12">
                    <?php print multitenant_print_messages(); ?>
                </div>
            </div>
        <?php endif; ?>

        <?php if (!$page_secure) : ?>
        <div class="row">
            <div class="col-sm-12">
                <div class="alert alert-danger">Your admin page is not secured. Please follow the README in the
                    <em>/multitenant</em> directory to set up basic authentication for this page.</div>
            </div>
        </div>
        <?php endif; ?>

        <div class="row">
            <div class="col-sm-12">
                <div class="jumbotron text-center">
                    <h1>UDOIT Multitenant Configuration</h1>
                    <p class="lead">UDOIT can be configured to work with multiple Canvas accounts. We call this multitenancy.</p>
                    <p>On this page you are able to add and delete Canvas accounts that work with this instance of UDOIT.</p>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-8">
                <h2>Canvas Accounts</h2>
                <table class="table institute-table">
                    <thead class="thead">
                        <tr>
                            <td scope="col">Canvas URL</td>
                            <td scope="col">Consumer Key</td>
                            <td scope="col">Shared Secret</td>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($rows as $i => $row) : ?>
                        <tr class="row<?php print $i ?>">
                            <th scope="row">
                                <a href="#"><i class="fa fa-eye"></i></a>
                                <?php print $row->domain ?>
                            </th>
                            <td><span class="pass d-none"><?php print $row->consumer_key ?></span>
                                <span class="pass-stars">* * * *</span></td>
                            <td><span class="pass d-none"><?php print $row->shared_secret ?></span>
                                <span class="pass-stars">* * * *</span></td>
                            <td class="text-right"><a href="index.php?action=delete&domain=<?php print $row->domain ?>"><i class="fa fa-times"></i></a></td>
                        </tr>
                        <?php endforeach; ?>

                        <?php if (empty($rows)) : ?>
                            <tr class="row0"><td colspan="99"><em>No institutes have been added. Use the <strong>Add a New Account</strong> form to add Canvas accounts.</em></td></tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
            <div class="col-sm-4">
                <div class="card">
                    <div class="card-body">
                        <h2 class="card-title">Add a New Account</h2>
                        <form class="form" action="index.php" id="multitenantForm" method="get">
                            <div class="form-group">
                                <label for="domain">Canvas Account Base URL</label>
                                <input type="text" name="domain" class="form-control" id="base_url" aria-describedby="base_url_desc" placeholder="myinstance.instructure.com" />
                                <small id="base_url_desc" class="form-text text-muted">The base URL for the Canvas account. <br/> (i.e. cidilabs.instructure.com)</small>
                            </div>
                            <input type="hidden" name="action" value="insert" />
                            <button type="submit" class="btn btn-primary">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"
        integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo"
        crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"
        integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49"
        crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"
        integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy"
        crossorigin="anonymous"></script>

<script>
    (function ($) {
        $('.institute-table tr a .fa-eye').click(function(e) {
            var row = $(this).closest('tr');
            $('.pass', row).toggleClass('d-none');
            $('.pass-stars', row).toggleClass('d-none');
        });
    })(jQuery);
</script>
</body>
</html>
