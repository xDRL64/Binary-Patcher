// dragAndDrop.js
//
///////////////////////////////////////////////////////////////////////////////
//
// @ts-check

/// <reference path="../header/SBSP_config.js" />
/// <reference path="../header/_user_config.js" />
/// <reference path="../patch-lib/types/PatchContext.js" />
/// <reference path="../patch-lib/functions/utils-lib.js" />
/// <reference path="../patch-lib/functions/patch-core-lib.js" />
/// <reference path="../html-lib/stdElem.js" />
//// <reference path="../html-lib/dragAndDrop.js" />
/// <reference path="../gui/types/DIVxLogPack.js" />
/// <reference path="../gui/types/DIVxPatchOptionPack.js" />
/// <reference path="../gui/types/DIVxPatchPanelPack.js" />
/// <reference path="../gui/functions/gui-patchPanel-lib.js" />
/// <reference path="../gui/functions/gui-settingsPanel-lib.js" />
/// <reference path="../gui/functions/gui-mainInterface-lib.js" />



/**
 * @typedef {0 | '' | null | undefined} Falsy
 */

/** @typedef {'ArrayBuffer'|'dataURL'|'Text'} DropParseType */

/**
 * @callback DropCallback
 *  @arg {string | ArrayBuffer | null | any} file
 *  @arg {string | null}                     name
 *  @return {void}
 */

/**
 * @callback DropCallback_STR
 *  @arg {string | null} file
 *  @arg {string | null} name
 *  @return {void}
 */
/**
 * @callback DropCallback_BIN
 *  @arg {ArrayBuffer | null} file
 *  @arg {string | null}      name
 *  @return {void}
 */



/**
 * @name dragAndDropManager
 *  @prop { (Element)=>void } disable_htmlElem
 *  @prop { (DropParseType|Falsy,DropCallback,string,string)=>void } make_dropArea
 *  @prop { (Blob,string)=>void } start_download
 */

const dragAndDropManager = (()=>{

	/**
	 * @private
	 * @arg {DragEvent} ev
	 * @return {void}
	 */
	const disable_dropEffect = (ev)=>{
		ev.stopPropagation();
		ev.preventDefault();
	};

	/**
	 * @private
	 * @arg {DragEvent} ev
	 * @return {void}
	 */
	const enable_dropEffect = (ev)=>{
		ev.stopPropagation();
		ev.preventDefault();
		const {dataTransfer:data} = ev;
		if(data) data.dropEffect = 'copy';
	};

	/**
	 * @public
	 * @static
	 * @memberof dragAndDropManager
	 * @arg {Element & HTMLElement} elem
	 * @return {void}
	 */
	const disable_htmlElem = (elem)=>{
		elem.addEventListener("dragover", disable_dropEffect);
		elem.addEventListener("drop", disable_dropEffect);
	};

	/**
	 * @public
	 * @static
	 * @memberof dragAndDropManager
	 * @arg {DropParseType | Falsy} type
	 * @arg {DropCallback} callback
	 * @arg {string} txt
	 * @arg {string} css
	 * @return {HTMLDivElement}
	 */
	const make_dropArea = (type='ArrayBuffer'||'dataURL'||'Text', callback, txt, css)=>{
		type ||= 'ArrayBuffer'; // if Falsy
		const readFileMethod = 'readAs'+type;
		/** @arg {DragEvent} e */
		const drop_file = (e)=>{
			e.stopPropagation();
			e.preventDefault();
			const reader = new FileReader();
			reader.addEventListener("load", ()=>callback(reader.result, name));
			
			const file = e.dataTransfer?.files[0];
			const name = file?.name || null;
			if(file) reader[readFileMethod](file);
		};
		const DROP = make_htmlBox(txt, css);
		DROP.addEventListener("dragover", enable_dropEffect);
		DROP.addEventListener("drop", drop_file);

		return DROP;
	};

	/**
	 * @param {Blob} blobFile 
	 * @param {string} downloadName 
	 */
	const start_download = (blobFile, downloadName)=>{
		const link = document.createElement('a');
		const url = URL.createObjectURL(blobFile);
		link.href = url;
		link.download = downloadName;
		link.click();
		const freemem = ()=>URL.revokeObjectURL(url);
		requestAnimationFrame(freemem);
	};

	return {disable_htmlElem, make_dropArea, start_download};
})();