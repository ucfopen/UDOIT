import AltText from '../Components/Forms/AltText'
import AnchorText from '../Components/Forms/AnchorText'
// import AriaAttributeForm from '../Components/Forms/AriaAttributeForm'
import AriaRoleForm from '../Components/Forms/AriaRoleForm'
import BlockquoteForm from '../Components/Forms/BlockquoteForm'
import ContrastForm from '../Components/Forms/ContrastForm'
import EmbeddedContentTitleForm from '../Components/Forms/EmbeddedContentTitleForm'
import EmphasisForm from '../Components/Forms/EmphasisForm'
import HeadingEmptyForm from '../Components/Forms/HeadingEmptyForm'
import HeadingStyleForm from '../Components/Forms/HeadingStyleForm'
// import InputLabelForm from '../Components/Forms/InputLabelForm'
// import InvalidAttributeForm from '../Components/Forms/InvalidAttributeForm'
// import KeyboardTabbableForm from '../Components/Forms/KeyboardTabbableForm'
import LabelForm from '../Components/Forms/LabelForm'
import LanguageForm from '../Components/Forms/LanguageForm'
import LinkForm from '../Components/Forms/LinkForm'
import ListForm from '../Components/Forms/ListForm'
import MediaCaptionsForm from '../Components/Forms/MediaCaptionsForm'
// import MultiPartForm from '../Components/Forms/MultiPartForm'
import QuoteForm from '../Components/Forms/QuoteForm'
// import SelectValidIdForm from '../Components/Forms/SelectValidIdForm'
import SensoryMisuseForm from '../Components/Forms/SensoryMisuseForm'
import TableCaptionForm from '../Components/Forms/TableCaptionForm'
import TableHeadersForm from '../Components/Forms/TableHeadersForm'

import InlineCSSForm from '../Components/Forms/InlineCSSForm'

import UfixitReviewOnly from '../Components/Forms/UfixitReviewOnly'

// These form names strictly match the translation keys in the language files (e.g. en.json).
export const formNames = {
  ALT_TEXT: 'alt_text',
  ANCHOR_TEXT: 'anchor_text',
  ARIA_ATTRIBUTE: 'aria_attribute',
  ARIA_ROLE: 'aria_role',
  BLOCKQUOTE: 'blockquote',
  CONTRAST: 'contrast',
  EMBEDDED_CONTENT_TITLE: 'embedded_content_title',
  EMPHASIS: 'emphasis',
  HEADING_EMPTY: 'heading_empty',
  HEADING_STYLE: 'heading_style',
  INPUT_LABEL: 'input_label',
  INVALID_ATTRIBUTE: 'invalid_attribute',
  INVALID_CSS: 'invalid_css',
  KEYBOARD_TABBABLE: 'keyboard_tabbable',
  LABEL: 'label',
  LABEL_UNIQUE: 'label_unique',
  LANGUAGE: 'language',
  LINK: 'link',
  LIST: 'list',
  MEDIA_CAPTIONS: 'media_captions',
  MULTI_PART: 'multi_part',
  QUOTE: 'quote',
  SELECT_VALID_ID: 'select_valid_id',
  SENSORY_MISUSE: 'sensory_misuse',
  TABLE_CAPTION: 'table_caption',
  TABLE_HEADERS: 'table_headers',

  INLINE_CSS: 'inline_css',

  REVIEW_ONLY: 'review_only',
}

export const disabilityTypes = {
  COGNITIVE: 'cognitive',
  HEARING: 'hearing',
  LANGUAGE: 'language',
  MOTOR: 'motor',
  VISUAL: 'visual',
}

