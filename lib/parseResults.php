<?php

include_once('../config/localConfig.php');

$issue_count = 0;

?>

<h1 class="text-center">
    Report for <?= $_SESSION['launch_params']['context_title'] ?>
    <br>
    <small><?= $total_results['errors']; ?> errors, <?= $total_results['suggestions']; ?> suggestions</small>
</h1>

<p><button class="btn btn-default btn-xs" id="savePdf"><span class="glyphicon glyphicon-save"></span> Save report as PDF</button><p>

<div id="errorWrapper">
<?php foreach ($badContent as $bad): ?>
    <?php if ($bad['title'] != "unscannable"): ?>
        <h2 class="content-title"><?= ucfirst($bad['title']); ?> <small><?= count($bad['items']) ?> issues from <?= $bad['amount'] ?> total in <?= $bad['time'] ?> seconds</small></h2>

        <?php if (!$bad['items']): ?>
            <div class="alert alert-success"><span class="glyphicon glyphicon-ok"></span> No problems were detected for this type of content!</div>
        <?php else: ?>
            <?php foreach ($bad['items'] as $report): ?>
                <?php if ($report['amount'] > 0): ?>
                    <div class="errorItem panel panel-default">
                        <div class="panel-heading clearfix">
                            <button class="btn btn-xs btn-default btn-toggle pull-left no-print margin-right-small"><span class="glyphicon glyphicon-plus"></span></button>

                            <h3 class="plus pull-left"><a href="<?= $report['url']; ?>" target="_blank"><?= $report['name']; ?></a></h3>

                            <div class="pull-right">
                                <?php if (count($report['error']) > 0): ?>
                                    <span class="label label-danger"><span class="glyphicon glyphicon-ban-circle"></span> <?= count($report['error']); ?> Errors</span>
                                <?php endif; ?>

                                <?php if (count($report['warning']) > 0): ?>
                                    <span class="label label-warning"><span class="glyphicon glyphicon-warning-sign"></span> <?= count($report['warning']); ?> Warnings</span>
                                <?php endif; ?>

                                <?php if (count($report['suggestion']) > 0): ?>
                                    <span class="label label-primary"><span class="glyphicon glyphicon-info-sign"></span> <?= count($report['suggestion']); ?> Suggestions</span>  
                                <?php endif; ?>
                            </div>
                        </div>

                        <div class="errorSummary panel-body">
                            <?php if (count($report['error']) > 0): ?>
                                <div class="panel panel-danger">
                                    <div class="panel-heading">
                                        <h4 class="panel-title">Errors <span class="badge"><?= count($report['error']); ?></span></h4>
                                    </div>

                                    <ul class="list-group">
                                        <?php foreach ($report['error'] as $item): ?>
                                            <?php $issue_count++; ?>
                                            <li class="list-group-item">
                                                <div class="clearfix">
                                                    <a href="#collapse-<?= $report['id']; ?>-<?= $issue_count; ?>" data-toggle="collapse"><h5 class="text-danger pull-left"><span class="glyphicon glyphicon-remove-sign"></span> <?= $item['title']; ?></h5></a>

                                                    <?php if ($item['type'] == "cssTextHasContrast" || $item['type'] == "imgHasAlt" || $item['type'] == "imgNonDecorativeHasAlt" || $item['type'] == "tableDataShouldHaveTh" || $item['type'] == "tableThShouldHaveScope"): ?>
                                                        <span class="label label-success margin-left-small hidden" style="margin-top: -2px;">Fixed!</span>
                                                    <?php endif; ?>
                                                </div>

                                                <div id="collapse-<?= $report['id']; ?>-<?= $issue_count; ?>" class="collapse in fade margin-top-small">
                                                    <?php if (isset($item['description'])): ?>
                                                        <p><?= $item['description'] ?></p>
                                                    <?php endif; ?>

                                                    <?php if ($item['html']): ?>
                                                        <p><a class="viewError" href="#viewError">View the source of this issue</a></p>
                                                        <pre class="hidden"><code class="html"><strong>Line <?= $item['lineNo']; ?></strong>: <?= $item['html']; ?></code></pre>
                                                    <?php endif; ?>

                                                    <?php if ($item['type'] == "cssTextHasContrast" || $item['type'] == "imgHasAlt" || $item['type'] == "imgNonDecorativeHasAlt" || $item['type'] == "tableDataShouldHaveTh" || $item['type'] == "tableThShouldHaveScope"): ?>
                                                        <button class="fix-this no-print btn btn-success">U FIX IT!</button>

                                                        <form class="ufixit-form form-horizontal no-print hidden" action="lib/contentUpdater.php" method="post" role="form">
                                                            <input type="hidden" name="contenttype" value="<?= $bad['title']; ?>">
                                                            <input type="hidden" name="contentid" value="<?= $report['id']; ?>">
                                                            <input type="hidden" name="errorhtml" value="<?= $item['html']; ?>">
                                                            <input type="hidden" name="errortype" value="<?= $item['type']; ?>">
                                                            <input type="hidden" name="submittingagain" value="">
                                                            
                                                            <div class="input-group">
                                                            <?php if ($item['type'] === "tableThShouldHaveScope"): ?>
                                                                <select class="form-control" name="newcontent">
                                                                    <option value="col">col</option>
                                                                    <option value="row">row</option>
                                                                </select>
                                                            <?php else: ?>
                                                                <input type="text" name="newcontent" class="form-control" placeholder="New value">
                                                            <?php endif; ?>
                                                                <span class="input-group-btn">
                                                                    <button class="submit-content btn btn-default" type="submit">Submit</button>
                                                                </span>
                                                            </div><!-- /input-group -->
                                                        </form>
                                                    <?php endif; ?>
                                                </div>
                                            </li>
                                        <?php endforeach; ?>
                                    </ul>
                                </div>
                            <?php endif; ?>

                            <?php if(count($report['warning']) > 0): ?>
                                <div class="panel panel-warning">
                                    <div class="panel-heading">
                                        <h4 class="panel-title">Warnings <span class="badge"><?= count($report['warning']); ?></span></h4>
                                    </div>

                                    <ul class="list-group">
                                        <?php foreach ($report['warning'] as $item): ?>
                                            <li class="list-group-item">
                                                <div class="clearfix margin-bottom-small">
                                                    <h5 class="text-warning pull-left"><span class="glyphicon glyphicon-remove-sign"></span> <?= $item['title']; ?></h5>
                                                </div>

                                                <?php if (isset($item['description'])): ?>
                                                    <p><?= $item['description'] ?></p>
                                                <?php endif; ?>

                                                <?php if ($item['html']): ?>
                                                    <p><a class="viewError" href="#viewError">View the source of this issue</a></p>
                                                    <pre class="hidden"><code class="html"><strong>Line <?= $item['lineNo']; ?></strong>: <?= $item['html']; ?></code></pre>
                                                <?php endif; ?>
                                            </li>
                                        <?php endforeach; ?>
                                    </ul>
                                </div>
                            <?php endif; ?>

                            <?php if (count($report['suggestion']) > 0): ?>
                                <div class="panel panel-info no-margin">
                                    <div class="panel-heading">
                                        <h4 class="panel-title">Suggestions <span class="badge"><?= count($report['suggestion']); ?></span></h4>
                                    </div>

                                    <ul class="list-group">
                                        <?php foreach ($report['suggestion'] as $item): ?>
                                            <li class="list-group-item">
                                                <div class="clearfix margin-bottom-small">
                                                    <h5 class="text-info pull-left"><span class="glyphicon glyphicon-remove-sign"></span> <?= $item['title']; ?></h5>
                                                </div>

                                                <?php if (isset($item['description'])): ?>
                                                    <p><?= $item['description'] ?></p>
                                                <?php endif; ?>

                                                <?php if ($item['html']): ?>
                                                    <p><a class="viewError" href="#viewError">View the source of this issue</a></p>
                                                    <pre class="hidden"><code class="html"><strong>Line <?= $item['lineNo']; ?></strong>: <?= $item['html']; ?></code></pre>
                                                <?php endif; ?>
                                            </li>
                                        <?php endforeach; ?>
                                    </ul>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endif; ?>
            <?php endforeach; ?>
        <?php endif; ?>
    <?php else: ?>
        <h2 class="content-title">Unscannable <small><?= count($bad['items']) ?> files</small></h2>

        <div class="errorItem panel panel-default">
            <div class="panel-heading clearfix">
                <button class="btn btn-xs btn-default btn-toggle pull-left no-print margin-right-small"><span class="glyphicon glyphicon-plus"></span></button>

                <h3 class="plus pull-left">UDOIT is unable to scan these files</h3>
            </div>

            <div class="errorSummary panel-body">
                <div class="panel panel-info">
                    <div class="panel-body">
                        <p>Due to the nature of UDOIT, the content in these files cannot be scanned for accessibility problems. Please visit the following resources to read about accessibility for these file types.</p>

                        <ul class="list-unstyled no-margin">
                            <li><a href="<?= $resource_link['doc']; ?>" target="blank"><?= $resource_link['doc']; ?></a></li>
                            <li><a href="<?= $resource_link['ppt']; ?>" target="blank"><?= $resource_link['ppt']; ?></a></li>
                            <li><a href="<?= $resource_link['pdf']; ?>" target="blank"><?= $resource_link['pdf']; ?></a></li>
                        </ul>
                    </div>
                </div>

                <div class="list-group no-margin">

                    <?php foreach ($bad['items'] as $item): ?>
                        <a href="<?= $item['url']; ?>" class="list-group-item"><?= $item['title']; ?></a>
                    <?php endforeach; ?>

                </div>
            </div>
        </div>      
    <?php endif; ?>
<?php endforeach; ?>