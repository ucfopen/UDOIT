<?php
/* Prevent Caching */
header("Cache-Control: no-cache, no-store, must-revalidate"); // HTTP 1.1.
header("Pragma: no-cache"); // HTTP 1.0.
header("Expires: 0"); // Proxies.

/* Oauth 1.0 Settings (For use when installing the app in Canvas) */
$consumer_key = '';
$shared_secret = '';

/* Oauth 2.0 Settings (Provided by Instructure) */
$oauth2_id = '';
$oauth2_key = '';
$oauth2_uri = '';

/* Disable headings check character count */
$doc_length ='1500';

/* Google/YouTube Data Api Key */
define( 'GOOGLE_API_KEY', '');

/* Database Config */
$db_host = '';
$db_user = '';
$db_password = '';
$db_name = '';
$db_user_table = 'users';
$db_reports_table = 'reports';

$debug = false;

/* Messages */
$udoit_welcome_message = 'The Universal Design Online content Inspection Tool (U<strong>DO</strong>IT) was created by the Center for Distributed Learning at the University of Central Florida. U<strong>DO</strong>IT will scan your course content, generate a report and provide instructions on how to correct accessibility issues. Funding for U<strong>DO</strong>IT was provided by a Canvas Grant awarded in 2014.';
$error_msg_wrong_referrer = 'It looks like you tried to access UDOIT from a website other than Canvas.  Please contact support.';
$error_msg_no_referrer = 'Your web browser did not provide a referrer.  Please contact support.';

/* Resource links */
$resource_link = [
    'doc' => 'http://webaim.org/techniques/word/',
    'pdf' => 'http://webaim.org/techniques/acrobat/',
    'ppt' => 'http://webaim.org/techniques/powerpoint/',
];

