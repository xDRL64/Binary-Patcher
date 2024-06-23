// DIVxLogPack.js
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
//// <reference path="../../gui/types/DIVxLogPack.js" />
/// <reference path="../../gui/types/DIVxPatchOptionPack.js" />
/// <reference path="../../gui/types/DIVxPatchPanelPack.js" />
/// <reference path="../../gui/functions/gui-patchPanel-lib.js" />
/// <reference path="../../gui/functions/gui-settingsPanel-lib.js" />
/// <reference path="../../gui/functions/gui-mainInterface-lib.js" />



/**
 * @typedef {Object} LogPack_CSSCLASS - log pack css (`className` propset)
 *  @prop {string}             [LOG=''] - main elem css (`className`)
 *  @prop {string}             [cbx=''] - full log display cbx css (`className`)
 *  @prop {string}             [ful=''] - full log display flag css (`className`)
 *  @prop {string}             [chk=''] - check log css (`className`)
 *  @prop {string}             [ptc=''] - patch log css (`className`)
 *  @prop {'LogPack_CSSCLASS'} __TYPE__ - type signature (JSDOCS ONLY)
*/
/** @return {LogPack_CSSCLASS} */
const makeEmpty_LogPack_CSSCLASS = ()=>/**@type {LogPack_CSSCLASS}*/({});

/**
 * @typedef {Object} LogPack_PROP - log pack own elems (<ELEM> propset)
 *  @prop {HTMLInputElement} cbx - full log display (<CHECKBOX>)
 *  @prop {HTMLDivElement}   chk - check log message box (<DIV>)
 *  @prop {HTMLDivElement}   ptc - patch log message box (<DIV>)
*/

/** @typedef {HTMLDivElement & LogPack_PROP} DIVxLogPack */

/**
 * @class
 *  @name DIV_LogPack
 *  @extends {HTMLDivElement}
*/
const DIV_LogPack = class extends HTMLDivElement {
    /** 
     * @constructor
     * @arg {LogPack_CSSCLASS} [css={}] - log pack css (`className` propset)
     *  @member {string} [css.LOG=''] - main elem css (`className`)
     *  @member {string} [css.cbx=''] - full log display cbx css (`className`)
     *  @member {string} [css.chk=''] - check log css (`className`)
     *  @member {string} [css.ptc=''] - patch log css (`className`)
     * @this {DIVxLogPack}
     * @instance
     *  @member {HTMLInputElement} cbx - full log display (<CHECKBOX>)
     *  @member {HTMLDivElement}   chk - check log message box (<DIV>)
     *  @member {HTMLDivElement}   ptc - patch log message box (<DIV>)
	 */
	constructor(css){
		super();
        const {LOG='', cbx, chk, ptc} = css || {};
		this.className = LOG;
		this.cbx = make_htmlCheckbox(cbx);
		this.chk = make_htmlBox(null, chk);
		this.ptc = make_htmlBox(null, ptc);

		this.appendChild(this.cbx);
		this.appendChild(this.chk);
		this.appendChild(this.ptc);
	};
};
/** @typedef {DIVxLogPack} DIV_LogPack */

customElements.define('log-pack', DIV_LogPack, {extends:'div'});



// CSS CLASS
//

const LogPack_defCSS = /**@type {LogPack_CSSCLASS}*/({
    LOG:'option-logBox',
    cbx:'option-fullLogCbx', ful:'fullLog-flag',
    chk:'option-checkLog', ptc:'option-patchLog',
    __TYPE__:/**@type {'LogPack_CSSCLASS'}*/('LogPack_CSSCLASS')
});

