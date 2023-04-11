sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
  ],
  function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("com.vesi.zfafidgtrcpt.controller.Detail", {
      onInit() {
        this.oRouter = this.getOwnerComponent().getRouter();

        this.oRouter.getRoute("master").attachPatternMatched(this._onProductMatched, this);
        this.oRouter.getRoute("detail").attachPatternMatched(this._onProductMatched, this);
      },

      _onProductMatched: function (oEvent) {
        this._receipt = oEvent.getParameter("arguments").receiptId || this._receipt || "0";
        this.onNavToAttach(this._receipt);
      },

      onExit: function () {
        this.oRouter.getRoute("master").detachPatternMatched(this._onProductMatched, this);
        this.oRouter.getRoute("detail").detachPatternMatched(this._onProductMatched, this);
      },

      onNavToAttach: function (pReceiptId) {
        this.oRouter.navTo("deepdetail", { receiptId: pReceiptId });
      }
    });
  });