// PatchContext.js
//
///////////////////////////////////////////////////////////////////////////////
//
// @ts-check

/**
 * @typedef {Object} BinRefs
 *  @prop {number} offset
 *  @prop {string} bytes - data as hex str (no space)
*/

/**
 * @typedef {Object} PatchCxtOptVerStep
 *  @prop {string} subname
 *  @prop {BinRefs} check
 *  @prop {BinRefs} patch
 *  @prop {BinRefs | null} run
*/

/**
 * @typedef {Object} PatchCxtOptVersion
 *  @prop {PatchCxtOptVerStep[]} steps
*/

/**
 * @typedef {Object.<string, PatchCxtOptVersion>} VersionList
*/

/**
 * @typedef {Object} PatchCxtOption
 *  @prop {string} strID - used for preset file (never change after a release)
 *  @prop {string} name
 *  @prop {string} description
 *  @prop {VersionList} version
 */

/**
 * @typedef {PatchCxtOption[]} PatchContext
 */
