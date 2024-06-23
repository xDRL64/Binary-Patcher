// DIVxPatchOptionPack.js
//
///////////////////////////////////////////////////////////////////////////////
//
// @ts-check

/// <reference path="../../header/SBSP_config.js" />
/// <reference path="../../header/_user_config.js" />
/// <reference path="../../patch-lib/types/PatchContext.js" />
/// <reference path="../../patch-lib/functions/utils-lib.js" />
/// <reference path="../../patch-lib/functions/patch-core-lib.js" />
/// <reference path="../../html-lib/stdElem.js" />
/// <reference path="../../html-lib/dragAndDrop.js" />
/// <reference path="../../gui/types/DIVxLogPack.js" />
//// <reference path="../../gui/types/DIVxPatchOptionPack.js" />
/// <reference path="../../gui/types/DIVxPatchPanelPack.js" />
/// <reference path="../../gui/functions/gui-patchPanel-lib.js" />
/// <reference path="../../gui/functions/gui-settingsPanel-lib.js" />
/// <reference path="../../gui/functions/gui-mainInterface-lib.js" />



/**
 * @typedef {Object} PatchOptionPack_CSSCLASS - patch option pack css (`className` propset)
 *  @prop {string}                     [OPT=''] - main elem css (`className`)
 *  @prop {string}                     [ttl=''] - title text css (`className`)
 *  @prop {List_CSSCLASS}              [ver={}] - version list css (`className` propset)
 *  @prop {string}                     [chk=''] - check button css (`className`)
 *  @prop {string}                     [ptc=''] - patch button css (`className`)
 *  @prop {string}                     [bar=''] - patch option bar css (`className`)
 *  @prop {LogPack_CSSCLASS}           [log={}] - log pack css (`className` propset)
 *  @prop {'PatchOptionPack_CSSCLASS'} __TYPE__ - type signature (JSDOCS ONLY)
 */
/** @return {PatchOptionPack_CSSCLASS} */
const makeEmpty_PatchOptionPack_CSSCLASS = ()=>/**@type {PatchOptionPack_CSSCLASS}*/({});

/**
 * @typedef {Object} PatchOptionPack_CONFIG - patch option pack config (propset)
 *  @prop {string}                   strID       - patch option strID (`strID`)
 *  @prop {string}                   name        - patch option name (`textContent`)
 *  @prop {string}                   description - patch option description (`title`)
 *  @prop {string[]}                 versions    - patch option version (`[].textContent`)
 *  @prop {number}                   index       - patch option index (`patchCtx[]`)
 *  @prop {'PatchOptionPack_CONFIG'} __TYPE__    - type signature (JSDOCS ONLY)
 */
/** @return {PatchOptionPack_CONFIG} */
const makeEmpty_PatchOptionPack_CONFIG = ()=>/**@type {PatchOptionPack_CONFIG}*/({});

/**
 * @typedef {Object} PatchOptionPack_PROP - patch option pack own elems (ELEM propset)
 *  @prop {string}            sID - string ID (string)
 *  @prop {HTMLSpanElement}   ttl - title text (<SPAN>)
 *  @prop {HTMLSelectElement} ver - version list (<SELECT>)
 *  @prop {HTMLButtonElement} chk - check button (<BUTTON>)
 *  @prop {HTMLButtonElement} ptc - patch button (<BUTTON>)
 *  @prop {DIV_LogPack}       log - log pack (<DIV_LogPack>)
 */

/** @typedef {HTMLDivElement & PatchOptionPack_PROP} DIVxPatchOptionPack */

/**
 * @class
 *  @name DIV_PatchOptionPack
 *  @extends {HTMLDivElement}
*/
const DIV_PatchOptionPack = class extends HTMLDivElement {
	/**
	 * @constructor
	 * @arg {PatchOptionPack_CONFIG} config - patch option pack config (propset)
	 *  @member {string}   config.strID       - patch option strID (`strID`)
     *  @member {string}   config.name        - patch option name (`textContent`)
     *  @member {string}   config.description - patch option description (`title`)
     *  @member {string[]} config.versions    - patch option version (`[].textContent`)
     *  @member {number}   config.index       - patch option index (`patchCtx[]`)
     * @arg {PatchOptionPack_CSSCLASS} [css={}] - patch option pack css (`className` propset)
     *  @member {string}           [css.OPT=''] - main elem css (`className`)
     *  @member {string}           [css.ttl=''] - title text css (`className`)
     *  @member {List_CSSCLASS}    [css.ver={}] - version list css (`className` propset)
     *  @member {string}           [css.chk=''] - check button css (`className`)
     *  @member {string}           [css.ptc=''] - patch button css (`className`)
     *  @member {string}           [css.bar=''] - patch option bar css (`className`)
     *  @member {LogPack_CSSCLASS} [css.log={}] - log pack css (`className` propset)
	 * @this {DIVxPatchOptionPack}
	 * @instance
	 *  @member {string}            sID - string ID (string)
	  * @member {HTMLSpanElement}   ttl - title text (<SPAN>)
	  * @member {HTMLSelectElement} ver - version list (<SELECT>)
	  * @member {HTMLButtonElement} chk - check button (<BUTTON>)
	  * @member {HTMLButtonElement} ptc - patch button (<BUTTON>)
	  * @member {DIV_LogPack}       log - log pack (<DIV_LogPack>)
	 */
	constructor(config, css){
		super();
		const {name, description, versions, strID} = config;
		const {OPT='', ttl, ver, chk, ptc, bar, log} = css || {};

		this.sID = strID;

		this.className = OPT;
		this.title = description;

		this.ttl = make_htmlText(name, ttl);
		this.ver = make_htmlList(versions, ver);
		this.chk = make_htmlButton('Check', chk);
		this.ptc = make_htmlButton('Patch', ptc);
		this.log = build_logArea(log);

		const BAR = make_htmlBox(null, bar);
		BAR.appendChild(this.ver);
		BAR.appendChild(this.chk);
		BAR.appendChild(this.ptc);

		this.appendChild(this.ttl);
		this.appendChild(BAR);
		this.appendChild(this.log);
	};
};
/** @typedef {DIVxPatchOptionPack} DIV_PatchOptionPack */

customElements.define('patch_option-pack', DIV_PatchOptionPack, {extends:'div'});

// CSS CLASS
//

const PatchOptionVersion_defCSS = /**@type {List_CSSCLASS}*/({
	LST:'option-version', opt:'versionList-option',
	__TYPE__:/**@type {'List_CSSCLASS'}*/('List_CSSCLASS')
});

const PatchOptionPack_defCSS = /**@type {PatchOptionPack_CSSCLASS}*/({
	OPT:'option-container', ttl:'option-title',
	ver:PatchOptionVersion_defCSS,
	chk:'option-checkBtn', ptc:'option-patchBtn',
	bar:'option-processBar', log:LogPack_defCSS,
	__TYPE__:/**@type {'PatchOptionPack_CSSCLASS'}*/('PatchOptionPack_CSSCLASS')
});

