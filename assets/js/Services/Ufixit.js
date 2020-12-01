import AltText from '../Components/Forms/AltText'
import AnchorText from '../Components/Forms/AnchorText'
import BaseFontIsNotUsed from '../Components/Forms/BaseFontIsNotUsed'
import ContentTooLong from '../Components/Forms/ContentTooLong'
import CssTextHasContrast from '../Components/Forms/CssTextHasContrast'
import CssTextStyleEmphasize from '../Components/Forms/CssTextStyleEmphasize'
import HeadersHaveText from '../Components/Forms/HeadersHaveText'
import UfixitReviewOnly from '../Components/Forms/UfixitReviewOnly'


const UfixitForms = {
  AnchorMustContainText: AnchorText,
  AnchorSuspiciousLinkText: AnchorText,
  BaseFontIsNotUsed,
  ContentTooLong,
  CssTextHasContrast,
  CssTextStyleEmphasize,
  HeadersHaveText,
  ImageAltIsDifferent: AltText,
  ImageAltIsTooLong: AltText,
  ImageAltNotEmptyInAnchor: AltText,
  ImageHasAlt: AltText,
  ImageHasAltDecorative: AltText,

}

export default class Ufixit {
  returnIssueForm(activeIssue) {
    if (activeIssue) {
      if (UfixitForms.hasOwnProperty(activeIssue.scanRuleId)) {
        return UfixitForms[activeIssue.scanRuleId]
      }
    }

    console.log('activeIssue', activeIssue)

    return UfixitReviewOnly
  }
}
