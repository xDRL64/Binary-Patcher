// _user_config.js
//
///////////////////////////////////////////////////////////////////////////////
//
// @ts-check

/// <reference path="../patch-lib/types/PatchContext.js" />
/* --BUILD_INJECTIONS : add <reference patchContext_type> */

const SBSP_USERCONFIG = {

    context_version : '0.0.0a',
    
    context_fileType : 'BIN',
    
    app_title : 'Bin Patcher APP Example (SBSP Demo)',
};

/** @type {PatchContext} */
SBSP_USERCONFIG.patchContext = [ // (all offsets are absolute)
	{
		strID:'option',
		name:'example_option',
		description : 'example_descr',
		version : {
			'PAL (F) 1.*' : {
				steps : [ // expect check success
					{subname:'asm replace', check:{offset:0x01,bytes:'01020304'}, patch:{offset:0x03,bytes:'FF'}, run:null},
				],
			},
			'PAL (A) 1.*' : {
				steps : [ // expect already patched
					{subname:'asm replace', check:{offset:0x01,bytes:'0102FF04'}, patch:{offset:0x3,bytes:'03'}, run:null},
				],
			},
		}
	},
	{
		strID:'option2',
		name:'example_option2',
		description : 'example_descr',
		version : {
			'PAL (F) 1.*' : {
				steps : [ // expect search propose 1 occurence
					{subname:'asm replace', check:{offset:0x0,bytes:'AABBCCDD'}, patch:{offset:0x0,bytes:'0000'}, run:null},
				],
			},
			'NTSC (U) 1.*' : {
				steps : [ // expect search propose multiple occurences (console log)
					{subname:'asm replace', check:{offset:0x1,bytes:'050607'}, patch:{offset:0x2,bytes:'03'}, run:null},
				],
			},
		}
	},
];