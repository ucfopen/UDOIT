import AnchorMustContainText from '../Components/Forms/AnchorMustContainText'
import AnchorSuspiciousLinkText from '../Components/Forms/AnchorSuspiciousLinkText'
import BaseFontIsNotUsed from '../Components/Forms/BaseFontIsNotUsed'
import ContentTooLong from '../Components/Forms/ContentTooLong'
import CssTextHasContrast from '../Components/Forms/CssTextHasContrast'
import CssTextStyleEmphasize from '../Components/Forms/CssTextStyleEmphasize'
import HeadersHaveText from '../Components/Forms/HeadersHaveText'
import ImageAltIsDifferent from '../Components/Forms/ImageAltIsDifferent'
import ImageAltIsTooLong from '../Components/Forms/ImageAltIsTooLong'
import ImageAltNotEmptyInAnchor from '../Components/Forms/ImageAltNotEmptyInAnchor'

const UfixitForms = {
  AnchorMustContainText,
  AnchorSuspiciousLinkText,
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

    return null
  }
}
