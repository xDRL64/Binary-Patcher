// SBSP_config.js
//
///////////////////////////////////////////////////////////////////////////////
//

// @ts-check
/// <reference path="./PatchContext-jsdocs.js" />
/// <reference path="../user/config.js" />

const SBSP_version = '0.0.0a';

const titleTag = document.querySelector('title');
if(titleTag) titleTag.textContent = SBSP_USERCONFIG.app_title;


// utils-lib.js
//
///////////////////////////////////////////////////////////////////////////////
//




const regHex = /[0-9a-fA-F]{2}/g;

const hexStrToArr = (str)=>([...str.matchAll(regHex)]).map(n=>parseInt(n,16));

const hexStrToUI8A = (str)=>new Uint8Array(hexStrToArr(str));

const binArrToRegStr = (binArr)=>([...binArr]).map(b=>'\\x'+b.toString(16).padStart(2,'0')).join('');

const binArrToRegexp = (binArr)=>new RegExp(binArrToRegStr(binArr),'g');

const binArrToStr = (binArr)=>String.fromCharCode(...binArr);

// patch-core-lib.js
//
///////////////////////////////////////////////////////////////////////////////
//




const make_log = (o,b)=>`0x${o.toString(16).toUpperCase()} : ${b.match(regHex).join(' ')}`

const logColors = {
	openTag : (color)=>`<span style="background-color:${color};">`,
	closeTag : '</span>',
	make_tag(color,txt){return `${this.openTag(color)}${txt}${this.closeTag}`;},
	/*red*/    r(txt){return this.make_tag('#ff3c3c',txt);},
	/*green*/  g(txt){return this.make_tag('lawngreen',txt);},
	/*blue*/   b(txt){return this.make_tag('deepskyblue',txt);},
	/*yellow*/ y(txt){return this.make_tag('gold',txt);},
	/*orange*/ o(txt){return this.make_tag('orange',txt);},
};

const normal = (step, file)=>{
	const {check, patch} = step;
	const {offset,bytes:b} = check, bytes = hexStrToUI8A(b);
	const toCheck = file.subarray(offset,offset+bytes.length);
	const log = make_log(offset,b);

	const _ = logColors;

	// check normal
	const status = toCheck.every( (byte,index)=>bytes[index]===byte );

	let alreadyPatched=false, msg=`${_.g('Success')} on 'normal' check process, Ready to patch`;

	// fail case
	if(!status){
		const patchToCheckOffset = patch.offset - offset;
		const patchBytes = hexStrToUI8A(patch.bytes);
		bytes.set(patchBytes, patchToCheckOffset);
		// determine state : patched or missing
		alreadyPatched = toCheck.every( (byte,index)=>bytes[index]===byte );
		if(alreadyPatched) msg = `${_.o('Warning')} on 'normal' check process, Already patched`;
		else               msg = `${_.r('Failed')} on 'normal' check process, Not found`
	}

	return {status, alreadyPatched, log, msg};
};

const search = (step, file)=>{
	const {subname, check, patch} = step;
	const {offset,bytes:b} = check, bytes = hexStrToUI8A(b);

	// try occurence scanning (in whole file)
	const byteSeqRegex = binArrToRegexp(bytes);
	const fileStr = binArrToStr(file);
	const occurences = [...fileStr.matchAll(byteSeqRegex)];

	// success only one unique occurence (found in file)
	if(occurences.length === 1){
		// create custom patch
		const patchToCheckOffset = patch.offset - offset;
		const {index} = occurences[0];
		const run = {
			offset : index + patchToCheckOffset,
			bytes : patch.bytes,
		};

		const _ = logColors;
		const log = make_log(index, check.bytes);
		const msg = `${_.b('Found')} on 'search' check process, Can try to patch`;

		return {status:true, run, log, msg}
	}

	// premanante debug
	if(occurences.length > 1) console.log(
		`\t[Check by occurences Search] in Step : "${subname}" at : [${
			occurences.map(e=>'0x'+e.index.toString(16).toUpperCase()).join()
		}] for : [${ b.match(regHex).join(' ') }]`
	);

	return {status:false};
};

const check_bin = (version, file)=>{

	const {steps} = version;
	let checkLogMessage = '';
	
	let nStatus = true;
	let aStatus = true;
	let sStatus = false;

	steps.forEach( (step)=>{
		const {subname}=step, nResult=normal(step,file);
		nStatus &&= nResult.status;
		aStatus &&= nResult.alreadyPatched;
		
		// prepare or cancel 'standard' patch run process
		step.run = (nResult.status) ? {...step.patch} : null;
		
		checkLogMessage += `\tStep : "${subname}", ${nResult.msg} :\n`
		                +  `\t\t${nResult.log}.\n`;
		
		if(!nResult.status && !nResult.alreadyPatched){
			const sResult = search(step,file);
			if(sResult.status){
				sStatus = true;
				checkLogMessage += `\tStep : "${subname}", ${sResult.msg} :\n`
								+  `\t\t${sResult.log}.\n`;
				// prepare 'custom' patch run process
				step.run = sResult.run;
			}
		}
	} );

	const _ = logColors;

	let         finalStatus = _.r('NOT ABLE TO PATCH');
	if(nStatus) finalStatus = _.g('SUCCESSFULL CHECKED');
	if(aStatus) finalStatus = _.o('ALREADY PATCHED');
	if(sStatus) finalStatus = _.b('WILL CREATE CUSTOM PATCH');

	checkLogMessage += finalStatus;

	return {checkLogMessage};
};

const apply_bin = (version, file)=>{

	const {steps} = version;
	let patchLogMessage = '';

	const _ = logColors;

	if( steps.some( e=>!e.run ) ) return {patchLogMessage:_.y('MISSING BUILT STEP(S)')};

	steps.forEach( (step)=>{
		const {subname} = step;
		const {offset, bytes:b} = step.run, bytes = hexStrToUI8A(b);
		file.set(bytes, offset);
		const log = make_log(offset,b);
		patchLogMessage += `\tStep : "${subname}", Patch wrote :\n`
		                +  `\t\t${log}.\n`;
		step.run = null;
	} );

	patchLogMessage += _.g('ALL PATCH STEPS SUCCESSFULL');

	return {patchLogMessage};
};

// stdElem.js
//
///////////////////////////////////////////////////////////////////////////////
//



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



// dragAndDrop.js
//
///////////////////////////////////////////////////////////////////////////////
//




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
// DIVxLogPack.js
//
///////////////////////////////////////////////////////////////////////////////
//




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


// DIVxPatchOptionPack.js
//
///////////////////////////////////////////////////////////////////////////////
//




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


// DIVxPatchPanelPack.js
//
///////////////////////////////////////////////////////////////////////////////
//




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





























// gui-patchPanel-lib.js
//
///////////////////////////////////////////////////////////////////////////////
//




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

// gui-settingsPanel-lib.js
//
///////////////////////////////////////////////////////////////////////////////
//





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





// gui-mainInterface-lib.js
//
///////////////////////////////////////////////////////////////////////////////
//




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
