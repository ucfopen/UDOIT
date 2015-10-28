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
*	WCAG 1.0 Level AA Guideline
*/
class Wcag1aaGuideline extends quailGuideline{

	/**
	*	@var array An array of test class names which will be called for this guideline
	*/	
	var $tests = array(
		'imgHasAlt',
		'imgNonDecorativeHasAlt',
		'imgImportantNoSpacerAlt',
		'imgHasLongDesc',
		'imgAltIsSameInText',
		'aLinksToSoundFilesNeedTranscripts',
		'aLinksToMultiMediaRequireTranscript',
		'appletContainsTextEquivalentInAlt',
		'frameRelationshipsMustBeDescribed',
		'inputImageHasAlt',
		'inputImageAltIdentifiesPurpose',
		'areaHasAltValue',
		'areaAltIdentifiesDestination',
		'areaLinksToSoundFile',
		'objectTextUpdatesWhenObjectChanges',
		'objectContentUsableWhenDisabled',
		'objectLinkToMultimediaHasTextTranscript',
		'objectMustHaveTitle',
		'objectMustHaveValidTitle',
		'objectMustContainText',
		'objectWithClassIDHasNoText',
		'imageMapServerSide',
		'imgNotReferredToByColorAlone',
		'appletsDoneUseColorAlone',
		'objectDoesNotUseColorAlone',
		'scriptsDoNotUseColorAlone',
		'documentWordsNotInLanguageAreMarked',
		'tableDataShouldHaveTh',
		'cssDocumentMakesSenseStyleTurnedOff',
		'documentContentReadableWithoutStylesheets',
		'objectTextUpdatesWhenObjectChanges',
		'objectWithClassIDHasNoText',
		'appletContainsTextEquivalent',
		'objectContentUsableWhenDisabled',
		'objectUIMustBeAccessible',
		'imgGifNoFlicker',
		'appletsDoNotFlicker',
		'objectDoesNotFlicker',
		'scriptsDoNotFlicker',
		'appletUIMustBeAccessible',
		'objectInterfaceIsAccessible',
		'scriptUIMustBeAccessible',
		'imgWithMapHasUseMap',
		'framesHaveATitle',
		'frameTitlesDescribeFunction',
		'imgWithMathShouldHaveMathEquivalent',
		'documentValidatesToDocType',
		'basefontIsNotUsed',
		'fontIsNotUsed',
		'headerH1',
		'headerH2',
		'headerH3',
		'headerH4',
		'headerH1Format',
		'headerH2Format',
		'headerH3Format',
		'headerH4Format',
		'headerH5Format',
		'headerH6Format',
		'menuNotUsedToFormatText',
		'listNotUsedForFormatting',
		'blockquoteNotUsedForIndentation',
		'tableLayoutDataShouldNotHaveTh',
		'framesetMustHaveNoFramesSection',
		'noframesSectionMustHaveTextEquivalent',
		'blinkIsNotUsed',
		'marqueeIsNotUsed',
		'documentMetaNotUsedWithTimeout',
		'documentAutoRedirectNotUsed',
		'aLinksDontOpenNewWindow',
		'areaDontOpenNewWindow',
		'textareaLabelPositionedClose',
		'passwordLabelIsNearby',
		'checkboxLabelIsNearby',
		'fileLabelIsNearby',
		'radioLabelIsNearby',
		'frameRelationshipsMustBeDescribed',
		'inputTextHasLabel',
		'selectHasAssociatedLabel',
		'textareaHasAssociatedLabel',
		'passwordHasLabel',
		'checkboxHasLabel',
		'radioHasLabel',
		'aLinksMakeSenseOutOfContext',
		'aSuspiciousLinkText',
		'documentHasTitleElement',
		'documentTitleNotEmpty',
		'documentTitleIsShort',
		'documentTitleIsNotPlaceholder',
		'documentTitleDescribesDocument',
		'svgContainsTitle',
		'cssTextHasContrast',
		'headersHaveText',
	);
}
/*@}*/