const formTypes = {
  [formNames.ALT_TEXT]: AltText,
  [formNames.ANCHOR_TEXT]: AnchorText,
  // [formNames.ARIA_ATTRIBUTE]: AriaAttributeForm,
  [formNames.ARIA_ROLE]: AriaRoleForm,
  [formNames.BLOCKQUOTE]: BlockquoteForm,
  [formNames.CONTRAST]: ContrastForm,
  [formNames.EMBEDDED_CONTENT_TITLE]: EmbeddedContentTitleForm,
  [formNames.EMPHASIS]: EmphasisForm,
  [formNames.HEADING_EMPTY]: HeadingEmptyForm,
  [formNames.HEADING_STYLE]: HeadingStyleForm,
  // [formNames.INPUT_LABEL]: InputLabelForm,
  // [formNames.INVALID_ATTRIBUTE]: InvalidAttributeForm,
  // [formNames.KEYBOARD_TABBABLE]: KeyboardTabbableForm,
  [formNames.LABEL]: LabelForm,
  [formNames.LABEL_UNIQUE]: LabelForm,
  [formNames.LANGUAGE]: LanguageForm,
  [formNames.LINK]: LinkForm,
  [formNames.LIST]: ListForm,
  [formNames.MEDIA_CAPTIONS]: MediaCaptionsForm,
  // [formNames.MULTI_PART]: MultiPartForm,
  [formNames.QUOTE]: QuoteForm,
  // [formNames.SELECT_VALID_ID]: SelectValidIdForm,
  [formNames.SENSORY_MISUSE]: SensoryMisuseForm,
  [formNames.TABLE_CAPTION]: TableCaptionForm,
  [formNames.TABLE_HEADERS]: TableHeadersForm,
  
  [formNames.INLINE_CSS]: InlineCSSForm,
  
  [formNames.REVIEW_ONLY]: UfixitReviewOnly,
}

