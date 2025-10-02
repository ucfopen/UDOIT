import React, { useEffect, useState } from 'react'
import * as Html from '../../Services/Html'
import FormSaveOrReview from './FormSaveOrReview'


const AriaLabelVisible = ({
  t,
  settings,
  activeIssue,
  handleIssueSave,
  isDisabled,
  handleActiveIssue,
  markAsReviewed,
  setMarkAsReviewed,
  previewInfo
}) => {

  const [inputErrors, setInputErrors] = useState([])

  useEffect(() => {
      if(!activeIssue){
          return
        }
      setInputErrors([])

    }, [activeIssue])

    useEffect(() => {
      updateActiveHtml()
      checkFormErrors()
    }, [previewInfo])

    const updateActiveHtml = () => {      
      const html = Html.getIssueHtml(activeIssue)
      let element = Html.toElement(html)
  
      element = Html.removeAttribute(element, 'aria-label')
      element = Html.setAttribute(element, 'aria-labelledby', previewInfo.aria_complementary_id); 
      
      let issue = activeIssue
      issue.newHtml = Html.toString(element)

      handleActiveIssue(issue)
      
    }

    const checkFormErrors = () => {
      let tempErrors = []
      if(!previewInfo.aria_complementary_id){
        tempErrors.push({text: "No ID", type: "error"})
      }

      setInputErrors(tempErrors)
    }

    const handleSubmit = () => {
       if(inputErrors.length == 0){
          handleIssueSave(activeIssue)
       }
    }

  return (
    <FormSaveOrReview 
        t={t}
            settings={settings}
            activeIssue={activeIssue}
            isDisabled={isDisabled}
            handleSubmit={handleSubmit}
            formErrors={inputErrors}
            markAsReviewed={markAsReviewed}
            setMarkAsReviewed={setMarkAsReviewed}
        />
  )
}

export default AriaLabelVisible