/* UDOIT test descriptions and examples */
/* refer to /quail/guidelines/section508.php to view currently enabled tests */
$udoit_tests = [
    'severe' => [
        [
            'name'      => 'aMustContainText',
            'title'     => 'Links should contain text',
            'desc'      => '<p>Because many users of <a href="http://en.wikipedia.org/wiki/Screen_reader">screen readers</a> use links to navigate the page, providing links with no text (or with images that have empty "alt" attributes and no other readable text) hinders these users.</p>',
            'resources' => [
                '<a href="http://guides.instructure.com/s/2204/m/4152/l/65824-how-do-i-create-a-hyperlink-in-the-rich-content-editor">Canvas Tutorial</a>',
                '<a href="http://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms.html">WCAG Guidelines</a>',
                'WCAG Standard <a href="http://www.w3.org/TR/WCAG20/#navigation-mechanisms-refs">2.4.4</a>'
            ],
            'example'   => '
                <p class="text-danger">Incorrect</p>
                <pre><code>'. htmlspecialchars('<a href="http://example.com/document.pdf"></a>') .'</code></pre>
                <p class="text-success">Correct</p>
                <pre><code>'. htmlspecialchars('<a href="http://example.com">read the document</a>') .'</code></pre>
            ',
        ],
        [
            'name'      => 'imgHasAlt',
            'title'     => 'No Alternative Text found',
            'desc'      => '<p>Alternative Text (Alt Text) is an alternative (non-visual) way to describe the meaning of an image. Please provide a brief (under 100 characters) description of the image for a <a href="http://en.wikipedia.org/wiki/Screen_reader">screen reader</a> user. Note: It should not be the image file name.</p>',
            'resources' => [
                '<a href="http://teach.ucf.edu/resources/document-formatting-guidelines/images/#about">Resource on Alternative Text</a>',
                'WCAG Standard: <a href="http://www.w3.org/TR/WCAG20/#text-equiv-all">1.1.1</a>',
            ],
            'example'   => '
                <p class="text-danger">Incorrect</p>
                <pre>'. htmlspecialchars('<img src="dog.jpg">') .'</pre>
                <p class="text-success">Correct</p>
                <pre>'. htmlspecialchars('<img src="dog.jpg" alt="A photograph of a dog">') .'</pre>
            ',
        ],
        [
            'name'      => 'imgAltIsDifferent',
            'title'     => 'Alternative Text should not be the image filename',
            'desc'      => '<p>Alternative Text (Alt Text) is an alternative (non-visual) way to describe the meaning of an image. Please provide a brief (under 100 characters) description of the image for a <a href="http://en.wikipedia.org/wiki/Screen_reader">screen reader</a> user. Note: It should not be the image file name.</p>',
            'resources' => [
                '<a href="http://teach.ucf.edu/resources/document-formatting-guidelines/images/#about">Resource on Alternative Text</a>',
                'WCAG Standard: <a href="http://www.w3.org/TR/WCAG20/#text-equiv-all">1.1.1</a>',
            ],
            'example'   => '
                <p class="text-danger">Incorrect</p>
                <pre>'. htmlspecialchars('<img src="dog.jpg" alt="dog.jpg">') .'</pre>
                <pre>'. htmlspecialchars('<img src="http://website.com/dog.jpg" alt="http://website.com/dog.jpg">') .'</pre>
                <p class="text-success">Correct</p>
                <pre>'. htmlspecialchars('<img src="dog.jpg" alt="A photograph of a dog">') .'</pre>
                <pre>'. htmlspecialchars('<img src="http://website.com/dog.jpg" alt="A photograph of a dog">') .'</pre>
            ',
        ],
        [
            'name'      => 'imgAltIsTooLong',
            'title'     => 'Alternative Text is more than 100 characters',
            'desc'      => '<p>Alternative Text (Alt Text) is an alternative (non-visual) way to describe the meaning of an image. Please provide a brief (under 100 characters) description of the image for a <a href="http://en.wikipedia.org/wiki/Screen_reader">screen reader</a> user. Note: It should not be the image file name.</p>',
            'resources' => [
                '<a href="http://teach.ucf.edu/resources/document-formatting-guidelines/images/#about">Resource on Alternative Text</a>',
                'WCAG Standard: <a href="http://www.w3.org/TR/WCAG20/#text-equiv-all">1.1.1</a>'
            ],
            'example'   => '
                <p class="text-danger">Incorrect</p>
                <pre>'. htmlspecialchars('<img src="http://placehold.it/img.jpg" alt="I am alt text that is just way too long, look at me being way too long and being a hassle!">') .'</pre>
                <p class="text-success">Correct</p>
                <pre>'. htmlspecialchars('<img src="http://placehold.it/img.jpg" alt="Short and sweet description">') .'</pre>
            ',
        ],
        [
            'name'      => 'imgAltNotEmptyInAnchor',
            'title'     => 'Alt text for all img elements used as source anchors should not be empty',
            'desc'      => '<p>Alternative Text (Alt Text) is an alternative (non-visual) way to describe the meaning of an image. Please provide a brief (under 100 characters) description of the image for a <a href="http://en.wikipedia.org/wiki/Screen_reader">screen reader</a> user. Note: It should not be the image file name.</p>',
            'resources' => [
                '<a href="http://teach.ucf.edu/resources/document-formatting-guidelines/images/#about">Resource on Alternative Text</a>',
                'WCAG Standard: <a href="http://www.w3.org/TR/WCAG20/#text-equiv-all">1.1.1</a>'
            ],
            'example'   => '
                <p class="text-danger">Incorrect</p>
                <pre>'. htmlspecialchars('<a href="http://google.com"><img src="http://placehold.it/img.jpg" alt=" "></a>') .'</pre>
                <p class="text-success">Correct</p>
                <pre>'. htmlspecialchars('<a href="http://google.com"><img src="http://placehold.it/img.jpg" alt="Alt text"></a>') .'</pre>
            ',
        ],
        [
            'name'      => 'tableDataShouldHaveTh',
            'title'     => 'No table headers found',
            'desc'      => '<p>Add a table header because it provides a description of the table structure for sighted and <a href="http://en.wikipedia.org/wiki/Screen_reader">screen reader</a> users.</p>',
            'resources' => [
                '<a href="http://online.ucf.edu/teach-online/develop/document-formatting-guidelines/tables/">Resource Link</a>',
                'WCAG Standard: <a href="http://www.w3.org/TR/WCAG20/#content-structure-separation-programmatic">1.3.1</a>',
            ],
            'example'   => '
                <p class="text-danger">Incorrect</p>
                <pre>'. htmlspecialchars('<table><tr><td>Header One</td><td>Header Two</td></tr><tr><td>1.30</td><td>4.50</td></tr></table>') .'</pre>
                <p class="text-success">Correct</p>
                <pre>'. htmlspecialchars('<table><tr><th>Header One</th><th>Header Two</th></tr><tr><td>1.30</td><td>4.50</td></tr></table>') .'</pre>
            ',
        ],
        [
            'name'      => 'tableThShouldHaveScope',
            'title'     => 'No row or column scopes declarations found in headers of the table',
            'desc'      => '<p>Scope declarations in headers organize and define table data by row/column for sighted and <a href="http://en.wikipedia.org/wiki/Screen_reader">screen reader</a> users.</p>',
            'resources' => [
                '<a href="http://online.ucf.edu/teach-online/develop/document-formatting-guidelines/tables/">Resource Link</a>',
                'WCAG Standard: <a href="http://www.w3.org/TR/WCAG20-TECHS/H63.html">1.3.1</a>',
            ],
            'example'   => '
                <p class="text-danger">Incorrect</p>
                <pre><code>'. htmlspecialchars('<table>'."\n\t".'<tr>'."\n\t\t".'<th>Heading 1</th>'."\n\t\t".'<th>Heading 2</th>'."\n\t".'</tr>'."\n\t".'<tr>'."\n\t\t".'<td>Cell 1</td>'."\n\t\t".'<td>Cell 2</td>'."\n\t".'</tr>'."\n".'</table>') .'</code></pre>
                <p class="text-success">Correct</p>
                <pre><code>'. htmlspecialchars('<table>'."\n\t".'<tr>'."\n\t\t".'<th scope="col">Heading 1</th>'."\n\t\t".'<th scope="col">Heading 2</th>'."\n\t".'</tr>'."\n\t".'<tr>'."\n\t\t".'<td>Cell 1</td>'."\n\t\t".'<td>Cell 2</td>'."\n\t".'</tr>'."\n".'</table>') .'</code></pre>
                <pre><code>'. htmlspecialchars('<table>'."\n\t".'<tr>'."\n\t\t".'<th scope="row">Heading 1</th>'."\n\t\t".'<td>Cell 1</td>'."\n\t".'</tr>'."\n\t".'<tr>'."\n\t\t".'<th scope="row">Heading 2</th>'."\n\t\t".'<td>Cell 2</td>'."\n\t".'</tr>'."\n".'</table>') .'</code></pre>
            ',
        ],
        [
            'name'      => 'cssTextHasContrast',
            'title'     => 'Insufficient text color contrast with the background',
            'desc'      => '<p>Text color should be easily viewable and should not be the only indicator of meaning or function. Color balance should have at least a 4.5:1 ratio for small text and 3:1 ratio for large text..</p>',
            'resources' => [
                '<a href="http://webaim.org/blog/wcag-2-0-and-link-colors/">Resource Link</a>',
                'WCAG Standard <a href="http://www.w3.org/TR/WCAG20/#visual-audio-contrast-contrast">1.4.3</a>',
            ],
            'example'   => '
                <p class="text-danger">Incorrect</p>
                <div class="well well-sm"><p class="no-margin" style="color:yellow">Bad contrasting text</p></div>
                <p class="text-success">Correct</p>
                <div class="well well-sm no-margin"><p class="no-margin" style="color:goldenrod">Good contrasting text</p></div>
            ',
        ],
        [
            'name'      => 'objectMustContainText',
            'title'     => 'Multimedia objects should have text equivalents (e.g., transcripts).',
            'desc'      => '<p>Multimedia objects should be accompanied by a link to a transcript of the content.</p>',
            'resources' => [
                'WCAG Standard: <a href="http://www.w3.org/TR/WCAG20/#media-equiv">1.2.1</a>',
            ],
            'example'   => '
                <p class="text-danger">Incorrect</p>
                <pre><code>'. htmlspecialchars('<object src="widget.html" title=""></object>') .'</code></pre>
                <p class="text-success">Correct</p>
                <pre><code>'. htmlspecialchars('<object src="widget.html" title="A small web widget">A widget of stock prices. <a href="widget.html">Access this widget.</a></object>') .'</code></pre>
            ',
        ],
    ],
    'suggestion' => [
        [
            'name'      => 'imgGifNoFlicker',
            'title'     => 'Avoid the use of animated GIF’s',
            'desc'      => '<p>Animated GIFs may cause seizures if they flash more than 3 times per second. A recommendation is to use an alternative format to deliver the content.</p>',
            'resources' => [
                '<a href="http://webaim.org/techniques/images/#seizures">Resource Link</a>',
                'WCAG Standard: <a href="http://www.w3.org/TR/WCAG20/#seizure-does-not-violate">2.3.1</a>',
            ],
            'example'   => '',
        ],
        [
            'name'      => 'videosEmbeddedOrLinkedNeedCaptions',
            'title'     => 'Synchronized <a href="http://webaim.org/techniques/captions/">captions</a> should be provided for prerecorded web-based video',
            'desc'      => '<p>Captions should be included in the video to provide dialogue to users who are hearing impaired.</p>',
            'resources' => [
                '<a href="https://support.google.com/youtube/answer/2734796?hl=en">Adding Captions to Youtube</a>',
                '<a href="http://guides.instructure.com/m/4152/l/98632-how-do-i-create-captions-for-new-or-uploaded-videos-in-canvas">Creating Captions for Video Uploaded to Canvas</a>',
                'CDL Video hosted video: CDL Video will caption video if a transcript is provided',
                'WCAG Standard <a href="http://www.w3.org/TR/WCAG20/#media-equiv-captions">1.2.2</a>',
            ],
            'example'   => '',
        ],
        [
            'name'      => 'aSuspiciousLinkText',
            'title'     => 'Link text should be descriptive',
            'desc'      => 'Links should be descriptive of the content they\'re linking to, such as "Class Schedule" rather than "schedule.html" or "click here".',
            'resources' => [
                '<a href="http://guides.instructure.com/s/2204/m/4152/l/65824-how-do-i-create-a-hyperlink-in-the-rich-content-editor">Canvas Tutorial</a>',
                '<a href="http://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms.html">WCAG Guidelines</a>',
                'WCAG Standard <a href="http://www.w3.org/TR/WCAG20/#navigation-mechanisms-refs">2.4.4</a>'
            ],
            'example'   => '
                <p class="text-danger">Incorrect</p>
                <pre><code>'. htmlspecialchars('<a href="http://example.com/document.pdf">click here!</a>') .'</code></pre>
                <p class="text-success">Correct</p>
                <pre><code>'. htmlspecialchars('<a href="http://example.com">read the document</a>') .'</code></pre>
            ',
        ],
        [
            'name'      => 'objectTextUpdatesWhenObjectChanges',
            'title'     => 'The text equivalents (e.g., transcripts and/or captions) for embedded content should update when content changes.',
            'desc'      => '',
            'resources' => ['WCAG Standard: <a href="http://www.w3.org/TR/UNDERSTANDING-WCAG20/media-equiv.html">1.2</a>',],
            'example'   => '',
        ],
        // [
        //     'name'      => 'objectLinkToMultimediaHasTextTranscript',
        //     'title'     => 'Multimedia objects should have text equivalents (e.g., transcripts).',
        //     'desc'      => '<p>Multimedia objects should be accompanied by a link to a transcript of the content.</p>',
        //     'resources' => [
        //         'WCAG Standard: <a href="http://www.w3.org/TR/WCAG20/#media-equiv">1.2.1</a>',
        //     ],
        //     'example'   => '
        //         <p class="text-danger">Incorrect</p>
        //         <pre><code>'. htmlspecialchars('<object src="video.mov"></object>') .'</code></pre>
        //         <p class="text-success">Correct</p>
        //         <pre><code>'. htmlspecialchars('<object src="video.mov"></object><a href="transcript.html">Read Transcript of the video</a>') .'</code></pre>
        //     ',
        // ],
        // [
        //     'name'      => 'aLinksToMultiMediaRequireTranscript',
        //     'title'     => 'Multimedia objects should have text equivalents (e.g., transcripts).',
        //     'desc'      => '<p>Multimedia objects should be accompanied by a link to a transcript of the content.</p>',
        //     'resources' => [
        //         'WCAG Standard: <a href="http://www.w3.org/TR/WCAG20/#media-equiv">1.2.1</a>',
        //     ],
        //     'example'   => '
        //         <p class="text-danger">Incorrect</p>
        //         <pre><code>'. htmlspecialchars('<a href="interview.mov">Watch the interview</a>') .'</code></pre>
        //         <p class="text-success">Correct</p>
        //         <pre><code>'. htmlspecialchars('<a href="interview.mov">Watch the interview</a> <a href="transcript.html">(transcript)</a>') .'</code></pre>
        //     ',
        // ],
        [
            'name'      => 'headersHaveText',
            'title'     => 'Headings should contain text',
            'desc'      => '<p>Sighted and <a href="http://en.wikipedia.org/wiki/Screen_reader">screen reader</a> users depend on headings to organize the content on the page. Headings should not be empty and should represent an accurate outline of the content</p>',
            'resources' => [
                'Using H1-H6 to Identify Headings <a href="http://www.w3.org/TR/WCAG20-TECHS/H42.html">Article</a>',
            ],
            'example'   => '
                <p class="text-danger">Incorrect</p>
                <pre><code>'. htmlspecialchars('<h1></h1>') .'</code></pre>
                <p class="text-success">Correct</p>
                <pre><code>'. htmlspecialchars('<h1>Title</h1>') .'</code></pre>
            ',
        ],
        [
            'name'      => 'noHeadings',
            'title'     => 'Consider adding headings to your document to create more structure',
            'desc'      => '<p>If appropriate, add headings to the page to organize the content for sighted and <a href="http://en.wikipedia.org/wiki/Screen_reader">screen reader</a> users. The headings should represent an accurate outline of the content</p>',
            'resources' => [
                '<a href="http://online.ucf.edu/teach-online/develop/document-formatting-guidelines/headings/">Resource Link</a>',
                'WCAG standard <a href="http://www.w3.org/TR/WCAG20/#content-structure-separation-programmatic">1.3.1</a> and <a href="http://www.w3.org/TR/WCAG20/#content-structure-separation-sequence">1.3.2</a>',
            ],
            'example'   => '',
        ],
        [
            'name'      => 'pNotUsedAsHeader',
            'title'     => 'Avoid using styles for document structure',
            'desc'      => '<p>Bold and Italics are used to emphasize text, whereas headings are used to define the structure of the document. Headings like <code>h1-h6</code> are extremely useful for non-sighted users to navigate the structure of the page, and formatting a paragraph to just be big or bold, while it might visually look like a heading, does not make it one.</p>',
            'resources' => [],
            'example'   => '
                <p class="text-danger">Incorrect</p>
                <pre><code>'. htmlspecialchars('<p><strong>Header 1</strong></p>') .'</code></pre>
                <p class="text-success">Correct</p>
                <pre><code>'. htmlspecialchars('<h1>Header 1</h1>') .'</code></pre>
            ',
        ],
    ],
];
