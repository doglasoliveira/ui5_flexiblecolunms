sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/f/LayoutType",
    "com/vesi/zfafidgtrcpt/model/formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,
        LayoutType,
        formatter) {
        "use strict";

        return Controller.extend("com.vesi.zfafidgtrcpt.controller.Master", {
            formatter: formatter,
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
            },

            onPressNextRout: function (oEvent) {
                this._receipt = oEvent.getSource().getBindingContext("receipts").getObject().receiptId || this._receipt || "0";
                this.getView().getModel().setProperty("/layout", "TwoColumnsMidExpanded")
                this.oRouter.navTo("detail", { receiptId: this._receipt, layout: "TwoColumnsMidExpanded" });
            },

            andleUploadComplete: function(oEvent) {
                var sResponse = oEvent.getParameter("response"),
                    iHttpStatusCode = parseInt(/\d{3}/.exec(sResponse)[0]),
                    sMessage;
    
                if (sResponse) {
                    sMessage = iHttpStatusCode === 200 ? sResponse + " (Upload Success)" : sResponse + " (Upload Error)";
                    MessageToast.show(sMessage);
                }
            }
        });
    });
