<?php 
/**
*    QUAIL - QUAIL Accessibility Information Library
*    Copyright (C) 2009 Kevin Miller
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*	@author Kevin Miller <kemiller@csumb.edu>
*/

/** \addtogroup guidelines */
/*@{*/

/**
*	WCAG 2.0 Level AA Guideline
*/
class Wcag2aaGuideline extends quailGuideline{

	/**
	*	@var array An array of test class names which will be called for this guideline
	*/	
	var $tests = array(
		'imgHasAlt',
		'imgAltIsDifferent',
		'imgAltIsTooLong',
		'imgAltNotPlaceHolder',
		'imgAltNotEmptyInAnchor',
		'imgHasLongDesc',
		'imgAltIsSameInText',
		'imgAltEmptyForDecorativeImages',
		'appletContainsTextEquivalentInAlt',
		'appletContainsTextEquivalent',
		'inputImageHasAlt',
		'inputImageAltIdentifiesPurpose',
		'inputImageAltIsShort',
		'inputImageAltIsNotPlaceholder',
		'areaHasAltValue',
		'areaAltIdentifiesDestination',
		'areaLinksToSoundFile',
		'objectMustContainText',
		'embedHasAssociatedNoEmbed',
		'inputImageNotDecorative',
		'areaAltRefersToText',
		'inputElementsDontHaveAlt',
		'aLinksToSoundFilesNeedTranscripts',
		'aLinksToMultiMediaRequireTranscript',
		'inputTextHasLabel',
		'pNotUsedAsHeader',
		'selectHasAssociatedLabel',
		'textareaHasAssociatedLabel',
		'textareaLabelPositionedClose',
		'tableComplexHasSummary',
		'tableSummaryIsEmpty',
		'tableLayoutHasNoSummary',
		'tableLayoutHasNoCaption',
		'passwordHasLabel',
		'checkboxHasLabel',
		'fileHasLabel',
		'radioHasLabel',
		'passwordLabelIsNearby',
		'checkboxLabelIsNearby',
		'fileLabelIsNearby',
		'radioLabelIsNearby',
		'tableDataShouldHaveTh',
		'tableLayoutDataShouldNotHaveTh',
		'tableUsesCaption',
		'preShouldNotBeUsedForTabularLayout',
		'radioMarkedWithFieldgroupAndLegend',
		'tableSummaryDescribesTable',
		'tableIsGrouped',
		'tableUseColGroup',
		'tabularDataIsInTable',
		'tableCaptionIdentifiesTable',
		'tableSummaryDoesNotDuplicateCaption',
		'tableWithBothHeadersUseScope',
		'tableWithMoreHeadersUseID',
		'inputCheckboxRequiresFieldset',
		'documentVisualListsAreMarkedUp',
		'documentReadingDirection',
		'tableLayoutMakesSenseLinearized',
		'appletUIMustBeAccessible',
		'objectInterfaceIsAccessible',
		'scriptUIMustBeAccessible',
		'scriptOndblclickRequiresOnKeypress',
		'scriptOnmousedownRequiresOnKeypress',
		'scriptOnmousemove',
		'scriptOnmouseoutHasOnmouseblur',
		'scriptOnmouseoverHasOnfocus',
		'scriptOnmouseupHasOnkeyup',
		'documentMetaNotUsedWithTimeout',
		'imgGifNoFlicker',
		'appletsDoNotFlicker',
		'objectDoesNotFlicker',
		'scriptsDoNotFlicker',
		'skipToContentLinkProvided',
		'framesHaveATitle',
		'frameTitlesDescribeFunction',
		'documentWordsNotInLanguageAreMarked',
		'documentLangNotIdentified',
		'documentLangIsISO639Standard',
		'areaDontOpenNewWindow',
		'selectDoesNotChangeContext',
		'documentIDsMustBeUnique',
		'objectShouldHaveLongDescription',
		'blinkIsNotUsed',
		'marqueeIsNotUsed',
		'documentAutoRedirectNotUsed',
		'documentHasTitleElement',
		'documentTitleNotEmpty',
		'documentTitleIsShort',
		'documentTitleIsNotPlaceholder',
		'documentTitleDescribesDocument',
		'appletProvidesMechanismToReturnToParent',
		'objectProvidesMechanismToReturnToParent',
		'embedProvidesMechanismToReturnToParent',
		'imgAltIsSameInText',
		'boldIsNotUsed',
		'iIsNotUsed',
		'basefontIsNotUsed',
		'fontIsNotUsed',
		'bodyColorContrast',
		'bodyLinkColorContrast',
		'bodyActiveLinkColorContrast',
		'bodyVisitedLinkColorContrast',
		'imgNotReferredToByColorAlone',
		'appletsDoneUseColorAlone',
		'inputDoesNotUseColorAlone',
		'objectDoesNotUseColorAlone',
		'scriptsDoNotUseColorAlone',
		'documentAllColorsAreSet',
		'aLinksMakeSenseOutOfContext',
		'aSuspiciousLinkText',
		'aMustContainText',
		'siteMap',
		'headerH1',
		'headerH2',
		'headerH3',
		'headerH4',
		'headerH4',
		'headerH1Format',
		'headerH2Format',
		'headerH3Format',
		'headerH4Format',
		'headerH5Format',
		'headerH6Format',
		'tabIndexFollowsLogicalOrder',
		'listNotUsedForFormatting',
		'blockquoteNotUsedForIndentation',
		'blockquoteUseForQuotations',
		'labelMustBeUnique',
		'labelMustNotBeEmpty',
		'formWithRequiredLabel',
		'formHasGoodErrorMessage',
		'formErrorMessageHelpsUser',
		'formDeleteIsReversable',
		'svgContainsTitle',
		'cssTextHasContrast',
		'headersHaveText',
	);
}
/*@}*/