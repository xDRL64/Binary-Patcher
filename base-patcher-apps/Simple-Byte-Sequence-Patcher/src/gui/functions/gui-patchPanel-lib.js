// gui-patchPanel-lib.js
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
/// <reference path="../../gui/types/DIVxPatchPanelPack.js" />
//// <reference path="../../gui/functions/gui-patchPanel-lib.js" />
/// <reference path="../../gui/functions/gui-settingsPanel-lib.js" />
/// <reference path="../../gui/functions/gui-mainInterface-lib.js" />



// LogPack
///////////////////////////////////////////////////////////////////////////////

/**
 * @arg {HTMLInputElement} cbx
 * @arg {DIV_LogPack} log
 * @arg {string} [css='']
 * @return {void}
 */
const toggle_logDisplay = (cbx, log, css='')=>{
    (cbx.checked) ? log.classList.add(css) : log.classList.remove(css)
};

/**
 * @arg {LogPack_CSSCLASS} [css] 
 * @return {DIV_LogPack}
 */
const build_logArea = (css)=>{
    const LOG = new DIV_LogPack(css);
    LOG.chk.title = 'check log message (dbl click to unfold)';
    LOG.ptc.title = 'patch log message (dbl click to unfold)';
    LOG.cbx.oninput = ()=>toggle_logDisplay(LOG.cbx, LOG, css?.ful);
    LOG.ondblclick = ()=>{window.getSelection()?.removeAllRanges();LOG.cbx.click();};
	return LOG;
};



// PatchOptionPack
///////////////////////////////////////////////////////////////////////////////

/**
 * @arg {HTMLSelectElement} ver
 * @arg {DIV_LogPack} log
 * @arg {number} index
 * @arg {PatchContext} patchCtx
 * @return {void}
 */
const check_version = (ver, log, index, patchCtx)=>{
	if(ver.value === unsetVersionValue){
		log.chk.textContent = 'unset version';
		return;
	}
    const file = get_loadedFile();
	const status_obj = check_bin(patchCtx[index].version[ver.value], file);
	log.chk.innerHTML = `"${ver.value}" :\n${status_obj.checkLogMessage}`;
};

/**
 * @arg {HTMLSelectElement} ver
 * @arg {DIV_LogPack} log
 * @arg {number} index
 * @arg {PatchContext} patchCtx
 * @return {void}
 */
const apply_patch = (ver, log, index, patchCtx)=>{
	if(ver.value === unsetVersionValue){
		log.ptc.textContent = 'unset version';
		return;
	}
    const file = get_loadedFile();
	const status_obj = apply_bin(patchCtx[index].version[ver.value], file);
	log.ptc.innerHTML = `"${ver.value}" :\n${status_obj.patchLogMessage}`;
};

/**
 * @arg {PatchOptionPack_CONFIG} config
 * @arg {PatchContext} patchCtx
 * @arg {PatchOptionPack_CSSCLASS} [css]
 * @return {DIV_PatchOptionPack}
 */
const build_patchOption = (config, patchCtx, css)=>{
    const ELM = new DIV_PatchOptionPack(config, css);

    const {name, index} = config;
    const {ver, log, chk, ptc} = ELM;

    const msg = `[Check Process] debug : ${name}\n\tVersion : ${ver.value}`;
    const debug = ()=>console.log(msg); // premanante debug

	chk.onclick = ()=>(debug(), check_version(ver,log,index,patchCtx));
	ptc.onclick = ()=>apply_patch(ver,log,index,patchCtx);

    return ELM;
};



// PatchPanelPack
///////////////////////////////////////////////////////////////////////////////

/**
 * @arg {DIV_PatchPanelPack} panel
 * @arg {PatchContext} patchCtx
 * @arg {PatchOptionPack_CSSCLASS} [css]
 * @return {void}
 */
const fill_patchPanel = (panel, patchCtx, css)=>{
    const ADD = (option, index)=>{
        const availableVersions = Object.keys(option.version);
        availableVersions.push(unsetVersionValue);

        const conf = makeEmpty_PatchOptionPack_CONFIG();
            conf.strID       = option.strID;
            conf.name        = option.name;
            conf.description = option.description;
            conf.versions    = availableVersions;
            conf.index       = index;

        const patchOp = build_patchOption(conf, patchCtx, css);
        panel.opt.push(patchOp);
        panel.appendChild(patchOp);
    };

    patchCtx.forEach( (o,i)=>ADD(o,i) );
};

/**
 * 
 * @arg {PatchContext} patchCtxOpts
 * @arg {PatchPanelPack_CSSCLASS} [css]
 * @return {DIV_PatchPanelPack}
 */
const build_patchPanel = (patchCtxOpts, css)=>{
    const PAN = new DIV_PatchPanelPack(css);
    fill_patchPanel(PAN, patchCtxOpts, css?.opt);
    return PAN;
};
