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
        let sLayout = "ThreeColumnsMidExpanded";

        // Save the current route name
        this.currentRouteName = sRouteName;

        //Check device
        sLayout = this.checkDevice(oEvent.getParameter("arguments").layout)
        /*if (navigator.userAgent.match(/Android/i)
          || navigator.userAgent.match(/webOS/i)
          || navigator.userAgent.match(/iPhone/i)
          || navigator.userAgent.match(/iPad/i)
          || navigator.userAgent.match(/iPod/i)
          || navigator.userAgent.match(/BlackBerry/i)
          || navigator.userAgent.match(/Windows Phone/i)
        ) {
          sLayout = "OneColumn"; // está utilizando celular
        }
        else {
          sLayout = oEvent.getParameter("arguments").layout || "ThreeColumnsMidExpanded"; // não é celular
        }*/
        if (this.currentRouteName === "master") {
          this.oRouter.navTo(this.currentRouteName, { layout: sLayout }, true);
        }

      },

      onStateChanged: function (oEvent) {
        //var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
        //sLayout = oEvent.getParameter("layout");

        // Replace the URL with the new layout if a navigation arrow was used
        /*if (bIsNavigationArrow) {
          this.oRouter.navTo(this.currentRouteName, { layout: sLayout }, true);
        }*/
      },

      onExit: function () {
        this.oRouter.detachRouteMatched(this.onRouteMatched, this);
      }
    });
  }
);
