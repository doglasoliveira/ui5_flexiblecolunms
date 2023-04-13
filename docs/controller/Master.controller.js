sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/f/LayoutType",
    "com/vesi/zfafidgtrcpt/model/formatter",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/Image",
    "sap/m/ImageMode"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,
	LayoutType,
	formatter,
	Fragment,
	JSONModel,
	Image,
	ImageMode) {
        "use strict";

        return Controller.extend("com.vesi.zfafidgtrcpt.controller.Master", {
            formatter: formatter,
            onInit: function () {
                const oModel = new JSONModel({
                    ReceiptsCollection: []
                });
                this.getView().setModel(oModel, "oViewMaster")
                this.oRouter = this.getOwnerComponent().getRouter();
            },

            onPressNextRout: function (oEvent) {
                this._receipt = oEvent.getSource().getBindingContext("receipts").getObject().receiptId || this._receipt || "0";
                this.getView().getModel().setProperty("/layout", "TwoColumnsMidExpanded")
                this.oRouter.navTo("detail", { receiptId: this._receipt, layout: "TwoColumnsMidExpanded" });
            },

            onSelecFile: function(oEvent) {
                const oFileUpload = this.getView().byId("fileUploaderPhoto");
                if (oEvent.getSource().oFileUpload.files.length > 0) {
                    const file = oEvent.getSource().oFileUpload.files[0];
                    let path = URL.createObjectURL(file);
                    
                    this.getView().getModel().setProperty("/firstPhotoPath", path);
                    this.getView().getModel().setProperty("/firstPhotoTitle", oEvent.getSource().oFileUpload.title);

                    oFileUpload.removeAllHeaderParameters();
                    oFileUpload.removeAllParameters();

                    this.oRouter.navTo("receiptConfig", { layout: "EndColumnFullScreen" });
                }
            }
        });
    });
