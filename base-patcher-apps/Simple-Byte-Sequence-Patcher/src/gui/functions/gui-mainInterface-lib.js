// gui-mainInterface-lib.js
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
/// <reference path="../../gui/functions/gui-patchPanel-lib.js" />
/// <reference path="../../gui/functions/gui-settingsPanel-lib.js" />
//// <reference path="../../gui/functions/gui-mainInterface-lib.js" />



const unsetVersionValue = 'SET BASED ON';

// CSS CLASS
//

const mainInterface_defCSS = {
	SBSP:'app-mainContainter',
	APP:'app-mainFrame',
	ttl:'app-title',
	lod:'appUserFile-dropArea',
	sav:'appUserFile-downloadBtn'
};





let loadedFile = null;
const get_loadedFile = ()=>loadedFile;
const set_loadedFile = (file)=>loadedFile=file;

let loadedName = null;
const get_loadedName = ()=>loadedName;
const set_loadedName = (file)=>loadedName=file;

/**
 * @arg {PatchContext}            patchCtx
 * @param {DIV_PatchOptionPack[]} patchOpts
 * @return {HTMLDivElement}
 */
const build_settingsPanel = (patchCtx, patchOpts)=>{
    const BAR = make_htmlBox(null, 'settings-panel');

    const setAllBar = build_setAllBar(patchCtx, patchOpts);

	const presetBar = build_presetBar(patchOpts);

    BAR.appendChild(setAllBar);
    BAR.appendChild(presetBar);

    return BAR;
};





const build_mainInterface = (patchCtx, htmlParent, SBSP_fileType='BIN')=>{

	const css = mainInterface_defCSS;

	const APP = make_htmlBox(null, css.APP);

	dragAndDropManager.disable_htmlElem(htmlParent);

	// drop are
	//

	/**@type {DropCallback_BIN}*/
	const dropFile = (file, name)=>{
		const f = new Uint8Array(file || []);
		set_loadedFile(f);
		set_loadedName(name || 'file.ext');
		const hexSize = '0x'+f.length.toString(16).toUpperCase();
		const msgName = `File name : "${name}"`;
		const msgSize = `File size : ${hexSize} (${f.length}) Bytes`;
		dropFileArea.textContent = `${msgName}\n${msgSize}`;
		userTrigger_start();
	};
	/**@type {[Falsy, DropCallback, string, string]} */
	const dropConf = [0, dropFile, `Drop (${SBSP_fileType}) file here`, css.lod];
	const dropFileArea = dragAndDropManager.make_dropArea(...dropConf);

	// save output result button
	//

	const saveOutputBtn = make_htmlButton('Download Output File', css.sav);
	saveOutputBtn.onclick = ()=>{
		const output = new Blob([get_loadedFile()], {type:'application/octet-stream'});
		dragAndDropManager.start_download(output, get_loadedName());
	};

	// patch panel
	//

	const patchPanel = build_patchPanel(patchCtx, PatchPanelPack_defCSS);


	const patchOptions = patchPanel.opt;

	// setttings panel
	//

	const settingsPanel = build_settingsPanel(patchCtx, patchOptions);

	// build html

	APP.appendChild(patchPanel);
	APP.appendChild(settingsPanel);
	//APP.appendChild(settingsPanel);
	
	htmlParent.appendChild(dropFileArea);
	htmlParent.appendChild(saveOutputBtn);
	htmlParent.appendChild(APP);

	// APP start
	//

	saveOutputBtn.style.display = 'none';
	APP.style.display = 'none';

	const userTrigger_start = ()=>{
		saveOutputBtn.style.display = '';
		APP.style.display = '';
	};

};


const build_SBSP = (htmlParent)=>{
	const {patchContext, context_fileType, app_title} = SBSP_USERCONFIG;
	const SBSP = make_htmlBox(null, mainInterface_defCSS.SBSP);

	// app title
	const title = make_htmlBox(app_title, mainInterface_defCSS.ttl);
	document.head.title = app_title;
	SBSP.appendChild(title);

	// main interface init
	const APP = build_mainInterface(patchContext, SBSP, context_fileType);

	htmlParent.appendChild(SBSP);
	return {mainContainer:SBSP, mainInterface:APP};
};