// Using the formNames as the only values prevents typos and other errors.
const rulesToFormNameMap = {
  // phpAlly rules
  AnchorMustContainText: formNames.ANCHOR_TEXT,
  AnchorSuspiciousLinkText: formNames.ANCHOR_TEXT,
  BrokenLink: formNames.LINK,
  CssTextHasContrast: formNames.CONTRAST,
  CssTextStyleEmphasize: formNames.EMPHASIS,
  HeadersHaveText: formNames.HEADING_EMPTY,
  ImageAltIsDifferent: formNames.ALT_TEXT,
  ImageAltIsTooLong: formNames.ALT_TEXT,
  ImageAltNotEmptyInAnchor: formNames.ALT_TEXT,
  ImageHasAlt: formNames.ALT_TEXT,
  ImageHasAltDecorative: formNames.ALT_TEXT,
  ParagraphNotUsedAsHeader: formNames.HEADING_STYLE,
  RedirectedLink: formNames.LINK,
  TableDataShouldHaveTableHeader: formNames.TABLE_HEADERS,
  TableHeaderShouldHaveScope: formNames.TABLE_HEADERS,
  ImageAltNotPlaceholder: formNames.ALT_TEXT,
  VideoCaptionsMatchCourseLanguage: formNames.MEDIA_CAPTIONS,
  VideosEmbeddedOrLinkedNeedCaptions: formNames.MEDIA_CAPTIONS,
  VideosHaveAutoGeneratedCaptions: formNames.MEDIA_CAPTIONS,

  // Equal Access Rules
  aria_graphic_labelled: formNames.ALT_TEXT,
  aria_img_labelled: formNames.ALT_TEXT,
  canvas_content_described: formNames.ALT_TEXT,
  imagebutton_alt_exists: formNames.ALT_TEXT,
  imagemap_alt_exists: formNames.ALT_TEXT,
  img_alt_background: formNames.ALT_TEXT,
  img_alt_decorative: formNames.ALT_TEXT,
  img_alt_misuse: formNames.ALT_TEXT,
  img_alt_null: formNames.ALT_TEXT,
  img_alt_redundant: formNames.ALT_TEXT,
  img_alt_valid: formNames.ALT_TEXT,
  img_ismap_misuse: formNames.ALT_TEXT,
  style_background_decorative: formNames.ALT_TEXT,

  a_text_purpose: formNames.ANCHOR_TEXT,
  area_alt_exists: formNames.ANCHOR_TEXT,
  
  // aria_attribute_allowed: formNames.ARIA_ATTRIBUTE,
  // aria_attribute_conflict: formNames.ARIA_ATTRIBUTE,
  // aria_attribute_exists: formNames.ARIA_ATTRIBUTE,
  // aria_attribute_required: formNames.ARIA_ATTRIBUTE,
  // aria_attribute_value_valid: formNames.ARIA_ATTRIBUTE,

  aria_role_valid: formNames.ARIA_ROLE,
  aria_role_allowed: formNames.ARIA_ROLE,

  blockquote_cite_exists: formNames.BLOCKQUOTE,

  text_contrast_sufficient: formNames.CONTRAST,
  
  applet_alt_exists: formNames.EMBEDDED_CONTENT_TITLE,
  embed_alt_exists: formNames.EMBEDDED_CONTENT_TITLE,
  frame_title_exists: formNames.EMBEDDED_CONTENT_TITLE,
  media_alt_brief: formNames.EMBEDDED_CONTENT_TITLE,
  media_alt_exists: formNames.EMBEDDED_CONTENT_TITLE,
  object_text_exists: formNames.EMBEDDED_CONTENT_TITLE,

  style_color_misuse: formNames.EMPHASIS,

  heading_content_exists: formNames.HEADING_EMPTY,

  heading_markup_misuse: formNames.HEADING_STYLE,
  text_block_heading: formNames.HEADING_STYLE,

  // input_label_after: formNames.INPUT_LABEL,
  // input_label_before: formNames.INPUT_LABEL,
  // input_label_exists: formNames.INPUT_LABEL,
  // input_label_visible: formNames.INPUT_LABEL,
  // label_content_exists: formNames.INPUT_LABEL,

  // aria_attribute_redundant: formNames.INVALID_ATTRIBUTE,
  // combobox_autocomplete_valid: formNames.INVALID_ATTRIBUTE,
  // combobox_haspopup_valid: formNames.INVALID_ATTRIBUTE,
  // dir_attribute_valid: formNames.INVALID_ATTRIBUTE,
  // input_autocomplete_valid: formNames.INVALID_ATTRIBUTE,
  // input_haspopup_conflict: formNames.INVALID_ATTRIBUTE,
  // table_aria_descendants: formNames.INVALID_ATTRIBUTE,
  // table_scope_valid: formNames.INVALID_ATTRIBUTE,

  // text_spacing_valid: formNames.INVALID_CSS,

  // aria_activedescendant_tabindex_valid: formNames.KEYBOARD_TABBABLE,
  // element_scrollable_tabbable: formNames.KEYBOARD_TABBABLE,
  // element_tabbable_role_valid: formNames.KEYBOARD_TABBABLE,
  // iframe_interactive_tabbable: formNames.KEYBOARD_TABBABLE,

  aria_accessiblename_exists: formNames.LABEL,
  aria_application_labelled: formNames.LABEL,
  aria_complementary_labelled: formNames.LABEL,
  aria_region_labelled: formNames.LABEL,
  aria_widget_labelled: formNames.LABEL,
  element_accesskey_labelled: formNames.LABEL,
  label_name_visible: formNames.LABEL,

  aria_application_label_unique: formNames.LABEL_UNIQUE,
  aria_article_label_unique: formNames.LABEL_UNIQUE,
  aria_banner_label_unique: formNames.LABEL_UNIQUE,
  aria_complementary_label_unique: formNames.LABEL_UNIQUE,
  aria_contentinfo_label_unique: formNames.LABEL_UNIQUE,
  aria_document_label_unique: formNames.LABEL_UNIQUE,
  aria_form_label_unique: formNames.LABEL_UNIQUE,
  aria_landmark_name_unique: formNames.LABEL_UNIQUE,
  aria_main_label_unique: formNames.LABEL_UNIQUE,
  aria_navigation_label_unique: formNames.LABEL_UNIQUE,
  aria_region_label_unique: formNames.LABEL_UNIQUE,
  aria_search_label_unique: formNames.LABEL_UNIQUE,
  aria_toolbar_label_unique: formNames.LABEL_UNIQUE,
  form_label_unique: formNames.LABEL_UNIQUE,

  // element_lang_valid: formNames.LANGUAGE,
  // html_lang_exists: formNames.LANGUAGE,
  // html_lang_valid: formNames.LANGUAGE,

  element_lang_valid: formNames.LANGUAGE,
  html_lang_exists: formNames.LANGUAGE,
  html_lang_valid: formNames.LANGUAGE,

  list_children_valid: formNames.LIST,
  list_markup_review: formNames.LIST,
  list_structure_proper: formNames.LIST,

  caption_track_exists: formNames.MEDIA_CAPTIONS,
  media_audio_transcribed: formNames.MEDIA_CAPTIONS,
  media_live_captioned: formNames.MEDIA_CAPTIONS,
  media_track_available: formNames.MEDIA_CAPTIONS,

  // aria_child_valid: formNames.MULTI_PART,
  // aria_parent_required: formNames.MULTI_PART,
  // fieldset_label_valid: formNames.MULTI_PART,
  // fieldset_legend_valid: formNames.MULTI_PART,
  // figure_label_exists: formNames.MULTI_PART,
  // table_caption_nested: formNames.MULTI_PART,

  // aria_complementary_label_visible: formNames.SELECT_VALID_ID,
  // aria_id_unique: formNames.SELECT_VALID_ID,
  // aria_main_label_visible: formNames.SELECT_VALID_ID,
  // combobox_popup_reference: formNames.SELECT_VALID_ID,
  // error_message_exists: formNames.SELECT_VALID_ID,
  // input_placeholder_label_visible: formNames.SELECT_VALID_ID,
  // label_ref_valid: formNames.SELECT_VALID_ID,
  // table_headers_ref_valid: formNames.SELECT_VALID_ID,

  table_caption_empty: formNames.TABLE_CAPTION,

  table_headers_exists: formNames.TABLE_HEADERS,
  table_structure_misuse: formNames.TABLE_HEADERS,

  text_sensory_misuse: formNames.SENSORY_MISUSE,
  text_spacing_valid: formNames.INLINE_CSS
}

