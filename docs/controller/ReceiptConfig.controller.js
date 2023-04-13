sap.ui.define([
    "com/vesi/zfafidgtrcpt/controller/BaseController",
    "com/vesi/zfafidgtrcpt/model/formatter",
    "sap/m/Image"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController,
	formatter,
	Image) {
        "use strict";

        return BaseController.extend("com.vesi.zfafidgtrcpt.controller.ReceiptConfig", {
            formatter: formatter,
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("receiptConfig").attachPatternMatched(this._onProductMatched, this);
                
            },
            _onProductMatched: function (oEvent) {
                const oReceiptsModel = this.getOwnerComponent().getModel("receipts");
                this._layout = oEvent.getParameter("arguments").layout;
                oReceiptsModel.setProperty("/layout", this._layout);
                this.sFristPhotoPath = this.getView().getModel().getProperty("/firstPhotoPath");
                this.sFristPhotoTitle = this.getView().getModel().getProperty("/firstPhotoTitle");
                this._createPreviewPhoto(this.sFristPhotoTitle, this.sFristPhotoPath);
            },

            onSelecFile: function (oEvent) {
                if (oEvent.getSource().oFileUpload.files.length > 0) {
                    const file = oEvent.getSource().oFileUpload.files[0];
                    let sPath = URL.createObjectURL(file);
                    let sTitle = oEvent.getSource().oFileUpload.title

                    this._createPreviewPhoto(sTitle, sPath);
                }
            },

            onFileNewReceipt: function(oEvent){
                this._clearCarousel();
                this.onSelecFile(oEvent);
            },

            _createPreviewPhoto: function (sTitle, SPath) {
                const oCarousel = this.getView().byId("previewImage");

                let oSelectedFile = new Image({
                    src: SPath
                });
                
                oCarousel.addPage(oSelectedFile);
            },

            onExit: function () {
                this.oRouter.getRoute("master").detachPatternMatched(this._onProductMatched, this);
                this.oRouter.getRoute("detail").detachPatternMatched(this._onProductMatched, this);
            },

            onCancelPhotoReceiptConfig: function(oEvent){
                this._clearCarousel()
                let sLayout = this.checkDevice();
                this.oRouter.navTo("deepdetail", {receiptId:"x", layout: sLayout });
            },

            _clearCarousel: function(){
                const oCarousel = this.getView().byId("previewImage");
                oCarousel.removeAllPages();
            }
        });
    });
