var ResultsFilter = {
    contentTypes: [],
    issues: {},
    context: '#scanner',
    container: '.results-wrapper',
    filters: {
        issueTypes: {},
    },
    oldHtml: null,

    init: function() {
        // Get run once on init()
        this.addIssueMetaData();
        this.scanContent();
        this.addHtmlStructure();
        this.createSummaryTab();
        this.renderSummaryFilters();
        this.setUpSummaryActions();
        
        // These will get run each time a filter is changed
        this.addContentTypeTabs();
        this.setUpContentTypeActions();
        this.addContentTypeCounts();

        $('section#result', this.context).remove();
        if ($('.welcome-toggle-btn .glyphicon-minus').length) {
            $('.welcome-toggle-btn').click();
        }
        ucfCloseAllAccordions();
    },
    scanContent: function() {
        let _this = this;
        this.contentTypes = {};

        $('h2.content-title', this.context).each(function(i, obj) {
            let contentType = _this.getTextFromElement(obj);

            while ($(obj).next('div.errorItem').length > 0) {
                obj = $(obj).next('div.errorItem');
                if (!Array.isArray(_this.contentTypes[contentType])) {
                    _this.contentTypes[contentType] = [];
                }
                _this.contentTypes[contentType].push($(obj).clone());
            }
        });

        _this.oldHtml = $('section#result', this.context);
    },
    addIssueMetaData: function() {
        $('.errorSummary .panel .list-group li.list-group-item').each((i, issue) => {
            let issueType = this.getTextFromElement($('h5.title-line', issue));
            $(issue).attr('data-issue-type', issueType);
            $(issue).attr('data-issue-count', $('ol li', issue).length);
        });      

    },
    renderSummaryFilters: function() {
        let errorWrapper = $('.results-panes .errorSummary .panel-danger');
        let suggestWrapper = $('.results-panes .errorSummary .panel-info');
        let selectAllErrorHtml = this.createSwitchHtml('error-filter select-all-filter', 'View All Errors');
        let selectAllSuggestHtml = this.createSwitchHtml('suggest-filter select-all-filter', 'View All Suggestions');

        $('.panel-heading', errorWrapper).prepend(selectAllErrorHtml);
        $('.panel-heading', suggestWrapper).prepend(selectAllSuggestHtml);

        $('li.list-group-item', errorWrapper).each((i, obj) => {
            let issueType = this.getTextFromElement(obj);
            $(obj).prepend(this.createSwitchHtml('issue-filter error-filter', 'Toggle issue visibility'));
            $(obj).attr('data-issue-type', issueType);
        });
        $('li.list-group-item', suggestWrapper).each((i, obj) => {
            let issueType = this.getTextFromElement(obj);
            $(obj).prepend(this.createSwitchHtml('issue-filter suggest-filter', 'Toggle issue visibility'));
            $(obj).attr('data-issue-type', issueType);
        });
    },
    setUpSummaryActions: function () {
        let _this = this;

        // toggle switches for select all switch
        $('.results-panes .select-all-filter input').on('change', function(e) {
            let container = $(this).closest('.panel');
            
            $('ul li.list-group-item .switch input', container).prop('checked', $(this).prop('checked'));
            $('ul li.list-group-item .switch input', container).change();
        });

        // issue switch action
        $('.results-panes .issue-filter input').on('change', function(e) {
            const issueType = $(this).closest('li.list-group-item').attr('data-issue-type');
            if ($(this).prop('checked')) {
                _this.filters.issueTypes[issueType] = issueType;
            }
            else {
                delete(_this.filters.issueTypes[issueType]);
            }

            // check to see if all switches are matching to toggle 'select all' switch
            let container = $(this).closest('.panel');

            if ($('ul li .switch input:checked', container).length === $('ul li .switch input', container).length) {
                $('.switch.select-all-filter input', container).prop('checked', true);
            }
            else {
                $('.switch.select-all-filter input', container).prop('checked', false);
            }

            _this.refreshIssueTabs();
        });

        $('.results-panes li.list-group-item').each(function(i, obj) {
            const issueType = $(obj).attr('data-issue-type');
            _this.filters.issueTypes[issueType] = issueType;
        });
    },
    refreshIssueTabs: function() {
        this.addContentTypeTabs();
        this.setUpContentTypeActions();
        this.filterContentTypes();
        this.addContentTypeCounts();
    },
    createSwitchHtml: function(classes, label) {
        return `
        <label class="switch ${classes}">
            <span class="sr-only">${label}</span>
            <input type="checkbox" checked="checked" />
            <span class="slider round"></span>
        </label>`;
    },
    createSummaryTab: function() {
        this.moveReportSummary();
        this.moveReportTitle();
        this.moveReportPdfButton();
    },
    addHtmlStructure: function() {
        $(this.container, this.context).remove();

        let html = `
            <div class="${this.container.replace('.','')}">
                <div class="results-tabs-wrapper row">
                    <div class="col-sm-3">
                        <ul class="results-tabs nav nav-pills nav-stacked" role="tablist">
                            <li role="presentation" class="active">
                                <a href="#summary" aria-controls="summary" role="tab" data-toggle="tab">Summary</a>
                            </li>
                        </ul>
                    </div>
                    <div class="col-sm-9 results-panes tab-content">
                        <div role="tabpanel" class="tab-pane active" id="summary"></div>
                    </div>
                </div>
            </div>
        `;

        $(this.context).append(html);
    },
    moveReportSummary: function() {
        let errorSummary = $('#errorTotalSummary .errorSummary').clone(true);
        $('#summary', this.context).append(errorSummary);
    },
    moveReportTitle: function() {
        let reportTitle = $('section#result h1').first().clone(true);
        $(this.container).prepend(reportTitle);
    },
    moveReportPdfButton: function() {
        $('button#savePdf').wrap(`<div class="save-pdf-wrapper"></div>`);

        $('#summary', this.context).append($('.save-pdf-wrapper').clone(true));
    },
    addContentTypeTabs: function() {
        let tabsUl = $('ul.results-tabs');
        let contentPanes = $('.results-panes');

        $('li.content-type-tab', tabsUl).remove();
        $('.tab-pane.content-type-pane', contentPanes).remove();

        let contentLabels = {
            'files': 'HTML Files',
            'unscannable': 'Unscannable Files',
        };

        for (let title in this.contentTypes) {
            let key = this.createTabKey(title);
            let contentArray = this.contentTypes[title];

            if (contentLabels.hasOwnProperty(title)) {
                title = contentLabels[title];
            }

            let tabHtml = `
                <li role="presentation" class="content-type-tab">
                    <a href="#${key}" aria-controls="${key}" role="tab" data-toggle="tab">
                        ${title}
                    </a>
                </li>
            `;
            tabsUl.append(tabHtml);

            let paneHtml = `
                <div role="tabpanel" class="tab-pane content-type-pane" id="${key}"></div>
            `;
            contentPanes.append(paneHtml);
            contentArray.forEach((item) => {
                $(`#${key}.tab-pane`).append(item);
            });
            
        }
    },
    filterContentTypes: function() {
        let context = $('.content-type-pane:not(#udoit-unscannable)');

        // Start with a clean slate
        $('*').removeClass('hiding');

        // Hide all issues
        //$('.content-type-pane:not(#udoit-unscannable) .errorItem .errorSummary .panel li.list-group-item').addClass('hiding');
        $('.errorItem .errorSummary .panel li.list-group-item', context).addClass('hiding');

        // Show any issues that are checked in the summary
        for (let issueType of Object.values(this.filters.issueTypes)) {
            //console.log('showing type', issueType);
            $(`.errorItem .errorSummary .panel li.list-group-item[data-issue-type="${issueType}"]`, context).removeClass('hiding');    
        }

        // Remove any empty error/suggestion containers
        $('.errorItem .errorSummary > .panel', context).each(function(i, issue) {
            //console.log('errors', $('.panel li.list-group-item:not(.hiding)', issue));
            if ($('li.list-group-item:not(.hiding)', issue).length === 0) {
                //console.log('hiding issue', issue);
                $(issue).addClass('hiding');
            }
        });

        // Remove any empty containers for issues
        $('.errorItem', context).each(function(i, item) {
            //console.log('issues', $('.errorSummary:not(.hiding)', item));
            if ($('.errorSummary > .panel:not(.hiding)', item).length === 0) {
                //console.log('hiding item', item);
                $(item).addClass('hiding');
            }
        });

        // Remove a tab when it's empty
        $(context).each(function(i, pane) {
            if ($('.errorItem:not(.hiding)', pane).length === 0) {
                let paneId = $(pane).attr('id');
                console.log('paneid', paneId);
                $(`.results-tabs li a[href="#${paneId}"]`).addClass('hiding');
            }
        });
    },
    addContentTypeCounts: function() {
        let _this = this;

        // Remove existing content type count badges
        $('.results-panes .content-type-pane .errorItem .pull-right .label').remove();
        
        // Set new values based on filtering
        $('.results-panes .content-type-pane .errorItem:not(.hiding)').each(function(i, obj) {
            const errorCount = _this.getIssueCount($(`.panel-danger:not(.hiding)`, obj));
            const suggestCount = _this.getIssueCount($(`.panel-info:not(.hiding)`, obj));
            
            $(obj).attr('data-error-count', errorCount);
            if (errorCount) {
                const label = (errorCount > 1) ? 'Errors' : 'Error';
                $('.panel-heading .pull-right', obj).append(`<span class="label label-danger">${errorCount} ${label}</span>`);
            }

            $(obj).attr('data-suggest-count', suggestCount);
            if (suggestCount) {
                const label = (suggestCount > 1) ? 'Suggestions' : 'Suggestion';
                $('.panel-heading .pull-right', obj).append(`<span class="label label-primary">${suggestCount} ${label}</span>`);
            }
        });

        $('ul.results-tabs li.content-type-tab').each(function(i, obj) {
            const type = $('a', obj).attr('aria-controls');
            let errorCount = 0;
            let suggestCount = 0;

            $(`#${type} .errorItem:not(.hiding)`).each(function(i, item) {
                let error = parseInt($(item).attr('data-error-count'));
                let suggest = parseInt($(item).attr('data-suggest-count'));

                if (error) {
                    errorCount += error;
                }
                if (suggest) {
                    suggestCount += suggest;
                }
            });
            
            if (suggestCount) {
                $('a', obj).append(`<span class="badge count-suggest">${suggestCount}</span>`);
            }
            if (errorCount) {
                $('a', obj).append(`<span class="badge count-error">${errorCount}</span>`);
            }
        });
    },
    getIssueCount: function(context) {
        //console.log(context);
        let totalCount = 0;

        $(`li.list-group-item:not(.hiding) .badge`, context).each(function(i, obj) {
            let count = parseInt($(obj).text().replace('x', '').trim());
            if (count != NaN) {
                totalCount += count;
            }
        });

        return totalCount;
    },
    setUpContentTypeActions: function() {
        $('.results-tabs a').click(function (e) {
            e.preventDefault();
            $(this).tab('show');
        });

        $('.results-panes .tab-pane').find('.errorItem:first:not(.hiding) .panel-heading button.btn-toggle').click();
    },
    createTabKey: function(key) {
        return 'udoit-' + key.replace(/ /g, '').toLowerCase();
    },
    getTextFromElement: function(obj) {
        return $(obj).clone().children().remove().end().text().trim().replace(/[.,#!$%;:=() "]/g, '').toLowerCase();
    },
    setUpWelcomeToggle: function() {
        $('.welcome-toggle-btn').on('click', function(e) {
            if ($('.glyphicon', this).hasClass('glyphicon-plus')) {
                $('.glyphicon', this).addClass('glyphicon-minus').removeClass('glyphicon-plus');
                $('.welcome-toggle').slideDown(function () {
                    setTimeout(resizeFrame, 200);
                });
            }
            else {
                $('.glyphicon', this).addClass('glyphicon-plus').removeClass('glyphicon-minus');
                $('.welcome-toggle').slideUp(function () {
                    setTimeout(resizeFrame, 200);
                });
            }
        });
    },
}

// This must get set up on page load, before init() is called
ResultsFilter.setUpWelcomeToggle();