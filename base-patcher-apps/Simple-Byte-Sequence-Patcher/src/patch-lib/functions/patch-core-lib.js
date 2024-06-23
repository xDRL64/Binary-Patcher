// patch-core-lib.js
//
///////////////////////////////////////////////////////////////////////////////
//
// @ts-check

/// <reference path="../../header/SBSP_config.js" />
/// <reference path="../../header/_user_config.js" />
/// <reference path="../../patch-lib/types/PatchContext.js" />
/// <reference path="../../patch-lib/functions/utils-lib.js" />
//// <reference path="../../patch-lib/functions/patch-core-lib.js" />
/// <reference path="../../html-lib/stdElem.js" />
/// <reference path="../../html-lib/dragAndDrop.js" />
/// <reference path="../../gui/types/DIVxLogPack.js" />
/// <reference path="../../gui/types/DIVxPatchOptionPack.js" />
/// <reference path="../../gui/types/DIVxPatchPanelPack.js" />
/// <reference path="../../gui/functions/gui-patchPanel-lib.js" />
/// <reference path="../../gui/functions/gui-settingsPanel-lib.js" />
/// <reference path="../../gui/functions/gui-mainInterface-lib.js" />



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