/* When a REVIEW_ONLY rule uses the same summary as another rule, add it here.
   The key is the name of the rule, and the value is the en.json translation that should be used. */
export const sharedRuleSummaries = {
  blink_elem_deprecated: 'rule.summary.blink_css_review',
  combobox_active_descendant: 'rule.summary.aria_activedescendant_valid',
  combobox_design_valid: 'rule.summary.aria_activedescendant_valid',
  combobox_focusable_elements: 'rule.summary.aria_activedescendant_valid',
  element_mouseevent_keyboard: 'rule.summary.aria_keyboard_handler_exists',
  form_font_color: 'form.emphasis.summary',
  form_submit_review: 'rule.summary.form_submit_button_exists',
  input_fields_grouped: 'rule.summary.input_checkboxes_grouped',
  input_onchange_review: 'rule.summary.form_interaction_review',
  meta_refresh_delay: 'rule.summary.meta_redirect_optional', 
  select_options_grouped: 'rule.summary.input_checkboxes_grouped',
  noembed_content_exists: 'rule.summary.embed_noembed_exists',
  page_title_valid: 'rule.summary.page_title_exists',
  script_onclick_misuse: 'rule.summary.script_focus_blur_review',
  script_select_review: 'rule.summary.script_focus_blur_review',
  skip_main_described: 'rule.summary.html_skipnav_exists',
  skip_main_exists: 'rule.summary.html_skipnav_exists',
  style_viewport_resizable: 'rule.summary.meta_viewport_zoomable',
}

