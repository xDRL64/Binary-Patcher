// gui-settingsPanel-lib.js
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
//// <reference path="../../gui/functions/gui-settingsPanel-lib.js" />
/// <reference path="../../gui/functions/gui-mainInterface-lib.js" />




// CSS CLASS
//

const settingsPanel_defCSS = {
    setAllBar : {
        BAR:'setAll-bar', txt:'setAll-listLabel',
        lst:'setAll-list', opt:'setAll-option',
        chk:'setAll-checkBtn', ptc:'setAll-patchBtn',
        log:'setAll-fullLogBtn',
    },
	presetBar : {
		BAR:'preset-bar',
		lod:'loadPresetFile-dropArea', sav:'savePresetFile-button',
	},
};







// SET ALL BAR
//


/**
 * @arg {PatchContext} patchCtx 
 * @return {string[]}
 */
const get_allVersions = (patchCtx)=>{
    return Array.from(new Set(patchCtx.flatMap(({version})=>Object.keys(version))));
};


/**
 * @arg {PatchContext}          patchCtx
 * @arg {DIV_PatchOptionPack[]} patchOptions
 * @arg {List_CSSCLASS}         [css={}]
 * @return {HTMLSelectElement}
 */
const build_allVersionList = (patchCtx, patchOptions, css)=>{

	const allVersions = get_allVersions(patchCtx);

    allVersions.push('Disable All Patch Options');

	const lst = make_htmlList(allVersions, css);

	const patchOpAvblVerLists = patchOptions.map(e=>e.ver);

	lst.title = 'Set the same version for all patch options';

	lst.oninput = ()=>{
		// apply version for all patch options
		patchOpAvblVerLists.forEach(ver=>{
			ver.value = lst.value;
			ver.value ||= unsetVersionValue;
		});
	}

	return lst;
};


/**
 * @arg {PatchContext}          patchCtx
 * @arg {DIV_PatchOptionPack[]} patchOptions
 * @return {HTMLDivElement}
 */
const build_setAllBar = (patchCtx, patchOptions)=>{
    const currentCSS = settingsPanel_defCSS.setAllBar;
    
    const BAR = make_htmlBox(null, currentCSS.BAR);

    const css = makeEmpty_List_CSSCLASS();
    css.LST = currentCSS.lst;
    css.opt = currentCSS.opt;

    const listLabel = make_htmlText('Set for all : ', currentCSS.txt);

    const allVerList = build_allVersionList(patchCtx, patchOptions, css);

    const checkAllBtn = make_htmlButton('Check All', currentCSS.chk);
    const patchAllBtn = make_htmlButton('Patch All', currentCSS.ptc);
    const fullLogAllBtn = make_htmlButton('Full Log All', currentCSS.log);

    checkAllBtn.onclick = ()=>patchOptions.forEach(e=>e.chk.click());
	patchAllBtn.onclick = ()=>patchOptions.forEach(e=>e.ptc.click());

    let c = true;
    const f = ()=>{patchOptions.forEach(e=>{e.log.cbx.checked=!c;e.log.cbx.click()});c=!c};
    fullLogAllBtn.onclick = f;

    BAR.appendChild(listLabel);
    BAR.appendChild(allVerList);
    BAR.appendChild(checkAllBtn);
    BAR.appendChild(patchAllBtn);
    BAR.appendChild(fullLogAllBtn);

    return BAR;
};




// PRESET BAR
//



/**
 * @param {Object}                obj - from JSON parsing
 * @param {string | null}         name - from loaded file name
 * @param {DIV_PatchOptionPack[]} patchOptions
 * @param {HTMLDivElement}        dropArea
 */
const load_preset = (obj, name, patchOptions, dropArea)=>{
	const {SBSP_version:jsonVersion, context_version, app_title, settings} = obj;
	if(jsonVersion){
        dropArea.textContent = `Loaded : ${name}\nApp title : ${app_title}\n`;
        const conf = SBSP_USERCONFIG;
		// only info : check version
		if(jsonVersion !== SBSP_version)
			dropArea.textContent += `Your file's SBSP version : ${jsonVersion}\n`
		                         +  `The app's SBSP version : ${SBSP_version}\n`;
		if(context_version !== conf.context_version)
			dropArea.textContent += `Your file's context version : ${context_version}\n`
		                         +  `The app's context version : ${conf.context_version}\n`;
		// apply loaded settings
		const currentOptions = {};
		patchOptions.forEach(e=>currentOptions[e.sID]={lst:e.ver,nam:e.ttl.textContent});
		settings.forEach(e=>{
            const {lst, nam} = (currentOptions[e.sID] || {});
			if(lst){
                lst.value = e.version;
                if(!lst.value){
                    lst.value = unsetVersionValue;
                    dropArea.textContent += `Version : "${e.version}" is not present in Option : "${nam}".\n`;
                }
			}else dropArea.textContent += `Option : "${e.name}" (ID: "${e.sID}") is not present in Patch Panel.\n`;
		});
	}else dropArea.textContent = 'Bad file';
};

/**
 * @arg {DIV_PatchOptionPack[]} patchOptions
 * @arg {boolean} [onlySet=false] - save only the patch options with a set version
 */
const save_preset = (patchOptions, onlySet=false)=>{
    const {context_version, app_title} = SBSP_USERCONFIG;
    const patchOpts = onlySet ? patchOptions.filter(e=>e.ver.value!==unsetVersionValue):patchOptions;
	const settings = patchOpts.map(e=>({sID:e.sID,version:e.ver.value,name:e.ttl.textContent}));
    /**@type {Object | string | Blob}*/
	let save = {SBSP_version, context_version, app_title, settings};
	save = JSON.stringify(save);
	save = new Blob([save], {type:"application/json"});
    dragAndDropManager.start_download(save, `[${app_title}] settings.json`);
};




/**
 * @arg {DIV_PatchOptionPack[]} patchOptions
 * @return {HTMLDivElement}
 */
const build_presetBar = (patchOptions)=>{
    const currentCSS = settingsPanel_defCSS.presetBar;

    const BAR = make_htmlBox(null, currentCSS.BAR);

    /**@type {DropCallback_STR}*/
    const dropPreset = (file,name)=>load_preset(JSON.parse(file||'{}'),name,patchOptions,loadArea);
    /**@type {[DropParseType, DropCallback, string, string]} */
    const dropConf = ['Text', dropPreset, 'Drop (settings.json) file here\n', currentCSS.lod];
    const loadArea = dragAndDropManager.make_dropArea(...dropConf);

    const saveButton = make_htmlButton('Save Settings (.json)', currentCSS.sav);
    saveButton.title = 'Hold CTRL+ALT while click :\nto save only [patch options with a set version]';
    saveButton.onclick = (ev)=>save_preset(patchOptions, ev.ctrlKey&&ev.altKey);

    BAR.appendChild(loadArea);
    BAR.appendChild(saveButton);

    return BAR;
};




