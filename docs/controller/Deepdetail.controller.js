sap.ui.define([
    "com/vesi/zfafidgtrcpt/controller/BaseController",
    "com/vesi/zfafidgtrcpt/model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator"
], function (
    BaseController,
    formatter,
    JSONModel,
    BusyIndicator
) {
    "use strict";

    return BaseController.extend("com.vesi.zfafidgtrcpt.controller.Deepdetail", {
        formatter: formatter,
        onInit: function () {
            const oModel = new JSONModel({
                sURLreceiptArch: "",
                bVisibleScreMode: true
            });
            this.getView().setModel(oModel, "oDeepDetailModel");
            this.oRouter = this.getOwnerComponent().getRouter();

            this.oRouter.getRoute("deepdetail").attachPatternMatched(this._onReceiptMatched, this);
            this.oRouter.getRoute("receiptConfig").attachPatternMatched(this._onReceiptMatched, this);
        },

        _onReceiptMatched: function (oEvent) {
            const oGlobalModel = this.getOwnerComponent().getModel("global");
            const pdfViewer = this.getView().byId("receiptPDFViewer");
            this._receipt = oEvent.getParameter("arguments").receiptId || this._receipt || "0";
            this._itemNumber = oEvent.getParameter("arguments").itemNumber || this._receipt || "0";
            let sArchId = oGlobalModel.getProperty("/ArchiveId");
            let sFileInternalId = oGlobalModel.getProperty("/FileInternalId");
            pdfViewer.setSource('');
            let sURL = encodeURI(`/sap/opu/odata/sap/ZSRFI_DGT_RCPT_SRV/ReceiptAttachments(ArchiveId='${sArchId}',FileInternalId=guid'${sFileInternalId}')/$value`);
            pdfViewer.setSource();
            if (sArchId) {
                BusyIndicator.show();
                jQuery.ajax({
                    url: sURL,
                    cache: false,
                    xhr: function () {
                        var xhr = new XMLHttpRequest();
                        xhr.responseType = 'blob'
                        return xhr;
                    },
                    success: function (data) {
                        pdfViewer.setSource(URL.createObjectURL(data));
                        BusyIndicator.hide();
                    },
                    error: function () {
                        BusyIndicator.hide();
                    }
                });
            }

            if (!sArchId && !sFileInternalId) {
                this.oRouter.navTo("master");
            }
        },

        onFullResize: function (sLayout) {
            this.setLayout(sLayout);
            const oModel = this.getModel("oDeepDetailModel");
            let bVisibleScreMode =oModel.getProperty("/bVisibleScreMode")
            oModel.setProperty("/bVisibleScreMode", !bVisibleScreMode);
        },

        onExitFullResize: function (sLayout) {
            this.setLayout("TwoColumnsMidExpanded");
            const oModel = this.getModel("oDeepDetailModel");
            oModel.setProperty("/bVisibleScreMode", true);
        },

        onExitAttachResize: function (sLayout) {
            this.setLayout("TwoColumnsMidExpanded");
        },

        onExit: function () {
            this.oRouter.getRoute("deepdetail").detachPatternMatched(this._onReceiptMatched, this);
        }
    });
});