/* When a REVIEW_ONLY rule uses the same description as another rule, add it here.
   The key is the name of the rule, and the value is the en.json translation that should be used. */
export const sharedRuleDescriptions = {
  aria_banner_single: 'form.label.learn_more',
  aria_child_tabbable: 'form.keyboard_tabbable.learn_more',
  aria_contentinfo_single: 'form.label.learn_more',
  aria_keyboard_handler_exists: 'rule.desc.element_tabbable_visible',
  blink_elem_deprecated: 'rule.desc.blink_css_review',
  combobox_active_descendant: 'rule.desc.aria_activedescendant_valid',
  combobox_design_valid: 'rule.desc.aria_activedescendant_valid',
  combobox_focusable_elements: 'rule.desc.aria_activedescendant_valid',
  element_mouseevent_keyboard: 'rule.desc.aria_keyboard_handler_exists',
  form_font_color: 'form.emphasis.learn_more',
  form_submit_review: 'rule.desc.form_submit_button_exists',
  input_fields_grouped: 'rule.desc.input_checkboxes_grouped',
  input_onchange_review: 'rule.desc.form_interaction_review',
  meta_refresh_delay: 'rule.desc.meta_redirect_optional',
  select_options_grouped: 'rule.desc.input_checkboxes_grouped',
  noembed_content_exists: 'rule.desc.embed_noembed_exists',
  page_title_valid: 'rule.desc.page_title_exists',
  script_onclick_misuse: 'rule.desc.script_focus_blur_review',
  script_select_review: 'rule.desc.script_focus_blur_review',
  skip_main_described: 'rule.desc.html_skipnav_exists',
  skip_main_exists: 'rule.desc.html_skipnav_exists',
  style_viewport_resizable: 'rule.desc.meta_viewport_zoomable',
  widget_tabbable_single: 'rule.desc.widget_tabbable_exists'
}

export function formFromIssue(activeIssue) {
  if (activeIssue) {
    const ruleId = activeIssue.scanRuleId
    // Get the form name based on the ruleId
    if (rulesToFormNameMap.hasOwnProperty(ruleId)) {
      const formName = rulesToFormNameMap[ruleId]
      // Get the form component based on the form name
      if (formTypes.hasOwnProperty(formName)) {
        return formTypes[formName]
      }
    }
  }
  return UfixitReviewOnly
}

export function formNameFromRule(ruleId) {
  
  if (rulesToFormNameMap.hasOwnProperty(ruleId)) {
    return rulesToFormNameMap[ruleId]
  }

  // If the ruleId is not found, return a default form name
  return formNames.REVIEW_ONLY
}

