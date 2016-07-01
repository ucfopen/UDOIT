<?php

$test_content_result = [
    "items"         => [
        [
            "id"        => "test",
            "content"   => '<p>Insufficient text color contrast with the background:&nbsp;<span style="color: #ffff99;">Bad contrasting text</span></p>
<p>Multimedia objects should have text equivalents(e.g., transcripts): <object title="" width="300" height="150"></object></p>
<p><span style="text-decoration: underline;"><strong>Suggestions</strong></span></p>
<p>Avoid the use of animated GIFs: <img src="http://www.mathworks.com/matlabcentral/mlc-downloads/downloads/submissions/21944/versions/2/screenshot.gif" alt="" /></p>
<p>Synchronized captions should be provided for prerecorded web-based video:</p>
<p><a class="" href="https://www.youtube.com/watch?v=JbLEPXhLVaA">https://www.youtube.com/watch?v=JbLEPXhLVaA</a></p>
<p>Link text should be descriptive: <a href="http://example.com/document.pdf">click here!</a></p>
<p>Headings should contain text:</p>
<h1></h1>
<p>Change paragraphs to headings:</p>',
            "title"     => "TEST",
            "url"       => "https://"
        ]
    ],
    "amount"        => 0,
    "time"          => (float)1450001111.0001,
    "module_urls"   => [],
    "unscannable"   => []
];


// UDOIT OBJECT {
//     ["course"]=> string(25) "Dev_UDOIT_DEV_Joseph_F_08"
//     ["total_results"]=> {
//         ["errors"]=> int(5)
//         ["warnings"]=> int(0)
//         ["suggestions"]=> int(3)
//     }
//     ["content"]=> {
//         ["pages"]=> object(stdClass) {
//             ["title"]=> string(5) "pages"
//             ["items"]=> array(1) {
//                 [0]=> object(stdClass) {
//                     ["id"]=> string(4) "test"
//                     ["name"]=> string(4) "TEST"
//                     ["url"]=> string(53) "https://webcourses.ucf.edu/courses/1165242/pages/test"
//                     ["amount"]=> int(8)
//                     ["error"]=> array(5) {
//                         [0]=> object(stdClass) {
//                             ["type"]=> string(9) "imgHasAlt"
//                             ["lineNo"]=> int(4)
//                             ["severity"]=> string(5) "Error"
//                             ["severity_num"]=> int(1)
//                             ["title"]=> string(45) "Image elements should have an "alt" attribute"
//                             ["description"]=> string(304) "Alternative Text (Alt Text) is an alternative (non-visual) way to describe the meaning of an image. Please provide a brief (under 100 characters) description of the image for a screen reader user. Note: It should not be the image file name."
//                             ["path"]=> string(4) "None"
//                             ["html"]=> string(126) " "
//                         }
//                         [1]=> object(stdClass) {
//                             ["type"]=> string(21) "objectMustContainText"
//                             ["lineNo"]=> int(2)
//                             ["severity"]=> string(5) "Error"
//                             ["severity_num"]=> int(1)
//                             ["title"]=> string(68) "Multimedia objects should have text equivalents (e.g., transcripts)."
//                             ["description"]=> string(89) "Multimedia objects should be accompanied by a link to a transcript of the content."
//                             ["path"]=> string(4) "None"
//                             ["html"]=> string(273) " "
//                         }
//                         [2]=> object(stdClass) {
//                             ["colors"]=> array(1) {
//                                 [0]=> string(7) "#ffff99"
//                             }
//                             ["type"]=> string(18) "cssTextHasContrast"
//                             ["lineNo"]=> int(1)
//                             ["severity"]=> string(5) "Error"
//                             ["severity_num"]=> int(1)
//                             ["title"]=> string(52) "Insufficient text color contrast with the background"
//                             ["description"]=> string(154) "Text color should be easily viewable and should not be the only indicator of meaning or function. Color balance should have at least a 4.5:1 ratio."
//                             ["path"]=> string(4) "None"
//                             ["html"]=> string(58) "Bad contrasting text "
//                         }
//                         [3]=> object(stdClass) {
//                             ["type"]=> string(15) "headersHaveText"
//                             ["lineNo"]=> int(9)
//                             ["severity"]=> string(5) "Error"
//                             ["severity_num"]=> int(1)
//                             ["title"]=> string(28) "Headings should contain text"
//                             ["description"]=> string(236) "Sighted and screen reader users depend on headings to organize the content on the page. Headings should not be empty and should represent an accurate outline of the content"
//                             ["path"]=> string(4) "None"
//                             ["html"]=> string(10) ""
//                         }
//                         [4]=> object(stdClass) {
//                             ["type"]=> string(34) "videosEmbeddedOrLinkedNeedCaptions"
//                             ["lineNo"]=> int(6)
//                             ["severity"]=> string(5) "Error"
//                             ["severity_num"]=> int(1)
//                             ["title"]=> string(125) "Synchronized captions should be provided for prerecorded web-based video"
//                             ["description"]=> string(102) "Captions should be included in the video to provide dialogue to users who are hearing impaired."
//                             ["path"]=> string(4) "None"
//                             ["html"]=> string(111) "https://www.youtube.com/watch?v=JbLEPXhLVaA "
//                         }
//                     }
//                     ["warning"]=> array(0) { }
//                     ["suggestion"]=> array(3) {
//                         [0]=> object(stdClass) {
//                             ["type"]=> string(31) "objectShouldHaveLongDescription"
//                             ["lineNo"]=> int(2)
//                             ["severity"]=> string(10) "Suggestion"
//                             ["severity_num"]=> int(3)
//                             ["title"]=> string(42) "An object might require a long description"
//                             ["description"]=> string(92) "Objects might require a long description, especially if their content is complicated."
//                             ["path"]=> string(4) "None"0
//                             ["html"]=> string(273) " "
//                         }
//                         [1]=> object(stdClass) {
//                             ["type"]=> string(27) "objectInterfaceIsAccessible"
//                             ["lineNo"]=> int(2)
//                             ["severity"]=> string(10) "Suggestion"
//                             ["severity_num"]=> int(3)
//                             ["title"]=> string(46) "Interfaces within objects should be accessible"
//                             ["description"]=> string(142) "Object content should be assessed for accessibility. Objects cannot be checked using automated tools, this should be reviewed manually."
//                             ["path"]=> string(4) "None"
//                             ["html"]=> string(273) " "
//                         }
//                         [2]=> object(stdClass) {
//                             ["type"]=> string(19) "aSuspiciousLinkText"
//                             ["lineNo"]=> int(6)
//                             ["severity"]=> string(10) "Suggestion"
//                             ["severity_num"]=> int(3)
//                             ["title"]=> string(31) "Link text should be descriptive"
//                             ["description"]=> string(140) "Links should be descriptive of the content they're linking to, such as 'Class Schedule' rather than 'schedule.html' or 'click here'."
//                             ["path"]=> string(4) "None"
//                             ["html"]=> string(111) "https://www.youtube.com/watch?v=JbLEPXhLVaA "
//                         }
//                     }
//                 }
//             }
//             ["amount"]=> int(1)
//             ["time"]=> float(0.61)
//         }
//     }
// }


?>