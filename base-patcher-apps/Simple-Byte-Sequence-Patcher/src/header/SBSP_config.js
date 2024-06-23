// SBSP_config.js
//
///////////////////////////////////////////////////////////////////////////////
//

/* --BUILD_INJECTIONS : add @ts-check */
/* --BUILD_INJECTIONS : add <reference patchContext_type> */
/* --BUILD_INJECTIONS : add <reference user_conf> */

const SBSP_version = '0.0.0a';

const titleTag = document.querySelector('title');
if(titleTag) titleTag.textContent = SBSP_USERCONFIG.app_title;