export function disabilitiesFromRule(ruleId) {
  let disabilities = []
  if (rulesToFormNameMap.hasOwnProperty(ruleId)) {
    let formName = rulesToFormNameMap[ruleId]
    switch (formName) {
      case formNames.ALT_TEXT:
      case formNames.ARIA_ATTRIBUTE:
      case formNames.ARIA_ROLE:
      case formNames.CONTRAST:
        disabilities = [disabilityTypes.VISUAL]
        break
      case formNames.KEYBOARD_TABBABLE:
        disabilities = [disabilityTypes.MOTOR, disabilityTypes.VISUAL]
        break
      case formNames.ANCHOR_TEXT:
      case formNames.BLOCKQUOTE:
      case formNames.EMBEDDED_CONTENT_TITLE:
      case formNames.EMPHASIS:
      case formNames.HEADING_EMPTY:
      case formNames.HEADING_STYLE:
      case formNames.INPUT_LABEL:
      case formNames.INVALID_CSS:
      case formNames.LABEL:
      case formNames.LABEL_UNIQUE:
        disabilities = [disabilityTypes.COGNITIVE, disabilityTypes.VISUAL]
        break
      case formNames.LANGUAGE:
        disabilities = [disabilityTypes.COGNITIVE, disabilityTypes.LANGUAGE, disabilityTypes.VISUAL]
        break
      case formNames.LINK:
      case formNames.LIST:
      case formNames.QUOTE:
      case formNames.SELECT_VALID_ID:
      case formNames.TABLE_CAPTION:
      case formNames.TABLE_HEADERS:
        disabilities = [disabilityTypes.COGNITIVE, disabilityTypes.VISUAL]
        break
      case formNames.INVALID_ATTRIBUTE:
      case formNames.MULTI_PART:
        disabilities = [disabilityTypes.COGNITIVE, disabilityTypes.MOTOR, disabilityTypes.VISUAL]
        break
      case formNames.LANGUAGE:
      case formNames.SENSORY_MISUSE:
        disabilities = [disabilityTypes.COGNITIVE, disabilityTypes.LANGUAGE, disabilityTypes.VISUAL]
        break
      case formNames.MEDIA_CAPTIONS:
        disabilities = [disabilityTypes.COGNITIVE, disabilityTypes.HEARING, disabilityTypes.LANGUAGE, disabilityTypes.VISUAL]        
        break
      default:
        disabilities = []
        break
    }
    return disabilities
  } else {
    switch (ruleId) {
      case 'aria_activedescendant_valid':
      case 'aria_hidden_nontabbable':
      case 'combobox_active_descendant':
      case 'combobox_design_valid':
      case 'combobox_focusable_elements':
      case 'embed_noembed_exists':
      case 'img_longdesc_misuse':
      case 'meta_viewport_zoomable':
      case 'noembed_content_exists':
      case 'page_title_exists':
      case 'page_title_valid':
      case 'style_background_decorative':
      case 'style_highcontrast_visible':
      case 'style_viewport_resizable':
      case 'table_headers_related':
      case 'table_summary_redundant':
        disabilities = [disabilityTypes.VISUAL]
        break
      case 'a_target_warning':
      case 'aria_banner_single':
      case 'blink_css_review':
      case 'blink_elem_deprecated':
      case 'form_font_color':
      case 'form_submit_button_exists':
      case 'form_submit_review':
      case 'input_onchange_review':
      case 'marquee_elem_avoid':
      case 'media_autostart_controllable':
      case 'table_layout_linearized':
        disabilities = [disabilityTypes.COGNITIVE, disabilityTypes.VISUAL]
        break
      case 'application_content_accessible':
      case 'aria_banner_single':
      case 'aria_child_tabbable':
      case 'aria_content_in_landmark':
      case 'aria_contentinfo_misuse':
      case 'aria_contentinfo_single':
      case 'aria_eventhandler_role_valid':
      case 'aria_keyboard_handler_exists':
      case 'download_keyboard_controllable':
      case 'element_mouseevent_keyboard':
      case 'element_orientation_unlocked':
      case 'frame_src_valid':
      case 'html_skipnav_exists':
      case 'input_checkboxes_grouped':
      case 'input_fields_grouped':
      case 'media_keyboard_controllable':
      case 'select_options_grouped':
      case 'skip_main_described':
      case 'skip_main_exists':
      case 'style_focus_visible':
      case 'widget_tabbable_exists':
      case 'widget_tabbable_single':
        disabilities = [disabilityTypes.MOTOR, disabilityTypes.VISUAL]
        break
      case 'aria_descendant_valid':
      case 'element_tabbable_visible':
      case 'form_interaction_review':
      case 'meta_redirect_optional':
      case 'meta_refresh_delay':
      case 'script_focus_blur_review':
      case 'script_onclick_misuse':
      case 'script_select_review':
      case 'style_hover_persistent':
        disabilities = [disabilityTypes.COGNITIVE, disabilityTypes.MOTOR, disabilityTypes.VISUAL]
        break
      case 'text_whitespace_valid':
        disabilities = [disabilityTypes.COGNITIVE, disabilityTypes.LANGUAGE, disabilityTypes.VISUAL]
      default:
        disabilities = []
        break
    }
    return disabilities
  }
}