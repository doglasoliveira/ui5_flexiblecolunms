sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (
    Controller
) {
    "use strict";

    return Controller.extend("com.vesi.zfafidgtrcpt.controller.Deepdetail", {
        /**
         * @override
         */
        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();

            this.oRouter.getRoute("deepdetail").attachPatternMatched(this._onProductMatched, this);
            this.oRouter.getRoute("receiptConfig").attachPatternMatched(this._onProductMatched, this);
        },

        _onProductMatched: function (oEvent) {
            this._receipt = oEvent.getParameter("arguments").receiptId || this._receipt || "0";
        },

        onExit: function () {
            this.oRouter.getRoute("deepdetail").detachPatternMatched(this._onProductMatched, this);
        }
    });
});