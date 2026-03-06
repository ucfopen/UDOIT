import React, { useEffect, useState } from 'react'
import * as Html from '../../Services/Html'
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from '../Widgets/OptionFeedback'
import DeleteIcon from '../Icons/DeleteIcon'
import './SelectValidIdForm.css'

export default function SelectValidIdForm ({
  t,
  settings,
  activeIssue,
  activeContentItem,
  handleActiveContentItem,
  isDisabled,
  handleActiveIssue,
  clickedInfo,
  setClickedInfo,
  setElementFocus,
  activeOption,
  setActiveOption,
  formErrors,
  setFormErrors,
  setPreviewData
}) {

  const FORM_OPTIONS = {
    EDIT_ATTRIBUTE: settings.UFIXIT_OPTIONS.EDIT_ATTRIBUTE,
    MARK_AS_REVIEWED: settings.UFIXIT_OPTIONS.MARK_AS_REVIEWED
  }

  /* 
    This holds an array of objects that look like the following:
    {
      attribute: Specifying what attribute it holds the IDs for
      selected: Shows if this the attribute selected or not for editing HTML
      idStorage: [] Array of all Ids 
      deactivated: Shows if user disabled this attribute which would prevent it from being used in the final save
    }
  */
  const [attributeId, setAttributeId] = useState([]) // add typescript pleaseeeeeeeeee
  const [idXpathMap, setIdXpathMap] = useState({}) // This will map each id to its each xpath AND the inner text {xpath, innerText}
  const [originalContentItem, setOriginalContentItem] = useState(null)
  const [liveMessage, setLiveMessage] = useState('')

  useEffect(() => {
    if(!activeIssue){
      return
    }

    setClickedInfo({})
    const html = Html.getIssueHtml(activeIssue) 
    const aria_attributes = Html.getAriaAttributes(html)
    const tempAttributeId = []
    const tempIDXpathMap = {}

    aria_attributes.forEach((attribute, i) => {
      const ariaValue = Html.getAttribute(html, attribute)
      const response = getValidIdFromHtml(ariaValue)
      if (!response){
        return
      }
      const ariaIds = response.validatedIds
      for (const [key, value] of Object.entries(response.validatedIdXpathMap)) {
        tempIDXpathMap[key] = value
      }
      tempAttributeId.push({
        attribute: (activeIssue.scanRuleId == "aria_complementary_label_visible") ? "aria-labelledby" : attribute,
        selected: (activeIssue.scanRuleId == "aria_complementary_label_visible") || (i == 0),
        idStorage: ariaIds,
        deactivated: false
      })
    })
    setAttributeId(tempAttributeId)
    setIdXpathMap(tempIDXpathMap)
    setPreviewData({
      attributeId: tempAttributeId,
      idXpathMap: tempIDXpathMap
    })
    setOriginalContentItem(activeContentItem)
    setFormErrors([])

    const fixed = activeIssue.newHtml && (activeIssue.status === 1 || activeIssue.status === 3)
    const reviewed = activeIssue.newHtml && (activeIssue.status === 2 || activeIssue.status === 3)
    let startingOption = ''

    if (reviewed){
      startingOption = FORM_OPTIONS.MARK_AS_REVIEWED
    }
    if (fixed) {
      startingOption = FORM_OPTIONS.EDIT_ATTRIBUTE
    }
    setActiveOption(startingOption)

  }, [activeIssue])


  useEffect(() => {
    if (!clickedInfo || Object.keys(clickedInfo).length == 0 || activeOption !== FORM_OPTIONS.EDIT_ATTRIBUTE) {
      return
    }

    const tempAttributeIdItem = JSON.parse(JSON.stringify(attributeId))
    const tempIdXpathMap = JSON.parse(JSON.stringify(idXpathMap)) 
    tempIdXpathMap[clickedInfo.id] = {xpath: clickedInfo.xpath, innerText: clickedInfo.inner_text} 

    tempAttributeIdItem.forEach((attribute) => {
      if (attribute.selected && !attribute.deactivated) {
        if (clickedInfo.class_selected) {
          attribute.idStorage = attribute.idStorage.filter((id) => id != clickedInfo.id)
        }
        else {
          attribute.idStorage.push(clickedInfo.id)
        }
      }
    })

    setIdXpathMap(tempIdXpathMap)
    setAttributeId(tempAttributeIdItem)
    setPreviewData({
      attributeId: tempAttributeIdItem,
      idXpathMap: tempIdXpathMap
    })
    setElementFocus(true)
  }, [clickedInfo])

  useEffect(() => {
    handleActiveContentItem(addIdsToContent())
    checkFormErrors()
  }, [activeOption, attributeId])

  const getValidIdFromHtml = (stringifedID) => {
    if(!activeContentItem?.body || !stringifedID){
      return null
    }
    
    const tempIdArray = stringifedID.split(" ")
    if(!tempIdArray || tempIdArray.length == 0){
      return null
    }

    const fullPageHtml = activeContentItem.body
    const parser = new DOMParser()
    const doc = parser.parseFromString(fullPageHtml, "text/html")
    let validatedIds = []
    let validatedIdXpathMap = {}

    tempIdArray.forEach((tempId) => {
      const element = doc.getElementById(tempId)
      if(element){
        const xpath = Html.findXpathFromElement(element)
        const innerText = Html.getInnerText(element)   
        validatedIds.push(tempId)
        validatedIdXpathMap[tempId] = {xpath: xpath, innerText: innerText}
      } 
    })

    const response = { validatedIds: validatedIds?.length > 0 ? validatedIds : [], validatedIdXpathMap: validatedIdXpathMap }
    return response
  }

  const addIdsToContent = () => {
    let issue = activeIssue
    issue.isModified = true

    if (activeOption === FORM_OPTIONS.MARK_AS_REVIEWED) {
      issue.newHtml = issue.initialHtml
      handleActiveIssue(issue)
      handleActiveContentItem(originalContentItem)
      return
    }

    let tempActiveContentItem = JSON.parse(JSON.stringify(activeContentItem))
    let fullPageHtml = tempActiveContentItem?.body
    if(!fullPageHtml){
      return
    }

    const parser = new DOMParser()
    const doc = parser.parseFromString(fullPageHtml, 'text/html')
    let errorElement = Html.findElementWithXpath(doc, activeIssue.xpath)

    attributeId.forEach((attribute) => {
      if(!attribute.deactivated && attribute.idStorage){
        if(activeIssue.scanRuleId == "aria_complementary_label_visible"){
          errorElement = Html.removeAttribute(errorElement, "aria-label")
        }
        let stringifiedID = attribute?.idStorage?.length > 0 ? attribute.idStorage.join(" ") : ""
        errorElement = Html.setAttribute(errorElement, attribute.attribute, stringifiedID)
        attribute.idStorage.forEach((id) => {
          if(id.includes("-udoit-clickable-id")){
            const element = Html.findElementWithXpath(doc, idXpathMap[id].xpath)
            element.setAttribute("id", id)
          }   
        })
      }
      else if(attribute.deactivated){
        errorElement = Html.removeAttribute(errorElement, attribute.attribute)
      }
    })

    tempActiveContentItem.body = Html.toString(doc.body)
    issue.newHtml = Html.toString(errorElement)
    return tempActiveContentItem
  }
  
  // const addPreviewClassesToContent = () => {
  //     let tempActiveContentItem = addIdsToContent()
  //     let fullPageHtml = tempActiveContentItem?.body
  //     if(!fullPageHtml){
  //         return
  //     }
  //     const parser = new DOMParser()
  //     const doc = parser.parseFromString(fullPageHtml, 'text/html')

  //     attributeId.forEach((attribute) => {
  //         if(attribute?.selected && !attribute.deactivated){
  //             const idsPointedToByAttribute = attribute.idStorage?.length > 0 ? attribute.idStorage : []
  //             idsPointedToByAttribute?.forEach((id) => {
  //                 if(id){
  //                     const element = Html.findElementWithXpath(doc, idXpathMap[id].xpath)
  //                     element.classList.add("ufixit-temp-selected")
  //                 }
  //             })
  //         }
  //     })

  //     tempActiveContentItem.body = Html.toString(doc.body)
  //     handleActiveContentItem(tempActiveContentItem)
  // }

  const handleAttributeSelect = (selectedVal) => {
    const tempAttributes = JSON.parse(JSON.stringify(attributeId))
    tempAttributes.forEach((attribute) => {
      attribute.selected = (attribute.attribute == selectedVal)
    })
    setAttributeId(tempAttributes)
    setElementFocus(false)
    setLiveMessage(t('form.select_valid_id.live_msg', {selectedAttribute: selectedVal}))
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.EDIT_ATTRIBUTE]: [],
    }

    if(activeOption === FORM_OPTIONS.EDIT_ATTRIBUTE){
      for(const attribute of attributeId){
        if(attribute.deactivated){
          continue
        }
        if(attribute?.idStorage?.length == 0){
          tempErrors[FORM_OPTIONS.EDIT_ATTRIBUTE].push({text: t("form.select_valid_id.error_msg"), type: "error"})
          break
        }
      }
    }
    setFormErrors(tempErrors)
  }

  const removeIDFromAttribute = (id) => {
    let tempAttributeId = JSON.parse(JSON.stringify(attributeId))
    for(let attribute of tempAttributeId){
      if(attribute.selected){
        attribute.idStorage = attribute.idStorage.filter((storedId) => storedId != id)
        break;
      }
    }
    setAttributeId(tempAttributeId)
  }

  const handleRemoveAttribute = (clickedAttribute) => {
    let tempAttributeId = JSON.parse(JSON.stringify(attributeId))
    for(let attribute of tempAttributeId){
      if(attribute.attribute == clickedAttribute.attribute){
        if(attribute.deactivated){
          attribute.deactivated = false
          tempAttributeId.forEach((attr) => {
            attr.selected = (attr.attribute == attribute.attribute)
          })
        }
        else{
          attribute.deactivated = true
          attribute.selected = false
        }
      }
    }
    setAttributeId(tempAttributeId)
    setElementFocus(false)
  }

  return (
    <>
      {/* OPTION 1: Add text. ID: "EDIT_ATTRIBUTE" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.EDIT_ATTRIBUTE ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.EDIT_ATTRIBUTE}
          labelText = {t('form.select_valid_id.label.assign')}
          />

        { activeOption === FORM_OPTIONS.EDIT_ATTRIBUTE && (
          <>
            <div className='mb-2'>{t("form.select_valid_id.instructions")}</div> 
            <label htmlFor='attributeSelectInput' className='instructions'>{t("form.select_valid_id.select_attribute_instruction")}</label>
            <div className='all-attribute-container'>
              {attributeId.map((attribute, index) => (
                <div key={index} className='attribute-container'>
                <div className='attribute-header'>
                  <label>
                    <input
                    type="radio"
                    disabled={attribute.deactivated}
                    name="main-attribute"
                    checked={attribute.selected}
                    tabIndex='0'
                    onChange={() => handleAttributeSelect(attribute.attribute)}
                    />
                    <span className={`attribute-label  ${attribute.deactivated ? `deactivated`: ``}`}>{attribute.attribute}</span>
                  </label>
                  { activeIssue.scanRuleId == "aria_complementary_label_visible" ? (
                    <div className="instructions">{t("form.select_valid_id.label.required")}</div>
                  ) : (
                    <button onClick={() => handleRemoveAttribute(attribute)}>{attribute.deactivated ? t("form.select_valid_id.use_attribute") : t("form.select_valid_id.remove_attribute")}</button>
                  )}
                </div>
                  {attribute.selected && (
                    <div className='attribute-id-list'>
                      {attribute.idStorage.map((id, i) => (
                        <div key={i} className='attribute-id'>
                          <p className='truncate-inner-text'>{idXpathMap[id].innerText}</p>
                          <button
                            className='btn-icon-only btn-link align-self-center remove-id-button'
                            alt={t("form.select_valid_id.remove")}
                            title={t("form.select_valid_id.remove")}
                            onClick={() => removeIDFromAttribute(id)}>
                              <DeleteIcon className="icon-md"/>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.EDIT_ATTRIBUTE]} />
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
          labelText = {t('fix.label.no_changes')}
          />
      </div>

      <div className='off-screen' aria-live='polite' aria-atomic='true'>{liveMessage}</div>
    </>
  )
}