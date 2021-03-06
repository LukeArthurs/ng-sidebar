/**
 * Returns whether the page is in LTR mode. Defaults to `true` if it can't be computed.
 *
 * @return {boolean} Page's language direction is left-to-right.
 */
export declare function isLTR(): boolean;
/**
 * Returns whether or not the current device is an iOS device.
 *
 * @return {boolean} Device is an iOS device (i.e. iPod touch/iPhone/iPad).
 */
export declare function isIOS(): boolean;
/**
 * Detects whether or not we are running in a browser context or not.
 * From https://stackoverflow.com/a/31090240
 *
 * @return {boolean} Whether this is a browser or a server.
 */
export declare function isBrowser(): boolean;
