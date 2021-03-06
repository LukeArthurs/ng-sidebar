"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var utils_1 = require("./utils");
// Based on https://github.com/angular/material2/tree/master/src/lib/sidenav
var SidebarContainer = /** @class */ (function () {
    function SidebarContainer(_ref) {
        this._ref = _ref;
        this.animate = true;
        this.allowSidebarBackdropControl = true;
        this.showBackdrop = false;
        this.showBackdropChange = new core_1.EventEmitter();
        this._sidebars = [];
        this._isBrowser = utils_1.isBrowser();
    }
    SidebarContainer.prototype.ngAfterContentInit = function () {
        if (!this._isBrowser) {
            return;
        }
        this._onToggle();
    };
    SidebarContainer.prototype.ngOnChanges = function (changes) {
        if (!this._isBrowser) {
            return;
        }
        if (changes['showBackdrop']) {
            this.showBackdropChange.emit(changes['showBackdrop'].currentValue);
        }
    };
    SidebarContainer.prototype.ngOnDestroy = function () {
        if (!this._isBrowser) {
            return;
        }
        this._unsubscribe();
    };
    /**
     * @internal
     *
     * Adds a sidebar to the container's list of sidebars.
     *
     * @param sidebar {Sidebar} A sidebar within the container to register.
     */
    SidebarContainer.prototype._addSidebar = function (sidebar) {
        this._sidebars.push(sidebar);
        this._subscribe(sidebar);
    };
    /**
     * @internal
     *
     * Removes a sidebar from the container's list of sidebars.
     *
     * @param sidebar {Sidebar} The sidebar to remove.
     */
    SidebarContainer.prototype._removeSidebar = function (sidebar) {
        var index = this._sidebars.indexOf(sidebar);
        if (index !== -1) {
            this._sidebars.splice(index, 1);
        }
    };
    /**
     * @internal
     *
     * Computes `margin` value to push page contents to accommodate open sidebars as needed.
     *
     * @return {CSSStyleDeclaration} margin styles for the page content.
     */
    SidebarContainer.prototype._getContentStyle = function () {
        var left = 0, right = 0, top = 0, bottom = 0;
        var transformStyle = null;
        var heightStyle = null;
        var widthStyle = null;
        for (var _i = 0, _a = this._sidebars; _i < _a.length; _i++) {
            var sidebar = _a[_i];
            // Slide mode: we need to translate the entire container
            if (sidebar._isModeSlide) {
                if (sidebar.opened) {
                    var transformDir = sidebar._isLeftOrRight ? 'X' : 'Y';
                    var transformAmt = "" + (sidebar._isLeftOrTop ? '' : '-') + (sidebar._isLeftOrRight ? sidebar._width : sidebar._height);
                    transformStyle = "translate" + transformDir + "(" + transformAmt + "px)";
                }
            }
            // Create a space for the sidebar
            if ((sidebar._isModePush && sidebar.opened) || sidebar.dock) {
                var paddingAmt = 0;
                if (sidebar._isModeSlide && sidebar.opened) {
                    if (sidebar._isLeftOrRight) {
                        widthStyle = '100%';
                    }
                    else {
                        heightStyle = '100%';
                    }
                }
                else {
                    if (sidebar._isDocked || (sidebar._isModeOver && sidebar.dock)) {
                        paddingAmt = sidebar._dockedSize;
                    }
                    else {
                        paddingAmt = sidebar._isLeftOrRight ? sidebar._width : sidebar._height;
                    }
                }
                switch (sidebar.position) {
                    case 'left':
                        left = Math.max(left, paddingAmt);
                        break;
                    case 'right':
                        right = Math.max(right, paddingAmt);
                        break;
                    case 'top':
                        top = Math.max(top, paddingAmt);
                        break;
                    case 'bottom':
                        bottom = Math.max(bottom, paddingAmt);
                        break;
                }
            }
        }
        return {
            padding: top + "px " + right + "px " + bottom + "px " + left + "px",
            webkitTransform: transformStyle,
            transform: transformStyle,
            height: heightStyle,
            width: widthStyle
        };
    };
    /**
     * @internal
     *
     * Closes sidebars when the backdrop is clicked, if they have the
     * `closeOnClickBackdrop` option set.
     */
    SidebarContainer.prototype._onBackdropClicked = function () {
        for (var _i = 0, _a = this._sidebars; _i < _a.length; _i++) {
            var sidebar = _a[_i];
            if (sidebar.opened && sidebar.showBackdrop && sidebar.closeOnClickBackdrop) {
                sidebar.close();
            }
        }
    };
    /**
     * Subscribes from a sidebar events to react properly.
     */
    SidebarContainer.prototype._subscribe = function (sidebar) {
        var _this = this;
        sidebar.onOpenStart.subscribe(function () { return _this._onToggle(); });
        sidebar.onOpened.subscribe(function () { return _this._markForCheck(); });
        sidebar.onCloseStart.subscribe(function () { return _this._onToggle(); });
        sidebar.onClosed.subscribe(function () { return _this._markForCheck(); });
        sidebar.onModeChange.subscribe(function () { return _this._markForCheck(); });
        sidebar.onPositionChange.subscribe(function () { return _this._markForCheck(); });
        sidebar._onRerender.subscribe(function () { return _this._markForCheck(); });
    };
    /**
     * Unsubscribes from all sidebars.
     */
    SidebarContainer.prototype._unsubscribe = function () {
        for (var _i = 0, _a = this._sidebars; _i < _a.length; _i++) {
            var sidebar = _a[_i];
            sidebar.onOpenStart.unsubscribe();
            sidebar.onOpened.unsubscribe();
            sidebar.onCloseStart.unsubscribe();
            sidebar.onClosed.unsubscribe();
            sidebar.onModeChange.unsubscribe();
            sidebar.onPositionChange.unsubscribe();
            sidebar._onRerender.unsubscribe();
        }
    };
    /**
     * Check if we should show the backdrop when a sidebar is toggled.
     */
    SidebarContainer.prototype._onToggle = function () {
        var _this = this;
        if (this._sidebars.length > 0 && this.allowSidebarBackdropControl) {
            // Show backdrop if a single open sidebar has it set
            var hasOpen = this._sidebars.some(function (sidebar) { return sidebar.opened && sidebar.showBackdrop; });
            this.showBackdrop = hasOpen;
            this.showBackdropChange.emit(hasOpen);
        }
        setTimeout(function () {
            _this._markForCheck();
        });
    };
    /**
     * Triggers change detection to recompute styles.
     */
    SidebarContainer.prototype._markForCheck = function () {
        this._ref.markForCheck();
    };
    SidebarContainer.decorators = [
        { type: core_1.Component, args: [{
                    selector: 'ng-sidebar-container',
                    template: "\n    <div *ngIf=\"showBackdrop\"\n      aria-hidden=\"true\"\n      class=\"ng-sidebar__backdrop\"\n      [ngClass]=\"backdropClass\"\n      (click)=\"_onBackdropClicked()\"></div>\n\n    <ng-content select=\"ng-sidebar\"></ng-content>\n\n    <div class=\"ng-sidebar__content\"\n      [class.ng-sidebar__content--animate]=\"animate\"\n      [ngClass]=\"contentClass\"\n      [ngStyle]=\"_getContentStyle()\">\n      <ng-content select=\"[ng-sidebar-content]\"></ng-content>\n    </div>\n  ",
                    styles: ["\n    :host {\n      box-sizing: border-box;\n      display: block;\n      position: relative;\n      height: 100%;\n      width: 100%;\n      overflow: hidden;\n    }\n\n    .ng-sidebar__backdrop {\n      position: absolute;\n      top: 0;\n      bottom: 0;\n      left: 0;\n      right: 0;\n      background: #000;\n      opacity: 0.75;\n      pointer-events: auto;\n      z-index: 99999998;\n    }\n\n    .ng-sidebar__content {\n      -webkit-overflow-scrolling: touch;\n      overflow: auto;\n      position: absolute;\n      top: 0;\n      bottom: 0;\n      left: 0;\n      right: 0;\n    }\n\n    .ng-sidebar__content--animate {\n      -webkit-transition: -webkit-transform 0.3s cubic-bezier(0, 0, 0.3, 1), padding 0.3s cubic-bezier(0, 0, 0.3, 1);\n      transition: transform 0.3s cubic-bezier(0, 0, 0.3, 1), padding 0.3s cubic-bezier(0, 0, 0.3, 1);\n    }\n  "],
                    changeDetection: core_1.ChangeDetectionStrategy.OnPush
                },] },
    ];
    /** @nocollapse */
    SidebarContainer.ctorParameters = function () { return [
        { type: core_1.ChangeDetectorRef, },
    ]; };
    SidebarContainer.propDecorators = {
        'animate': [{ type: core_1.Input },],
        'allowSidebarBackdropControl': [{ type: core_1.Input },],
        'showBackdrop': [{ type: core_1.Input },],
        'showBackdropChange': [{ type: core_1.Output },],
        'contentClass': [{ type: core_1.Input },],
        'backdropClass': [{ type: core_1.Input },],
    };
    return SidebarContainer;
}());
exports.SidebarContainer = SidebarContainer;
