import AltText from '../Components/Forms/AltText'
import AnchorText from '../Components/Forms/AnchorText'
import BaseFontIsNotUsed from '../Components/Forms/BaseFontIsNotUsed'
import ContrastForm from '../Components/Forms/ContrastForm'
import UfixitReviewOnly from '../Components/Forms/UfixitReviewOnly'
import HeadingForm from '../Components/Forms/HeadingForm'
import HeadingEmptyForm from '../Components/Forms/HeadingEmptyForm'
import HeadingStyleForm from '../Components/Forms/HeadingStyleForm'
import TableHeaders from '../Components/Forms/TableHeaders'
import Video from '../Components/Forms/Video'


const UfixitForms = {
  AnchorMustContainText: AnchorText,
  AnchorSuspiciousLinkText: AnchorText,
  BaseFontIsNotUsed,
  CssTextHasContrast: ContrastForm,
  CssTextStyleEmphasize: ContrastForm,
  HeadersHaveText: HeadingEmptyForm,
  ImageAltIsDifferent: AltText,
  ImageAltIsTooLong: AltText,
  ImageAltNotEmptyInAnchor: AltText,
  ImageHasAlt: AltText,
  ImageHasAltDecorative: AltText,
  ParagraphNotUsedAsHeader: HeadingForm,
  TableDataShouldHaveTableHeader: TableHeaders,
  TableHeaderShouldHaveScope: TableHeaders,
  ImageAltNotPlaceholder: AltText,
  VideoCaptionsMatchCourseLanguage: Video,
  VideosEmbeddedOrLinkedNeedCaptions: Video
}

export default class Ufixit {
  returnIssueForm(activeIssue) {
    if (activeIssue) {
      if (UfixitForms.hasOwnProperty(activeIssue.scanRuleId)) {
        return UfixitForms[activeIssue.scanRuleId]
      }
    }

    return UfixitReviewOnly
  }
}
