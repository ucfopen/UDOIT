import React, { useEffect, useState } from 'react'
import OptionFeedback from '../Widgets/OptionFeedback'
import RadioSelector from '../Widgets/RadioSelector'
import { UFIXIT_OPTIONS } from '../../Services/Constants'

export default function EmbeddedContentReviewForm({
  t,
  activeIssue,
  isDisabled,
  handleActiveIssue,
  activeOption,
  setActiveOption,
  formErrors,
  setFormErrors
 }) {

  const FORM_OPTIONS = {
    REVIEW_CONTENT: UFIXIT_OPTIONS.REVIEW_CONTENT,
    MARK_AS_REVIEWED: UFIXIT_OPTIONS.MARK_AS_REVIEWED
  };

  const [hasReviewedKeyboard, setHasReviewedKeyboard] = useState(false);
  const [hasReviewedContrast, setHasReviewedContrast] = useState(false);
  const [hasReviewedCaptions, setHasReviewedCaptions] = useState(false);

  useEffect(() => {

    const fixed = activeIssue.newHtml && (activeIssue.status === 1 || activeIssue.status === 3);
    const reviewed = activeIssue.newHtml && (activeIssue.status === 2 || activeIssue.status === 3);
    let startingOption = ''
    let fullyReviewed = false;

    if (reviewed) {
      startingOption = FORM_OPTIONS.MARK_AS_REVIEWED;
    }
    if (fixed) {
      startingOption = FORM_OPTIONS.REVIEW_CONTENT;
      fullyReviewed = true;
    }
    setHasReviewedKeyboard(fullyReviewed);
    setHasReviewedContrast(fullyReviewed);
    setHasReviewedCaptions(fullyReviewed);
    setActiveOption(startingOption);

  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent();
    checkFormErrors();
  }, [activeOption, hasReviewedKeyboard, hasReviewedContrast, hasReviewedCaptions]);

  const updateHtmlContent = () => {
    let issue = activeIssue;
    issue.newHtml = issue.initialHtml;
    handleActiveIssue(issue);
  };

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.REVIEW_CONTENT]: []
    };
    
    if(activeOption === FORM_OPTIONS.REVIEW_CONTENT) {
      if(!hasReviewedKeyboard || !hasReviewedContrast || !hasReviewedCaptions) {
        tempErrors[FORM_OPTIONS.REVIEW_CONTENT].push({ text: t('If the embedded content cannot meet these requirements, either replace it or add an equivalent accessible alternative.'), type: "error" });
      }
    }
    
    setFormErrors(tempErrors);
  }

  const handleSelectAllClick = () => {
    let selectAll = true;
    if (hasReviewedKeyboard && hasReviewedContrast && hasReviewedCaptions) {
      selectAll = false;
    }
    setHasReviewedKeyboard(selectAll);
    setHasReviewedContrast(selectAll);
    setHasReviewedCaptions(selectAll);
  }
  
  return (
    <>
      {/* OPTION 1: Review content's Keyboard controls, Contrast, and Captions. ID: "REVIEW_CONTENT" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.REVIEW_CONTENT ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.REVIEW_CONTENT}
          labelId = 'content-review-label'
          labelText = {t('form.embedded_content_review.decision.review')}
        />
        {activeOption === FORM_OPTIONS.REVIEW_CONTENT && (
          <>
            <div className="flex-column indented gap-1" role="group" aria-labelledby="content-review-label">
              <div className="flex-row justify-content-start gap-1">
                <input
                  type="checkbox"
                  id="keyboardCheckbox"
                  disabled={isDisabled}
                  checked={hasReviewedKeyboard}
                  onChange={(e) => setHasReviewedKeyboard(e.target.checked)}
                />
                <label
                  className="ufixit-instructions"
                  htmlFor="keyboardCheckbox"
                  dangerouslySetInnerHTML={{__html: t('form.embedded_content_review.label.keyboard')}}
                ></label>
              </div>
              <div className="flex-row justify-content-start gap-1">
                <input
                  type="checkbox"
                  id="contrastCheckbox"
                  disabled={isDisabled}
                  checked={hasReviewedContrast}
                  onChange={(e) => setHasReviewedContrast(e.target.checked)}
                />
                <label
                  className="ufixit-instructions"
                  htmlFor="contrastCheckbox"
                  dangerouslySetInnerHTML={{__html: t('form.embedded_content_review.label.contrast')}}
                ></label>
              </div>
              <div className="flex-row justify-content-start gap-1">
                <input
                  type="checkbox"
                  id="captionsCheckbox"
                  disabled={isDisabled}
                  checked={hasReviewedCaptions}
                  onChange={(e) => setHasReviewedCaptions(e.target.checked)}
                />
                <label
                  className="ufixit-instructions"
                  htmlFor="captionsCheckbox"
                  dangerouslySetInnerHTML={{__html: t('form.embedded_content_review.label.captions')}}
                ></label>
              </div>
            </div>
            <div className="flex-row justify-content-center mt-3">
              <button
                className="btn-small btn-secondary"
                onClick={() => handleSelectAllClick()}
                >{t('form.embedded_content_review.button.mark_all')}</button>
            </div>
            <OptionFeedback
              t={t}
              feedbackArray={formErrors[FORM_OPTIONS.REVIEW_CONTENT]}
            />
          </>
        )}
      </div>

      {/* OPTION 2: Mark as Reviewed. ID: "MARK_AS_REVIEWED" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.MARK_AS_REVIEWED ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.MARK_AS_REVIEWED}
          labelText = {t('form.embedded_content_review.decision.alternative')}
        />
      </div>
    </>
  )
}