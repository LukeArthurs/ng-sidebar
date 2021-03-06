"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns whether the page is in LTR mode. Defaults to `true` if it can't be computed.
 *
 * @return {boolean} Page's language direction is left-to-right.
 */
function isLTR() {
    var dir = 'ltr';
    if (typeof window !== 'undefined') {
        if (window.getComputedStyle) {
            dir = window.getComputedStyle(document.body, null).getPropertyValue('direction');
        }
        else {
            dir = document.body.currentStyle.direction;
        }
    }
    return dir === 'ltr';
}
exports.isLTR = isLTR;
/**
 * Returns whether or not the current device is an iOS device.
 *
 * @return {boolean} Device is an iOS device (i.e. iPod touch/iPhone/iPad).
 */
function isIOS() {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }
    return false;
}
exports.isIOS = isIOS;
/**
 * Detects whether or not we are running in a browser context or not.
 * From https://stackoverflow.com/a/31090240
 *
 * @return {boolean} Whether this is a browser or a server.
 */
function isBrowser() {
    return new Function('try{return this===window;}catch(e){return false;}')();
}
exports.isBrowser = isBrowser;
