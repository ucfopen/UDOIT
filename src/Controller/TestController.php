<?php

namespace App\Controller;

use App\Entity\ContentItem;
use App\Entity\Issue;
use App\Services\HtmlService;
use App\Services\LmsApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class TestController extends AbstractController
{
    #[Route('/test/issue/{issue}', name: 'test')]
    public function testIssue(HtmlService $html, Issue $issue)
    {
        $contentItem = $issue->getContentItem();

        print "<h1>Content Item</h1>";
        echo "<textarea style='width:100%; height:100px'>" . $contentItem->getBody() . "</textarea>";
        echo "<textarea style='width:100%; height:100px'>" . $html->clean($contentItem->getBody()) . "</textarea>";

        print "<h1>Issue</h1>";
        echo "<textarea style='width:100%; height:100px'>" . $issue->getHtml() . "</textarea>";
        echo "<textarea style='width:100%; height:100px'>" . $html->clean($issue->getHtml()) . "</textarea>";
        echo "<textarea style='width:100%; height:100px'>" . $issue->getPreviewHtml() . "</textarea>";
        echo "<textarea style='width:100%; height:100px'>" . $html->clean($issue->getPreviewHtml()) . "</textarea>";

        

        exit;
        return $this->render('test/index.html.twig', [
            'controller_name' => 'TestController',
        ]);
    }

    #[Route('/api/test/content/{item}', name: 'test')]
    public function testContentItem(LmsApiService $lmsApi, ContentItem $item)
    {
        $lms = $lmsApi->getLms();
        $response = $lms->postContentItem($item);

        print_r($response);
        exit;
        
        return $this->render('test/index.html.twig', [
            'controller_name' => 'TestController',
        ]);
    }

    protected function getHtml() 
    {
        return 
<<<STRING
<html><head><title>Burp Scanner Report</title>
<meta http-equiv="Content-Security-Policy" content="default-src 'none';img-src 'self' data:;style-src 'unsafe-inline'" />
<style type="text/css">
body { background: #dedede; font-family: 'Droid sans', Helvetica, Arial, sans-serif; color: #404042; -webkit-font-smoothing: antialiased; }
#container { width: 930px; padding: 0 15px; margin: 20px auto; background-color: #ffffff; }
table { font-family: Arial, sans-serif; }
a:link, a:visited { color: #ff6633; text-decoration: none; transform: 0.3s; }
a:hover, a:active { color: #e24920; text-decoration: underline; }
h1 { font-size: 1.6em; line-height: 1.4em; font-weight: normal; color: #404042; }
h2 { font-size: 1.3em; line-height: 1.2em; padding: 0; margin: 0.8em 0 0.3em 0; font-weight: normal; color: #404042;}
h4 { font-size: 1.0em; line-height: 1.2em; padding: 0; margin: 0.8em 0 0.3em 0; font-weight: bold; color: #404042;}
.rule { height: 0px; border-top: 1px solid #404042; padding: 0; margin: 20px -15px 0 -15px; }
.title { color: #ffffff; background: #ff6633; margin: 0 -15px 10px -15px; overflow: hidden; }
.title h1 { color: #ffffff; padding: 10px 15px; margin: 0; font-size: 1.8em; }
.title img { float: right; display: inline; padding: 1px; }
.heading { background: #404042; margin: 0 -15px 10px -15px; padding: 0; display: inline-block; overflow: hidden; }
.heading img { float: right; display: inline; margin: 8px 10px 0 10px; padding: 0; }
.code { font-family: 'Courier New', Courier, monospace; }
table.overview_table { border: 2px solid #e6e6e6; margin: 0; padding: 5px;}
table.overview_table td.info { padding: 5px; background: #dedede; text-align: right; border-top: 2px solid #ffffff; border-right: 2px solid #ffffff; }
table.overview_table td.info_end { padding: 5px; background: #dedede; text-align: right; border-top: 2px solid #ffffff; }
table.overview_table td.colour_holder { padding: 0px; border-top: 2px solid #ffffff; border-right: 2px solid #ffffff; }
table.overview_table td.colour_holder_end { padding: 0px; border-top: 2px solid #ffffff; }
table.overview_table td.label { padding: 5px; font-weight: bold; }
table.summary_table td { padding: 5px; background: #dedede; text-align: left; border-top: 2px solid #ffffff; border-right: 2px solid #ffffff; }
table.summary_table td.icon { background: #404042; }
.colour_block { padding: 5px; text-align: right; display: block; font-weight: bold; }
.high_certain { border: 2px solid #f00; background: #f00; }
.high_firm { border: 2px solid #f66; background: #f66; }
.high_tentative { border: 2px solid #fcc; background: #fcc; }
.medium_certain { border: 2px solid #f90; background: #f90; }
.medium_firm { border: 2px solid #ffc266; background: #ffc266; }
.medium_tentative { border: 2px solid #ffebcc; background: #ffebcc; }
.low_certain { border: 2px solid #fe0; background: #fe0; }
.low_firm { border: 2px solid #fff566; background: #fff566; }
.low_tentative { border: 2px solid #fffccc; background: #fffccc; }
.info_certain { border: 2px solid #ababab; background: #ababab; }
.info_firm { border: 2px solid #cdcdcd; background: #cdcdcd; }
.info_tentative { border: 2px solid #eee; background: #eee; }
.row_total { border: 1px solid #dedede; background: #fff; }
.grad_mark { padding: 4px; border-left: 1px solid #404042; display: inline-block; }
.bar { margin-top: 3px; }
.TOCH0 { font-size: 1.0em; font-weight: bold; word-wrap: break-word; }
.TOCH1 { font-size: 0.8em; text-indent: -20px; padding-left: 50px; margin: 0; word-wrap: break-word; }
.TOCH2 { font-size: 0.8em; text-indent: -20px; padding-left: 70px; margin: 0; word-wrap: break-word; }
.BODH0 { font-size: 1.6em; line-height: 1.2em; font-weight: normal; padding: 10px 15px; margin: 0 -15px 10px -15px; display: inline-block; color: #ffffff; background-color: #ff6633; width: 100%; word-wrap: break-word; }
.BODH0 a:link, .BODH0 a:visited, .BODH0 a:hover, .BODH0 a:active { color: #ffffff; text-decoration: none; }
.BODH1 { font-size: 1.3em; line-height: 1.2em; font-weight: normal; padding: 13px 15px; margin: 0 -15px 0 -15px; display: inline-block; width: 100%; word-wrap: break-word; }
.BODH1 a:link, .BODH1 a:visited, .BODH1 a:hover, .BODH1 a:active { color: #404042; text-decoration: none; }
.BODH2 { font-size: 1.0em; font-weight: bold; line-height: 2.0em; width: 100%; word-wrap: break-word; }
.PREVNEXT { font-size: 0.7em; font-weight: bold; color: #ffffff; padding: 3px 10px; border-radius: 10px;}
.PREVNEXT:link, .PREVNEXT:visited { color: #ff6633 !important; background: #ffffff !important; border: 1px solid #ff6633 !important; text-decoration: none; }
.PREVNEXT:hover, .PREVNEXT:active { color: #fff !important; background: #e24920 !important; border: 1px solid #e24920 !important; text-decoration: none; }
.TEXT { font-size: 0.8em; padding: 0; margin: 0; word-wrap: break-word; }
TD { font-size: 0.8em; }
.HIGHLIGHT { background-color: #fcf446; }
.rr_div { border: 2px solid #ff6633; width: 916px; word-wrap: break-word; -ms-word-wrap: break-word; margin: 0.8em 0; padding: 5px; font-size: 0.8em; max-height: 300px; overflow-y: auto; }

div.scan_issue_false_positive_rpt{width: 32px; height: 32px; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAQaSURBVFhHxZdNbBNXEIDHa8d/guCUJDLCoEKiHkJVELQKRYpAQhyqCjiBOICExA24kAOIA4WcCiKppR4bbqWoDQeCkBCQVkFABOGnEIJDI2IEQQHZwbjYsfy33sfM88T2uv5Zi6R80Whn5u3MvJ19L34LRvH5fFZVVb8TQnRrmvYnyiuUGEoK5S36R1B+RdkdiUQaOezjSSQSrZj0Fy5iCJpUJpP5I5VKreU0tUNPjElOUDLOWzMYq+HlJxQHpzVGLBZbgrFDMsscgLl82MmVnL4y1DYMeMOxcwbmfIeXdi5TGrzh8/koXkCQ1hSX00PvHIvf5RvnE9otuTVh4iv4Y/6uBZYFP7BpCJfFBUktCXEtzp7SWE1WcJqdYFWs0sYHPWk2m4+SLidAbdn5z87xgfCAUi1ZIWfbzsKD6APwvvKypzI2xQYbFm2ArhVdmQ5XxyqTyTQuB3C7naHepLW0WDO8RsBfkJOR6Ih4MvNEytjMmBgIDYh9Y/vk2JXQFQoTM+qM2OPbo4s7PHFY3Pr3lhTvpFcsvrE4N+YcdIqLwYtnZHGMt2FLYjITsm1kmy5RKQbDg3KMJjVLz8seXRzdU8i10DXd+K7RXVTTpuDTf4+tcMrZIB67h7XyeGwe2NG8A+rN9ewBsCt21kqz5bMt0OJoYQvgReKFk2oruBg2s88wrY5W6PuyD5bZl7EHoMnaxFp5KG4WmjDVVrAN37LPEFPJKbgXucdWbUzEJ1gD2Niwkd7vWgXbn+9LCWibFdL7uhf2Pt3LlnGuhq6CP+6XeoOlAfYv3Q9Yu82Cdv5FIk11+lYee35M7mFCExqcD54HxaRIuxqPoo8gkArA0Psh6J7slj7Kf2n1JWi2NpNZXzUTBeOKhv7pfjgXOAfP4s94pDo9kz2w9fFWeXVb3XDQcxBG20ehvb7gJwHfQwIlx/Hnx3XbJZgM8kiWA+MHRNudNrby9AX6dHHF27AMCVqEYzwXQ6y0G/tVNQLWfkiL8Dbbhuhc3gm+dh9bHwfW/pvWwPWsmaV41c8z15VAIHAZlVzVSCbCWm1EVH1csV2CJNVW3G43nWx/ZydMp6ZZy5LQEqxVprhz1SZANam23IaKovyICyJDOv2nK2Q4MgyqUNkqz/3ofday0P+Acq+Tlj8e8U+TnjuQuG+6b6RFuiOUDrEnT52pDg4tPwSnWk6xJ88R/xHoneqFsBpmTx4T/m1v3A4XvrrAniz49F78HegkPTeBdYPrGvvX91/GU8s37NLhUByw0LKQrTxRNVrxRESnIVediy3JY5T1uAP+G4Sd+XSH0lnwWP71fEwCc75Lp9ObuExl8H7qxFx/mHzB6Y3xST/NCqF3hgn+/4/TYmY/zzHxz1iAPs+nqBAKPWUYL6M49hvqNXyeA3wAUPUS+7uslXoAAAAASUVORK5CYII=)}
div.scan_issue_high_certain_rpt{width: 32px; height: 32px; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAL3SURBVFhHvZfPaxNBFMdfN8ZQLTlEghEKFSNWExApFfEmeBL/gOKp9/4F8ebNW/8A7wW9F9RTe6iUerCkND21lzaiBi0YEUyjGb9v9226m7xNZrbiBx47MzvzvvPj7ezMBFnSIDo/S/QwAzNEd1CELBVgWVgbjj7iuQN7+4PoTZ7oK9Jn5xfRdQi+6MEhnmbIKhVjlpYCKxT8MtQ9+UP06oRoTty4wyOGk2fsbEg0kzFmYcGYtTUTo1qN1UPbHp7LsElxa8dPoito/C7qrG/T08YcHoriAPxOaQNfDczkNXE/Gp42NPikOfKNR5lELqe3gcHnMZ73REYHFa6OFGcrl0VtgFZLrx+3FseUyMXhNYf4e6VR3HiUGhwPWv1hq8P6MeHJk24S1fAp3ZVsMp0OUbMpmQgHB5IYy20M9Kmkgw7wtCBR80tsODqSRIQG5tASDLQWLoXfAewkLG7/qWijtZ8B7kBWNMnDeuRQ8MR/Y4s22v19SdjBmqztYbN5jMwFKbfjbDHgw5qs7fHeLmX2DIpxhzg4HWFtXoL7krdncAkcAjAKtOc8TEVZ8va02/Fl2NuThBvQrvBXgD9nCqKjTjkDIN/fiJz5BzPAcAfco4eJfnbaxmRHh4MwXffDGRiMBwegvc1BuCl5N8JP0XEDigLtD7wE60HWEZ72lRWixUUpSMX6xGeii5eJviGTC8r+G50vRJe8Ek5g+D2+lEI3JvH/KmMb4V+LI6zJ2n4GwTCLgt94ageIYSuVjFldNabbDQ4ju7vGzMzodRWDVg+fXtUXD8GP4blWWbWtrUA4Sr2u11UMWssiewr2MrsjGZ98k8jn9TZxix3JYuDF+EPpqA4Ui3qbU0s+lIbgWD4/thMplgA+j7tED0RmNGjAM6FfTNg4CDc2RBmMCUL44ovJDXFvB8dE4tUstKmp4J6Qzarv0Tbd1SwKrxkcJF9OFeNOo/NWl1Nsx3bwjPD1HA0e8UECRbdgRdg55L9DuAnbwd7+2v56TvQXGcdZcmkc3RsAAAAASUVORK5CYII=)}
div.scan_issue_high_firm_rpt{width: 32px; height: 32px; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAALmSURBVFhHpZdNaxNRFIYnCTGokI2WIqQgtrWQQhfFIpZCA67EX2Bx199QcOHCnRvpQrpyZRGh/gcX3UjBhSI2brooVKyJmEoDgUy+ru87c4ZMJjcz904eOM25X+e9n9N7HVOq1eqVXq/3SCn1ajAYfIT9hLVgHdhf5H+DvYM9bTabN6XZ9LTb7QUEfSMi4xwfK7W351uj4WWxU/1+/0On01mVMPZwxAjygsG8qGG6XaUODpSqVJRynKGxMyHQdoCfXdhVCWtGq9W6hbafvChRzs6UKpVGhQNjmQbEqmIm70j4eDhtaPBb2o7DUerEae22VBoHMS/wc19k9KDC7VhxcnKiF5+ZkQqx/OGeErlRuOYQ/ywVJ8NR6jqwuSkVEuFpGd8T3HB+uQG6PbC9LYXJQOulyDpZ/uG0ZDKZ516OCaWSOCHKZXGSgdYO+rFE3+tAPp9/hswcfSMWNMuoy5sAtbDcO/Sz6EkBGU+8ElN0o52fF8cMalI7i/V4jMQ1yTdjbk6cEBYzQKhJ7Wwul3soeeZER8t0oSAJc6jNJXggaXOWl8URomlDoL2axVTYLR4pFkdPguX6B0C7zFOAaCkIjzrlDICidwxTEZ4Bi29AFHbA9V1LwtOu+zCZ4XIT/pCEHcFR5H7QHUsDoP2Vm/BI0nYEM5ByAxJof+ESHPpJSxYXHWdry3H29yUjFYeZWq12fXZ2toGE/ZdkOtx6vX7D8/BJfIv1sKfZ9C8orisZ5lDTEydIL+G/U88vMuD8XKmNjeFdoFxW6vRUCpOB1sB13dGPBy8JUp7M2troZYS2siKFyUBrV2SHGF/JePONigd2eSmVYtFfyQgKki+lcR2o16XSRCZfSgNwLb+X2IkUS4CYF91utyIy8aA+Z0L/MCHchOvrQ/GETYhYfJjclfBmxD7NAhKOIdqme5qF4ZohwOTHqQZ2Gp2f7nEaJXieI/BrCPB5/otCMI7yH36+o+w9fIvnueP8BxSS9SUfeqeFAAAAAElFTkSuQmCC)}
div.scan_issue_high_tentative_rpt{width: 32px; height: 32px; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAOISURBVFhHvZfPS1RRFMfv+KMxE1MMJHARTaXkLpDEhS5CsEUbQxFxE/0BEkgLEYo2maSL0I0EBhoULsKFIpLoJoUEJWICsUWQ0Uxm0jBjM+PMnL7n3TPOvN6bH2+EPnDm3Xd/nO+5d+69716VL16v91QsFrtJRE8TicRb2FdYCBaF/UT+B9g0rC8QCJyTZjlxyTMj4XD4ktvtvg/HnS6Xq0b9+aPU6qpSGxtKBYO6UkWFUlevKtXertTZswp1j2BvEPAjtPXqSg7hHsfj8YfcQzgjCgaJ7t0jqqoiUtCws/Jyov5+osNDowm3hY8nSJ4Wt/kRCoXOo/E7wwuzv090+bK9qJ21tBwHwcCXFyN5UdxnJxqNXkOD79JWMzdnL5TNeCTSgM9feFwXGXtQ4YJFnHnwIOW4tZVoeJhoZESLeDxm4aS53XrkzPzgOSVyZvg/h/h7qWjmxg3tdHJSMtI4wnzr6bEGwLa4KJVM8GqxzgmecLr8H8Jh3ZumJsmwYW/PPoBpXpVWoPVYZDU8LOh9TMrNrKxoZ1NTkpGBujprAGtrUmhGtOpF3uj9c11kw/Y20fi4XobZqKw0i1dXZ23DmoY40m5EFNLZBbKwYBZnGxiQQntE062wW3XqrALhXjY0mMV5zzg4kAqZYW3Upgn9WiC9vVbx3V0pzMmEwlBsyotzRkfN4s3NTsT5b1hHK/qtXx0yP09UXJwS7+rKPVGt/OYAnOPzpT5KLpfeGeNxKXRGYQHcvavFS0uJXr2SzMLgALDVOYQ/uxwA9/xkhIvw88nYEJxQUqKfd+7oZ4FAe6sIp5x1ec+ftjZJnAxobxbhifOVQ4aGlPJ4lNrdlYyCWXX5fL4ztbW1+3hx67z/RsTv99cYKXwYXhhT4j/CmoY4g/d6+UTmZmuLqKND7wO87c7OSkH+QCsRiUQaRV7DhwQpz4zfbz0V80a0vCwV8gNaYyKbIuuRLAmfC9LFk9bXJxXywnQk41Vg0NjYGMWy6EahT7KsZJr1gYAkcrKHob8NHdxuNMcBMCj4gm/0rYxB8M3HjpYWSWQGPg/gu7usrOyzZGUGlfl4nrqYpDM4qP/35PDzMT3tEmIHfPHF5Iq4zw/L1SydnR2imRmipaWsX0G05ZU1BnN2NUuHT8xwMAlnfAPOCw4awb+2LLWTkLyew/EzCPD1/BsLwRLQPMDjI8peIu3geq7UX+xyemrcb22vAAAAAElFTkSuQmCC)}
div.scan_issue_info_certain_rpt{width: 32px; height: 32px; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAMwSURBVFhHvZdPaBNBFMYna/7poRBrSoQeihFbkpsXT4VeRTwF2hw85Oyth4DgQU8tRisijQevYlDBk+hJaHOQQoWKkUhKpQiJaFFSCESbkGT83uS122ST7myq+cHLvn0z+763O7OTHaFLPp/3NhqNy1LKe61W6y2sCKvC6rBfiH+EPYFdq1QqZ/iy47O3t3ceSR+ziBZUVLPZfF6r1aKcxjl0x0hym5Jx3gMQl6lUSk5NTcnR0VE5Pz8vUSi3mnAhd+Ce5LR6VKvVs7j4XTuNlYWFBYluHZZMJrnVCnLlUeA59LOnXq9fxAXf+dqeBINBSwHj4+Pc2hvkLONwCX07MPioQIcJt9v92uVyhTikDcabvd4gZwCHVzSn2pE2BwXQmKOAFzriGHP2TBKJBHtHEvT5fC+hY50TNOHQoMX+JAyHwzIQCPSdhP3A9YssK1z0Q4/F6/UWcPcnVPQ/QzVAKwrbVEPg8XhuDEucIC1MyqTyUY0PVkbwlGodEtD8Dc3TBsbjynHEi8WiWFpaEnNzcxzRgzSVNipJ4/x6O9yfcrkscrmcKJVKSrRQKIj19XV1JLAOqLhDHgmMxQaKsCWdTlsWn8MWiUS4pz7QXjPwKMJIYMv09LRYXl4WeP0ExDhqMjY2xp4+0I7QZHBMJpOxPIGZmRludUbHUqwLlmv2TEZGRthzBhVw9CKuCZZY9hxRM/AUPvOJNoPebTfQ/kCTcI3Ptel1t4MUBe0NGoLV9unxGHAIVo2dnZ03cBzNgwHFuqmRthEKhejL9hkHtfgXc4A0SVu9hoZhLGJCNFWLBnZfP3bQ+49P/LvkqwIwGTYRUwEd8N3P3mBA6wGGMU/+wUKEP5VbaHjPp45xUFQOT/wm+2YB0Wi0jicxiyJ+cKgvvcQ0h+Un+sWg84fPzQIINHzF2Fy1K2J7e5s9k62tLfZ6g5y7yD3r9/u/cKg/6DyBWdqxMVlZWZHxeFzGYjGJt8DyZ0Q2OTkp8WEis9ksX9UGuWhjcgF99Onemtl9Dxw26svCDRzuw5xtzQ5DX8xIMPzNaTf723MkfggB2p5/IyFYC5q7OHxC21P4DrbnQvwF214N3RLEYxoAAAAASUVORK5CYII=)}
div.scan_issue_info_firm_rpt{width: 32px; height: 32px; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAOPSURBVFhHxZdNaBNREMdfkiZp0lJoiBBLDwU9Jf1AK5WGHupRpAcRe7Kn3rz3IArtTUFLRdCDB/Ei+HkScxIqPQmGRFKaJmkQqVVSTJNSGtPEJvE/L9MN+dh0k7bxB4+dmd19Mztv9n0IraysrJj29/cvFwqFB/l8/iPaD7QUWhYtjubL5XLPcP/Gzs6OnV87Ont7e2fR6VNygqsmKCgE8yqTybi4G1V0fK2CvtjpdM6ivxmdTmdkswSdC6/XK8LhsEin08Llcgm32y30ej0/UQTv/kVbgH0OfaTZXEbNAFKp1GmLxfIWL7nZVMbS0pLw+/2sFRkZGRGjo6OslYMggtlsdqK9vf0bmxTKQwZ48Dyc+9ScE8gOSyWCwSBL1aAvp8lk8iKQi2xSKAsAD/S1tbV9wAsONmmGhqUe6LMbl/dUU0VLESUAGnME8FqLcxrzSgYGBliqyymz2fwOfiysl2oAXzCHYplltS4HRbi6ukp/iejv769ZhGrgL7lnMBhukSwDoLRgjEL4egPpJw0ykIMvF1pYhmw0Gu+0yjlBvpCFGSkjGhuuv9DMZGgV8PsHgdj0iOQ69KadY9oVPp9PeDwetmgDzq2opSuUgcfQbxbN6lCxxeNxsbu7K9vW1paIxWJie3tb3u/s7BTT09NSboAnOmSAJp1zbFAlEAiIxcVF1qqx2WxiamqKNW3g4z/r4fwM63Xp6ekR4+PjYmxsTHR305xSjtVqZUk78O2kv6CrqNbHbreLoaEhMTw8LAYHB9laAtM3Sw3RpW3mqKCjo4OlEphHWGoMCiBTFI8GZjaWGiKjRyGoL2MqNPu1lcC3n4rQx7pmmvzaKsg3TURfWP8ffMICpn8D4VjqoEEym5ubHhqCBLLwko0tg3w6HI6U/A2RhbsoiPpbmmMEvgrY4t8nWQaALIRhk4ZWAF8PsTOSG0tlIgqFQrQF11SQ2Liy1BQBZPw2y6UAsM/LIhOTCCLGJlVqbUAP25Qyv3FYuQY/yhlBCYDAje8Ym4nDgqDluJJkMslSbdBnEn1P4mwQZZOk5sEED/ehvUBAytlgY2NDLC8vU/WK9fX1msNAqyQtWrRY9fb2slX2RweTq3AeYZNCWQYOoExgx3sJ4jyanCMSiYSIRCIiGo2q1gBlYW1tTT5LwDGNywL6u1DLuSZO+nCqmYPjOTp+BAd0PP9JjtDy8JnE5SvuPYfcwPFciH+oJiV1ec52uwAAAABJRU5ErkJggg==)}
div.scan_issue_info_tentative_rpt{width: 32px; height: 32px; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAANQSURBVFhHxZfPaxNBFMcna5s0thRsYn6QS0GhkJwUQfDmUaQHEXvyL/DuSUEvUkRFEfTgQbwI/jyJnjx4FJQohqSpiBgkqWnS9GfMr6br982+7JLNbtxsa/zAsG/ebN578+btTEY4JZ1Oe7e3t0+pqnpzZ2fnLdpPtCpaE62Mlmy32w8xfn5jYyPIP9s99Xr9MIw+ICd4OoKCQjBPG41Ggs0MDs0Ytq6RMc2sAXTq0tKSurCwoKZSKbVQKEidGQ7kOkQ/m+3Bw88uqtVq1O/3v/B4PCdY1QUcilKpxD2NcDgsIpEI97pBAJlmszk7Njb2nVU6Cj918OJROE/aOSdWVlZYMqhUKiz1Altxr9f7EYEcZ5VOVwB4YXpkZOQ1fmA9lT7gtyxZA5sH8HhFNaVpNPQAeM2fOXEeCARYMrDSWXDQ5/O9hJ/emkCxXMWAIzpFmMlk+hahHfA1z261IqS0YI2ymP0+qf3HUAzwlUBblEswOjp6eVjOCfKFjF2UMqKZwrOA5iPFsIDf3whkSkEk59B37RyfrVheXha5XI41zoDz/aiF05SBe+hf0NT24BygWhGtVks6JblWqwlst3Icyyji8biUB+C+BxmgTecIK2wpl8sin89zrxfscmJmZoZ7zsDk3ytwfoj7fRkfHxexWExEo1GBb5m1BtjAWHIOfMfpK5jUuv3B9iyCwaAIhUKWm46bAMBkz1ngBFpvM4riypTcirUq2iUuA2goKIQMdxzjdrZm4PsTFWGS+47ZqwDIN21EH7j/P3iHySjPIexJHQxIo1gsvqElqCALT1g5NMgn/sJV5WIiC/MoiLYcGQLwpWJrv0GyDABZWIROKoYBfN3BbpomWS/nbDZ7BQOOChKnGEuu+IKMX2LZCCCRSDSRiTkE8YtVttDJaAZrylJfSjg9z8JPjftGAAQGfsD47N+CoCPZTOdYtgM2V2F7DqfmN1ZJLC8meHka7TEC0u8GW1tb8j4Avdjc3LScMZ2SdCzToTUxMcFaaY8uJmcw9pVVOl0Z6ECZwLXrJMRbaHJq9AdkbW1NrK+v26abskDj9C4Bx1Qst2HvmJVzR9A/Zhga/uXUTOd6DsN34YCu53lyhEYXglU8PmPsEeQBrudC/AFTuKzU4nNa5gAAAABJRU5ErkJggg==)}
div.scan_issue_low_certain_rpt{width: 32px; height: 32px; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAPTSURBVFhHvZfdaxRnFMafeSe7m0Sb2mzXGGqaFgOhadESqzWCoASxojFUIWAv0uv+ASklLW3oTS960dJ7bwTBBkVsiB9IQLzQi0bTBBqwTW1oDIr5otF87uxMn3f27O5sdnZ3JkJ/sDvnnJnd57xfZ97XQED6+xBta0W7odAOB+/DQDOvtbxGeF3kI9O0xxzg5vIibjR/gtn0L0tTNoGJq2iqUvicf3zaMBCXcJaKrS2IxQ+79sqTn2GvzzEfJGHjSgr4tvEUfndvFqFoAm6L96KXor18KCLhNIaJyu0nUd34GWKvH4XBbtE8u/MerOc5PZ2I4+AHrKCvoYvfPvgmMHkZ9RUxXOLNgxLKoip3InHwLsyqBonkeDrUAHv1sXh5jFtAR+NJPBI/Szp1D5MDaDWjeOAnrlGRV33FNfb6jFgFtJgOhqcG8aH4WfIS+PsK3jKBQWVgh4QKcFKrYuVjW5yH9pp4hXAoX1MOBvSckpBLNgE95pEK9JcS16T8uxippQmxSpKoVLg81Y8q8XMJyITbJ25x2Eq/JKzlv8QqDTV2qyp8LW46gSl2C8f8KzcSgNTKlFg5vLO/HFwdPdNXWUeIm4Ay8QUz4/AHw6+1ycURscrjapno0bb68xpiXKtn3TsB8WutFWwOZNGaWltVJnGCGVVLPBAvMwcyaE2trdj97RILzEYx1y+xBIuhtRW7ok38wGwcgjAT0Au1WxW7Ypf4gXFYdLzDELb7M1C7Ra+CmrQbDm+rN9sDpCZbiMJieXog+WJcrPCwPCP87CHe0utXmIKgtRW/N5V+Zg7ol1CRV3B5HIzoSXhP3FBkJl7Al5Av1H6gh+C2+KFILf2B5ekLWBj9VCLh0drG6Hlsiddiji+jmMT/F/T4z80jrvZ0Y4n+xXQ4HIa5FWY1y4iRv2UMyEWt7S5DI4XvWJW4iQ2GitYhvv8G6j96jrojE0gcGuE2rVHulodaTsrG99p2E3ijEw/ZJW4gCNv2nEMscUw8bplfeRe1H/wiXgAM/JjZrmcL0b37+IaZ/SpuUVQ0wS35CfFyRGp2p4ejDNQYc5bxpbi5BLr6sJ600GU7eCqh0Biq7DyeWbVxxntGyCvFb3+MScdGR6kk9NZ7bfaWeDmSi2OwSpRktnyB/9vV1Im8wpGXgObNTgxbFto4J+5KqICF37qZxJB4FOfLaH74lHi+jK8lcaCho7Dm+J6MNCWPZoJehipWx3fBP2xiUqI53JVl4Cc95qGOZl7KHU794LMvfzjdSOZ4TvO43kjw+g5/naBaBe1/+XlM4THGrgc/ngP/AaoMYrity1oNAAAAAElFTkSuQmCC)}
div.scan_issue_low_firm_rpt{width: 32px; height: 32px; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAOzSURBVFhHrZfPaxNREMc3m82vGhPbUow/CoKlwVaLVIvWi2gPIlIQxNLe/Cd60aInD6KI4E08eBFUFAQVepDSgxTE2kohhZZS1KIGUtsmbZLuZpP1O5vpJmm22d3UDzx2Znb3zex7896+cQk2icVi3mg02qdpWp/L5TqJFoXchFsetBTkn7B9gzyWyWRGQ6HQMr23azY3N9vy+fwTVVWXcdW2N3ltRltffKw3VUnpNjyroL2UZbmTu3EOfTE6u0udlTvUHeQy2sbScy0xcV779V4wWi4br3wO7+ZyuXtLS0sB7rYK0ylIp9MHfD7fawzpOTYZqBuzwsrni0JBSbClxP5LGcEl+lgrUSgUZhFQv9/vX2STgchXA0VRuuF8ysw5oRVkU+cuKWTqnBBFsUOSpEn0fYZNBhUBZLPZI3j4A5xH2FQFOTJD9LawZA76bHS73e8op9ikYwRAc+7xeF7Vck64/YdZqsTdcJSlmrTAx5vynDACaG9vvwnnPazuCA2zaBLEToGZ0BWJRG6zXAyAhgXOR3SLDcycScEOlqyBr2H4jJKsB4AEGYHRTbIdzIbbvadiamtCvuBzmGQxmUw2wTCo37GJ2dc6GQFmCLunTwwGg9ehmK+fHXAHWlkqQitDspeEBvjoBizLKzQFXUWTfbZPgc0VUAWmoY8C6C2q9tk+3A5WQAWYgm4KwHH4Iu16ZRtSvSOAaeigAMy3NgvKnUp76/7phfRlWA/l01DHCjCgAOSi6IzyrK83B4BMAcwWZWdsbTyUC7tIwmkKYKqoOmMrB+pNQAJJOEUBfCmqzpAa2gT/wSEh3PWMLc7BCIy7aCvGbvgbuqPd8D8gJxKJZjEcDq8gkhdsdERBXRfU9AJOSQpb7EM+8VtO62dC+jViW4zRX0q/a0Fe/iOsTQ8KudVPuk7LsLFnFMl4SNetgHM6tJ7A0S+m7wM4LM7Bdl+/a4PVr1cN5wQdVJMzN1izBr4ekXOS9QCI+fn5O7hhmZDkTE1OslZC+TuGKUmxVpOZeDx+i+VSAJ2dnXSGH0AQcTY5BydmCxLwca21tTXLeikAIhAIfMcZvr9WEDTfUvg0ayW8zRdqnozR5yr6HsB0L7BJpyIAwuv1TiLKXrwwwaYqGk+9FTz7SmUDBRU+/pS1aqgwQZV0FificTZZw6XZA7RNKrPMWk5e0+TUHEq1rOl9OFXxMQ9rlWaWWBWnZo1qQjRbxanj8hziZTT6/x5Do0mXsH8kMcw/cKXy/KP98lwQ/gEfuhb/OCSbIgAAAABJRU5ErkJggg==)}
div.scan_issue_low_tentative_rpt{width: 32px; height: 32px; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAASISURBVFhHvZdNaB1VFMfPzPtMXj6aD0xbixabkthAxUJpmoVCg+AHdaG0unDjQhcuXIjR2laNushCaUFddVPBjyIV3BQtEkgWkmBbUmxJSI0Wpc0jL0lf0pe85M3kzRv/587JPOd9JPNepT+4zDln7tz/mZk7d84lv4yPj4ez2ewztm1/lsvlBtFuoaXRTLR5xH9H+xrtlVQq1SqXbYomx7JkMpn2SCTyDgZ+QdO0FttaJePOMK3dvUx2dln10YJ1FKzbQ5HWp0gPNRL6rqH9iIQ/xrXjqlMZyibAd9zZ2XkcotxCtpWm1I33aeXWWQgvSi8vWqCWah96jRo6BmDXrCdyWtf1foyxKt08lEwgnU5vq6mp+QEX9bCfM5M0P9JN2fSUOr8Z4aYeajkwqJJgkMSEaZqHo9HoTRX4D7ocXdBxH8TH1sUZc+FX3+KMuTCCp/WeeLhLTdsTDoevIJEDEnLxPAF02Ik2igu2Skix9Ec/LU19pOxw8xMUfeBZWDpZxjRlEhfIWvlLnfOgR2hrb5z0cLMEFHOGYfTgSfwpfh5+55jNl5BAEfOjvfb0BbLT/5yRSJ5cbs1Ojr2szhe2zOxF6eWBvxbn3QD3FciE2y+ui50zyMArCDXuVxOsEE0LUmPXF+J5scw5sTzsxY1+ILaTAH9qED+pIgWYC6OYhQbFHn5DIsXo4VbSozvEyxOs3SWWF2j14Sl0sK0SCIVCxxAMsF1IILodd/gl1Ww/IpHS2NmUWA5aqIlCDXvF88JaeAp9ykYmEbQkgrXqbBVk5n6m5CWemHnqHnmbGh79VLxioLkCzWbdsqzn7kVcLVATb4nnEIztprr2E+KVhjVZWw8EAr0Sq4rFa69TdnlSPEe8pXsIS/IWiZSHtXU8ioPiV8zyzVO0Gv9OPMylpm4lHog+KJGNgfY+ngN3YTc4If9kZn+i5JXn+R0oP7rtCDU9dhbLb0z5PklxArY4vrGMBM0Od8pPSaP6zgFMuj6816KVfVMqvwIs3TjhiGshanr8HNXvercqcYavMhzTP6vxc+pY3/EJ1oeXlF0lBk/CCXH8g+WXie14VR2rBdpXdXyPWGsrI9LypFj3BrTH+BUMO65/6tpPUgDrvJW5LZGqGdZmZmZibW1td+BEnNh9w0gkEi3KwpL4FX+O9xPWVOIM/A78nbLOqY0xF6/a8789bccvbrETQ7vtlfh5OeMfaOVQGXWxtluSIaMBVK/HxC1JzpylxFBHQVWsYfkdxMQ8JP7mQP80/gPqD+auHpOTkx8iucvilmQ1fr5ESW6rUr0CruFG3V+lm0BXV5eJz+IokpiRUBHlZn1hMbIBXJS+CB13j+BZP3Hib+xmDpdLgnc+peB9wGZgzAWMfbSwIvYkwHD9jkQO4oIRCblEWg9hDTgOK1/Nc5ke2/mmeKXBWLwx6Ubp53/N4TIdE7MfE8bEAB7Wlqfs9O1vUHb/ghltSbQY+bJOoblleMVwxYwBzmAw3gH7gpNG8t+vf2r/C+vbcwz8OQR4ez7NQmg5aC7gcB3nvoVdwfac6F9oIodwSlO0xgAAAABJRU5ErkJggg==)}
div.scan_issue_medium_certain_rpt{width: 32px; height: 32px; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAOxSURBVFhHvZffaxxVFMe/92azm8aQaEOaFJW2WIkmEqQQNUJByJNIFNoaqD74UAoiCAq2hDStL/2RYsQ8+C9ExFalFVHfRFChLQlEEqK0ImkCsbHRJMT82N2M3zN7dnd2dzZ7JwE/kMw9Z3b3e+6Zc8/ca+DIxKuItz6O7iqLbs/gabpa4WE3r9X8W+IPzfI6DoPvlv/Ft/Uf4i/aFakYwFofDiZiOO0BR4xBo7rzNLUBB17IjH/5FFhdgOchyc9/md7E5fhFjGZuhlM2AJnxE63o5wf6KSyzzGOqgPZjQOebeXHh46eAexNqQAJhsjCMFZwxH2FV3QWEBrDSj727LK5S+Hl15al/BDj5E9DwqDoCDNG3NKNGHmZjciOJnppB/K6uHFavOTb6cYjio6HiQk1DuLiwMq+DQjjLtngMt7yzeFZdOQoC8PqwP2bxNcVb1FVKak0HRYh4el2NUvibDzEVX0lNqcsnF4A8c68an20pLiyWptgn8OzLYtDEgv7cexe71JMPQAuuU83yyCzDgli4o4MKGHRs1uKcWpkAJC0UH/A9Lizd1UEAlwwozPIpb4B9hPgBVMfQRyfXliNhs3XNABGtTeCUjK33NhKc/XH/jiths124rQM3RFO0bboBLzGiWvW7sZMaUERTtG2VQbf63CkWu097iyVYDtG2bJddarszX/QIim1HqH3IMhWPqe3O+lLhY4iY/izUbpNVUJ8xIxKcdYQlWER9rhFFJpiBe5M6iI5lf45ePUJw2YU1JheobeVVqWY0shlYYz2EvIJdoPaYFOHPakcjW3gRG1AQao9abOJ7taOx8Bt3gCPAF2+oYxtQ28y9hweaa3CfvTGh7v8HPv8/19BoW4awwhcDd5PbIF4H7GYbsYVbRhdEU7T9Zch/l9iV0v4dF+q4ZznxA1/gy8A7rIG3xoAH9+nNyshmNZXEBzL2AzDn8atnMg4nXr8G7DusBtnTDrx2XY3KsPqHE5fhd69cI5qawvu8cVPN8siu+OFn1AjQ0gEkHJqqh3HLbbpa+QDar2DDJNHL9MypKzqxCnXsYX49haPBM0IuAMEM4o+Uh54tg5CmM3tDjQBz42W35QJ/8+8U0MuzQUHjKAhAiF/ALZNCF7/A00cZRl4Bpn9Ug8jL6JOX1SjFP5ik8Vz1+dKew51ROFsezbLIMqxrBv6Z5rpKqjOPVDu/H/1oFqTi4TQECu/8cFpM9nhuLF6UjQRdTzK3TbzGaC9SdIai49bgG/fjOfAfeU8viaUaLdcAAAAASUVORK5CYII=)}
div.scan_issue_medium_firm_rpt{width: 32px; height: 32px; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAN0SURBVFhHpZfbaxNBFMYnmzQXCy1tTavUgqLS0qAPBdH6pPgkUhSFgkXoX1EQL9VXUUTEJ8GiiIWKCiK+iEIfRAWl4iWlohRRiklrKcRGs7mt39k92WyS2exu8oNh55zdne/sXM7OCLfE4/FgPp8/rGnalWKx+BzlJ0oaJYvyG/4PKHdRTqVSqY38WvNkMpkdaPQmi9SS/Kxpb24YRV3XXRRUoVCYUVU1xs14h74YjVykxvRWreQy+N5pTbt1QNPOi3JZX+YHDDiQS6hGuNkafHytIJ1Ob45EIg98Pt9+dpVZjgsxdVCIvyvssDCZESIQYqMMApjPZrMj4XB4kV0mCl9N8OAQxOek4kRelYuH2qTiBNoaDAaD7xDIXnaZVASAB7YGAoGneGETu2ohIRmtUa7IQZsduDyhOWV4DMwAaMwRwP264kR7H1eq6Kho145oKBR6aJ0TZgADAwNnIL6HTXuom9u2sGGhXeKTsxuTc5LrRgDULRA/p3vcIAuge5ArzkBrAr3QT3U9gJaWltNw+qnuik5Jd8t8NpAWemGC6goiCcFxUr/jFtnXdm7nijtIk7QVJIojMDaw3x2yieihBwjSJG3F7/cfYp97qr+WbJscUA/SpiEYZts90aoUX227BNpDCrrC2+ARYSQj60rwOP4loD1Iq8AmtTlg/eruhn96bWYi8ow18XjIAdVQAPi7NIC122WJyR0qTcJ5NrxRWor0c7L7PzgA7fc0CV+z7Y1SDzQ4AQloz9EQzBqmR7p24rcyJsTxO+xoiFlfIpFo7enpWYXhPZM0h5pMJrv0GlLibYyHdzIpTVv9qml5lR3uIU3S1veEsPtR4hgTd3/EP7+EmBkV4sdLw45iGY4/w2roNWwHKIBcLrcLm5O4ngcg/AW+y/pdN0wfLYsTK1hIj8bZcAZa10ic6mYiWlhYuIAbb9m0h3bFS5LHFl9gZ5Nioy4fFUU5y/VyALFYLIueGEUQCXZ5p4BteX1WcFg5AZ1/bJcDIHDjO45fI3WDoLzfK9k6bsNZobWbjVrQ5hraHsXZ4Bu7dCoCIGj/jkCG8cIrdtUy9liIPsuxgSbhsSk2akFbdDDZh62f+5xT92hWwmEZ4t08LldRbI9mjjgeTiVQ0Ai+ucNpNaXjORq+DgE6ni+REEoRmmu4fMK9e6h7OJ4L8R8qPqbiZvrQ7QAAAABJRU5ErkJggg==)}
div.scan_issue_medium_tentative_rpt{width: 32px; height: 32px; background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAARXSURBVFhHvZdbbBRlFMf/M+3udsFUpJrKxSsQWjby0HhpFWkiICiBxBu+eONBHnyQxIgiXiAQA1ECij6YvkhEBILGRKMYU5UHgomaotQljSUEU9AWKMiGle6yu+P/zHc67G3Y2cXwS77Md87MfP8z893Oh6DE4/FwJpN5wHGcjblcrptlgCXJkmY5Rf9vLNtYnkgkEtfqaxWx9OrLyMjI1Egk8hIbftiyrCZcOA8c3Qsc/xlInTMPRa4CrpsBTJkHNFwNPnuB5XMGvJbvxs1D5fENQL64paVlFUWlhJBOAt+/DvR8yKj+0aeKCI0Bbn8WmLue9ehoIJtt217DNhh5KWUDSCaTE6LR6Kd86W7Xcf400NUODPe7ZkVu4GvPdLtBCAziUDqdXtTQ0HDEdeRh69WDD7ZRvMcTF/7cF1xcGNgPdL+iBr/SsmaEw+FfGMhd6vIoCIAP3FxfX/8VX7heXYa/e7RCbpoNzNsA3P8W0LEcGD9FbxTx0wfmzyls8xpevpQxZTwGrwukz1tbW/fxwTvUdZGtc4Ej3wGLu0wf55PLAJ89CfTuVEceT30DTJ2vhsdBlnbquGPC+wM64ErFMynTBZN4q1hcsOuBhe+pUUTypFYKmMlp+4bWTQDyWyj+muspZuBHIMsg7nxOHWUYw2nfOFmNPHy6h1or2N3Tpe4GEAqFVtJZJ/USGifyC98HYo+pw4dUQitKlF3ePFONQkSLf2GFW2ckEZbTdHIS10j/HmDbg2oo97wIzH9bjVKo+S81x9vZbHbhZYnLArXnBTWUpmlA56tqlEc0Rduuq6ubo77a+GIZcKpPDSLiS3/gkjxOHf6Its1f0aF29ezfxEn1iRpkMldLEW+cpI5LQ+02GQNnWW80rir442tg+2K2kjW2DNKHuE+Exxo7GAkJwFEjOOeGgC0tZlOyuJbJ5jOLg9oqWdkrUv0bQjcHmIjbIeDRHcC9L9ckLshbXGWqpJeiwpx1wG2Pm3ptpGQQHlIjOLL8Cm1LzbVGqH3A5nzkWlslt3Rq5fKgdo90AfOrKunktiHr/Nlj6qiZvdbg4ODY5ubmYRoR47tipIaGhprcGpfErTIdrySi6YoLtKdzd8qYWxX464DjfLTAcd4c5zjvTHOc33frjeBQK5dKpWKi7WVEjGg9s9eVapYneQJ4l9t4flYsC9HTTEBvvU8dlaH+Zu4D7g7mrR59fX2rGRyT/UsQ312akstCKql6cA7yQ72t0gsgFoulOS2WMIhBdZXiN+qLkxF/TvLXP0Id74xQsH7yxlGeZhb5BiEnn3LceDGD94NtnmHbS3g2OKwul4IABMnfGUgHX2ByX4T08+xVpt9HkTS9/Xk1ysO25GDSztQv+JojaToH5hoOmDQbKGS433F+/dhxDn/LIZ1VZyk6szaxmCNSLUjGzAa62JicgAMhQTP4XaNT7X9h9HjOhrdQQI7nx0WIJUfNM7z08t521qs4ngP/AVBE/q1Wmrg8AAAAAElFTkSuQmCC)}


@media print {
 body { width: 100%; color: #000000; position: relative; }
 #container { width: 98%; padding: 0; margin: 0; }
 h1 { color: #000000; }
 h2 { color: #000000;}
 .rule { margin: 20px 0 0 0; }
 .title { color: #000000; margin: 0 0 10px 0; padding: 10px 0; }
 .title h1 { color: #000000; }
 .title img { margin: -3px 0; }
 .heading { margin: 0 0 10px 0; }
 .BODH0 { color: #000000; }
 .BODH1 { color: #000000; }
 .PREVNEXT { visibility: hidden; display: none; }
 .rr_div { width: 98%; margin: 0.8em auto; max-height: none !important; overflow: hidden; }
}

</style>
</head>
<body>
<div id="container">
<div class="title"><img src="data:image/png;base64,R0lGODlhuAA6ANUAAHl8f9LT1P+ymaWnqf+MZldbX/T09GJmaenp6oSHit3e35udn4+SlP/ZzG5xdLy9v8fIyf9wQP/18rCytP/i2f+Wc/+DWf/Pv/95Tf+pjf/Fsv/s5f+ggP+zmf+8pf+fgP/Gs/+8pv+pjP/s5kxQVP9mM////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAC4ADoAAAb/QJNwSCwaj8ikcslsOp/QqHRKrVqv2Kx2y+16v+CweEwum8/otHrNbrvf8Lh8Tq/b7/h81RCYMBwkAhEEAhcbThYliouLBA1EiRlJFSUCQpSMjBEch0MNmZkEGkYGCwckqAUJDwZDCSQLSQskDEKADAgFqLu8vAu6vbwFCFZ8AwmnvQKZgxkaFEmgoKNCigTRikIR0prUJsvcjRJDEMDBtK27SeomqAAB5/HyuwFUyPOB4dYXRvqL0CasYStRzZ+iR98UDSLAkCGjCkIU9HIAiNeEdqjWZcQIwEACACABJOtVYJa7kCgTtJqCDxW4RR0CMrJUZJGRDYlKcCh4DYlN/5kEjTTIiUEIOJpEJHBY9AhAKlZCDDxI9gAjCY1XORqBRwJAEa5eu7TMxyhmJqRDfha5oJDnwIJBjVD4l7ASEgKKKkhEpeCIgr5WsQpxt5UwEbBexr5UZHZmv2xHfgr0CVmtEUyWjiJhWyIC4iXsjrAzfJi0kM9cFDPCIEHC2cdxa1Yu0TPy7NhFNGumXIJrAiahjYzuWph4aeOpW76MQEFCzkVo4R7ZIJn2W6BJPtndbbvE3mGgN4reaPp0edRbVHdu/hw67CMZ8rrlLR2JbkXRidhMdgAwkuBFDBfWcQOah1x6yh1kAl6g5AedABBCuJSCMtX2HnZIYFZXfkJwFv+BCVyhMoBg/5F3oIEFgoiKAwG06CIWqoUgm3szhiPJfN3VJxdTG94lnwnl7OKAf0QAWKSJKap4YojB1GKFag0RAAJQ+MEWzk44XrjIOEU0sE0JRfVYhFKLeIOAU7uMGKB4wiFZXIpM9pJkFOrBRKVdM0YY4XM3TpbjneHwU5c/FhgxgTlDHpnVeFmVpyScqaAEUj1PJliWCR2E0EADGDgIWRETlnCIn1oa5M1i3FjAZRFn8qJmYCU2euKjXzkKo6WLfLApNB/gqd+nRTAoCakzwiUNBhl0YpQ+oixx6C5OGjmEgG/WOuut+KAqnwhVFnsEZ9cQ+2tQlmESJhHcSdH/KioXSTuYm9ZCeu0VdS6iKgg0jvuWuGndRgR13Q6R7hQMoHIArIy+myR6tIqFq0IjzJVvv7jpq0ih9GEosEKrimlFMnst2qasC59nK70PlxDTlwFTjATARW35rSJhWmaCBF/euKyvVaAZIjFGIEBtvEQ7nG0mjU2sYxEayJcTh5hgabMJHiyi7MBSGABMAGg6WYRJYTnKMMNZ1KvynZ5WfDMGinhANV1ENE3h1Cawbd3OHAZN5BAepWLCA7tURQTgqAgutsnzVno0IwT06tiMm0begAZ2RzCOBHZX0oAEDWByt8ZEaFcCQlgbAYHBC0BQTx8jqVkRLQEoAEHBBk87/+vYK7qoO6VUHPP6OdouMogACI2rj6AmUMAyKKq6fASDGJdexAAtea2AOcEU4N/hS+JTwEpW9PGHMpoQYogS/kSAvBAUtLdIBR1/iYTEQUlPhEfYC/OqEOvKCbTC1TrOPHinhQA8YAEA0EAFiNexJWQgShD0QAOHcAEONCQDxRuCBwigMyNs0G3JYwhAmhCAY4QkARMAXxFmFxIGEFAIH9lfVD4CAVZJ6oa/0YMOd8jDHvrwh0AMohCnYAAV8m+IQ0QgSFZhgjOFZAH+GQBIGNAKBUgKARCQFJD4MyID0I4ECUCAFSPyEQDU8G9eOxP4BnBGIZgRiWIAgAMGIEUSDP8AHiEpAHhewYBfOEBFC6DjAAxAPUGOqAAOeMADEvAb6i0gAAhU3VVycYA6VoV6goMHpQxAgj9OS4Zw5AIAXiVHTfKPBBMQ2kVU9AB4TE9kpiQCSGplAgZ8D4YHo94BWhFLwv3PjqEEwyiHQL1YmqCS8PjlHUVmAuoRQWgdIULB2qgiE8xSCM4cgC5GFEsGHKAknwzmF4YJQxaRgFKqdOUn4RFINVFvikIAXAHaaABAqMQ81hyQK6UIgGHEsiTeDKc4uyBHOjrlkbQYgClIgAB1DmaZIcFmVwCQQxMowJ5rJME8q3nNakpRaC48J5BIIDuSPnSgBD3AE/nQyVOwqJr102olM515BOp5MiKAkGQ+h7BPr8yimCb4hRDA2Q5QotQK5OSpSA9wMBWB75wOlWgSjOnGd1yloxO4ihRNoDVd1OObIClAU4F5VC0k1TyrAyY8BCe0Fs2UmUTIKpEMcIAEuBIZKzFFM8OS1XNKhAF0LFhfyFpWLJxVRZTqZyscUABFfpOlrxTkBCSiUqf88RUgOYVOT2fGWcRiq0I4RR9IAL4DxKIrhjRiYZ9wWIkALRd9saLB+hJVE/TVbxNYqUUZsMQaXi+ewFhAKyZQ0WQuoKLNrEVlQ/K/1Tr3udCNrnSnS93qWve62M2udrfL3e5697tjCAIAOw==" width="184" height="58"><h1>Burp Scanner Report</h1></div>
<h1>Summary</h1>
<span class="TEXT">The table below shows the numbers of issues identified in different categories. Issues are classified according to severity as High, Medium, Low or Information. This reflects the likely impact of each issue for a typical organization. Issues are also classified according to confidence as Certain, Firm or Tentative. This reflects the inherent reliability of the technique that was used to identify the issue.</span><br><br><table cellpadding="0" cellspacing="0" class="overview_table">
 <tr>
 <td width="70"> </td>
 <td width="90"> </td>
 <td colspan="4" height="40" align="center" class="label">Confidence</td>
 </tr>
 <tr>
 <td width="70"> </td>
 <td width="90"> </td>
 <td width="82" height="30" class="info">Certain</td>
 <td width="82" height="30" class="info">Firm</td>
 <td width="82" height="30" class="info">Tentative</td>
 <td width="82" height="30" class="info_end">Total</td>
 </tr>
 <tr>
 <td rowspan="4" valign="middle" class="label">Severity</td>
 <td class="info" height="30">High</td>
 <td class="colour_holder"><span class="colour_block high_certain">0</span></td>
 <td class="colour_holder"><span class="colour_block high_firm">0</span></td>
 <td class="colour_holder"><span class="colour_block high_tentative">0</span></td>
 <td class="colour_holder_end"><span class="colour_block row_total">0</span></td>
 </tr>
 <tr>
 <td class="info" height="30">Medium</td>
 <td class="colour_holder"><span class="colour_block medium_certain">0</span></td>
 <td class="colour_holder"><span class="colour_block medium_firm">2</span></td>
 <td class="colour_holder"><span class="colour_block medium_tentative">0</span></td>
 <td class="colour_holder_end"><span class="colour_block row_total">2</span></td>
 </tr>
 <tr>
 <td class="info" height="30">Low</td>
 <td class="colour_holder"><span class="colour_block low_certain">4</span></td>
 <td class="colour_holder"><span class="colour_block low_firm">2</span></td>
 <td class="colour_holder"><span class="colour_block low_tentative">0</span></td>
 <td class="colour_holder_end"><span class="colour_block row_total">6</span></td>
 </tr>
 <tr>
 <td class="info" height="30">Information</td>
 <td class="colour_holder"><span class="colour_block info_certain">33</span></td>
 <td class="colour_holder"><span class="colour_block info_firm">7</span></td>
 <td class="colour_holder"><span class="colour_block info_tentative">3</span></td>
 <td class="colour_holder_end"><span class="colour_block row_total">43</span></td>
 </tr>
</table><br>
<span class="TEXT">The chart below shows the aggregated numbers of issues identified in each category. Solid colored bars represent issues with a confidence level of Certain, and the bars fade as the confidence level falls.</span><br><br><table cellpadding="0" cellspacing="0" class="overview_table">
 <tr>
 <td width="70"> </td>
 <td width="90"> </td>
 <td colspan="7" height="40" align="center" class="label">Number of issues</td>
 </tr>
 <tr>
 <td width="70"> </td>
 <td width="90"> </td>
 <td width="107"><span class="grad_mark">0</span></td>
 <td width="107"><span class="grad_mark">1</span></td>
 <td width="107"><span class="grad_mark">2</span></td>
 <td width="107"><span class="grad_mark">3</span></td>
 <td width="107"><span class="grad_mark">4</span></td>
 <td width="107"><span class="grad_mark">5</span></td>
 </tr>
 <tr>
 <td rowspan="3" valign="middle" class="label">Severity</td>
 <td class="info">High</td>
 <td colspan="6" height="30">
 <table cellpadding="0" cellspacing="0"><tr><td><img class="bar" src="data:image/png;base64,R0lGODlhAQABAIAAAP8AAAAAACH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4zLWMwMTEgNjYuMTQ1NjYxLCAyMDEyLzAyLzA2LTE0OjU2OjI3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjY0RDFGNDAzODk3QjExRTJCMkY1QUI4QUUwNzNBMzFDIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjY0RDFGNDA0ODk3QjExRTJCMkY1QUI4QUUwNzNBMzFDIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NjREMUY0MDE4OTdCMTFFMkIyRjVBQjhBRTA3M0EzMUMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NjREMUY0MDI4OTdCMTFFMkIyRjVBQjhBRTA3M0EzMUMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAAAh+QQAAAAAACwAAAAAAQABAAACAkQBADs=" width="0" height="16"></td><td><img class="bar" src="data:image/png;base64,R0lGODlhAQABAIAAAP9mZgAAACH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4zLWMwMTEgNjYuMTQ1NjYxLCAyMDEyLzAyLzA2LTE0OjU2OjI3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjY0RDFGNDA3ODk3QjExRTJCMkY1QUI4QUUwNzNBMzFDIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjY0RDFGNDA4ODk3QjExRTJCMkY1QUI4QUUwNzNBMzFDIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NjREMUY0MDU4OTdCMTFFMkIyRjVBQjhBRTA3M0EzMUMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NjREMUY0MDY4OTdCMTFFMkIyRjVBQjhBRTA3M0EzMUMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAAAh+QQAAAAAACwAAAAAAQABAAACAkQBADs=" width="0" height="16"></td><td><img class="bar" src="data:image/png;base64,R0lGODlhAQABAIAAAP/MzAAAACH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4zLWMwMTEgNjYuMTQ1NjYxLCAyMDEyLzAyLzA2LTE0OjU2OjI3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjg0Q0E0ODg0ODk3QjExRTJCMkY1QUI4QUUwNzNBMzFDIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjg0Q0E0ODg1ODk3QjExRTJCMkY1QUI4QUUwNzNBMzFDIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NjREMUY0MDk4OTdCMTFFMkIyRjVBQjhBRTA3M0EzMUMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NjREMUY0MEE4OTdCMTFFMkIyRjVBQjhBRTA3M0EzMUMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAAAh+QQAAAAAACwAAAAAAQABAAACAkQBADs=" width="0" height="16"></td></tr></table>
 </td>
 <td> </td>
 </tr>
 <tr>
 <td class="info">Medium</td>
 <td colspan="6" height="30">
 <table cellpadding="0" cellspacing="0"><tr><td><img class="bar" src="data:image/png;base64,R0lGODlhAQABAIAAAP+ZAAAAACH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4zLWMwMTEgNjYuMTQ1NjYxLCAyMDEyLzAyLzA2LTE0OjU2OjI3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjg0Q0E0ODg4ODk3QjExRTJCMkY1QUI4QUUwNzNBMzFDIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjg0Q0E0ODg5ODk3QjExRTJCMkY1QUI4QUUwNzNBMzFDIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ODRDQTQ4ODY4OTdCMTFFMkIyRjVBQjhBRTA3M0EzMUMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6ODRDQTQ4ODc4OTdCMTFFMkIyRjVBQjhBRTA3M0EzMUMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAAAh+QQAAAAAACwAAAAAAQABAAACAkQBADs=" width="0" height="16"></td><td><img class="bar" src="data:image/png;base64,R0lGODlhAQABAIAAAP/CZgAAACH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4zLWMwMTEgNjYuMTQ1NjYxLCAyMDEyLzAyLzA2LTE0OjU2OjI3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjg0Q0E0ODhDODk3QjExRTJCMkY1QUI4QUUwNzNBMzFDIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjg0Q0E0ODhEODk3QjExRTJCMkY1QUI4QUUwNzNBMzFDIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ODRDQTQ4OEE4OTdCMTFFMkIyRjVBQjhBRTA3M0EzMUMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6ODRDQTQ4OEI4OTdCMTFFMkIyRjVBQjhBRTA3M0EzMUMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAAAh+QQAAAAAACwAAAAAAQABAAACAkQBADs=" width="214" height="16"></td><td><img class="bar" src="data:image/png;base64,R0lGODlhAQABAIAAAP/rzAAAACH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4zLWMwMTEgNjYuMTQ1NjYxLCAyMDEyLzAyLzA2LTE0OjU2OjI3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkI1MDMwNTM3ODk3QjExRTJCMkY1QUI4QUUwNzNBMzFDIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkI1MDMwNTM4ODk3QjExRTJCMkY1QUI4QUUwNzNBMzFDIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ODRDQTQ4OEU4OTdCMTFFMkIyRjVBQjhBRTA3M0EzMUMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QjUwMzA1MzY4OTdCMTFFMkIyRjVBQjhBRTA3M0EzMUMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAAAh+QQAAAAAACwAAAAAAQABAAACAkQBADs=" width="0" height="16"></td></tr></table>
 </td>
 <td> </td>
 </tr>
 <tr>
 <td class="info">Low</td>
 <td colspan="6" height="30">
 <table cellpadding="0" cellspacing="0"><tr><td><img class="bar" src="data:image/png;base64,R0lGODlhAQABAIAAAP/uAAAAACH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4zLWMwMTEgNjYuMTQ1NjYxLCAyMDEyLzAyLzA2LTE0OjU2OjI3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkI1MDMwNTNCODk3QjExRTJCMkY1QUI4QUUwNzNBMzFDIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkI1MDMwNTNDODk3QjExRTJCMkY1QUI4QUUwNzNBMzFDIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QjUwMzA1Mzk4OTdCMTFFMkIyRjVBQjhBRTA3M0EzMUMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QjUwMzA1M0E4OTdCMTFFMkIyRjVBQjhBRTA3M0EzMUMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAAAh+QQAAAAAACwAAAAAAQABAAACAkQBADs=" width="428" height="16"></td><td><img class="bar" src="data:image/png;base64,R0lGODlhAQABAIAAAP/1ZgAAACH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4zLWMwMTEgNjYuMTQ1NjYxLCAyMDEyLzAyLzA2LTE0OjU2OjI3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkI1MDMwNTNGODk3QjExRTJCMkY1QUI4QUUwNzNBMzFDIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkI1MDMwNTQwODk3QjExRTJCMkY1QUI4QUUwNzNBMzFDIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QjUwMzA1M0Q4OTdCMTFFMkIyRjVBQjhBRTA3M0EzMUMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QjUwMzA1M0U4OTdCMTFFMkIyRjVBQjhBRTA3M0EzMUMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAAAh+QQAAAAAACwAAAAAAQABAAACAkQBADs=" width="214" height="16"></td><td><img class="bar" src="data:image/png;base64,R0lGODlhAQABAIAAAP/8zAAAACH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4zLWMwMTEgNjYuMTQ1NjYxLCAyMDEyLzAyLzA2LTE0OjU2OjI3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkU2OTVBQzRBODk3QjExRTJCMkY1QUI4QUUwNzNBMzFDIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkU2OTVBQzRCODk3QjExRTJCMkY1QUI4QUUwNzNBMzFDIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RTY5NUFDNDg4OTdCMTFFMkIyRjVBQjhBRTA3M0EzMUMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RTY5NUFDNDk4OTdCMTFFMkIyRjVBQjhBRTA3M0EzMUMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAfHh0cGxoZGBcWFRQTEhEQDw4NDAsKCQgHBgUEAwIBAAAh+QQAAAAAACwAAAAAAQABAAACAkQBADs=" width="0" height="16"></td></tr></table>
 </td>
 <td> </td>
 </tr>
</table>

<div class="rule"></div>
<h1>Contents</h1>
<p class="TOCH0"><a href="#1">1. SSL cookie without secure flag set</a></p>
<p class="TOCH1"><a href="#1.1">1.1. https://multitool.ciditools.com/cropped/</a></p>
<p class="TOCH1"><a href="#1.2">1.2. https://multitool.ciditools.com/uei/config/config.php</a></p>
<p class="TOCH0"><a href="#2">2. Cross-site scripting (reflected)</a></p>
<p class="TOCH1"><a href="#2.1">2.1. https://multitool.ciditools.com/health.php [Referer HTTP header]</a></p>
<p class="TOCH1"><a href="#2.2">2.2. https://multitool.ciditools.com/health.php [User-Agent HTTP header]</a></p>
<p class="TOCH0"><a href="#3">3. Cookie without HttpOnly flag set</a></p>
<p class="TOCH1"><a href="#3.1">3.1. https://multitool.ciditools.com/cropped/</a></p>
<p class="TOCH1"><a href="#3.2">3.2. https://multitool.ciditools.com/uei/config/config.php</a></p>
<p class="TOCH0"><a href="#4">4. Strict transport security not enforced</a></p>
<p class="TOCH1"><a href="#4.1">4.1. https://multitool.ciditools.com/</a></p>
<p class="TOCH1"><a href="#4.2">4.2. https://multitool.ciditools.com/robots.txt</a></p>
<p class="TOCH0"><a href="#5">5. Path-relative style sheet import</a></p>
<p class="TOCH1"><a href="#5.1">5.1. https://multitool.ciditools.com/install/</a></p>
<p class="TOCH1"><a href="#5.2">5.2. https://multitool.ciditools.com/install/complete.php</a></p>
<p class="TOCH1"><a href="#5.3">5.3. https://multitool.ciditools.com/install/index.php</a></p>
<p class="TOCH0"><a href="#6">6. Referer-dependent response</a></p>
<p class="TOCH0"><a href="#7">7. Spoofable client IP address</a></p>
<p class="TOCH0"><a href="#8">8. User agent-dependent response</a></p>
<p class="TOCH0"><a href="#9">9. Input returned in response (reflected)</a></p>
<p class="TOCH1"><a href="#9.1">9.1. https://multitool.ciditools.com/health.php [Referer HTTP header]</a></p>
<p class="TOCH1"><a href="#9.2">9.2. https://multitool.ciditools.com/health.php [User-Agent HTTP header]</a></p>
<p class="TOCH0"><a href="#10">10. Cross-domain script include</a></p>
<p class="TOCH1"><a href="#10.1">10.1. https://multitool.ciditools.com/cancelled.php</a></p>
<p class="TOCH1"><a href="#10.2">10.2. https://multitool.ciditools.com/controller.php</a></p>
<p class="TOCH1"><a href="#10.3">10.3. https://multitool.ciditools.com/cropped/cancelled.php</a></p>
<p class="TOCH1"><a href="#10.4">10.4. https://multitool.ciditools.com/cropped/controller.php</a></p>
<p class="TOCH1"><a href="#10.5">10.5. https://multitool.ciditools.com/cropped/oauth2response.php</a></p>
<p class="TOCH1"><a href="#10.6">10.6. https://multitool.ciditools.com/install/</a></p>
<p class="TOCH1"><a href="#10.7">10.7. https://multitool.ciditools.com/install/complete.php</a></p>
<p class="TOCH1"><a href="#10.8">10.8. https://multitool.ciditools.com/install/index.php</a></p>
<p class="TOCH1"><a href="#10.9">10.9. https://multitool.ciditools.com/resources/oauth2response.php</a></p>
<p class="TOCH0"><a href="#11">11. Frameable response (potential Clickjacking)</a></p>
<p class="TOCH1"><a href="#11.1">11.1. https://multitool.ciditools.com/</a></p>
<p class="TOCH1"><a href="#11.2">11.2. https://multitool.ciditools.com/cancelled.php</a></p>
<p class="TOCH1"><a href="#11.3">11.3. https://multitool.ciditools.com/controller.php</a></p>
<p class="TOCH0"><a href="#12">12. Directory listing</a></p>
<p class="TOCH0"><a href="#13">13. Email addresses disclosed</a></p>
<p class="TOCH1"><a href="#13.1">13.1. https://multitool.ciditools.com/</a></p>
<p class="TOCH1"><a href="#13.2">13.2. https://multitool.ciditools.com/cancelled.php</a></p>
<p class="TOCH1"><a href="#13.3">13.3. https://multitool.ciditools.com/cropped/cancelled.php</a></p>
<p class="TOCH1"><a href="#13.4">13.4. https://multitool.ciditools.com/install/</a></p>
<p class="TOCH1"><a href="#13.5">13.5. https://multitool.ciditools.com/install/index.php</a></p>
<p class="TOCH1"><a href="#13.6">13.6. https://multitool.ciditools.com/uei/composer.lock</a></p>
<p class="TOCH0"><a href="#14">14. Private IP addresses disclosed</a></p>
<p class="TOCH1"><a href="#14.1">14.1. https://multitool.ciditools.com/health.php</a></p>
<p class="TOCH1"><a href="#14.2">14.2. https://multitool.ciditools.com/health.php</a></p>
<p class="TOCH1"><a href="#14.3">14.3. https://multitool.ciditools.com/uei/vendor/league/oauth2-client/README.md</a></p>
<p class="TOCH0"><a href="#15">15. Cacheable HTTPS response</a></p>
<p class="TOCH1"><a href="#15.1">15.1. https://multitool.ciditools.com/</a></p>
<p class="TOCH1"><a href="#15.2">15.2. https://multitool.ciditools.com/cancelled.php</a></p>
<p class="TOCH1"><a href="#15.3">15.3. https://multitool.ciditools.com/config.php</a></p>
<p class="TOCH1"><a href="#15.4">15.4. https://multitool.ciditools.com/controller.php</a></p>
<p class="TOCH1"><a href="#15.5">15.5. https://multitool.ciditools.com/genkey.php</a></p>
<p class="TOCH1"><a href="#15.6">15.6. https://multitool.ciditools.com/health.php</a></p>
<p class="TOCH1"><a href="#15.7">15.7. https://multitool.ciditools.com/path.php</a></p>
<p class="TOCH1"><a href="#15.8">15.8. https://multitool.ciditools.com/set_session.php</a></p>
<p class="TOCH1"><a href="#15.9">15.9. https://multitool.ciditools.com/toolLTI.php</a></p>
<p class="TOCH0"><a href="#16">16. Content type is not specified</a></p>
<p class="TOCH1"><a href="#16.1">16.1. https://multitool.ciditools.com/uei</a></p>
<p class="TOCH1"><a href="#16.2">16.2. https://multitool.ciditools.com/uei/README.md</a></p>
<p class="TOCH1"><a href="#16.3">16.3. https://multitool.ciditools.com/uei/composer.lock</a></p>
<p class="TOCH0"><a href="#17">17. SSL certificate</a></p>
<br><div class="rule"></div>
<span class="BODH0" id="1">1. <a href="https://portswigger.net/knowledgebase/issues/details/00500200_sslcookiewithoutsecureflagset">SSL cookie without secure flag set</a></span>
<br><a class="PREVNEXT" href="#2">Next</a>
<br>
<br><span class="TEXT">There are 2 instances of this issue:
<ul>
<li><a href="#1.1">/cropped/</a></li>
<li><a href="#1.2">/uei/config/config.php</a></li>
</ul></span>
<h2>Issue background</h2>
<span class="TEXT"><p>If the secure flag is set on a cookie, then browsers will not submit the cookie in any requests that use an unencrypted HTTP connection, thereby preventing the cookie from being trivially intercepted by an attacker monitoring network traffic. If the secure flag is not set, then the cookie will be transmitted in clear-text if the user visits any HTTP URLs within the cookie's scope. An attacker may be able to induce this event by feeding a user suitable links, either directly or via another web site. Even if the domain that issued the cookie does not host any content that is accessed over HTTP, an attacker may be able to use links of the form http://example.com:443/ to perform the same attack.</p>
<p>To exploit this vulnerability, an attacker must be suitably positioned to eavesdrop on the victim's network traffic. This scenario typically occurs when a client communicates with the server over an insecure connection such as public Wi-Fi, or a corporate or home network that is shared with a compromised computer. Common defenses such as switched networks are not sufficient to prevent this. An attacker situated in the user's ISP or the application's hosting infrastructure could also perform this attack. Note that an advanced adversary could potentially target any connection made over the Internet's core infrastructure.</p></span>
<h2>Issue remediation</h2>
<span class="TEXT"><p>The secure flag should be set on all cookies that are used for transmitting sensitive data when accessing content over HTTPS. If cookies are used to transmit session tokens, then areas of the application that are accessed over HTTPS should employ their own session handling mechanism, and the session tokens used should never be transmitted over unencrypted communications.</p></span>
<h2>Vulnerability classifications</h2><span class="TEXT"><ul>
<li><a href="https://cwe.mitre.org/data/definitions/614.html">CWE-614: Sensitive Cookie in HTTPS Session Without 'Secure' Attribute</a></li>
</ul></span>
<br><br><div class="rule"></div>
<span class="BODH1" id="1.1">1.1. https://multitool.ciditools.com/cropped/</span>
<br><a class="PREVNEXT" href="#1.2">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_medium_firm_rpt'></div></td>
<td>Severity: </td>
<td><b>Medium</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Firm</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/cropped/</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The following cookie was issued by the application and does not have the secure flag set:<ul><li><b>PHPSESSID</b></li></ul>The cookie appears to contain a session token, which may increase the risk associated with this issue. You should review the contents of the cookie to determine its function.</span>
<h2>Request</h2>
<div class="rr_div"><span>GET /cropped/ HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Cache-Control: no-store, no-cache, must-revalidate<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:56:14 GMT<br>Expires: Thu, 19 Nov 1981 08:52:00 GMT<br>Pragma: no-cache<br>Server: Apache/2.4.18 (Ubuntu)<br><span class="HIGHLIGHT">Set-Cookie: PHPSESSID=t2ehk9395noriarahbk3ee87l5; path=/</span><br>Vary: Accept-Encoding<br>Content-Length: 276<br>Connection: Close<br><br><!-- These tools were designed to facilitate rapid course development in the Canvas LMS<br>Copyright (C) 2017 Ludovic Attiogbe and Kenneth larsen - Center for Innovative Design and Instruction<br>Utah Stat<br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="1.2">1.2. https://multitool.ciditools.com/uei/config/config.php</span>
<br><a class="PREVNEXT" href="#1.1">Previous</a>
 <a class="PREVNEXT" href="#2.1">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_medium_firm_rpt'></div></td>
<td>Severity: </td>
<td><b>Medium</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Firm</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/uei/config/config.php</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The following cookie was issued by the application and does not have the secure flag set:<ul><li><b>PHPSESSID</b></li></ul>The cookie appears to contain a session token, which may increase the risk associated with this issue. You should review the contents of the cookie to determine its function.</span>
<h2>Request</h2>
<div class="rr_div"><span>GET /uei/config/config.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/uei/config/<br><br></span></div>
<h2>Response</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Cache-Control: no-store, no-cache, must-revalidate<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:57:01 GMT<br>Expires: Thu, 19 Nov 1981 08:52:00 GMT<br>Pragma: no-cache<br>Server: Apache/2.4.18 (Ubuntu)<br><span class="HIGHLIGHT">Set-Cookie: PHPSESSID=nsnqglecrmbatm05hb9gkq91v6; path=/</span><br>Vary: Accept-Encoding<br>Content-Length: 32<br>Connection: Close<br><br>Missing institution credentials.</span></div>
<div class="rule"></div>
<span class="BODH0" id="2">2. <a href="https://portswigger.net/knowledgebase/issues/details/00200300_crosssitescriptingreflected">Cross-site scripting (reflected)</a></span>
<br><a class="PREVNEXT" href="#1">Previous</a>
 <a class="PREVNEXT" href="#3">Next</a>
<br>
<br><span class="TEXT">There are 2 instances of this issue:
<ul>
<li><a href="#2.1">/health.php [Referer HTTP header]</a></li>
<li><a href="#2.2">/health.php [User-Agent HTTP header]</a></li>
</ul></span>
<h2>Issue background</h2>
<span class="TEXT"><p>Reflected cross-site scripting vulnerabilities arise when data is copied from a request and echoed into the application's immediate response in an unsafe way. An attacker can use the vulnerability to construct a request that, if issued by another application user, will cause JavaScript code supplied by the attacker to execute within the user's browser in the context of that user's session with the application.</p>
<p>The attacker-supplied code can perform a wide variety of actions, such as stealing the victim's session token or login credentials, performing arbitrary actions on the victim's behalf, and logging their keystrokes.</p>
<p>Users can be induced to issue the attacker's crafted request in various ways. For example, the attacker can send a victim a link containing a malicious URL in an email or instant message. They can submit the link to popular web sites that allow content authoring, for example in blog comments. And they can create an innocuous looking web site that causes anyone viewing it to make arbitrary cross-domain requests to the vulnerable application (using either the GET or the POST method).</p>
<p>The security impact of cross-site scripting vulnerabilities is dependent upon the nature of the vulnerable application, the kinds of data and functionality that it contains, and the other applications that belong to the same domain and organization. If the application is used only to display non-sensitive public content, with no authentication or access control functionality, then a cross-site scripting flaw may be considered low risk. However, if the same application resides on a domain that can access cookies for other more security-critical applications, then the vulnerability could be used to attack those other applications, and so may be considered high risk. Similarly, if the organization that owns the application is a likely target for phishing attacks, then the vulnerability could be leveraged to lend credibility to such attacks, by injecting Trojan functionality into the vulnerable application and exploiting users' trust in the organization in order to capture credentials for other applications that it owns. In many kinds of application, such as those providing online banking functionality, cross-site scripting should always be considered high risk. </p></span>
<h2>Issue remediation</h2>
<span class="TEXT"><p>In most situations where user-controllable data is copied into application responses, cross-site scripting 
 attacks can be prevented using two layers of defenses:</p>
<ul>
 <li>Input should be validated as strictly as possible on arrival, given the kind of content that 
it is expected to contain. For example, personal names should consist of alphabetical 
and a small range of typographical characters, and be relatively short; a year of birth 
should consist of exactly four numerals; email addresses should match a well-defined 
regular expression. Input which fails the validation should be rejected, not sanitized.</li>
<li>User input should be HTML-encoded at any point where it is copied into 
application responses. All HTML metacharacters, including < > " ' and =, should be 
replaced with the corresponding HTML entities (< > etc).</li></ul>
<p>In cases where the application's functionality allows users to author content using 
 a restricted subset of HTML tags and attributes (for example, blog comments which 
 allow limited formatting and linking), it is necessary to parse the supplied HTML to 
 validate that it does not use any dangerous syntax; this is a non-trivial task.</p></span>
<h2>References</h2>
<span class="TEXT"><ul>
	<li><a href="https://portswigger.net/web-security/cross-site-scripting">Cross-site scripting</a></li>
	<li><a href="https://portswigger.net/web-security/cross-site-scripting/reflected">Reflected cross-site scripting</a></li>
	<li><a href="https://support.portswigger.net/customer/portal/articles/1965737-Methodology_XSS.html">Using Burp to Find XSS issues</a></li></ul></span>
<h2>Vulnerability classifications</h2><span class="TEXT"><ul>
<li><a href="https://cwe.mitre.org/data/definitions/79.html">CWE-79: Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')</a></li>
<li><a href="https://cwe.mitre.org/data/definitions/80.html">CWE-80: Improper Neutralization of Script-Related HTML Tags in a Web Page (Basic XSS)</a></li>
<li><a href="https://cwe.mitre.org/data/definitions/116.html">CWE-116: Improper Encoding or Escaping of Output</a></li>
<li><a href="https://cwe.mitre.org/data/definitions/159.html">CWE-159: Failure to Sanitize Special Element</a></li>
</ul></span>
<br><br><div class="rule"></div>
<span class="BODH1" id="2.1">2.1. https://multitool.ciditools.com/health.php [Referer HTTP header]</span>
<br><a class="PREVNEXT" href="#1.2">Previous</a>
 <a class="PREVNEXT" href="#2.2">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_low_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Low</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/health.php</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The value of the <b>Referer</b> HTTP header is copied into the HTML document as plain text between tags. The payload <b>ml0q2<script>alert(1)</script>ptvv5</b> was submitted in the Referer HTTP header. This input was echoed unmodified in the application's response.<br><br>This proof-of-concept attack demonstrates that it is possible to inject arbitrary JavaScript into the application's response.<br><br>Because the user data that is copied into the response is submitted within a request header, the application's behavior is not trivial to exploit in an attack against another user. In the past, methods have existed of using client-side technologies such as Flash to cause another user to make a request containing an arbitrary HTTP header. If you can use such a technique, you can probably leverage it to exploit the XSS flaw. This limitation partially mitigates the impact of the vulnerability.</span>
<h2>Request</h2>
<div class="rr_div"><span>GET /health.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://example.com/<span class="HIGHLIGHT">ml0q2<script>alert(1)</script>ptvv5</span><br><br></span></div>
<h2>Response</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:22:42 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 2450<br>Connection: Close<br><br><p>Counter is 3916226</p><table><tr><td>USER</td><td>multitool</td></tr><tr><td>HOME</td><td>/home/multitool</td></tr><tr><td>SCRIPT_NAME</td><td>/health.php</td></tr><tr><td>REQUEST_URI</td><td>/heal<br><b>...[SNIP]...</b><br><td>https://example.com/<span class="HIGHLIGHT">ml0q2<script>alert(1)</script>ptvv5</span></td><br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="2.2">2.2. https://multitool.ciditools.com/health.php [User-Agent HTTP header]</span>
<br><a class="PREVNEXT" href="#2.1">Previous</a>
 <a class="PREVNEXT" href="#3.1">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_low_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Low</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/health.php</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The value of the <b>User-Agent</b> HTTP header is copied into the HTML document as plain text between tags. The payload <b>i4yhn<script>alert(1)</script>e8i4t</b> was submitted in the User-Agent HTTP header. This input was echoed unmodified in the application's response.<br><br>This proof-of-concept attack demonstrates that it is possible to inject arbitrary JavaScript into the application's response.<br><br>Because the user data that is copied into the response is submitted within a request header, the application's behavior is not trivial to exploit in an attack against another user. In the past, methods have existed of using client-side technologies such as Flash to cause another user to make a request containing an arbitrary HTTP header. If you can use such a technique, you can probably leverage it to exploit the XSS flaw. This limitation partially mitigates the impact of the vulnerability.</span>
<h2>Request</h2>
<div class="rr_div"><span>GET /health.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<span class="HIGHLIGHT">i4yhn<script>alert(1)</script>e8i4t</span><br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:22:18 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 2391<br>Connection: Close<br><br><p>Counter is 3916150</p><table><tr><td>USER</td><td>multitool</td></tr><tr><td>HOME</td><td>/home/multitool</td></tr><tr><td>SCRIPT_NAME</td><td>/health.php</td></tr><tr><td>REQUEST_URI</td><td>/heal<br><b>...[SNIP]...</b><br><td>Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<span class="HIGHLIGHT">i4yhn<script>alert(1)</script>e8i4t</span></td><br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH0" id="3">3. <a href="https://portswigger.net/knowledgebase/issues/details/00500600_cookiewithouthttponlyflagset">Cookie without HttpOnly flag set</a></span>
<br><a class="PREVNEXT" href="#2">Previous</a>
 <a class="PREVNEXT" href="#4">Next</a>
<br>
<br><span class="TEXT">There are 2 instances of this issue:
<ul>
<li><a href="#3.1">/cropped/</a></li>
<li><a href="#3.2">/uei/config/config.php</a></li>
</ul></span>
<h2>Issue background</h2>
<span class="TEXT"><p>If the HttpOnly attribute is set on a cookie, then the cookie's value cannot be read or set by client-side JavaScript. This measure makes certain client-side attacks, such as cross-site scripting, slightly harder to exploit by preventing them from trivially capturing the cookie's value via an injected script.</p></span>
<h2>Issue remediation</h2>
<span class="TEXT"><p>There is usually no good reason not to set the HttpOnly flag on all cookies. Unless you specifically require legitimate client-side scripts within your application to read or set a cookie's value, you should set the HttpOnly flag by including this attribute within the relevant Set-cookie directive.</p>
<p>You should be aware that the restrictions imposed by the HttpOnly flag can potentially be circumvented in some circumstances, and that numerous other serious attacks can be delivered by client-side script injection, aside from simple cookie stealing. </p></span>
<h2>References</h2>
<span class="TEXT"><ul>
<li><a href='https://www.owasp.org/index.php/HttpOnly'>Configuring HttpOnly</a></li>
</ul></span>
<h2>Vulnerability classifications</h2><span class="TEXT"><ul>
<li><a href="https://cwe.mitre.org/data/definitions/16.html">CWE-16: Configuration</a></li>
</ul></span>
<br><br><div class="rule"></div>
<span class="BODH1" id="3.1">3.1. https://multitool.ciditools.com/cropped/</span>
<br><a class="PREVNEXT" href="#2.2">Previous</a>
 <a class="PREVNEXT" href="#3.2">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_low_firm_rpt'></div></td>
<td>Severity: </td>
<td><b>Low</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Firm</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/cropped/</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The following cookie was issued by the application and does not have the HttpOnly flag set:<ul><li><b>PHPSESSID</b></li></ul>The cookie appears to contain a session token, which may increase the risk associated with this issue. You should review the contents of the cookie to determine its function.</span>
<h2>Request</h2>
<div class="rr_div"><span>GET /cropped/ HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Cache-Control: no-store, no-cache, must-revalidate<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:56:14 GMT<br>Expires: Thu, 19 Nov 1981 08:52:00 GMT<br>Pragma: no-cache<br>Server: Apache/2.4.18 (Ubuntu)<br><span class="HIGHLIGHT">Set-Cookie: PHPSESSID=t2ehk9395noriarahbk3ee87l5; path=/</span><br>Vary: Accept-Encoding<br>Content-Length: 276<br>Connection: Close<br><br><!-- These tools were designed to facilitate rapid course development in the Canvas LMS<br>Copyright (C) 2017 Ludovic Attiogbe and Kenneth larsen - Center for Innovative Design and Instruction<br>Utah Stat<br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="3.2">3.2. https://multitool.ciditools.com/uei/config/config.php</span>
<br><a class="PREVNEXT" href="#3.1">Previous</a>
 <a class="PREVNEXT" href="#4.1">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_low_firm_rpt'></div></td>
<td>Severity: </td>
<td><b>Low</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Firm</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/uei/config/config.php</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The following cookie was issued by the application and does not have the HttpOnly flag set:<ul><li><b>PHPSESSID</b></li></ul>The cookie appears to contain a session token, which may increase the risk associated with this issue. You should review the contents of the cookie to determine its function.</span>
<h2>Request</h2>
<div class="rr_div"><span>GET /uei/config/config.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/uei/config/<br><br></span></div>
<h2>Response</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Cache-Control: no-store, no-cache, must-revalidate<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:57:01 GMT<br>Expires: Thu, 19 Nov 1981 08:52:00 GMT<br>Pragma: no-cache<br>Server: Apache/2.4.18 (Ubuntu)<br><span class="HIGHLIGHT">Set-Cookie: PHPSESSID=nsnqglecrmbatm05hb9gkq91v6; path=/</span><br>Vary: Accept-Encoding<br>Content-Length: 32<br>Connection: Close<br><br>Missing institution credentials.</span></div>
<div class="rule"></div>
<span class="BODH0" id="4">4. <a href="https://portswigger.net/knowledgebase/issues/details/01000300_stricttransportsecuritynotenforced">Strict transport security not enforced</a></span>
<br><a class="PREVNEXT" href="#3">Previous</a>
 <a class="PREVNEXT" href="#5">Next</a>
<br>
<br><span class="TEXT">There are 2 instances of this issue:
<ul>
<li><a href="#4.1">/</a></li>
<li><a href="#4.2">/robots.txt</a></li>
</ul></span>
<h2>Issue background</h2>
<span class="TEXT"><p> The application fails to prevent users from connecting to it over unencrypted connections. An attacker able to modify a legitimate user's network traffic could bypass the application's use of SSL/TLS encryption, and use the application as a platform for attacks against its users. This attack is performed by rewriting HTTPS links as HTTP, so that if a targeted user follows a link to the site from an HTTP page, their browser never attempts to use an encrypted connection. The sslstrip tool automates this process. </p>
<p>
To exploit this vulnerability, an attacker must be suitably positioned to intercept and modify the victim's network traffic.This scenario typically occurs when a client communicates with the server over an insecure connection such as public Wi-Fi, or a corporate or home network that is shared with a compromised computer. Common defenses such as switched networks are not sufficient to prevent this. An attacker situated in the user's ISP or the application's hosting infrastructure could also perform this attack. Note that an advanced adversary could potentially target any connection made over the Internet's core infrastructure. </p></span>
<h2>Issue remediation</h2>
<span class="TEXT"><p>The application should instruct web browsers to only access the application using HTTPS. To do this, enable HTTP Strict Transport Security (HSTS) by adding a response header with the name 'Strict-Transport-Security' and the value 'max-age=expireTime', where expireTime is the time in seconds that browsers should remember that the site should only be accessed using HTTPS. Consider adding the 'includeSubDomains' flag if appropriate.</p>
<p>Note that because HSTS is a "trust on first use" (TOFU) protocol, a user who has never accessed the application will never have seen the HSTS header, and will therefore still be vulnerable to SSL stripping attacks. To mitigate this risk, you can optionally add the 'preload' flag to the HSTS header, and submit the domain for review by browser vendors.</p></span>
<h2>References</h2>
<span class="TEXT"><ul>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/Security/HTTP_strict_transport_security">HTTP Strict Transport Security</a></li>
<li><a href="http://www.thoughtcrime.org/software/sslstrip/">sslstrip</a></li>
<li><a href="https://hstspreload.appspot.com/">HSTS Preload Form</a></li>
</ul></span>
<h2>Vulnerability classifications</h2><span class="TEXT"><ul>
<li><a href="https://cwe.mitre.org/data/definitions/523.html">CWE-523: Unprotected Transport of Credentials</a></li>
</ul></span>
<br><br><div class="rule"></div>
<span class="BODH1" id="4.1">4.1. https://multitool.ciditools.com/</span>
<br><a class="PREVNEXT" href="#3.2">Previous</a>
 <a class="PREVNEXT" href="#4.2">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_low_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Low</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">This issue was found in multiple locations under the reported path.</span>
<h2>Request</h2>
<div class="rr_div"><span>GET /cancelled.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:21:35 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 1149<br>Connection: Close<br><br><!DOCTYPE html><br><head><br> <!-- Global site tag (gtag.js) - Google Analytics --><br> <script async src="https://www.googletagmanager.com/gtag/js?id=UA-74231940-3"></script><br> <script><br> window.dataLayer = w<br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="4.2">4.2. https://multitool.ciditools.com/robots.txt</span>
<br><a class="PREVNEXT" href="#4.1">Previous</a>
 <a class="PREVNEXT" href="#5.1">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_low_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Low</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/robots.txt</b></td>
</tr>
</table>
<h2>Request</h2>
<div class="rr_div"><span>GET /robots.txt HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response</h2>
<div class="rr_div"><span>HTTP/1.1 404 Not Found<br>Content-Type: text/html; charset=iso-8859-1<br>Date: Mon, 09 Dec 2019 21:13:02 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Content-Length: 285<br>Connection: Close<br><br><!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"><br><html><head><br><title>404 Not Found</title><br></head><body><br><h1>Not Found</h1><br><p>The requested URL was not found on this server.</p><br><hr><br><address>Apach<br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH0" id="5">5. <a href="https://portswigger.net/knowledgebase/issues/details/00200328_pathrelativestylesheetimport">Path-relative style sheet import</a></span>
<br><a class="PREVNEXT" href="#4">Previous</a>
 <a class="PREVNEXT" href="#6">Next</a>
<br>
<br><span class="TEXT">There are 3 instances of this issue:
<ul>
<li><a href="#5.1">/install/</a></li>
<li><a href="#5.2">/install/complete.php</a></li>
<li><a href="#5.3">/install/index.php</a></li>
</ul></span>
<h2>Issue background</h2>
<span class="TEXT"><p>Path-relative style sheet import vulnerabilities arise when the following conditions hold:</p>
<ol>
<li>A response contains a style sheet import that uses a path-relative URL (for example, the page at "/original-path/file.php" might import "styles/main.css").</li><li>When handling requests, the application or platform tolerates superfluous path-like data following the original filename in the URL (for example, "/original-path/file.php/extra-junk/"). When superfluous data is added to the original URL, the application's response still contains a path-relative stylesheet import.</li><li>The response in condition 2 can be made to render in a browser's quirks mode, either because it has a missing or old doctype directive, or because it allows itself to be framed by a page under an attacker's control.</li>
<li>When a browser requests the style sheet that is imported in the response from the modified URL (using the URL "/original-path/file.php/extra-junk/styles/main.css"), the application returns something other than the CSS response that was supposed to be imported. Given the behavior described in condition 2, this will typically be the same response that was originally returned in condition 1.</li><li>An attacker has a means of manipulating some text within the response in condition 4, for example because the application stores and displays some past input, or echoes some text within the current URL.</li></ol>
<p>Given the above conditions, an attacker can execute CSS injection within the browser of the target user. The attacker can construct a URL that causes the victim's browser to import as CSS a different URL than normal, containing text that the attacker can manipulate.</p>
<p>Being able to inject arbitrary CSS into the victim's browser may enable various attacks, including:</p>
<ul>
 <li>Executing arbitrary JavaScript using IE's expression() function.</li><li>Using CSS selectors to read parts of the HTML source, which may include sensitive data such as anti-CSRF tokens.</li>
<li>Capturing any sensitive data within the URL query string by making a further style sheet import to a URL on the attacker's domain, and monitoring the incoming Referer header.</li></ul></span>
<h2>Issue remediation</h2>
<span class="TEXT"><p>The root cause of the vulnerability can be resolved by not using path-relative URLs in style sheet imports. Aside from this, attacks can also be prevented by implementing all of the following defensive measures: </p>
<ul><li>Setting the HTTP response header "X-Frame-Options: deny" in all responses. One method that an attacker can use to make a page render in quirks mode is to frame it within their own page that is rendered in quirks mode. Setting this header prevents the page from being framed.</li><li>Setting a modern doctype (e.g. "<!doctype html>") in all HTML responses. This prevents the page from being rendered in quirks mode (unless it is being framed, as described above).</li>
<li>Setting the HTTP response header "X-Content-Type-Options: nosniff" in all responses. This prevents the browser from processing a non-CSS response as CSS, even if another page loads the response via a style sheet import.</li></ul></span>
<h2>References</h2>
<span class="TEXT"><ul><li><a href="http://blog.portswigger.net/2015/02/prssi.html">Detecting and exploiting path-relative stylesheet import (PRSSI) vulnerabilities</a></li></ul></span>
<h2>Vulnerability classifications</h2><span class="TEXT"><ul>
<li><a href="https://cwe.mitre.org/data/definitions/16.html">CWE-16: Configuration</a></li>
</ul></span>
<br><br><div class="rule"></div>
<span class="BODH1" id="5.1">5.1. https://multitool.ciditools.com/install/</span>
<br><a class="PREVNEXT" href="#4.2">Previous</a>
 <a class="PREVNEXT" href="#5.2">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_tentative_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Tentative</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/install/</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The application may be vulnerable to path-relative style sheet import (PRSSI) attacks. The response contains a path-relative style sheet import, and so condition 1 for an exploitable vulnerability is present (see issue background). The response can also be made to render in a browser's quirks mode. The page does not contain a doctype directive, and so it will always be rendered in quirks mode. Further, the response does not prevent itself from being framed, so an attacker can frame the response within a page that they control, to force it to be rendered in quirks mode. (Note that this technique is IE-specific and due to P3P restrictions might sometimes limit the impact of a successful attack.) This means that condition 3 for an exploitable vulnerability is probably present if condition 2 is present.<br><br>Burp was not able to confirm that the other conditions hold, and you should manually investigate this issue to confirm whether they do hold.</span>
<h2>Request</h2>
<div class="rr_div"><span>GET /install/ HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:56:18 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Set-Cookie: dtinstallsession=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0; path=/<br>Set-Cookie: dtinstalldomain=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0; path=/<br>Vary: Accept-Encoding<br>Content-Length: 13418<br>Connection: Close<br><br><br><!DOCTYPE html><br><head><br> <!-- Global site tag (gtag.js) - Google Analytics --><br> <script async src="https://www.googletagmanager.com/gtag/js?id=UA-74231940-3"></script><br> <script><br> window.dataLayer = <br><b>...[SNIP]...</b><br><link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css"><br> <span class="HIGHLIGHT"><link rel="stylesheet" href="css/main.css" type="text/css"></span><br> <span class="HIGHLIGHT"><link rel="stylesheet" href="css/prettify.css" type="text/css"></span><br> <link rel="shortcut icon" href="https://files.ciditools.com/cidi/logos/DesignPLUS-icon.png" type="image/png"><br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="5.2">5.2. https://multitool.ciditools.com/install/complete.php</span>
<br><a class="PREVNEXT" href="#5.1">Previous</a>
 <a class="PREVNEXT" href="#5.3">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_tentative_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Tentative</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/install/complete.php</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The application may be vulnerable to path-relative style sheet import (PRSSI) attacks. The response contains a path-relative style sheet import, and so condition 1 for an exploitable vulnerability is present (see issue background). The response can also be made to render in a browser's quirks mode. The page does not contain a doctype directive, and so it will always be rendered in quirks mode. Further, the response does not prevent itself from being framed, so an attacker can frame the response within a page that they control, to force it to be rendered in quirks mode. (Note that this technique is IE-specific and due to P3P restrictions might sometimes limit the impact of a successful attack.) This means that condition 3 for an exploitable vulnerability is probably present if condition 2 is present.<br><br>Burp was not able to confirm that the other conditions hold, and you should manually investigate this issue to confirm whether they do hold.</span>
<h2>Request</h2>
<div class="rr_div"><span>GET /install/complete.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:56:20 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Set-Cookie: dtinstallsession=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0; path=/<br>Set-Cookie: dtinstalldomain=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0; path=/<br>Vary: Accept-Encoding<br>Content-Length: 2893<br>Connection: Close<br><br><br><!DOCTYPE html><br><head><br> <meta http-equiv="Content-Type" content="text/html;charset=utf-8" /><br> <meta name="viewport" content="width=device-width, initial-scale=1"><br> <title>Design Tools Install</title><br><b>...[SNIP]...</b><br><link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css"><br> <span class="HIGHLIGHT"><link rel="stylesheet" href="css/main.css" type="text/css"></span><br> <span class="HIGHLIGHT"><link rel="stylesheet" href="css/prettify.css" type="text/css"></span><br> <link rel="shortcut icon" href="https://files.ciditools.com/cidi/logos/DesignPLUS-icon.png" type="image/png"><br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="5.3">5.3. https://multitool.ciditools.com/install/index.php</span>
<br><a class="PREVNEXT" href="#5.2">Previous</a>
 <a class="PREVNEXT" href="#9.1">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_tentative_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Tentative</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/install/index.php</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The application may be vulnerable to path-relative style sheet import (PRSSI) attacks. The response contains a path-relative style sheet import, and so condition 1 for an exploitable vulnerability is present (see issue background). The response can also be made to render in a browser's quirks mode. The page does not contain a doctype directive, and so it will always be rendered in quirks mode. Further, the response does not prevent itself from being framed, so an attacker can frame the response within a page that they control, to force it to be rendered in quirks mode. (Note that this technique is IE-specific and due to P3P restrictions might sometimes limit the impact of a successful attack.) This means that condition 3 for an exploitable vulnerability is probably present if condition 2 is present.<br><br>Burp was not able to confirm that the other conditions hold, and you should manually investigate this issue to confirm whether they do hold.</span>
<h2>Request</h2>
<div class="rr_div"><span>GET /install/index.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/install/complete.php<br><br></span></div>
<h2>Response</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:56:39 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Set-Cookie: dtinstallsession=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0; path=/<br>Set-Cookie: dtinstalldomain=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0; path=/<br>Vary: Accept-Encoding<br>Content-Length: 13418<br>Connection: Close<br><br><br><!DOCTYPE html><br><head><br> <!-- Global site tag (gtag.js) - Google Analytics --><br> <script async src="https://www.googletagmanager.com/gtag/js?id=UA-74231940-3"></script><br> <script><br> window.dataLayer = <br><b>...[SNIP]...</b><br><link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css"><br> <span class="HIGHLIGHT"><link rel="stylesheet" href="css/main.css" type="text/css"></span><br> <span class="HIGHLIGHT"><link rel="stylesheet" href="css/prettify.css" type="text/css"></span><br> <link rel="shortcut icon" href="https://files.ciditools.com/cidi/logos/DesignPLUS-icon.png" type="image/png"><br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH0" id="6">6. <a href="https://portswigger.net/knowledgebase/issues/details/00400100_refererdependentresponse">Referer-dependent response</a></span>
<br><a class="PREVNEXT" href="#5">Previous</a>
 <a class="PREVNEXT" href="#7">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_firm_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Firm</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/health.php</b></td>
</tr>
</table>
<h2>Issue description</h2>
<span class="TEXT"><p>Application responses may depend systematically on the presence or absence of the Referer header in requests. This behavior does not necessarily constitute a security vulnerability, and you should investigate the nature of and reason for the differential responses to determine whether a vulnerability is present.</p>
<p>Common explanations for Referer-dependent responses include: </p>
<ul><li>Referer-based access controls, where the application assumes that if you have arrived from one privileged location then you are authorized to access another privileged location. These controls can be trivially defeated by supplying an accepted Referer header in requests for the vulnerable function.</li><li>Attempts to prevent cross-site request forgery attacks by verifying that requests to perform privileged actions originated from within the application itself and not from some external location. Such defenses are often not robust, and can be bypassed by removing the Referer header entirely.</li>
<li>Delivery of Referer-tailored content, such as welcome messages to visitors from specific domains, search-engine optimization (SEO) techniques, and other ways of tailoring the user's experience. Such behaviors often have no security impact; however, unsafe processing of the Referer header may introduce vulnerabilities such as SQL injection and cross-site scripting. If parts of the document (such as META keywords) are updated based on search engine queries contained in the Referer header, then the application may be vulnerable to persistent code injection attacks, in which search terms are manipulated to cause malicious content to appear in responses served to other application users.</li></ul></span>
<h2>Issue remediation</h2>
<span class="TEXT"><p>The Referer header is not a robust foundation on which to build access controls. Any such measures should be replaced with more secure alternatives that are not vulnerable to Referer spoofing.</p>
<p>If the contents of responses is updated based on Referer data, then the same defenses against malicious input should be employed here as for any other kinds of user-supplied data. </p></span>
<h2>Vulnerability classifications</h2><span class="TEXT"><ul>
<li><a href="https://cwe.mitre.org/data/definitions/16.html">CWE-16: Configuration</a></li>
<li><a href="https://cwe.mitre.org/data/definitions/213.html">CWE-213: Intentional Information Exposure</a></li>
</ul></span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /health.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:23:24 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: <span class="HIGHLIGHT">2357</span><br>Connection: Close<br><br><p>Counter is 3916266</p><table><tr><td>USER</td><td>multitool</td></tr><tr><td>HOME</td><td>/home/multitool</td></tr><tr><td>SCRIPT_NAME</td><td>/health.php</td></tr><tr><td>REQUEST_URI</td><td>/heal<br><b>...[SNIP]...</b><br></span></div>
<h2>Request 2</h2>
<div class="rr_div"><span>GET /health.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><span class="HIGHLIGHT">Referer: http://pvesgvcyou.com/</span><br><br></span></div>
<h2>Response 2</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:23:24 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: <span class="HIGHLIGHT">2418</span><br>Connection: Close<br><br><p>Counter is 3916267</p><table><tr><td>USER</td><td>multitool</td></tr><tr><td>HOME</td><td>/home/multitool</td></tr><tr><td>SCRIPT_NAME</td><td>/health.php</td></tr><tr><td>REQUEST_URI</td><td>/heal<br><b>...[SNIP]...</b><br></tr><span class="HIGHLIGHT"><tr><td>HTTPS</td><td>on</td></tr></span></table></span></div>
<div class="rule"></div>
<span class="BODH0" id="7">7. <a href="https://portswigger.net/knowledgebase/issues/details/00400110_spoofableclientipaddress">Spoofable client IP address</a></span>
<br><a class="PREVNEXT" href="#6">Previous</a>
 <a class="PREVNEXT" href="#8">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_firm_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Firm</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/health.php</b></td>
</tr>
</table>
<h2>Issue description</h2>
<span class="TEXT"><p>
If an application trusts an HTTP request header like X-Forwarded-For to accurately specify the remote IP address of the connecting client, then malicious clients can spoof their IP address. This behavior does not necessarily constitute a security vulnerability, however some applications use client IP addresses to enforce access controls and rate limits. For example, an application might expose administrative functionality only to clients connecting from the local IP address of the server, or allow a certain number of failed login attempts from each unique IP address.
Consider reviewing relevant functionality to determine whether this might be the case. </p></span>
<h2>Issue remediation</h2>
<span class="TEXT"><p>HTTP request headers such as X-Forwarded-For, True-Client-IP, and X-Real-IP are not a robust foundation on which to build any security measures, such as access controls. Any such measures should be replaced with more secure alternatives that are not vulnerable to spoofing.</p>
<p>If the platform application server returns incorrect information about the client's IP address due to the presence of any particular HTTP request header, then the server may need to be reconfigured, or an alternative method of identifying clients should be used. </p></span>
<h2>Vulnerability classifications</h2><span class="TEXT"><ul>
<li><a href="https://cwe.mitre.org/data/definitions/16.html">CWE-16: Configuration</a></li>
</ul></span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /health.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:23:32 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: <span class="HIGHLIGHT">2357</span><br>Connection: Close<br><br><p>Counter is 3916293</p><table><tr><td>USER</td><td>multitool</td></tr><tr><td>HOME</td><td>/home/multitool</td></tr><tr><td>SCRIPT_NAME</td><td>/health.php</td></tr><tr><td>REQUEST_URI</td><td>/heal<br><b>...[SNIP]...</b><br></span></div>
<h2>Request 2</h2>
<div class="rr_div"><span>GET /health.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><span class="HIGHLIGHT">X-Forwarded-For: 127.0.0.1</span><br><br></span></div>
<h2>Response 2</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:23:32 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: <span class="HIGHLIGHT">2368</span><br>Connection: Close<br><br><p>Counter is 3916294</p><table><tr><td>USER</td><td>multitool</td></tr><tr><td>HOME</td><td>/home/multitool</td></tr><tr><td>SCRIPT_NAME</td><td>/health.php</td></tr><tr><td>REQUEST_URI</td><td>/heal<br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH0" id="8">8. <a href="https://portswigger.net/knowledgebase/issues/details/00400120_useragentdependentresponse">User agent-dependent response</a></span>
<br><a class="PREVNEXT" href="#7">Previous</a>
 <a class="PREVNEXT" href="#9">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_firm_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Firm</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/health.php</b></td>
</tr>
</table>
<h2>Issue description</h2>
<span class="TEXT"><p>Application responses may depend systematically on the value of the User-Agent header in requests. This behavior does not itself constitute a security vulnerability, but may point towards additional attack surface within the application, which may contain vulnerabilities.</p>
<p>This behavior often arises because applications provide different user interfaces for desktop and mobile users. Mobile interfaces have often been less thoroughly tested for vulnerabilities such as cross-site scripting, and often have simpler authentication and session handling mechanisms that may contain problems that are not present in the full interface.</p>
<p>To review the interface provided by the alternate User-Agent header, you can configure a match/replace rule in Burp Proxy to modify the User-Agent header in all requests, and then browse the application in the normal way using your normal browser. </p></span>
<h2>Vulnerability classifications</h2><span class="TEXT"><ul>
<li><a href="https://cwe.mitre.org/data/definitions/16.html">CWE-16: Configuration</a></li>
</ul></span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /health.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br><span class="HIGHLIGHT">User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36</span><br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:21:36 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: <span class="HIGHLIGHT">2356</span><br>Connection: Close<br><br><p>Counter is 3916108</p><table><tr><td>USER</td><td>multitool</td></tr><tr><td>HOME</td><td>/home/multitool</td></tr><tr><td>SCRIPT_NAME</td><td>/health.php</td></tr><tr><td>REQUEST_URI</td><td>/heal<br><b>...[SNIP]...</b><br></span></div>
<h2>Request 2</h2>
<div class="rr_div"><span>GET /health.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br><span class="HIGHLIGHT">User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 5_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Version/5.1 Mobile/9B176 Safari/7534.48.3</span><br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 2</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:23:28 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: <span class="HIGHLIGHT">2376</span><br>Connection: Close<br><br><p>Counter is 3916280</p><table><tr><td>USER</td><td>multitool</td></tr><tr><td>HOME</td><td>/home/multitool</td></tr><tr><td>SCRIPT_NAME</td><td>/health.php</td></tr><tr><td>REQUEST_URI</td><td>/heal<br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH0" id="9">9. <a href="https://portswigger.net/knowledgebase/issues/details/00400c00_inputreturnedinresponsereflected">Input returned in response (reflected)</a></span>
<br><a class="PREVNEXT" href="#8">Previous</a>
 <a class="PREVNEXT" href="#10">Next</a>
<br>
<br><span class="TEXT">There are 2 instances of this issue:
<ul>
<li><a href="#9.1">/health.php [Referer HTTP header]</a></li>
<li><a href="#9.2">/health.php [User-Agent HTTP header]</a></li>
</ul></span>
<h2>Issue background</h2>
<span class="TEXT"><p>Reflection of input arises when data is copied from a request and echoed into the application's immediate response.</p><p>Input being returned in application responses is not a vulnerability in its own right. However, it is a prerequisite for many client-side vulnerabilities, including cross-site scripting, open redirection, content spoofing, and response header injection. Additionally, some server-side vulnerabilities such as SQL injection are often easier to identify and exploit when input is returned in responses. In applications where input retrieval is rare and the environment is resistant to automated testing (for example, due to a web application firewall), it might be worth subjecting instances of it to focused manual testing. </p></span>
<h2>Vulnerability classifications</h2><span class="TEXT"><ul>
<li><a href="https://cwe.mitre.org/data/definitions/20.html">CWE-20: Improper Input Validation</a></li>
<li><a href="https://cwe.mitre.org/data/definitions/116.html">CWE-116: Improper Encoding or Escaping of Output</a></li>
</ul></span>
<br><br><div class="rule"></div>
<span class="BODH1" id="9.1">9.1. https://multitool.ciditools.com/health.php [Referer HTTP header]</span>
<br><a class="PREVNEXT" href="#5.3">Previous</a>
 <a class="PREVNEXT" href="#9.2">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/health.php</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The value of the <b>Referer</b> HTTP header is copied into the application's response.</span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /health.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://example.com/<span class="HIGHLIGHT">o1au4an6lb</span><br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:22:41 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 2425<br>Connection: Close<br><br><p>Counter is 3916223</p><table><tr><td>USER</td><td>multitool</td></tr><tr><td>HOME</td><td>/home/multitool</td></tr><tr><td>SCRIPT_NAME</td><td>/health.php</td></tr><tr><td>REQUEST_URI</td><td>/heal<br><b>...[SNIP]...</b><br><td>https://example.com/<span class="HIGHLIGHT">o1au4an6lb</span></td><br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="9.2">9.2. https://multitool.ciditools.com/health.php [User-Agent HTTP header]</span>
<br><a class="PREVNEXT" href="#9.1">Previous</a>
 <a class="PREVNEXT" href="#10.1">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/health.php</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The value of the <b>User-Agent</b> HTTP header is copied into the application's response.</span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /health.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<span class="HIGHLIGHT">gr531knofj</span><br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:22:18 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 2366<br>Connection: Close<br><br><p>Counter is 3916147</p><table><tr><td>USER</td><td>multitool</td></tr><tr><td>HOME</td><td>/home/multitool</td></tr><tr><td>SCRIPT_NAME</td><td>/health.php</td></tr><tr><td>REQUEST_URI</td><td>/heal<br><b>...[SNIP]...</b><br><td>Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<span class="HIGHLIGHT">gr531knofj</span></td><br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH0" id="10">10. <a href="https://portswigger.net/knowledgebase/issues/details/00500500_crossdomainscriptinclude">Cross-domain script include</a></span>
<br><a class="PREVNEXT" href="#9">Previous</a>
 <a class="PREVNEXT" href="#11">Next</a>
<br>
<br><span class="TEXT">There are 9 instances of this issue:
<ul>
<li><a href="#10.1">/cancelled.php</a></li>
<li><a href="#10.2">/controller.php</a></li>
<li><a href="#10.3">/cropped/cancelled.php</a></li>
<li><a href="#10.4">/cropped/controller.php</a></li>
<li><a href="#10.5">/cropped/oauth2response.php</a></li>
<li><a href="#10.6">/install/</a></li>
<li><a href="#10.7">/install/complete.php</a></li>
<li><a href="#10.8">/install/index.php</a></li>
<li><a href="#10.9">/resources/oauth2response.php</a></li>
</ul></span>
<h2>Issue background</h2>
<span class="TEXT"><p>When an application includes a script from an external domain, this script is executed by the browser within the security context of the invoking application. The script can therefore do anything that the application's own scripts can do, such as accessing application data and performing actions within the context of the current user.</p>
<p>If you include a script from an external domain, then you are trusting that domain with the data and functionality of your application, and you are trusting the domain's own security to prevent an attacker from modifying the script to perform malicious actions within your application. </p></span>
<h2>Issue remediation</h2>
<span class="TEXT"><p>Scripts should ideally not be included from untrusted domains. Applications that rely on static third-party scripts should consider using Subresource Integrity to make browsers verify them, or copying the contents of these scripts onto their own domain and including them from there. If that is not possible (e.g. for licensing reasons) then consider reimplementing the script's functionality within application code.</p></span>
<h2>References</h2>
<span class="TEXT"><ul>
<li>
<a href="https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity">Subresource Integrity</a>
</li>
</ul></span>
<h2>Vulnerability classifications</h2><span class="TEXT"><ul>
<li><a href="https://cwe.mitre.org/data/definitions/829.html">CWE-829: Inclusion of Functionality from Untrusted Control Sphere</a></li>
</ul></span>
<br><br><div class="rule"></div>
<span class="BODH1" id="10.1">10.1. https://multitool.ciditools.com/cancelled.php</span>
<br><a class="PREVNEXT" href="#9.2">Previous</a>
 <a class="PREVNEXT" href="#10.2">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/cancelled.php</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The response dynamically includes the following script from another domain:<ul><li>https://www.googletagmanager.com/gtag/js?id=UA-74231940-3</li></ul></span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /cancelled.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:21:35 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 1149<br>Connection: Close<br><br><!DOCTYPE html><br><head><br> <!-- Global site tag (gtag.js) - Google Analytics --><br> <span class="HIGHLIGHT"><script async src="https://www.googletagmanager.com/gtag/js?id=UA-74231940-3"></span></script><br> <script><br> window.dataLayer = w<br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="10.2">10.2. https://multitool.ciditools.com/controller.php</span>
<br><a class="PREVNEXT" href="#10.1">Previous</a>
 <a class="PREVNEXT" href="#10.3">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/controller.php</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The response dynamically includes the following script from another domain:<ul><li>https://www.googletagmanager.com/gtag/js?id=UA-74231940-3</li></ul></span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /controller.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:21:36 GMT<br>P3P: CP="CAO PSA OUR"<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 593<br>Connection: Close<br><br><!DOCTYPE html><br><head><br> <!-- Global site tag (gtag.js) - Google Analytics --><br> <span class="HIGHLIGHT"><script async src="https://www.googletagmanager.com/gtag/js?id=UA-74231940-3"></span></script><br> <script><br> window.dataLayer = w<br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="10.3">10.3. https://multitool.ciditools.com/cropped/cancelled.php</span>
<br><a class="PREVNEXT" href="#10.2">Previous</a>
 <a class="PREVNEXT" href="#10.4">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/cropped/cancelled.php</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The response dynamically includes the following script from another domain:<ul><li>https://www.googletagmanager.com/gtag/js?id=UA-74231940-3</li></ul></span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /cropped/cancelled.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:56:13 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 1141<br>Connection: Close<br><br><!DOCTYPE html><br><head><br> <!-- Global site tag (gtag.js) - Google Analytics --><br> <span class="HIGHLIGHT"><script async src="https://www.googletagmanager.com/gtag/js?id=UA-74231940-3"></span></script><br> <script><br> window.dataLayer = w<br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="10.4">10.4. https://multitool.ciditools.com/cropped/controller.php</span>
<br><a class="PREVNEXT" href="#10.3">Previous</a>
 <a class="PREVNEXT" href="#10.5">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/cropped/controller.php</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The response dynamically includes the following script from another domain:<ul><li>https://www.googletagmanager.com/gtag/js?id=UA-74231940-3</li></ul></span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /cropped/controller.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:56:14 GMT<br>P3P: CP="CAO PSA OUR"<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 520<br>Connection: Close<br><br><!DOCTYPE html><br><head><br> <!-- Global site tag (gtag.js) - Google Analytics --><br> <span class="HIGHLIGHT"><script async src="https://www.googletagmanager.com/gtag/js?id=UA-74231940-3"></span></script><br> <script><br> window.dataLayer = w<br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="10.5">10.5. https://multitool.ciditools.com/cropped/oauth2response.php</span>
<br><a class="PREVNEXT" href="#10.4">Previous</a>
 <a class="PREVNEXT" href="#10.6">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/cropped/oauth2response.php</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The response dynamically includes the following script from another domain:<ul><li>https://www.googletagmanager.com/gtag/js?id=UA-74231940-3</li></ul></span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /cropped/oauth2response.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:56:15 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Set-Cookie: testCookie=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0<br>Vary: Accept-Encoding<br>Content-Length: 524<br>Connection: Close<br><br><!DOCTYPE html><br><head><br> <!-- Global site tag (gtag.js) - Google Analytics --><br> <span class="HIGHLIGHT"><script async src="https://www.googletagmanager.com/gtag/js?id=UA-74231940-3"></span></script><br> <script><br> window.dataLayer = w<br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="10.6">10.6. https://multitool.ciditools.com/install/</span>
<br><a class="PREVNEXT" href="#10.5">Previous</a>
 <a class="PREVNEXT" href="#10.7">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/install/</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The response dynamically includes the following scripts from other domains:<ul><li>https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.11.0/umd/popper.min.js</li><li>https://code.jquery.com/jquery-3.2.1.min.js</li><li>https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/js/bootstrap.min.js</li><li>https://www.googletagmanager.com/gtag/js?id=UA-74231940-3</li></ul></span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /install/ HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:56:18 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Set-Cookie: dtinstallsession=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0; path=/<br>Set-Cookie: dtinstalldomain=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0; path=/<br>Vary: Accept-Encoding<br>Content-Length: 13418<br>Connection: Close<br><br><br><!DOCTYPE html><br><head><br> <!-- Global site tag (gtag.js) - Google Analytics --><br> <script async src="https://www.googletagmanager.com/gtag/js?id=UA-74231940-3"></script><br> <script><br> window.dataLayer = <br><b>...[SNIP]...</b><br></script><br> <span class="HIGHLIGHT"><script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.11.0/umd/popper.min.js" integrity="sha384-b/U6ypiBEHpOf/4+1nzFpr53nxSS+GLCkfwBdFNTxtclqqenISfwAzpKaMNFNmj4" crossorigin="anonymous"></span><span class="HIGHLIGHT"></span></script><br> <span class="HIGHLIGHT"><script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/js/bootstrap.min.js" integrity="sha384-h0AbiXch4ZDo7tp9hKZ4TsHbi047NrKGLO3SEJAg45jXxnGIfYzk4Si90RDIqNm1" crossorigin="anonymous"></span><span class="HIGHLIGHT"></span></script><br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="10.7">10.7. https://multitool.ciditools.com/install/complete.php</span>
<br><a class="PREVNEXT" href="#10.6">Previous</a>
 <a class="PREVNEXT" href="#10.8">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/install/complete.php</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The response dynamically includes the following scripts from other domains:<ul><li>https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.11.0/umd/popper.min.js</li><li>https://code.jquery.com/jquery-3.2.1.min.js</li><li>https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/js/bootstrap.min.js</li></ul></span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /install/complete.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:56:20 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Set-Cookie: dtinstallsession=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0; path=/<br>Set-Cookie: dtinstalldomain=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0; path=/<br>Vary: Accept-Encoding<br>Content-Length: 2893<br>Connection: Close<br><br><br><!DOCTYPE html><br><head><br> <meta http-equiv="Content-Type" content="text/html;charset=utf-8" /><br> <meta name="viewport" content="width=device-width, initial-scale=1"><br> <title>Design Tools Install</title><br><b>...[SNIP]...</b><br></script><br> <span class="HIGHLIGHT"><script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.11.0/umd/popper.min.js" integrity="sha384-b/U6ypiBEHpOf/4+1nzFpr53nxSS+GLCkfwBdFNTxtclqqenISfwAzpKaMNFNmj4" crossorigin="anonymous"></span><span class="HIGHLIGHT"></span></script><br> <span class="HIGHLIGHT"><script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/js/bootstrap.min.js" integrity="sha384-h0AbiXch4ZDo7tp9hKZ4TsHbi047NrKGLO3SEJAg45jXxnGIfYzk4Si90RDIqNm1" crossorigin="anonymous"></span></script><br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="10.8">10.8. https://multitool.ciditools.com/install/index.php</span>
<br><a class="PREVNEXT" href="#10.7">Previous</a>
 <a class="PREVNEXT" href="#10.9">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/install/index.php</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The response dynamically includes the following scripts from other domains:<ul><li>https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.11.0/umd/popper.min.js</li><li>https://code.jquery.com/jquery-3.2.1.min.js</li><li>https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/js/bootstrap.min.js</li><li>https://www.googletagmanager.com/gtag/js?id=UA-74231940-3</li></ul></span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /install/index.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/install/complete.php<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:56:39 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Set-Cookie: dtinstallsession=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0; path=/<br>Set-Cookie: dtinstalldomain=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0; path=/<br>Vary: Accept-Encoding<br>Content-Length: 13418<br>Connection: Close<br><br><br><!DOCTYPE html><br><head><br> <!-- Global site tag (gtag.js) - Google Analytics --><br> <script async src="https://www.googletagmanager.com/gtag/js?id=UA-74231940-3"></script><br> <script><br> window.dataLayer = <br><b>...[SNIP]...</b><br></script><br> <span class="HIGHLIGHT"><script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.11.0/umd/popper.min.js" integrity="sha384-b/U6ypiBEHpOf/4+1nzFpr53nxSS+GLCkfwBdFNTxtclqqenISfwAzpKaMNFNmj4" crossorigin="anonymous"></span><span class="HIGHLIGHT"></span></script><br> <span class="HIGHLIGHT"><script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/js/bootstrap.min.js" integrity="sha384-h0AbiXch4ZDo7tp9hKZ4TsHbi047NrKGLO3SEJAg45jXxnGIfYzk4Si90RDIqNm1" crossorigin="anonymous"></span><span class="HIGHLIGHT"></span></script><br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="10.9">10.9. https://multitool.ciditools.com/resources/oauth2response.php</span>
<br><a class="PREVNEXT" href="#10.8">Previous</a>
 <a class="PREVNEXT" href="#11.1">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/resources/oauth2response.php</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The response dynamically includes the following script from another domain:<ul><li>https://www.googletagmanager.com/gtag/js?id=UA-74231940-3</li></ul></span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /resources/oauth2response.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: http://multitool.ciditools.com/install/<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Tue, 10 Dec 2019 17:43:13 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 597<br>Connection: Close<br><br><!DOCTYPE html><br><head><br> <!-- Global site tag (gtag.js) - Google Analytics --><br> <span class="HIGHLIGHT"><script async src="https://www.googletagmanager.com/gtag/js?id=UA-74231940-3"></span></script><br> <script><br> window.dataLayer = w<br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH0" id="11">11. <a href="https://portswigger.net/knowledgebase/issues/details/005009a0_frameableresponsepotentialclickjacking">Frameable response (potential Clickjacking)</a></span>
<br><a class="PREVNEXT" href="#10">Previous</a>
 <a class="PREVNEXT" href="#12">Next</a>
<br>
<br><span class="TEXT">There are 3 instances of this issue:
<ul>
<li><a href="#11.1">/</a></li>
<li><a href="#11.2">/cancelled.php</a></li>
<li><a href="#11.3">/controller.php</a></li>
</ul></span>
<h2>Issue background</h2>
<span class="TEXT"><p>If a page fails to set an appropriate X-Frame-Options or Content-Security-Policy HTTP header, it might be possible for a page controlled by an attacker to load it within an iframe. This may enable a clickjacking attack, in which the attacker's page overlays the target application's interface with a different interface provided by the attacker. By inducing victim users to perform actions such as mouse clicks and keystrokes, the attacker can cause them to unwittingly carry out actions within the application that is being targeted. This technique allows the attacker to circumvent defenses against cross-site request forgery, and may result in unauthorized actions.</p>
<p>Note that some applications attempt to prevent these attacks from within the HTML page itself, using "framebusting" code. However, this type of defense is normally ineffective and can usually be circumvented by a skilled attacker.</p>
<p>You should determine whether any functions accessible within frameable pages can be used by application users to perform any sensitive actions within the application. </p></span>
<h2>Issue remediation</h2>
<span class="TEXT"><p>To effectively prevent framing attacks, the application should return a response header with the name <b>X-Frame-Options</b> and the value <b>DENY</b> to prevent framing altogether, or the value <b>SAMEORIGIN</b> to allow framing only by pages on the same origin as the response itself. Note that the SAMEORIGIN header can be partially bypassed if the application itself can be made to frame untrusted websites.</p></span>
<h2>References</h2>
<span class="TEXT"><ul><li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/X-Frame-Options">X-Frame-Options</a></li></ul></span>
<h2>Vulnerability classifications</h2><span class="TEXT"><ul>
<li><a href="https://cwe.mitre.org/data/definitions/693.html">CWE-693: Protection Mechanism Failure</a></li>
</ul></span>
<br><br><div class="rule"></div>
<span class="BODH1" id="11.1">11.1. https://multitool.ciditools.com/</span>
<br><a class="PREVNEXT" href="#10.9">Previous</a>
 <a class="PREVNEXT" href="#11.2">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_firm_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Firm</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">This issue was found in multiple locations under the reported path.</span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /uei/vendor/psr/http-message/src/?C=N%3bO%3dD HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/uei/vendor/psr/http-message/src/<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html;charset=UTF-8<br>Date: Mon, 09 Dec 2019 22:49:18 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 2391<br>Connection: Close<br><br><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN"><br><html><br> <head><br> <title>Index of /uei/vendor/psr/http-message/src</title><br> </head><br> <body><br><h1>Index of /uei/vendor/psr/http-message/src</h1><br> <br><b>...[SNIP]...</b><br></span></div>
<h2>Request 2</h2>
<div class="rr_div"><span>GET /uei/vendor/composer/ HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/uei/vendor/<br><br></span></div>
<h2>Response 2</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html;charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:57:09 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 2720<br>Connection: Close<br><br><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN"><br><html><br> <head><br> <title>Index of /uei/vendor/composer</title><br> </head><br> <body><br><h1>Index of /uei/vendor/composer</h1><br> <table><br> <tr><th valig<br><b>...[SNIP]...</b><br></span></div>
<h2>Request 3</h2>
<div class="rr_div"><span>GET /uei/vendor/psr/http-message/?C=M%3bO%3dA HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/uei/vendor/psr/http-message/<br><br></span></div>
<h2>Response 3</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html;charset=UTF-8<br>Date: Mon, 09 Dec 2019 22:17:48 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 1803<br>Connection: Close<br><br><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN"><br><html><br> <head><br> <title>Index of /uei/vendor/psr/http-message</title><br> </head><br> <body><br><h1>Index of /uei/vendor/psr/http-message</h1><br> <table><br><br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="11.2">11.2. https://multitool.ciditools.com/cancelled.php</span>
<br><a class="PREVNEXT" href="#11.1">Previous</a>
 <a class="PREVNEXT" href="#11.3">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_firm_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Firm</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/cancelled.php</b></td>
</tr>
</table>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /cancelled.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:21:35 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 1149<br>Connection: Close<br><br><!DOCTYPE html><br><head><br> <!-- Global site tag (gtag.js) - Google Analytics --><br> <script async src="https://www.googletagmanager.com/gtag/js?id=UA-74231940-3"></script><br> <script><br> window.dataLayer = w<br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="11.3">11.3. https://multitool.ciditools.com/controller.php</span>
<br><a class="PREVNEXT" href="#11.2">Previous</a>
 <a class="PREVNEXT" href="#13.1">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_firm_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Firm</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/controller.php</b></td>
</tr>
</table>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /controller.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:21:36 GMT<br>P3P: CP="CAO PSA OUR"<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 593<br>Connection: Close<br><br><!DOCTYPE html><br><head><br> <!-- Global site tag (gtag.js) - Google Analytics --><br> <script async src="https://www.googletagmanager.com/gtag/js?id=UA-74231940-3"></script><br> <script><br> window.dataLayer = w<br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH0" id="12">12. <a href="https://portswigger.net/knowledgebase/issues/details/00600100_directorylisting">Directory listing</a></span>
<br><a class="PREVNEXT" href="#11">Previous</a>
 <a class="PREVNEXT" href="#13">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_firm_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Firm</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/uei</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">This issue was found in multiple locations under the reported path.</span>
<h2>Issue background</h2>
<span class="TEXT"><p>Web servers can be configured to automatically list the contents of directories that do not have an index page present. This can aid an attacker by enabling them to quickly identify the resources at a given path, and proceed directly to analyzing and attacking those resources. It particularly increases the exposure of sensitive files within the directory that are not intended to be accessible to users, such as temporary files and crash dumps.</p>
<p>Directory listings themselves do not necessarily constitute a security vulnerability. Any sensitive resources within the web root should in any case be properly access-controlled, and should not be accessible by an unauthorized party who happens to know or guess the URL. Even when directory listings are disabled, an attacker may guess the location of sensitive files using automated tools.</p></span>
<h2>Issue remediation</h2>
<span class="TEXT"><p>There is not usually any good reason to provide directory listings, and disabling them may place additional hurdles in the path of an attacker. This can normally be achieved in two ways:</p>
<ul>
<li>Configure your web server to prevent directory listings for all paths beneath the web root; </li>
<li>Place into each directory a default file (such as index.htm) that the web server will display instead of returning a directory listing.</li></ul></span>
<h2>Vulnerability classifications</h2><span class="TEXT"><ul>
<li><a href="https://cwe.mitre.org/data/definitions/538.html">CWE-538: File and Directory Information Exposure</a></li>
<li><a href="https://cwe.mitre.org/data/definitions/548.html">CWE-548: Information Exposure Through Directory Listing</a></li>
</ul></span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /uei/vendor/composer/ HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/uei/vendor/<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html;charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:57:09 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 2720<br>Connection: Close<br><br><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN"><br><html><br> <head><br> <span class="HIGHLIGHT"><title>Index of /uei/vendor/composer</span></title><br> </head><br> <body><br><h1>Index of /uei/vendor/composer</h1><br> <table><br> <tr><th valig<br><b>...[SNIP]...</b><br><th><span class="HIGHLIGHT"><a href="?C=N;O=D">Name</span></a></th><th><span class="HIGHLIGHT"><a href="?C=M;O=A">Last modified</span></a></th><th><span class="HIGHLIGHT"><a href="?C=S;O=A">Size</span></a></th><th><span class="HIGHLIGHT"><a href="?C=D;O=A">Description</span></a><br><b>...[SNIP]...</b><br><td><span class="HIGHLIGHT"><a href="/uei/vendor/">Parent Directory</span></a><br><b>...[SNIP]...</b><br></span></div>
<h2>Request 2</h2>
<div class="rr_div"><span>GET /uei/vendor/league/?C=D%3bO%3dA HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/uei/vendor/league/<br><br></span></div>
<h2>Response 2</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html;charset=UTF-8<br>Date: Mon, 09 Dec 2019 22:04:10 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 993<br>Connection: Close<br><br><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN"><br><html><br> <head><br> <span class="HIGHLIGHT"><title>Index of /uei/vendor/league</span></title><br> </head><br> <body><br><h1>Index of /uei/vendor/league</h1><br> <table><br> <tr><th valign="t<br><b>...[SNIP]...</b><br><th><span class="HIGHLIGHT"><a href="?C=N;O=D">Name</span></a></th><th><span class="HIGHLIGHT"><a href="?C=M;O=A">Last modified</span></a></th><th><span class="HIGHLIGHT"><a href="?C=S;O=A">Size</span></a></th><th><span class="HIGHLIGHT"><a href="?C=D;O=A">Description</span></a><br><b>...[SNIP]...</b><br><td><span class="HIGHLIGHT"><a href="/uei/vendor/">Parent Directory</span></a><br><b>...[SNIP]...</b><br></span></div>
<h2>Request 3</h2>
<div class="rr_div"><span>GET /uei/vendor/psr/http-message/src/?C=N%3bO%3dD HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/uei/vendor/psr/http-message/src/<br><br></span></div>
<h2>Response 3</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html;charset=UTF-8<br>Date: Mon, 09 Dec 2019 22:49:18 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 2391<br>Connection: Close<br><br><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN"><br><html><br> <head><br> <span class="HIGHLIGHT"><title>Index of /uei/vendor/psr/http-message/src</span></title><br> </head><br> <body><br><h1>Index of /uei/vendor/psr/http-message/src</h1><br> <br><b>...[SNIP]...</b><br><th><span class="HIGHLIGHT"><a href="?C=N;O=D">Name</span></a></th><th><span class="HIGHLIGHT"><a href="?C=M;O=A">Last modified</span></a></th><th><span class="HIGHLIGHT"><a href="?C=S;O=A">Size</span></a></th><th><span class="HIGHLIGHT"><a href="?C=D;O=A">Description</span></a><br><b>...[SNIP]...</b><br><td><span class="HIGHLIGHT"><a href="/uei/vendor/psr/http-message/">Parent Directory</span></a><br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH0" id="13">13. <a href="https://portswigger.net/knowledgebase/issues/details/00600200_emailaddressesdisclosed">Email addresses disclosed</a></span>
<br><a class="PREVNEXT" href="#12">Previous</a>
 <a class="PREVNEXT" href="#14">Next</a>
<br>
<br><span class="TEXT">There are 6 instances of this issue:
<ul>
<li><a href="#13.1">/</a></li>
<li><a href="#13.2">/cancelled.php</a></li>
<li><a href="#13.3">/cropped/cancelled.php</a></li>
<li><a href="#13.4">/install/</a></li>
<li><a href="#13.5">/install/index.php</a></li>
<li><a href="#13.6">/uei/composer.lock</a></li>
</ul></span>
<h2>Issue background</h2>
<span class="TEXT"><p>The presence of email addresses within application responses does not necessarily constitute a security vulnerability. Email addresses may appear intentionally within contact information, and many applications (such as web mail) include arbitrary third-party email addresses within their core content.</p>
<p>However, email addresses of developers and other individuals (whether appearing on-screen or hidden within page source) may disclose information that is useful to an attacker; for example, they may represent usernames that can be used at the application's login, and they may be used in social engineering attacks against the organization's personnel. Unnecessary or excessive disclosure of email addresses may also lead to an increase in the volume of spam email received.</p></span>
<h2>Issue remediation</h2>
<span class="TEXT"><p>Consider removing any email addresses that are unnecessary, or replacing personal addresses with anonymous mailbox addresses (such as helpdesk@example.com).</p>
<p>To reduce the quantity of spam sent to anonymous mailbox addresses, consider hiding the email address and instead providing a form that generates the email server-side, protected by a CAPTCHA if necessary. </p></span>
<h2>Vulnerability classifications</h2><span class="TEXT"><ul>
<li><a href="https://cwe.mitre.org/data/definitions/200.html">CWE-200: Information Exposure</a></li>
</ul></span>
<br><br><div class="rule"></div>
<span class="BODH1" id="13.1">13.1. https://multitool.ciditools.com/</span>
<br><a class="PREVNEXT" href="#11.3">Previous</a>
 <a class="PREVNEXT" href="#13.2">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The following email addresses were disclosed in the response:<ul><li>mtdowling@gmail.com</li><li>hugh.downer@gmail.com</li><li>hello@alexbilbie.com</li><li>security@paragonie.com</li><li>ralph.khattar@gmail.com</li><li>stsalkov@gmail.com</li><li>aaron@unsplash.com</li><li>luke@unsplash.com</li><li>charles@pickcrew.com</li><li>kontakt@beberlei.de</li><li>rquadling@gmail.com</li><li>support@cidilabs.com</li><li>developer@cidilabs.com</li><li>ocramius@gmail.com</li><li>ircmaxell@ircmaxell.com</li><li>info@paragonie.com</li><li>padraic.brady@gmail.com</li><li>dave.marshall@atstsolutions.co.uk</li><li>mail@adrian-philipp.com</li><li>opensource@ijaap.nl</li></ul>Numerous email addresses were found to be disclosed and the above are a sample subset.<br><br>This issue was found in multiple locations under the reported path.</span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /uei/vendor/guzzlehttp/psr7/LICENSE HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/uei/vendor/guzzlehttp/psr7/<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Accept-Ranges: bytes<br>Date: Mon, 09 Dec 2019 22:10:10 GMT<br>ETag: "457-595c35c583800"<br>Last-Modified: Fri, 25 Oct 2019 22:06:24 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Content-Length: 1111<br>Connection: Close<br><br>Copyright (c) 2015 Michael Dowling, https://github.com/mtdowling <<span class="HIGHLIGHT">mtdowling@gmail.com</span>><br><br>Permission is hereby granted, free of charge, to any person obtaining a copy<br>of this software and associated doc<br><b>...[SNIP]...</b><br></span></div>
<h2>Request 2</h2>
<div class="rr_div"><span>GET /uei/composer.lock HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/uei/<br><br></span></div>
<h2>Response 2</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Accept-Ranges: bytes<br>Date: Mon, 09 Dec 2019 21:56:44 GMT<br>ETag: "4bb6-595c35c583800"<br>Last-Modified: Fri, 25 Oct 2019 22:06:24 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Content-Length: 19382<br>Connection: Close<br><br>{<br> "_readme": [<br> "This file locks the dependencies of your project to a known state",<br> "Read more about it at https://getcomposer.org/doc/01-basic-usage.md#installing-dependencies",<br> <br><b>...[SNIP]...</b><br>agist.org/downloads/",<br> "license": [<br> "MIT"<br> ],<br> "authors": [<br> {<br> "name": "Hugh Downer",<br> "email": "<span class="HIGHLIGHT">hugh.downer@gmail.com</span>"<br> }<br> ],<br> "description": "Unsplash OAuth 2.0 Client Provider for The PHP League OAuth2-Client",<br> "keywords": [<br> "Authentication",<br> <br><b>...[SNIP]...</b><br> "name": "Charles Lalonde",<br> "email": "charles@pickcrew.com"<br> },<br> {<br> "name": "Hugh Downer",<br> "email": "<span class="HIGHLIGHT">hugh.downer@gmail.com</span>"<br> }<br> ],<br> "description": "Wrapper to access the Unsplash API and photo library",<br> "time": "2019-08-14T20:44:07+00:00"<br> }<br> ],<br> "packages-dev"<br><b>...[SNIP]...</b><br></span></div>
<h2>Request 3</h2>
<div class="rr_div"><span>GET /uei/composer.lock HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/uei/<br><br></span></div>
<h2>Response 3</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Accept-Ranges: bytes<br>Date: Mon, 09 Dec 2019 21:56:44 GMT<br>ETag: "4bb6-595c35c583800"<br>Last-Modified: Fri, 25 Oct 2019 22:06:24 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Content-Length: 19382<br>Connection: Close<br><br>{<br> "_readme": [<br> "This file locks the dependencies of your project to a known state",<br> "Read more about it at https://getcomposer.org/doc/01-basic-usage.md#installing-dependencies",<br> <br><b>...[SNIP]...</b><br>agist.org/downloads/",<br> "license": [<br> "MIT"<br> ],<br> "authors": [<br> {<br> "name": "Alex Bilbie",<br> "email": "<span class="HIGHLIGHT">hello@alexbilbie.com</span>",<br> "homepage": "http://www.alexbilbie.com",<br> "role": "Developer"<br> },<br> {<br> "name": "Woody Gilk",<br> <br><b>...[SNIP]...</b><br>/",<br> "license": [<br> "MIT"<br> ],<br> "authors": [<br> {<br> "name": "Paragon Initiative Enterprises",<br> "email": "<span class="HIGHLIGHT">security@paragonie.com</span>",<br> "homepage": "https://paragonie.com"<br> }<br> ],<br> "description": "PHP 5.x polyfill for random_bytes() and random_int() from PHP 7",<br> "ke<br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="13.2">13.2. https://multitool.ciditools.com/cancelled.php</span>
<br><a class="PREVNEXT" href="#13.1">Previous</a>
 <a class="PREVNEXT" href="#13.3">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/cancelled.php</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The following email address was disclosed in the response:<ul><li>support@cidilabs.com</li></ul></span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /cancelled.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:21:35 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 1149<br>Connection: Close<br><br><!DOCTYPE html><br><head><br> <!-- Global site tag (gtag.js) - Google Analytics --><br> <script async src="https://www.googletagmanager.com/gtag/js?id=UA-74231940-3"></script><br> <script><br> window.dataLayer = w<br><b>...[SNIP]...</b><br><a href="mailto:<span class="HIGHLIGHT">support@cidilabs.com</span> ?Subject=Multi%20Tool%20Error"><span class="HIGHLIGHT">support@cidilabs.com</span> </a><br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="13.3">13.3. https://multitool.ciditools.com/cropped/cancelled.php</span>
<br><a class="PREVNEXT" href="#13.2">Previous</a>
 <a class="PREVNEXT" href="#13.4">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/cropped/cancelled.php</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The following email address was disclosed in the response:<ul><li>support@cidilabs.com</li></ul></span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /cropped/cancelled.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Tue, 10 Dec 2019 16:57:41 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 1141<br>Connection: Close<br><br><!DOCTYPE html><br><head><br> <!-- Global site tag (gtag.js) - Google Analytics --><br> <script async src="https://www.googletagmanager.com/gtag/js?id=UA-74231940-3"></script><br> <script><br> window.dataLayer = w<br><b>...[SNIP]...</b><br><a href="mailto:<span class="HIGHLIGHT">support@cidilabs.com</span> ?Subject=Multi%20Tool%20Error"><span class="HIGHLIGHT">support@cidilabs.com</span> </a><br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="13.4">13.4. https://multitool.ciditools.com/install/</span>
<br><a class="PREVNEXT" href="#13.3">Previous</a>
 <a class="PREVNEXT" href="#13.5">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/install/</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The following email address was disclosed in the response:<ul><li>developer@cidilabs.com</li></ul></span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /install/ HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Tue, 10 Dec 2019 16:57:46 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Set-Cookie: dtinstallsession=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0; path=/<br>Set-Cookie: dtinstalldomain=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0; path=/<br>Vary: Accept-Encoding<br>Content-Length: 13418<br>Connection: Close<br><br><br><!DOCTYPE html><br><head><br> <!-- Global site tag (gtag.js) - Google Analytics --><br> <script async src="https://www.googletagmanager.com/gtag/js?id=UA-74231940-3"></script><br> <script><br> window.dataLayer = <br><b>...[SNIP]...</b><br><dd id="email"><span class="HIGHLIGHT">developer@cidilabs.com</span></dd><br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="13.5">13.5. https://multitool.ciditools.com/install/index.php</span>
<br><a class="PREVNEXT" href="#13.4">Previous</a>
 <a class="PREVNEXT" href="#13.6">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/install/index.php</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The following email address was disclosed in the response:<ul><li>developer@cidilabs.com</li></ul></span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /install/index.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/install/complete.php<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Tue, 10 Dec 2019 16:58:08 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Set-Cookie: dtinstallsession=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0; path=/<br>Set-Cookie: dtinstalldomain=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0; path=/<br>Vary: Accept-Encoding<br>Content-Length: 13418<br>Connection: Close<br><br><br><!DOCTYPE html><br><head><br> <!-- Global site tag (gtag.js) - Google Analytics --><br> <script async src="https://www.googletagmanager.com/gtag/js?id=UA-74231940-3"></script><br> <script><br> window.dataLayer = <br><b>...[SNIP]...</b><br><dd id="email"><span class="HIGHLIGHT">developer@cidilabs.com</span></dd><br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="13.6">13.6. https://multitool.ciditools.com/uei/composer.lock</span>
<br><a class="PREVNEXT" href="#13.5">Previous</a>
 <a class="PREVNEXT" href="#14.1">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/uei/composer.lock</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The following email addresses were disclosed in the response:<ul><li>mtdowling@gmail.com</li><li>hugh.downer@gmail.com</li><li>hello@alexbilbie.com</li><li>security@paragonie.com</li><li>ralph.khattar@gmail.com</li><li>stsalkov@gmail.com</li><li>aaron@unsplash.com</li><li>luke@unsplash.com</li><li>charles@pickcrew.com</li></ul></span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /uei/composer.lock HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/uei/<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Accept-Ranges: bytes<br>Date: Tue, 10 Dec 2019 16:58:13 GMT<br>ETag: "4bb6-595c35c583800"<br>Last-Modified: Fri, 25 Oct 2019 22:06:24 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Content-Length: 19382<br>Connection: Close<br><br>{<br> "_readme": [<br> "This file locks the dependencies of your project to a known state",<br> "Read more about it at https://getcomposer.org/doc/01-basic-usage.md#installing-dependencies",<br> <br><b>...[SNIP]...</b><br>t.org/downloads/",<br> "license": [<br> "MIT"<br> ],<br> "authors": [<br> {<br> "name": "Michael Dowling",<br> "email": "<span class="HIGHLIGHT">mtdowling@gmail.com</span>",<br> "homepage": "https://github.com/mtdowling"<br> }<br> ],<br> "description": "Guzzle is a PHP HTTP client library",<br> "homepage": "http://guzz<br><b>...[SNIP]...</b><br>t.org/downloads/",<br> "license": [<br> "MIT"<br> ],<br> "authors": [<br> {<br> "name": "Michael Dowling",<br> "email": "<span class="HIGHLIGHT">mtdowling@gmail.com</span>",<br> "homepage": "https://github.com/mtdowling"<br> }<br> ],<br> "description": "Guzzle promises library",<br> "keywords": [<br> "promi<br><b>...[SNIP]...</b><br>t.org/downloads/",<br> "license": [<br> "MIT"<br> ],<br> "authors": [<br> {<br> "name": "Michael Dowling",<br> "email": "<span class="HIGHLIGHT">mtdowling@gmail.com</span>",<br> "homepage": "https://github.com/mtdowling"<br> },<br> {<br> "name": "Tobias Schultze",<br> "homepage": "https://github.com<br><b>...[SNIP]...</b><br>agist.org/downloads/",<br> "license": [<br> "MIT"<br> ],<br> "authors": [<br> {<br> "name": "Hugh Downer",<br> "email": "<span class="HIGHLIGHT">hugh.downer@gmail.com</span>"<br> }<br> ],<br> "description": "Unsplash OAuth 2.0 Client Provider for The PHP League OAuth2-Client",<br> "keywords": [<br> "Authentication",<br> <br><b>...[SNIP]...</b><br> "name": "Charles Lalonde",<br> "email": "charles@pickcrew.com"<br> },<br> {<br> "name": "Hugh Downer",<br> "email": "<span class="HIGHLIGHT">hugh.downer@gmail.com</span><span class="HIGHLIGHT"></span><span class="HIGHLIGHT"></span><span class="HIGHLIGHT"></span><span class="HIGHLIGHT"></span><span class="HIGHLIGHT"></span><span class="HIGHLIGHT"></span><span class="HIGHLIGHT"></span>"<br> }<br> ],<br> "description": "Wrapper to access the Unsplash API and photo library",<br> "time": "2019-08-14T20:44:07+00:00"<br> }<br> ],<br> "packages-dev"<br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH0" id="14">14. <a href="https://portswigger.net/knowledgebase/issues/details/00600300_privateipaddressesdisclosed">Private IP addresses disclosed</a></span>
<br><a class="PREVNEXT" href="#13">Previous</a>
 <a class="PREVNEXT" href="#15">Next</a>
<br>
<br><span class="TEXT">There are 3 instances of this issue:
<ul>
<li><a href="#14.1">/health.php</a></li>
<li><a href="#14.2">/health.php</a></li>
<li><a href="#14.3">/uei/vendor/league/oauth2-client/README.md</a></li>
</ul></span>
<h2>Issue background</h2>
<span class="TEXT"><p>RFC 1918 specifies ranges of IP addresses that are reserved for use in private networks and cannot be routed on the public Internet. Although various methods exist by which an attacker can determine the public IP addresses in use by an organization, the private addresses used internally cannot usually be determined in the same ways.</p>
<p>Discovering the private addresses used within an organization can help an attacker in carrying out network-layer attacks aiming to penetrate the organization's internal infrastructure. </p></span>
<h2>Issue remediation</h2>
<span class="TEXT"><p>There is not usually any good reason to disclose the internal IP addresses used within an organization's infrastructure. If these are being returned in service banners or debug messages, then the relevant services should be configured to mask the private addresses. If they are being used to track back-end servers for load balancing purposes, then the addresses should be rewritten with innocuous identifiers from which an attacker cannot infer any useful information about the infrastructure.</p></span>
<h2>Vulnerability classifications</h2><span class="TEXT"><ul>
<li><a href="https://cwe.mitre.org/data/definitions/200.html">CWE-200: Information Exposure</a></li>
</ul></span>
<br><br><div class="rule"></div>
<span class="BODH1" id="14.1">14.1. https://multitool.ciditools.com/health.php</span>
<br><a class="PREVNEXT" href="#13.6">Previous</a>
 <a class="PREVNEXT" href="#14.2">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/health.php</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The following RFC 1918 IP addresses were disclosed in the response:<ul><li>10.0.1.46</li><li>10.0.1.62</li></ul></span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /health.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:21:36 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 2356<br>Connection: Close<br><br><p>Counter is 3916108</p><table><tr><td>USER</td><td>multitool</td></tr><tr><td>HOME</td><td>/home/multitool</td></tr><tr><td>SCRIPT_NAME</td><td>/health.php</td></tr><tr><td>REQUEST_URI</td><td>/heal<br><b>...[SNIP]...</b><br><td><span class="HIGHLIGHT">10.0.1.46</span></td><br><b>...[SNIP]...</b><br><td><span class="HIGHLIGHT">10.0.1.62</span></td><br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="14.2">14.2. https://multitool.ciditools.com/health.php</span>
<br><a class="PREVNEXT" href="#14.1">Previous</a>
 <a class="PREVNEXT" href="#14.3">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/health.php</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The following RFC 1918 IP addresses were disclosed in the response:<ul><li>10.0.1.12</li><li>10.0.1.62</li></ul></span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /health.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Tue, 10 Dec 2019 16:58:00 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 2356<br>Connection: Close<br><br><p>Counter is 3921485</p><table><tr><td>USER</td><td>multitool</td></tr><tr><td>HOME</td><td>/home/multitool</td></tr><tr><td>SCRIPT_NAME</td><td>/health.php</td></tr><tr><td>REQUEST_URI</td><td>/heal<br><b>...[SNIP]...</b><br><td><span class="HIGHLIGHT">10.0.1.12</span></td><br><b>...[SNIP]...</b><br><td><span class="HIGHLIGHT">10.0.1.62</span></td><br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="14.3">14.3. https://multitool.ciditools.com/uei/vendor/league/oauth2-client/README.md</span>
<br><a class="PREVNEXT" href="#14.2">Previous</a>
 <a class="PREVNEXT" href="#15.1">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/uei/vendor/league/oauth2-client/README.md</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The following RFC 1918 IP address was disclosed in the response:<ul><li>192.168.0.1</li></ul></span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /uei/vendor/league/oauth2-client/README.md HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/uei/vendor/league/oauth2-client/<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Accept-Ranges: bytes<br>Date: Mon, 09 Dec 2019 22:10:24 GMT<br>ETag: "39bf-595c35c583800"<br>Last-Modified: Fri, 25 Oct 2019 22:06:24 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Content-Length: 14783<br>Connection: Close<br><br># OAuth 2.0 Client<br><br>This package makes it simple to integrate your application with [OAuth 2.0](http://oauth.net/2/) service providers.<br><br>[![Gitter Chat](https://img.shields.io/badge/gitter-join_chat-b<br><b>...[SNIP]...</b><br>e.example.com/authorize',<br> 'urlAccessToken' => 'http://service.example.com/token',<br> 'urlResourceOwnerDetails' => 'http://service.example.com/resource',<br> 'proxy' => '<span class="HIGHLIGHT">192.168.0.1</span>:8888',<br> 'verify' =><br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH0" id="15">15. <a href="https://portswigger.net/knowledgebase/issues/details/00700100_cacheablehttpsresponse">Cacheable HTTPS response</a></span>
<br><a class="PREVNEXT" href="#14">Previous</a>
 <a class="PREVNEXT" href="#16">Next</a>
<br>
<br><span class="TEXT">There are 9 instances of this issue:
<ul>
<li><a href="#15.1">/</a></li>
<li><a href="#15.2">/cancelled.php</a></li>
<li><a href="#15.3">/config.php</a></li>
<li><a href="#15.4">/controller.php</a></li>
<li><a href="#15.5">/genkey.php</a></li>
<li><a href="#15.6">/health.php</a></li>
<li><a href="#15.7">/path.php</a></li>
<li><a href="#15.8">/set_session.php</a></li>
<li><a href="#15.9">/toolLTI.php</a></li>
</ul></span>
<h2>Issue background</h2>
<span class="TEXT"><p>Unless directed otherwise, browsers may store a local cached copy of content received from web servers. Some browsers, including Internet Explorer, cache content accessed via HTTPS. If sensitive information in application responses is stored in the local cache, then this may be retrieved by other users who have access to the same computer at a future time.</p></span>
<h2>Issue remediation</h2>
<span class="TEXT"><p>Applications should return caching directives instructing browsers not to store local copies of any sensitive data. Often, this can be achieved by configuring the web server to prevent caching for relevant paths within the web root. Alternatively, most web development platforms allow you to control the server's caching directives from within individual scripts. Ideally, the web server should return the following HTTP headers in all responses containing sensitive content:</p>
<ul>
<li>Cache-control: no-store</li><li>Pragma: no-cache</li></ul></span>
<h2>Vulnerability classifications</h2><span class="TEXT"><ul>
<li><a href="https://cwe.mitre.org/data/definitions/524.html">CWE-524: Information Exposure Through Caching</a></li>
<li><a href="https://cwe.mitre.org/data/definitions/525.html">CWE-525: Information Exposure Through Browser Caching</a></li>
</ul></span>
<br><br><div class="rule"></div>
<span class="BODH1" id="15.1">15.1. https://multitool.ciditools.com/</span>
<br><a class="PREVNEXT" href="#14.3">Previous</a>
 <a class="PREVNEXT" href="#15.2">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">This issue was found in multiple locations under the reported path.</span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /modules/ HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:56:26 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 183<br>Connection: Close<br><br><!-- Copyright (C) 2019 Utah State University --><br>Your browser appears to be preventing multitool.ciditools.com from creating cookies. Cookies are essential for this tool to function.</span></div>
<h2>Request 2</h2>
<div class="rr_div"><span>GET /uei/vendor/psr/http-message/src/?C=N%3bO%3dD HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/uei/vendor/psr/http-message/src/<br><br></span></div>
<h2>Response 2</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html;charset=UTF-8<br>Date: Mon, 09 Dec 2019 22:49:18 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 2391<br>Connection: Close<br><br><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 Final//EN"><br><html><br> <head><br> <title>Index of /uei/vendor/psr/http-message/src</title><br> </head><br> <body><br><h1>Index of /uei/vendor/psr/http-message/src</h1><br> <br><b>...[SNIP]...</b><br></span></div>
<h2>Request 3</h2>
<div class="rr_div"><span>GET /uei/vendor/guzzlehttp/guzzle/src/ClientInterface.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/uei/vendor/guzzlehttp/guzzle/src/<br><br></span></div>
<h2>Response 3</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 22:21:29 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Content-Length: 0<br>Connection: Close<br><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="15.2">15.2. https://multitool.ciditools.com/cancelled.php</span>
<br><a class="PREVNEXT" href="#15.1">Previous</a>
 <a class="PREVNEXT" href="#15.3">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/cancelled.php</b></td>
</tr>
</table>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /cancelled.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:21:35 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 1149<br>Connection: Close<br><br><!DOCTYPE html><br><head><br> <!-- Global site tag (gtag.js) - Google Analytics --><br> <script async src="https://www.googletagmanager.com/gtag/js?id=UA-74231940-3"></script><br> <script><br> window.dataLayer = w<br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="15.3">15.3. https://multitool.ciditools.com/config.php</span>
<br><a class="PREVNEXT" href="#15.2">Previous</a>
 <a class="PREVNEXT" href="#15.4">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/config.php</b></td>
</tr>
</table>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /config.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:21:35 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 133<br>Connection: Close<br><br>Your browser appears to be preventing multitool.ciditools.com from creating cookies. Cookies are essential for this tool to function.</span></div>
<div class="rule"></div>
<span class="BODH1" id="15.4">15.4. https://multitool.ciditools.com/controller.php</span>
<br><a class="PREVNEXT" href="#15.3">Previous</a>
 <a class="PREVNEXT" href="#15.5">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/controller.php</b></td>
</tr>
</table>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /controller.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:21:36 GMT<br>P3P: CP="CAO PSA OUR"<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 593<br>Connection: Close<br><br><!DOCTYPE html><br><head><br> <!-- Global site tag (gtag.js) - Google Analytics --><br> <script async src="https://www.googletagmanager.com/gtag/js?id=UA-74231940-3"></script><br> <script><br> window.dataLayer = w<br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="15.5">15.5. https://multitool.ciditools.com/genkey.php</span>
<br><a class="PREVNEXT" href="#15.4">Previous</a>
 <a class="PREVNEXT" href="#15.6">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/genkey.php</b></td>
</tr>
</table>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /genkey.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:21:36 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 33<br>Connection: Close<br><br>e761023812c087ff0f509245746c05fe<br></span></div>
<div class="rule"></div>
<span class="BODH1" id="15.6">15.6. https://multitool.ciditools.com/health.php</span>
<br><a class="PREVNEXT" href="#15.5">Previous</a>
 <a class="PREVNEXT" href="#15.7">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/health.php</b></td>
</tr>
</table>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /health.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:21:36 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 2356<br>Connection: Close<br><br><p>Counter is 3916108</p><table><tr><td>USER</td><td>multitool</td></tr><tr><td>HOME</td><td>/home/multitool</td></tr><tr><td>SCRIPT_NAME</td><td>/health.php</td></tr><tr><td>REQUEST_URI</td><td>/heal<br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="15.7">15.7. https://multitool.ciditools.com/path.php</span>
<br><a class="PREVNEXT" href="#15.6">Previous</a>
 <a class="PREVNEXT" href="#15.8">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/path.php</b></td>
</tr>
</table>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /path.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:21:37 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Content-Length: 0<br>Connection: Close<br><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="15.8">15.8. https://multitool.ciditools.com/set_session.php</span>
<br><a class="PREVNEXT" href="#15.7">Previous</a>
 <a class="PREVNEXT" href="#15.9">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/set_session.php</b></td>
</tr>
</table>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /set_session.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: text/html; charset=UTF-8<br>Date: Mon, 09 Dec 2019 21:21:37 GMT<br>P3P: CP="CAO PSA OUR"<br>Server: Apache/2.4.18 (Ubuntu)<br>Set-Cookie: testCookie=test<br>Vary: Accept-Encoding<br>Content-Length: 42<br>Connection: Close<br><br><script> window.history.back(2); </script></span></div>
<div class="rule"></div>
<span class="BODH1" id="15.9">15.9. https://multitool.ciditools.com/toolLTI.php</span>
<br><a class="PREVNEXT" href="#15.8">Previous</a>
 <a class="PREVNEXT" href="#16.1">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/toolLTI.php</b></td>
</tr>
</table>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /toolLTI.php HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Content-Type: application/xml<br>Date: Mon, 09 Dec 2019 21:21:37 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Vary: Accept-Encoding<br>Content-Length: 1919<br>Connection: Close<br><br><?xml version="1.0" encoding="UTF-8"?><cartridge_basiclti_link xmlns="http://www.imsglobal.org/xsd/imslticc_v1p0"<br> xmlns:blti = "http://www.imsglobal.org/xsd/imsbasiclti_v1p0"<br> xmlns:lticm ="htt<br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH0" id="16">16. <a href="https://portswigger.net/knowledgebase/issues/details/00800500_contenttypeisnotspecified">Content type is not specified</a></span>
<br><a class="PREVNEXT" href="#15">Previous</a>
 <a class="PREVNEXT" href="#17">Next</a>
<br>
<br><span class="TEXT">There are 3 instances of this issue:
<ul>
<li><a href="#16.1">/uei</a></li>
<li><a href="#16.2">/uei/README.md</a></li>
<li><a href="#16.3">/uei/composer.lock</a></li>
</ul></span>
<h2>Issue background</h2>
<span class="TEXT"><p>If a response does not specify a content type, then the browser will usually analyze the response and attempt to determine the MIME type of its content. This can have unexpected results, and if the content contains any user-controllable data may lead to cross-site scripting or other client-side vulnerabilities.</p>
<p>In most cases, the absence of a content type statement does not constitute a security flaw, particularly if the response contains static content. You should review the contents of affected responses, and the context in which they appear, to determine whether any vulnerability exists. </p></span>
<h2>Issue remediation</h2>
<span class="TEXT"><p>For every response containing a message body, the application should include a single Content-type header that correctly and unambiguously states the MIME type of the content in the response body.</p></span>
<h2>Vulnerability classifications</h2><span class="TEXT"><ul>
<li><a href="https://cwe.mitre.org/data/definitions/16.html">CWE-16: Configuration</a></li>
</ul></span>
<br><br><div class="rule"></div>
<span class="BODH1" id="16.1">16.1. https://multitool.ciditools.com/uei</span>
<br><a class="PREVNEXT" href="#15.9">Previous</a>
 <a class="PREVNEXT" href="#16.2">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/uei</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">This issue was found in multiple locations under the reported path.</span>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /uei/vendor/league/oauth2-client/README.PROVIDER-GUIDE.md HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/uei/vendor/league/oauth2-client/<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Accept-Ranges: bytes<br>Date: Mon, 09 Dec 2019 22:05:04 GMT<br>ETag: "108d-595c35c583800"<br>Last-Modified: Fri, 25 Oct 2019 22:06:24 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Content-Length: 4237<br>Connection: Close<br><br># OAuth 2.0 Client<br><br>## Provider Guide<br><br>New providers may be created by copying the layout of an existing package. See<br>the [list of providers](docs/providers/thirdparty.md) for good examples.<br><br>When cho<br><b>...[SNIP]...</b><br></span></div>
<h2>Request 2</h2>
<div class="rr_div"><span>GET /uei/vendor/unsplash/unsplash/LICENSE HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/uei/vendor/unsplash/unsplash/<br><br></span></div>
<h2>Response 2</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Accept-Ranges: bytes<br>Date: Mon, 09 Dec 2019 22:10:35 GMT<br>ETag: "42e-595c35c583800"<br>Last-Modified: Fri, 25 Oct 2019 22:06:24 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Content-Length: 1070<br>Connection: Close<br><br>MIT License<br><br>Copyright (c) 2015 Unsplash Inc.<br><br>Permission is hereby granted, free of charge, to any person obtaining a copy<br>of this software and associated documentation files (the "Software"), to dea<br><b>...[SNIP]...</b><br></span></div>
<h2>Request 3</h2>
<div class="rr_div"><span>GET /uei/vendor/unsplash/unsplash/tests/fixtures/stats.yml HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/uei/vendor/unsplash/unsplash/tests/fixtures/<br><br></span></div>
<h2>Response 3</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Accept-Ranges: bytes<br>Date: Mon, 09 Dec 2019 22:55:19 GMT<br>ETag: "4c9-595c35c583800"<br>Last-Modified: Fri, 25 Oct 2019 22:06:24 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Content-Length: 1225<br>Connection: Close<br><br>[{<br> "request": {<br> "method": "GET",<br> "url": "https:\/\/api.unsplash.com\/stats\/total",<br> "headers": {<br> "Host": "api.unsplash.com",<br> "Accept-Encoding": null<br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="16.2">16.2. https://multitool.ciditools.com/uei/README.md</span>
<br><a class="PREVNEXT" href="#16.1">Previous</a>
 <a class="PREVNEXT" href="#16.3">Next</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/uei/README.md</b></td>
</tr>
</table>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /uei/README.md HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/uei/<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Accept-Ranges: bytes<br>Date: Tue, 10 Dec 2019 16:58:12 GMT<br>ETag: "2e3-595c35c583800"<br>Last-Modified: Fri, 25 Oct 2019 22:06:24 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Content-Length: 739<br>Connection: Close<br><br>#Upload Embed Image Tool (UEI)<br>Designed by Kenneth Larsen @ Utah State University.<br>Developed by Cidi Labs, Summer 2019.<br><br>##Dependencies<br>Development on the UEI front-end requires the following tools:<br>*<br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH1" id="16.3">16.3. https://multitool.ciditools.com/uei/composer.lock</span>
<br><a class="PREVNEXT" href="#16.2">Previous</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/uei/composer.lock</b></td>
</tr>
</table>
<h2>Request 1</h2>
<div class="rr_div"><span>GET /uei/composer.lock HTTP/1.1<br>Host: multitool.ciditools.com<br>Accept-Encoding: gzip, deflate<br>Accept: */*<br>Accept-Language: en-US,en-GB;q=0.9,en;q=0.8<br>User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36<br>Connection: close<br>Cache-Control: max-age=0<br>Referer: https://multitool.ciditools.com/uei/<br><br></span></div>
<h2>Response 1</h2>
<div class="rr_div"><span>HTTP/1.1 200 OK<br>Accept-Ranges: bytes<br>Date: Tue, 10 Dec 2019 16:58:13 GMT<br>ETag: "4bb6-595c35c583800"<br>Last-Modified: Fri, 25 Oct 2019 22:06:24 GMT<br>Server: Apache/2.4.18 (Ubuntu)<br>Content-Length: 19382<br>Connection: Close<br><br>{<br> "_readme": [<br> "This file locks the dependencies of your project to a known state",<br> "Read more about it at https://getcomposer.org/doc/01-basic-usage.md#installing-dependencies",<br> <br><b>...[SNIP]...</b><br></span></div>
<div class="rule"></div>
<span class="BODH0" id="17">17. <a href="https://portswigger.net/knowledgebase/issues/details/01000100_sslcertificate">SSL certificate</a></span>
<br><a class="PREVNEXT" href="#16">Previous</a>
<br>
<h2>Summary</h2>
<table cellpadding="0" cellspacing="0" class="summary_table">
<tr>
<td rowspan="4" class="icon" valign="top" align="center"><div class='scan_issue_info_certain_rpt'></div></td>
<td>Severity: </td>
<td><b>Information</b></td>
</tr>
<tr>
<td>Confidence: </td>
<td><b>Certain</b></td>
</tr>
<tr>
<td>Host: </td>
<td><b>https://multitool.ciditools.com</b></td>
</tr>
<tr>
<td>Path: </td>
<td><b>/</b></td>
</tr>
</table>
<h2>Issue detail</h2>
<span class="TEXT">The server presented a valid, trusted SSL certificate. This issue is purely informational.<br><br>The server presented the following certificates:<br><br><h4>Server certificate</h4><table><tr><td><b>Issued to:</b> </td><td>*.ciditools.com, ciditools.com</td></tr><tr><td><b>Issued by:</b> </td><td>Amazon</td></tr><tr><td><b>Valid from:</b> </td><td>Sun May 12 18:00:00 MDT 2019</td></tr><tr><td><b>Valid to:</b> </td><td>Sat Jun 13 06:00:00 MDT 2020</td></tr></table><h4>Certificate chain #1</h4><table><tr><td><b>Issued to:</b> </td><td>Amazon</td></tr><tr><td><b>Issued by:</b> </td><td>Amazon Root CA 1</td></tr><tr><td><b>Valid from:</b> </td><td>Wed Oct 21 18:00:00 MDT 2015</td></tr><tr><td><b>Valid to:</b> </td><td>Sat Oct 18 18:00:00 MDT 2025</td></tr></table><h4>Certificate chain #2</h4><table><tr><td><b>Issued to:</b> </td><td>Amazon Root CA 1</td></tr><tr><td><b>Issued by:</b> </td><td>Starfield Services Root Certificate Authority - G2</td></tr><tr><td><b>Valid from:</b> </td><td>Mon May 25 06:00:00 MDT 2015</td></tr><tr><td><b>Valid to:</b> </td><td>Wed Dec 30 18:00:00 MST 2037</td></tr></table><h4>Certificate chain #3</h4><table><tr><td><b>Issued to:</b> </td><td>Starfield Services Root Certificate Authority - G2</td></tr><tr><td><b>Issued by:</b> </td><td>Starfield Class 2 Certification Authority</td></tr><tr><td><b>Valid from:</b> </td><td>Tue Sep 01 18:00:00 MDT 2009</td></tr><tr><td><b>Valid to:</b> </td><td>Wed Jun 28 11:39:16 MDT 2034</td></tr></table><h4>Certificate chain #4</h4><table><tr><td><b>Issued to:</b> </td><td>Starfield Class 2 Certification Authority</td></tr><tr><td><b>Issued by:</b> </td><td>Starfield Class 2 Certification Authority</td></tr><tr><td><b>Valid from:</b> </td><td>Tue Jun 29 11:39:16 MDT 2004</td></tr><tr><td><b>Valid to:</b> </td><td>Thu Jun 29 11:39:16 MDT 2034</td></tr></table></span>
<h2>Issue background</h2>
<span class="TEXT"><p>SSL (or TLS) helps to protect the confidentiality and integrity of information in transit between the browser and server, and to provide authentication of the server's identity. To serve this purpose, the server must present an SSL certificate that is valid for the server's hostname, is issued by a trusted authority and is valid for the current date. If any one of these requirements is not met, SSL connections to the server will not provide the full protection for which SSL is designed.</p>
<p>It should be noted that various attacks exist against SSL in general, and in the context of HTTPS web connections in particular. It may be possible for a determined and suitably-positioned attacker to compromise SSL connections without user detection even when a valid SSL certificate is used. </p></span>
<h2>References</h2>
<span class="TEXT"><ul><li><a href="https://wiki.mozilla.org/Security/Server_Side_TLS">SSL/TLS Configuration Guide</a></li></ul></span>
<h2>Vulnerability classifications</h2><span class="TEXT"><ul>
<li><a href="https://cwe.mitre.org/data/definitions/295.html">CWE-295: Improper Certificate Validation</a></li>
<li><a href="https://cwe.mitre.org/data/definitions/326.html">CWE-326: Inadequate Encryption Strength</a></li>
<li><a href="https://cwe.mitre.org/data/definitions/327.html">CWE-327: Use of a Broken or Risky Cryptographic Algorithm</a></li>
</ul></span>
<div class="rule"></div>
<span class="TEXT"><br>Report generated by Burp Suite <a href="https://portswigger.net/vulnerability-scanner/">web vulnerability scanner</a> v2.1.06, at Tue Dec 10 15:52:10 MST 2019.<br><br></span>
</div>
</body>
</html>
STRING;
    }
}
