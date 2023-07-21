sap.ui.define([
    "com/vesi/zfafidgtrcpt/controller/BaseController",
    "com/vesi/zfafidgtrcpt/model/formatter",
    "sap/m/Image",
    "sap/m/MessageToast",
    "thirdparty/jsPDF",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController,
        formatter,
        Image,
        MessageToast,
        jsPDF,
        BusyIndicator,
        Fragment,
        JSONModel) {
        "use strict";

        return BaseController.extend("com.vesi.zfafidgtrcpt.controller.ReceiptConfig", {
            formatter: formatter,
            onInit: function () {
                const oModel = new JSONModel({
                    isImage: true
                });
                this.getView().setModel(oModel, "oReceiptConfigView");
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("receiptConfig").attachPatternMatched(this._onReceiptMatched, this);

            },
            _onReceiptMatched: function (oEvent) {
                const oGlobalModel = this.getModel("global");
                const oModel = this.getModel("oReceiptConfigView");
                this.setLayout("EndColumnFullScreen");
                let sfirstPhotoPath = oGlobalModel.getProperty("/firstPhotoPath");
                let sFristPhotoTitle = oGlobalModel.getProperty("/firstPhotoTitle");
                let sCurrentFile = oGlobalModel.getProperty("/currentFile");
                let pdfPreViewer = this.byId("receiptPDFPreViewer");
                let filBlob = oGlobalModel.getProperty("/listFiles");
                if (sCurrentFile.type === "application/pdf") {
                    oModel.setProperty("/isImage", false);
                    pdfPreViewer.setSource(sfirstPhotoPath);
                } else {
                    oModel.setProperty("/isImage", true);
                    this.createPreviewPhoto("previewImage", sFristPhotoTitle, sfirstPhotoPath);
                }
            },

            onSelecFile: function (oEvent) {
                const oGlobalModel = this.getModel("global");
                let oListFiles = oGlobalModel.getProperty("/listFiles");

                if (oEvent.getSource().getId().includes("fileUploaderAddPhotoReceiptsConfig")) {
                    oGlobalModel.setProperty("/bShowIsToSplit", true);
                };

                if (oEvent.getSource().oFileUpload.files.length > 0) {
                    const file = oEvent.getSource().oFileUpload.files[0];
                    let sPath = URL.createObjectURL(file);
                    let sTitle = oEvent.getSource().oFileUpload.title

                    //save current file in global file model
                    let oBlobFile = new Blob([file], { type: file.type });

                    //save file in global list files model
                    oListFiles.push(oBlobFile);
                    oGlobalModel.setProperty("/listFiles", oListFiles);
                    oGlobalModel.setProperty("/currentFile", file);
                    oGlobalModel.setProperty("/firstPhotoPath", sPath);
                    oGlobalModel.setProperty("/firstPhotoTitle", sTitle);

                    this.createPreviewPhoto("previewImage", sTitle, sPath);
                }
            },

            onFileNewReceipt: function (oEvent) {
                const oGlobalModel = this.getModel("global");
                oGlobalModel.setProperty("/newReceipt", true);

                //this.onOpenToSplit();
                //this.onChoseToSplit();
                //this._clearCarousel();
                this.onSelecFile(oEvent);
            },

            onExit: function () {
                this.oRouter.getRoute("receiptConfig").detachPatternMatched(this._onReceiptMatched, this);
            },

            onCancelPhotoReceiptConfig: function () {
                this._clearCarousel()
                this.setLayout("OneColumn");
                this.oRouter.navTo("master");
                this.getOwnerComponent().removeTreeColumnPage();
            },

            _clearCarousel: function () {
                const oGlobalModel = this.getModel("global");
                oGlobalModel.setProperty("/listFiles", []);
                const oCarousel = this.getView().byId("previewImage");
                oCarousel.removeAllPages();
                const pdfPreViewer = this.byId("receiptPDFPreViewer");
                pdfPreViewer.setSource();
            },

            onOpenToSplit: function () {
                const oModel = this.getModel("oReceiptConfigView");
                const oBundle = this.getView().getModel("i18n").getResourceBundle();
                const oGlobalModel = this.getModel("global");
                let sCurrentFile = oGlobalModel.getProperty("/currentFile");
                let bShowIsToSplit = oGlobalModel.getProperty("/bShowIsToSplit");
                if (sCurrentFile.type !== "application/pdf" && !bShowIsToSplit) {
                    this.onDigitaliseReceipt(false);
                    return;
                }

                let sisToSplit = `<p>${oBundle.getText('reciptConfigIsToSplitMessage')}</p>
                                  <p><li><strong>${oBundle.getText('reciptConfigIsToSplitMessageOne1th')}</strong> ${oBundle.getText('reciptConfigIsToSplitMessageOne2th')} <strong>${oBundle.getText('reciptConfigIsToSplitMessageOne3th')}</strong></li></p>
                                  <p><li><strong>${oBundle.getText('reciptConfigIsToSplitMessageMulti1th')}</strong> ${oBundle.getText('reciptConfigIsToSplitMessageMulti2th')} <strong>${oBundle.getText('reciptConfigIsToSplitMessageMulti3th')}</strong></li></p>`
                oModel.setProperty("/reciptConfigIsToSplitMessage", sisToSplit)
                if (!this._oToSplitDialog) {
                    Fragment.load({
                        name: "com.vesi.zfafidgtrcpt.view.fragment.dialogMessages.DialogIsToSplit",
                        controller: this
                    }).then(function (oToSplitDialog) {
                        this._oToSplitDialog = oToSplitDialog;
                        this.getView().addDependent(this._oToSplitDialog);
                        this._oToSplitDialog.open();
                    }.bind(this));
                } else {
                    this._oToSplitDialog.open();
                }
            },

            onChoseToSplit: function (isToSplit) {
                isToSplit = isToSplit ? 'X' : '';
                const oGlobalModel = this.getOwnerComponent().getModel("global");
                let sCurrentFile = oGlobalModel.getProperty("/currentFile");
                //if (this._oToSplitDialog) {
                this._oToSplitDialog.close();
                //}
                let bShowIsToSplit = oGlobalModel.getProperty("/bShowIsToSplit");
                if (bShowIsToSplit) {
                    this.onDigitaliseReceipt(isToSplit)
                    return
                };
                this._savePDFDocs(sCurrentFile, isToSplit);
            },

            onCloseToSplit: function () {
                this._oToSplitDialog.close();
            },

            onDigitaliseReceipt: function (pIsToSplit) {
                const oGlobalModel = this.getModel("global");
                let oListFiles = oGlobalModel.getProperty("/listFiles");
                var aImages = [];
                for (var i = 0; i < oListFiles.length; i++) {
                    var oReader = new FileReader();

                    oReader.onload = function (e) {
                        aImages.push(e.target.result);
                    };

                    oReader.readAsDataURL(oListFiles[i]);
                }
                oReader.onloadend = function () {
                    this.generatePdf(aImages, pIsToSplit);
                }.bind(this);
            },

            generatePdf: function (aImages, pIsToSplit) {
                let doc = new jsPDF.jsPDF();
                for (var i = 0; i < aImages.length; i++) {
                    doc.addImage(aImages[i], 'JPEG', 0, 0, 210, 297);
                    if (i < aImages.length - 1) {
                        doc.addPage();
                    }
                }
                let to_split = pIsToSplit ? 'X' : '';
                this._savePDFDocImages(doc, to_split)
            },

            _savePDFDocImages: function (oPDF, to_split) {
                let that = this;
                const oGlobalModel = this.getModel("global");
                const pdfBuffer = oPDF.output('arraybuffer');
                const sSecurityToken = this.getView().getModel().getSecurityToken();
                let sTime = new Date().toLocaleTimeString().substr(0, 8).replaceAll(":", "");
                let sFileName = `receipts_${sTime}.pdf`;
                //oPDF.save(sFileName); //just for test
                const formData = new FormData();
                const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
                formData.append('value', pdfBlob, sFileName);

                let pNewReceipt = oGlobalModel.getProperty("/newReceipt");

                if (!pNewReceipt) {
                    BusyIndicator.show();
                }
                fetch('/sap/opu/odata/sap/ZSRFI_DGT_RCPT_SRV/ReceiptAttachments', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-Token': sSecurityToken,
                        'SLUG': sFileName + ";" + "PDF" + ";" + to_split
                    },
                    body: formData
                })
                    .then(response => response.json())
                    .then(data => {
                        BusyIndicator.hide();
                        this.onCancelPhotoReceiptConfig();
                    })
                    .catch(error => {
                        BusyIndicator.hide();
                        this.onCancelPhotoReceiptConfig();
                    });
            },

            _savePDFDocs: function (oPDF, to_split) {
                let that = this;
                //const pdfBuffer = oPDF.output('arraybuffer');
                //const pdfBuffer = oPDF.arrayBuffer();
                const sSecurityToken = this.getView().getModel().getSecurityToken();
                let sTime = new Date().toLocaleTimeString().substr(0, 8).replaceAll(":", "");
                let sFileName = `receipts_${sTime}.pdf`;
                //oPDF.save(sFileName); just for test
                const formData = new FormData();
                const pdfBlob = new Blob([oPDF], { type: 'application/pdf' });
                formData.append('value', pdfBlob, sFileName);

                BusyIndicator.show();
                fetch('/sap/opu/odata/sap/ZSRFI_DGT_RCPT_SRV/ReceiptAttachments', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-Token': sSecurityToken,
                        'SLUG': sFileName + ";" + "PDF" + ";" + to_split
                    },
                    body: formData
                })
                    .then(response => response.json())
                    .then(data => {
                        BusyIndicator.hide();
                        this.onCancelPhotoReceiptConfig();
                    })
                    .catch(error => {
                        BusyIndicator.hide();
                        this.onCancelPhotoReceiptConfig();
                    });
            },

            onPageChanged: function (oEvent) {
                const oGlobalModel = this.getModel("global");
                const oCarousel = this.getView().byId("previewImage");
                let newActivePageIdx = oCarousel._getPageIndex(oEvent.getParameter("newActivePageId"));
                oGlobalModel.setProperty("/gPhotoCountIndice", newActivePageIdx + 1);
            }
        });
    });