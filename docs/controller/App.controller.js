sap.ui.define(
  [
    "com/vesi/zfafidgtrcpt/controller/BaseController"
  ],
  function (
    BaseController) {
    "use strict";

    return BaseController.extend("com.vesi.zfafidgtrcpt.controller.App", {
      onInit() {
        this.oOwnerComponent = this.getOwnerComponent();
        this.oRouter = this.oOwnerComponent.getRouter();
        this.oRouter.attachRouteMatched(this.onRouteMatched, this);
      },

      onRouteMatched: function (oEvent) {
        const sRouteName = oEvent.getParameter("name");
        let sLayout = "OneColumn";

        // Save the current route name
        this.currentRouteName = sRouteName;
      },

      onExit: function () {
        this.oRouter.detachRouteMatched(this.onRouteMatched, this);
      }
    });
  }
);
