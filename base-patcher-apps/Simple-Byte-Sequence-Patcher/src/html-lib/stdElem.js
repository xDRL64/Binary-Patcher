// stdElem.js
//
///////////////////////////////////////////////////////////////////////////////
//
// @ts-check

/// <reference path="../header/SBSP_config.js" />
/// <reference path="../header/_user_config.js" />
/// <reference path="../patch-lib/types/PatchContext.js" />
/// <reference path="../patch-lib/functions/utils-lib.js" />
/// <reference path="../patch-lib/functions/patch-core-lib.js" />
//// <reference path="../html-lib/stdElem.js" />
/// <reference path="../html-lib/dragAndDrop.js" />
/// <reference path="../gui/types/DIVxLogPack.js" />
/// <reference path="../gui/types/DIVxPatchOptionPack.js" />
/// <reference path="../gui/types/DIVxPatchPanelPack.js" />
/// <reference path="../gui/functions/gui-patchPanel-lib.js" />
/// <reference path="../gui/functions/gui-settingsPanel-lib.js" />
/// <reference path="../gui/functions/gui-mainInterface-lib.js" />


// regex : \s*=\s* make_html.*\(


// will be deleted (maybe)
const addToELEM = (elem,list)=>Object.keys(list).forEach( k=>elem[k]=list[k] );




/**
 * @arg {string}              type
 * @arg {null|string|Element} content
 * @arg {string}              [css='']
 * @return {Element}
 */
const make_htmlStdElem = (type, content=null, css='')=>{
	const ELEM = document.createElement(type);

	ELEM.className = css;

	if(content === null) return ELEM; else

	if(content instanceof Element) ELEM.appendChild(content); else

	if(typeof content === 'string') ELEM.textContent = content;

	return ELEM;
};


/**
 * @arg {null | string | Element} content
 * @arg {string}              [css='']
 * @return {HTMLDivElement}
 */
const make_htmlBox = (content=null, css)=>{
	/** @typedef {HTMLDivElement} T */
	return /**@type {T}*/(make_htmlStdElem('div', content, css));
};


/**
 * @arg {null | string | Element} content
 * @arg {string}              [css='']
 * @return {HTMLLabelElement}
 */
const make_htmlLabel = (content=null, css)=>{
	/** @typedef {HTMLLabelElement} T */
	return /**@type {T}*/(make_htmlStdElem('label', content, css));
};


/**
 * @arg {null | string | Element} content
 * @arg {string}              [css='']
 * @return {HTMLSpanElement}
 */
const make_htmlText = (content=null, css)=>{
	/** @typedef {HTMLSpanElement} T */
	return /**@type {T}*/(make_htmlStdElem('span', content, css));
};


/**
 * @arg {string} [css='']
 * @return {HTMLInputElement}
 */
const make_htmlCheckbox = (css)=>{
	/** @typedef {HTMLInputElement} T */
	const CBX = /**@type {T}*/(make_htmlStdElem('input', null, css));
	CBX.type = 'checkbox';
	return CBX;
};


/**
 * @arg {number | string} val
 * @arg {string}          txt
 * @arg {string}          [css='']
 * @return {HTMLOptionElement}
 */
const make_htmlListOption = (val, txt, css)=>{
	/** @typedef {HTMLOptionElement} T */
	const OP = /**@type {T}*/(make_htmlStdElem('option', txt, css));
	OP.value = ''+val;
	return OP;
};

/**
 * @typedef {Object} List_CSSCLASS
 *  @prop {string} [LST='']
 *  @prop {string} [opt='']
 *  @prop {'List_CSSCLASS'} __TYPE__ - type signature (JSDOCS ONLY)
 */
/** @return {List_CSSCLASS} */
const makeEmpty_List_CSSCLASS = ()=>/**@type {List_CSSCLASS}*/({});

/**
 * @arg {string[]} refs
 * @arg {List_CSSCLASS} [css={}]
 * @return {HTMLSelectElement}
 */
const make_htmlList = (refs, css)=>{
	/** @typedef {HTMLSelectElement} T */
	const LST = /**@type {T}*/(make_htmlStdElem('select', null, css?.LST));

	refs.forEach(ver=>LST.appendChild(
		make_htmlListOption(ver,ver,css?.opt)
	));

	return LST;
};


/**
 * @arg {null | string | Element} content
 * @arg {string} [css='']
 * @return {HTMLButtonElement}
 */
const make_htmlButton = (content, css)=>{
	/** @typedef {HTMLButtonElement} T */
	const BTN = /**@type {T}*/(make_htmlStdElem('button', content, css));
	return BTN;
};


