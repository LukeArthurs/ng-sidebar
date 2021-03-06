"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var sidebar_container_component_1 = require("./sidebar-container.component");
var sidebar_component_1 = require("./sidebar.component");
var close_directive_1 = require("./close.directive");
var SidebarModule = /** @class */ (function () {
    function SidebarModule() {
    }
    SidebarModule.forRoot = function () {
        return {
            ngModule: SidebarModule
        };
    };
    SidebarModule.decorators = [
        { type: core_1.NgModule, args: [{
                    declarations: [sidebar_container_component_1.SidebarContainer, sidebar_component_1.Sidebar, close_directive_1.CloseSidebar],
                    imports: [common_1.CommonModule],
                    exports: [sidebar_container_component_1.SidebarContainer, sidebar_component_1.Sidebar, close_directive_1.CloseSidebar]
                },] },
    ];
    /** @nocollapse */
    SidebarModule.ctorParameters = function () { return []; };
    return SidebarModule;
}());
exports.SidebarModule = SidebarModule;
