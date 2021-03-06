"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var sidebar_component_1 = require("./sidebar.component");
var CloseSidebar = /** @class */ (function () {
    function CloseSidebar(_sidebar) {
        this._sidebar = _sidebar;
    }
    /** @internal */
    CloseSidebar.prototype._onClick = function () {
        if (this._sidebar) {
            this._sidebar.close();
        }
    };
    CloseSidebar.decorators = [
        { type: core_1.Directive, args: [{
                    selector: '[closeSidebar]',
                    host: {
                        '(click)': '_onClick()'
                    }
                },] },
    ];
    /** @nocollapse */
    CloseSidebar.ctorParameters = function () { return [
        { type: sidebar_component_1.Sidebar, },
    ]; };
    return CloseSidebar;
}());
exports.CloseSidebar = CloseSidebar;
