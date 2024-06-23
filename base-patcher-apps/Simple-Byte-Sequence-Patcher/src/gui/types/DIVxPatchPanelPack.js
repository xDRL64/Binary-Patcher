// DIVxPatchPanelPack.js
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
/// <reference path="../../gui/types/DIVxPatchOptionPack.js" />
//// <reference path="../../gui/types/DIVxPatchPanelPack.js" />
/// <reference path="../../gui/functions/gui-patchPanel-lib.js" />
/// <reference path="../../gui/functions/gui-settingsPanel-lib.js" />
/// <reference path="../../gui/functions/gui-mainInterface-lib.js" />



/**
 * @typedef {Object} PatchPanelPack_CSSCLASS - patch panel pack css (`className` propset)
 *  @prop {string}                    [PAN=''] - main elem css (`className`)
 *  @prop {PatchOptionPack_CSSCLASS}  [opt={}] - patch options css (`className` propset)
 *  @prop {'PatchPanelPack_CSSCLASS'} __TYPE__ - type signature (JSDOCS ONLY)
 */
/** @return {PatchPanelPack_CSSCLASS} */
const makeEmpty_PatchPanelPack_CSSCLASS = ()=>/**@type {PatchPanelPack_CSSCLASS}*/({});

/**
 * @typedef {Object} PatchPanelPack_PROP - patch panel pack own elems (ELEM propset)
 *  @prop {DIV_PatchOptionPack[]} opt - patch option pack array (<DIV_PatchOptionPack>[])
 */
/** @return {DIV_PatchOptionPack[]} */
const makeEmpty_PatchPanelPack_PROP_opt = ()=>/**@type {DIV_PatchOptionPack[]}*/([]);

/** @typedef {HTMLDivElement & PatchPanelPack_PROP} DIVxPatchPanelPack */

/**
 * @class
 *  @name DIV_PatchPanelPack
 *  @extends {HTMLDivElement}
*/
const DIV_PatchPanelPack = class extends HTMLDivElement {
    /**
     * @constructor
     * @arg {PatchPanelPack_CSSCLASS} [css={}] - patch panel pack css (`className` propset)
     *  @member {string}                   [css.PAN=''] - main elem css (`className`)
     *  @member {PatchOptionPack_CSSCLASS} [css.opt={}] - patch options css (`className` propset)
     * @this {DIVxPatchPanelPack}
	 * @instance
	  * @member {DIV_PatchOptionPack[]} opt - patch option pack array (<DIV_PatchOptionPack>[])
     */
    constructor(css){
        super();
        const {PAN=''} = css || {};

        this.className = PAN;

        this.opt = makeEmpty_PatchPanelPack_PROP_opt();
    };
};
/** @typedef {DIVxPatchPanelPack} DIV_PatchPanelPack */

customElements.define('patch_panel-pack', DIV_PatchPanelPack, {extends:'div'});

// CSS CLASS
//

const PatchPanelPack_defCSS = /**@type {PatchPanelPack_CSSCLASS}*/({
	PAN:'option-panel', opt:PatchOptionPack_defCSS,
	__TYPE__:/**@type {'PatchPanelPack_CSSCLASS'}*/('PatchPanelPack_CSSCLASS')
});




























