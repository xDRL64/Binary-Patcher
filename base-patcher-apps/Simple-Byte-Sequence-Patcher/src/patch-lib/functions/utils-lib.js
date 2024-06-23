// utils-lib.js
//
///////////////////////////////////////////////////////////////////////////////
//
// @ts-check

/// <reference path="../../header/SBSP_config.js" />
/// <reference path="../../header/_user_config.js" />
/// <reference path="../../patch-lib/types/PatchContext.js" />
//// <reference path="../../patch-lib/functions/utils-lib.js" />
/// <reference path="../../patch-lib/functions/patch-core-lib.js" />
/// <reference path="../../html-lib/stdElem.js" />
/// <reference path="../../html-lib/dragAndDrop.js" />
/// <reference path="../../gui/types/DIVxLogPack.js" />
/// <reference path="../../gui/types/DIVxPatchOptionPack.js" />
/// <reference path="../../gui/types/DIVxPatchPanelPack.js" />
/// <reference path="../../gui/functions/gui-patchPanel-lib.js" />
/// <reference path="../../gui/functions/gui-settingsPanel-lib.js" />
/// <reference path="../../gui/functions/gui-mainInterface-lib.js" />



const regHex = /[0-9a-fA-F]{2}/g;

const hexStrToArr = (str)=>([...str.matchAll(regHex)]).map(n=>parseInt(n,16));

const hexStrToUI8A = (str)=>new Uint8Array(hexStrToArr(str));

const binArrToRegStr = (binArr)=>([...binArr]).map(b=>'\\x'+b.toString(16).padStart(2,'0')).join('');

const binArrToRegexp = (binArr)=>new RegExp(binArrToRegStr(binArr),'g');

const binArrToStr = (binArr)=>String.fromCharCode(...binArr);
