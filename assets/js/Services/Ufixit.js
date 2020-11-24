import AnchorText from '../Components/Forms/AnchorText'
import BaseFontIsNotUsed from '../Components/Forms/BaseFontIsNotUsed'
import ContentTooLong from '../Components/Forms/ContentTooLong'
import CssTextHasContrast from '../Components/Forms/CssTextHasContrast'
import CssTextStyleEmphasize from '../Components/Forms/CssTextStyleEmphasize'
import HeadersHaveText from '../Components/Forms/HeadersHaveText'
import ImageAltIsDifferent from '../Components/Forms/ImageAltIsDifferent'
import ImageAltIsTooLong from '../Components/Forms/ImageAltIsTooLong'
import ImageAltNotEmptyInAnchor from '../Components/Forms/ImageAltNotEmptyInAnchor'
import UfixitReviewOnly from '../Components/Forms/UfixitReviewOnly'

const UfixitForms = {
  AnchorMustContainText: AnchorText,
  AnchorSuspiciousLinkText: AnchorText,
  BaseFontIsNotUsed,
  ContentTooLong,
  CssTextHasContrast,
  CssTextStyleEmphasize,
  HeadersHaveText,
  ImageAltIsDifferent,
  ImageAltIsTooLong,
  ImageAltNotEmptyInAnchor
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
