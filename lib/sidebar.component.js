"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var utils_1 = require("./utils");
var Sidebar = /** @class */ (function () {
    function Sidebar(_ref) {
        this._ref = _ref;
        // `openedChange` allows for "2-way" data binding
        this.opened = false;
        this.openedChange = new core_1.EventEmitter();
        this.mode = 'over';
        this.dock = false;
        this.dockedSize = '0px';
        this.position = 'start';
        this.animate = true;
        this.trapFocus = false;
        this.autoFocus = true;
        this.showBackdrop = false;
        this.closeOnClickBackdrop = false;
        this.closeOnClickOutside = false;
        this.keyClose = false;
        this.keyCode = 27; // Default to ESC key
        this.onOpenStart = new core_1.EventEmitter();
        this.onOpened = new core_1.EventEmitter();
        this.onCloseStart = new core_1.EventEmitter();
        this.onClosed = new core_1.EventEmitter();
        this.onModeChange = new core_1.EventEmitter();
        this.onPositionChange = new core_1.EventEmitter();
        /** @internal */
        this._onRerender = new core_1.EventEmitter();
        this._focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]),' +
            'textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]';
        this._clickEvent = 'click';
        this._onClickOutsideAttached = false;
        this._onKeyDownAttached = false;
        this._onResizeAttached = false;
        this._isBrowser = utils_1.isBrowser();
        // Handle taps in iOS
        if (this._isBrowser && utils_1.isIOS() && 'ontouchstart' in window) {
            this._clickEvent = 'touchstart';
        }
        this._normalizePosition();
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this._onTransitionEnd = this._onTransitionEnd.bind(this);
        this._onFocusTrap = this._onFocusTrap.bind(this);
        this._onClickOutside = this._onClickOutside.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onResize = this._onResize.bind(this);
    }
    Object.defineProperty(Sidebar.prototype, "container", {
        set: function (container) {
            if (container) {
                this._container = container;
                this._container._addSidebar(this);
            }
        },
        enumerable: true,
        configurable: true
    });
    Sidebar.prototype.ngOnInit = function () {
        if (!this._isBrowser) {
            return;
        }
        if (this.animate) {
            this._shouldAnimate = true;
            this.animate = false;
        }
        // this._container._addSidebar(this);
    };
    Sidebar.prototype.ngOnChanges = function (changes) {
        var _this = this;
        if (!this._isBrowser) {
            return;
        }
        if (changes['animate'] && this._shouldAnimate) {
            this._shouldAnimate = changes['animate'].currentValue;
        }
        if (changes['opened']) {
            if (this._shouldAnimate) {
                this.animate = true;
                this._shouldAnimate = false;
            }
            if (changes['opened'].currentValue) {
                this.open();
            }
            else {
                this.close();
            }
        }
        if (changes['closeOnClickOutside'] || changes['keyClose']) {
            this._initCloseListeners();
        }
        if (changes['position']) {
            // Handle "start" and "end" aliases
            this._normalizePosition();
            // Emit change in timeout to allow for position change to be rendered first
            setTimeout(function () {
                _this.onPositionChange.emit(changes['position'].currentValue);
            });
        }
        if (changes['mode']) {
            setTimeout(function () {
                _this.onModeChange.emit(changes['mode'].currentValue);
            });
        }
        if (changes['dock']) {
            this.triggerRerender();
        }
        if (changes['autoCollapseHeight'] || changes['autoCollapseWidth']) {
            this._initCollapseListeners();
        }
    };
    Sidebar.prototype.ngOnDestroy = function () {
        if (!this._isBrowser) {
            return;
        }
        this._destroyCloseListeners();
        this._destroyCollapseListeners();
        this._container._removeSidebar(this);
    };
    // Sidebar toggling
    // ==============================================================================================
    /**
     * Opens the sidebar and emits the appropriate events.
     */
    Sidebar.prototype.open = function () {
        var _this = this;
        if (!this._isBrowser) {
            return;
        }
        this.opened = true;
        this.openedChange.emit(true);
        this.onOpenStart.emit();
        this._ref.detectChanges();
        setTimeout(function () {
            if (_this.animate && !_this._isModeSlide) {
                _this._elSidebar.nativeElement.addEventListener('transitionend', _this._onTransitionEnd);
            }
            else {
                _this._setFocused();
                _this._initCloseListeners();
                if (_this.opened) {
                    _this.onOpened.emit();
                }
            }
        });
    };
    /**
     * Closes the sidebar and emits the appropriate events.
     */
    Sidebar.prototype.close = function () {
        var _this = this;
        if (!this._isBrowser) {
            return;
        }
        this.opened = false;
        this.openedChange.emit(false);
        this.onCloseStart.emit();
        this._ref.detectChanges();
        setTimeout(function () {
            if (_this.animate && !_this._isModeSlide) {
                _this._elSidebar.nativeElement.addEventListener('transitionend', _this._onTransitionEnd);
            }
            else {
                _this._setFocused();
                _this._destroyCloseListeners();
                if (!_this.opened) {
                    _this.onClosed.emit();
                }
            }
        });
    };
    /**
     * Manually trigger a re-render of the container. Useful if the sidebar contents might change.
     */
    Sidebar.prototype.triggerRerender = function () {
        var _this = this;
        if (!this._isBrowser) {
            return;
        }
        setTimeout(function () {
            _this._onRerender.emit();
        });
    };
    /**
     * @internal
     *
     * Computes the transform styles for the sidebar template.
     *
     * @return {CSSStyleDeclaration} The transform styles, with the WebKit-prefixed version as well.
     */
    Sidebar.prototype._getStyle = function () {
        var transformStyle = null;
        // Hides sidebar off screen when closed
        if (!this.opened) {
            var transformDir = 'translate' + (this._isLeftOrRight ? 'X' : 'Y');
            var translateAmt = (this._isLeftOrTop ? '-' : '') + "100%";
            transformStyle = transformDir + "(" + translateAmt + ")";
            // Docked mode: partially remains open
            // Note that using `calc(...)` within `transform(...)` doesn't work in IE
            if (this.dock && this._dockedSize > 0 && !(this._isModeSlide && this.opened)) {
                transformStyle += " " + transformDir + "(" + (this._isLeftOrTop ? '+' : '-') + this.dockedSize + ")";
            }
        }
        return {
            webkitTransform: transformStyle,
            transform: transformStyle
        };
    };
    /**
     * @internal
     *
     * Handles the `transitionend` event on the sidebar to emit the onOpened/onClosed events after the transform
     * transition is completed.
     */
    Sidebar.prototype._onTransitionEnd = function (e) {
        if (e.target === this._elSidebar.nativeElement && e.propertyName.endsWith('transform')) {
            this._setFocused();
            if (this.opened) {
                this._initCloseListeners();
                this.onOpened.emit();
            }
            else {
                this._destroyCloseListeners();
                this.onClosed.emit();
            }
            this._elSidebar.nativeElement.removeEventListener('transitionend', this._onTransitionEnd);
        }
    };
    Object.defineProperty(Sidebar.prototype, "_shouldTrapFocus", {
        // Focus on open/close
        // ==============================================================================================
        /**
         * Returns whether focus should be trapped within the sidebar.
         *
         * @return {boolean} Trap focus inside sidebar.
         */
        get: function () {
            return this.opened && this.trapFocus && this._isModeOver;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Sets focus to the first focusable element inside the sidebar.
     */
    Sidebar.prototype._focusFirstItem = function () {
        if (this._focusableElements && this._focusableElements.length > 0) {
            this._focusableElements[0].focus();
        }
    };
    /**
     * Loops focus back to the start of the sidebar if set to do so.
     */
    Sidebar.prototype._onFocusTrap = function (e) {
        if (this._shouldTrapFocus && !this._elSidebar.nativeElement.contains(e.target)) {
            this._focusFirstItem();
        }
    };
    /**
     * Handles the ability to focus sidebar elements when it's open/closed to ensure that the sidebar is inert when
     * appropriate.
     */
    Sidebar.prototype._setFocused = function () {
        this._focusableElements = Array.from(this._elSidebar.nativeElement.querySelectorAll(this._focusableElementsString));
        if (this.opened) {
            this._focusedBeforeOpen = document.activeElement;
            // Restore focusability, with previous tabindex attributes
            for (var _i = 0, _a = this._focusableElements; _i < _a.length; _i++) {
                var el = _a[_i];
                var prevTabIndex = el.getAttribute('__tabindex__');
                if (prevTabIndex !== null) {
                    el.setAttribute('tabindex', prevTabIndex);
                    el.removeAttribute('__tabindex__');
                }
                else {
                    el.removeAttribute('tabindex');
                }
            }
            if (this.autoFocus) {
                this._focusFirstItem();
            }
            document.addEventListener('focus', this._onFocusTrap, true);
        }
        else {
            // Manually make all focusable elements unfocusable, saving existing tabindex attributes
            for (var _b = 0, _c = this._focusableElements; _b < _c.length; _b++) {
                var el = _c[_b];
                var existingTabIndex = el.getAttribute('tabindex');
                el.setAttribute('tabindex', '-1');
                if (existingTabIndex !== null) {
                    el.setAttribute('__tabindex__', existingTabIndex);
                }
            }
            document.removeEventListener('focus', this._onFocusTrap, true);
            // Set focus back to element before the sidebar was opened
            if (this._focusedBeforeOpen && this.autoFocus && this._isModeOver) {
                this._focusedBeforeOpen.focus();
                this._focusedBeforeOpen = null;
            }
        }
    };
    // Close event handlers
    // ==============================================================================================
    /**
     * Initializes event handlers for the closeOnClickOutside and keyClose options.
     */
    Sidebar.prototype._initCloseListeners = function () {
        var _this = this;
        if (this.opened && (this.closeOnClickOutside || this.keyClose)) {
            // In a timeout so that things render first
            setTimeout(function () {
                if (_this.closeOnClickOutside && !_this._onClickOutsideAttached) {
                    document.addEventListener(_this._clickEvent, _this._onClickOutside);
                    _this._onClickOutsideAttached = true;
                }
                if (_this.keyClose && !_this._onKeyDownAttached) {
                    document.addEventListener('keydown', _this._onKeyDown);
                    _this._onKeyDownAttached = true;
                }
            });
        }
    };
    /**
     * Destroys the event handlers from _initCloseListeners.
     */
    Sidebar.prototype._destroyCloseListeners = function () {
        if (this._onClickOutsideAttached) {
            document.removeEventListener(this._clickEvent, this._onClickOutside);
            this._onClickOutsideAttached = false;
        }
        if (this._onKeyDownAttached) {
            document.removeEventListener('keydown', this._onKeyDown);
            this._onKeyDownAttached = false;
        }
    };
    /**
     * Handles `click` events on anything while the sidebar is open for the closeOnClickOutside option.
     * Programatically closes the sidebar if a click occurs outside the sidebar.
     *
     * @param e {MouseEvent} Mouse click event.
     */
    Sidebar.prototype._onClickOutside = function (e) {
        if (this._onClickOutsideAttached && this._elSidebar && !this._elSidebar.nativeElement.contains(e.target)) {
            this.close();
        }
    };
    /**
     * Handles the `keydown` event for the keyClose option.
     *
     * @param e {KeyboardEvent} Normalized keydown event.
     */
    Sidebar.prototype._onKeyDown = function (e) {
        e = e || window.event;
        if (e.keyCode === this.keyCode) {
            this.close();
        }
    };
    // Auto collapse handlers
    // ==============================================================================================
    Sidebar.prototype._initCollapseListeners = function () {
        var _this = this;
        if (this.autoCollapseHeight || this.autoCollapseWidth) {
            // In a timeout so that things render first
            setTimeout(function () {
                if (!_this._onResizeAttached) {
                    window.addEventListener('resize', _this._onResize);
                    _this._onResizeAttached = true;
                }
            });
        }
    };
    Sidebar.prototype._destroyCollapseListeners = function () {
        if (this._onResizeAttached) {
            window.removeEventListener('resize', this._onResize);
            this._onResizeAttached = false;
        }
    };
    Sidebar.prototype._onResize = function () {
        var winHeight = window.innerHeight;
        var winWidth = window.innerWidth;
        if (this.autoCollapseHeight) {
            if (winHeight <= this.autoCollapseHeight && this.opened) {
                this._wasCollapsed = true;
                this.close();
            }
            else if (winHeight > this.autoCollapseHeight && this._wasCollapsed) {
                this.open();
                this._wasCollapsed = false;
            }
        }
        if (this.autoCollapseWidth) {
            if (winWidth <= this.autoCollapseWidth && this.opened) {
                this._wasCollapsed = true;
                this.close();
            }
            else if (winWidth > this.autoCollapseWidth && this._wasCollapsed) {
                this.open();
                this._wasCollapsed = false;
            }
        }
    };
    Object.defineProperty(Sidebar.prototype, "_height", {
        // Helpers
        // ==============================================================================================
        /**
         * @internal
         *
         * Returns the rendered height of the sidebar (or the docked size).
         * This is used in the sidebar container.
         *
         * @return {number} Height of sidebar.
         */
        get: function () {
            if (this._elSidebar.nativeElement) {
                return this._isDocked ? this._dockedSize : this._elSidebar.nativeElement.offsetHeight;
            }
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sidebar.prototype, "_width", {
        /**
         * @internal
         *
         * Returns the rendered width of the sidebar (or the docked size).
         * This is used in the sidebar container.
         *
         * @return {number} Width of sidebar.
         */
        get: function () {
            if (this._elSidebar.nativeElement) {
                return this._isDocked ? this._dockedSize : this._elSidebar.nativeElement.offsetWidth;
            }
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sidebar.prototype, "_dockedSize", {
        /**
         * @internal
         *
         * Returns the docked size as a number.
         *
         * @return {number} Docked size.
         */
        get: function () {
            return parseFloat(this.dockedSize);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sidebar.prototype, "_isModeOver", {
        /**
         * @internal
         *
         * Returns whether the sidebar is over mode.
         *
         * @return {boolean} Sidebar's mode is "over".
         */
        get: function () {
            return this.mode === 'over';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sidebar.prototype, "_isModePush", {
        /**
         * @internal
         *
         * Returns whether the sidebar is push mode.
         *
         * @return {boolean} Sidebar's mode is "push".
         */
        get: function () {
            return this.mode === 'push';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sidebar.prototype, "_isModeSlide", {
        /**
         * @internal
         *
         * Returns whether the sidebar is slide mode.
         *
         * @return {boolean} Sidebar's mode is "slide".
         */
        get: function () {
            return this.mode === 'slide';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sidebar.prototype, "_isDocked", {
        /**
         * @internal
         *
         * Returns whether the sidebar is "docked" -- i.e. it is closed but in dock mode.
         *
         * @return {boolean} Sidebar is docked.
         */
        get: function () {
            return this.dock && this.dockedSize && !this.opened;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sidebar.prototype, "_isLeftOrTop", {
        /**
         * @internal
         *
         * Returns whether the sidebar is positioned at the left or top.
         *
         * @return {boolean} Sidebar is positioned at the left or top.
         */
        get: function () {
            return this.position === 'left' || this.position === 'top';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sidebar.prototype, "_isLeftOrRight", {
        /**
         * @internal
         *
         * Returns whether the sidebar is positioned at the left or right.
         *
         * @return {boolean} Sidebar is positioned at the left or right.
         */
        get: function () {
            return this.position === 'left' || this.position === 'right';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Sidebar.prototype, "_isInert", {
        /**
         * @internal
         *
         * Returns whether the sidebar is inert -- i.e. the contents cannot be focused.
         *
         * @return {boolean} Sidebar is inert.
         */
        get: function () {
            return !this.opened && !this.dock;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * "Normalizes" position. For example, "start" would be "left" if the page is LTR.
     */
    Sidebar.prototype._normalizePosition = function () {
        var ltr = utils_1.isLTR();
        if (this.position === 'start') {
            this.position = ltr ? 'left' : 'right';
        }
        else if (this.position === 'end') {
            this.position = ltr ? 'right' : 'left';
        }
    };
    Sidebar.decorators = [
        { type: core_1.Component, args: [{
                    selector: 'ng-sidebar',
                    template: "\n    <aside #sidebar\n      role=\"complementary\"\n      [attr.aria-hidden]=\"!opened\"\n      [attr.aria-label]=\"ariaLabel\"\n      class=\"ng-sidebar ng-sidebar--{{opened ? 'opened' : 'closed'}} ng-sidebar--{{position}} ng-sidebar--{{mode}}\"\n      [class.ng-sidebar--docked]=\"_isDocked\"\n      [class.ng-sidebar--inert]=\"_isInert\"\n      [class.ng-sidebar--animate]=\"animate\"\n      [ngClass]=\"sidebarClass\"\n      [ngStyle]=\"_getStyle()\">\n      <ng-content></ng-content>\n    </aside>\n  ",
                    styles: ["\n    .ng-sidebar {\n      -webkit-overflow-scrolling: touch;\n      overflow: auto;\n      pointer-events: auto;\n      position: absolute;\n      touch-action: auto;\n      will-change: initial;\n      z-index: 99999999;\n    }\n\n    .ng-sidebar--left {\n      bottom: 0;\n      left: 0;\n      top: 0;\n    }\n\n    .ng-sidebar--right {\n      bottom: 0;\n      right: 0;\n      top: 0;\n    }\n\n    .ng-sidebar--top {\n      left: 0;\n      right: 0;\n      top: 0;\n    }\n\n    .ng-sidebar--bottom {\n      bottom: 0;\n      left: 0;\n      right: 0;\n    }\n\n    .ng-sidebar--inert {\n      pointer-events: none;\n      touch-action: none;\n      will-change: transform;\n    }\n\n    .ng-sidebar--animate {\n      -webkit-transition: -webkit-transform 0.3s cubic-bezier(0, 0, 0.3, 1);\n      transition: transform 0.3s cubic-bezier(0, 0, 0.3, 1);\n    }\n  "],
                    changeDetection: core_1.ChangeDetectionStrategy.OnPush
                },] },
    ];
    /** @nocollapse */
    Sidebar.ctorParameters = function () { return [
        { type: core_1.ChangeDetectorRef, },
    ]; };
    Sidebar.propDecorators = {
        'opened': [{ type: core_1.Input },],
        'openedChange': [{ type: core_1.Output },],
        'mode': [{ type: core_1.Input },],
        'dock': [{ type: core_1.Input },],
        'dockedSize': [{ type: core_1.Input },],
        'position': [{ type: core_1.Input },],
        'animate': [{ type: core_1.Input },],
        'autoCollapseHeight': [{ type: core_1.Input },],
        'autoCollapseWidth': [{ type: core_1.Input },],
        'sidebarClass': [{ type: core_1.Input },],
        'ariaLabel': [{ type: core_1.Input },],
        'trapFocus': [{ type: core_1.Input },],
        'autoFocus': [{ type: core_1.Input },],
        'showBackdrop': [{ type: core_1.Input },],
        'closeOnClickBackdrop': [{ type: core_1.Input },],
        'closeOnClickOutside': [{ type: core_1.Input },],
        'keyClose': [{ type: core_1.Input },],
        'keyCode': [{ type: core_1.Input },],
        'onOpenStart': [{ type: core_1.Output },],
        'onOpened': [{ type: core_1.Output },],
        'onCloseStart': [{ type: core_1.Output },],
        'onClosed': [{ type: core_1.Output },],
        'onModeChange': [{ type: core_1.Output },],
        'onPositionChange': [{ type: core_1.Output },],
        '_onRerender': [{ type: core_1.Output },],
        '_elSidebar': [{ type: core_1.ViewChild, args: ['sidebar',] },],
        'container': [{ type: core_1.Input },],
    };
    return Sidebar;
}());
exports.Sidebar = Sidebar;
