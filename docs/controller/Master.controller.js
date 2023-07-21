sap.ui.define([
    "com/vesi/zfafidgtrcpt/controller/BaseController",
    "sap/f/LayoutType",
    "com/vesi/zfafidgtrcpt/model/formatter",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/Image",
    "sap/m/ImageMode",
    "com/vesi/zfafidgtrcpt/model/models",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/table/library",
    "sap/m/MessageToast",
    "com/vesi/zfafidgtrcpt/model/filterReceiptsDialog",
    "sap/ui/core/BusyIndicator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController,
        LayoutType,
        formatter,
        Fragment,
        JSONModel,
        Image,
        ImageMode,
        models,
        Filter,
        FilterOperator,
        Sorter,
        library,
        MessageToast,
        FilterReceiptsDialog,
        BusyIndicator) {
        "use strict";

        const SortOrder = library.SortOrder;
        return BaseController.extend("com.vesi.zfafidgtrcpt.controller.Master", {
            formatter: formatter,
            onInit: function () {
                const oModel = new JSONModel({
                    ReceiptsCollection: [],
                    oReceiptsListAll: [],
                    visibleMensageStrip: true,
                    receiptListCount: 0,
                    receiptListToReviewCount: 0,
                    sortByDateA: false,
                    listFiltersReceipts: models.createListFitersTypesModel().getData().listFiltersReceipts,
                    listFilterMonths: models.createListFitersTypesModel().getData().listFilterMonths,
                    listFilterExpType: models.createListFitersTypesModel().getData().ListFilterExpType,
                    listFilterAmount: models.createListFitersTypesModel().getData().listFilterAmount,
                    listFilterArStatus: models.createListFitersTypesModel().getData().listFilterArStatus,
                    visibleFilterTypesList: true,
                    filterByTileText: "",
                    filterByContext: "kNGroup",
                    isOCRStatus: "OCRStatus",
                    isArchStatus: "ArchStatus",
                    isReviewStatus: "ReviewStatus"
                });
                this.getView().setModel(oModel, "oViewMaster")
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.getRoute("master").attachMatched(this._onReceiptMatched, this);

                //this._onOpenFirstDialog();
                this._onCheckFirstDialog();

                this.createExpenseTypes();
            },

            _onReceiptMatched: function (oEvent) {
                this.getReceiptList();
            },

            getDisplayFlag: function () {
                return new Promise(function (res, rej) {
                    this.getOwnerComponent().getModel().read("/MessagesInformation(MessageId='FIRSTALERT')", {
                        success: function (oData) {
                            res(oData);
                        },
                        error: function (oError) {
                            rej(oError);
                        }
                    });
                }.bind(this));
            },

            _onCheckFirstDialog: function () {
                this.getDisplayFlag().then((oData) => this._onOpenFirstDialog(oData.NotDisplayMsg));
            },

            _onOpenFirstDialog: function (showMessage) {
                if (showMessage) {
                    if (!this._oFirstAlertDialog) {
                        Fragment.load({
                            name: "com.vesi.zfafidgtrcpt.view.fragment.dialogMessages.DialogFirstAlert",
                            controller: this
                        }).then(function (oFirstAlertDialog) {
                            this._oFirstAlertDialog = oFirstAlertDialog;
                            this.getView().addDependent(this._oFirstAlertDialog);
                            this._oFirstAlertDialog.open();
                        }.bind(this));
                    } else {
                        this._oFirstAlertDialog.open();
                    }
                }
            },

            onCloseFirstDialog: function () {
                const messageId = "FIRSTALERT";
                const oGlobalModel = this.getOwnerComponent().getModel("global");
                let doNotShowAgain = oGlobalModel.getProperty("/bFirstDialog");
                this.getReceiptList();

                if (doNotShowAgain) {
                    const oDataModel = this.getOwnerComponent().getModel();
                    let oEntry = {
                        "MessageId": messageId,
                        "NotDisplayMsg": doNotShowAgain
                    };

                    oDataModel.create("/MessagesInformation", oEntry, {
                        success: function (oData) {
                            this._oFirstAlertDialog.close();
                        }.bind(this),
                        error: function (oError) {
                            console.error(oError)
                        }.bind(this)
                    })
                } else {
                    this._oFirstAlertDialog.close();
                }
            },

            getReceiptList: function () {
                const oModel = this.getModel("oViewMaster");
                const oGlobalModel = this.getModel("global");
                const oModelData = this.getOwnerComponent().getModel();

                BusyIndicator.show();
                oModelData.read("/Receipts", {
                    success: function (oData) {
                        BusyIndicator.hide();

                        let oReceiptsList = oData.results;
                        let oReceiptsListToReview = oReceiptsList.filter(items => items.IsReviewed == "");

                        oModel.setProperty("/ReceiptsCollection", oReceiptsList);
                        oModel.setProperty("/oReceiptsListAll", oReceiptsList);

                        //Set counters
                        oModel.setProperty("/receiptListCount", oReceiptsList.length);
                        oModel.setProperty("/receiptListToReviewCount", oReceiptsListToReview.length);

                        if (oReceiptsListToReview.length > 0) {
                            oGlobalModel.setProperty("/receiptListToReview", oReceiptsListToReview);
                        } else {
                            oGlobalModel.setProperty("/receiptListToReview", []);
                        }

                        const oTable = this.byId("receiptsTable");
                        let oBinding = oTable.getBinding("items");
                        let oSorter = new Sorter("CreatedAt", true);
                        oBinding.sort(oSorter);
                        oTable.getModel().refresh();
                    }.bind(this),
                    error: function (oError) {
                        BusyIndicator.hide();
                    }
                });
            },

            onPressNextRout: function (oEvent) {
                this._receipt = oEvent.getSource().getBindingContext("oViewMaster").getObject().FileInternalId || this._receipt || "0";
                this._itemNumber = oEvent.getSource().getBindingContext("oViewMaster").getObject().ItemNumber || this._itemNumber || "0";
                this.setLayout("TwoColumnsMidExpanded");
                this.oRouter.navTo("detail", { itemNumber: this._itemNumber, receiptId: this._receipt });
            },

            onSelecFile: function (oEvent) {
                const oGlobalModel = this.getModel("global");
                let oListFiles = oGlobalModel.getProperty("/listFiles");

                // const oFileUpload = this.getView().byId("fileUploaderPhoto");
                if (oEvent.getSource().oFileUpload.files.length > 0) {
                    const file = oEvent.getSource().oFileUpload.files[0];
                    let sTitle = oEvent.getSource().oFileUpload.title
                    let sPath = URL.createObjectURL(file);
                    //save current file in global file model
                    let oBlobFile = new Blob([file], { type: file.type });
                    //save file in global list files model
                    oListFiles.push(oBlobFile);
                    oGlobalModel.setProperty("/listFiles", oListFiles);
                    oGlobalModel.setProperty("/currentFile", file);
                    oGlobalModel.setProperty("/firstPhotoPath", sPath);
                    oGlobalModel.setProperty("/firstPhotoTitle", sTitle);
                    oGlobalModel.setProperty("/layout", "EndColumnFullScreen");
                    this.getOwnerComponent().removeTreeColumnPage();
                    this.oRouter.navTo("receiptConfig", { receiptId: "0", layout: "EndColumnFullScreen" });
                }
            },

            // onExit: function () {
            //     this.oRouter.getRoute("master").detachPatternMatched(this._onReceiptMatched, this);
            //     this.oRouter.getRoute("detail").detachPatternMatched(this._onReceiptMatched, this);
            // },

            onChangeReceiptListMode: function (oEvent) {
                const oModel = this.getModel("oViewMaster");
                let oSegmentedButton = this.byId('segBtmChangeReceiptListMode'),
                    oSelectedItemId = oSegmentedButton.getSelectedKey();

                let oReceiptsListAll = oModel.getProperty("/oReceiptsListAll");
                let oReceiptsListToReview = oReceiptsListAll.filter(items => items.IsReviewed == "");

                if (oSelectedItemId === "srcAll") {
                    oModel.setProperty("/ReceiptsCollection", oReceiptsListAll);
                    return;
                };

                oModel.setProperty("/ReceiptsCollection", oReceiptsListToReview);
            },

            onSearchRecipts: function (oEvent) {
                const oModelData = this.getOwnerComponent().getModel();
                const oGlobalModel = this.getModel("global");
                const oModel = this.getModel("oViewMaster");
                let sQuery = oEvent.getSource().getProperty("value");

                let oParams = {
                    search: sQuery
                };

                BusyIndicator.show();
                oModelData.read("/Receipts", {
                    urlParameters: oParams,
                    success: function (oData) {
                        BusyIndicator.hide();

                        let oReceiptsList = oData.results;
                        let oReceiptsListToReview = oReceiptsList.filter(items => items.IsReviewed == "");

                        oModel.setProperty("/ReceiptsCollection", oReceiptsList);
                        oModel.setProperty("/oReceiptsListAll", oReceiptsList);

                        //Calc Total Amount
                        let totalAmount = 0.00;
                        oReceiptsList.map(item => {
                            let oDataAmount = parseFloat(item.Amount);
                            totalAmount = (+totalAmount + oDataAmount);
                        })
                        let nFixedFloatAmaount = totalAmount.toFixed(2);
                        oModel.setProperty("/receiptListTotalAmount", `Amount: ${nFixedFloatAmaount} ${oReceiptsList[0].Currency}`);

                        //Set counters
                        oModel.setProperty("/receiptListCount", oReceiptsList.length);
                        oModel.setProperty("/receiptListToReviewCount", oReceiptsListToReview.length);

                        if (oReceiptsListToReview.length > 0) {
                            oGlobalModel.setProperty("/receiptListToReview", oReceiptsListToReview);
                        } else {
                            oGlobalModel.setProperty("/receiptListToReview", []);
                        }

                        const oTable = this.byId("receiptsTable");
                        let oBinding = oTable.getBinding("items");
                        let oSorter = new Sorter("CreatedAt", true);
                        oBinding.sort(oSorter);
                        oTable.getModel().refresh();
                    }.bind(this),
                    error: function (oError) {
                        BusyIndicator.hide();
                    }
                });
            },

            onSelectGrouping: function (oEvent) {
                let sGroupKey = oEvent.getParameter("selectedKey");
                let sGroupBy = "";

                switch (sGroupKey) {
                    case "kDate":
                        sGroupBy = "InvoiceDate";
                        break;
                    case "kExpType":
                        sGroupBy = "Category";
                        break;
                    case "kOCRStatus":
                        sGroupBy = "OCRStatusDesc";
                        break;
                    case "kArchStatus":
                        sGroupBy = "ArchiveStatusDesc";
                        break;
                    default:
                        this.getReceiptList();
                        return;
                        break;
                }

                const oTable = this.byId("receiptsTable");
                let oBinding = oTable.getBinding("items");
                let oSorter = new sap.ui.model.Sorter(sGroupBy, Sorter.Ascending, true);
                oBinding.sort(oSorter);
                oTable.setModel(oBinding.getModel());
            },

            onSortByDate: function (oEvent) {
                const oModel = this.getModel("oViewMaster");
                let bStateSortByDateA = oModel.getProperty("/sortByDateA");
                oModel.setProperty("/sortByDateA", !bStateSortByDateA);

                const oTable = this.byId("receiptsTable");
                let oBinding = oTable.getBinding("items");
                let oSorter = new Sorter("InvoiceDate", bStateSortByDateA ? true : false, false);
                oBinding.sort(oSorter);
                oTable.getModel().refresh();
                oTable.setModel(oBinding.getModel());
            },

            onReLoadList: function (oEvent) {
                this.getReceiptList();
            },

            onDeleteList: function (oEvent) {
                //const oModel = this.getModel("oViewMaster");
                //oModel.setProperty("/ReceiptsCollection", [])

                const oDataModel = this.getOwnerComponent().getModel();
                oDataModel.callFunction("/deleteAll", {
                    method: "POST",
                    urlParameters: {
                        DeleteFlag: true
                    },
                    success: function (oData, response) {
                        this.onReLoadList();
                        MessageToast.show("Receipts deleted")
                    }.bind(this),
                    error: function (oError) {
                    }.bind(this)
                });

            },

            onOpenFilterReciptsDialog: function (oEvent) {
                FilterReceiptsDialog.onOpenFilterReciptsDialog(this, oEvent);
            },

            onCloseFilterReceiptsDialog(oEvent) {
                FilterReceiptsDialog.onCloseFilterReceiptsDialog(this, oEvent);
            },

            onNavToDetailFilterTypes(oEvent) {
                FilterReceiptsDialog.onNavToDetailFilterTypes(this, oEvent);
            },

            onNavBackFilterReciptsDialog() {
                FilterReceiptsDialog.onNavBackFilterReciptsDialog(this);
            },

            onSearchFilterList: function (oEvent) {
                FilterReceiptsDialog.onSearchFilterList(this, oEvent);
            },

            onSelectMonthFilter(oEvent) {
                this.getOwnerComponent.popListMonth = oEvent.getSource();
                const oModel = this.getModel("oViewMaster");
                let oListFilterTypes = oModel.getProperty("/listFiltersReceipts");
                let oSelectedMonthsModel = [];
                let sMonthsSelected = oEvent.getSource().getSelectedItems();

                sMonthsSelected.forEach(item => {
                    oSelectedMonthsModel.push({ month: item.oBindingContexts["oViewMaster"].getObject().monthId });
                });

                oListFilterTypes.forEach(item => {
                    if (item.key === "kFilterMonth") {
                        item.qtdSelected++;
                        item.selectedIndices = oSelectedMonthsModel;
                    }
                });

                oModel.setProperty("/listFiltersReceipts", oListFilterTypes);
            },

            onSelectExpTypesFilter(oEvent) {
                this.getOwnerComponent.popListExType = oEvent.getSource();
                const oModel = this.getModel("oViewMaster");
                let oListFilterTypes = oModel.getProperty("/listFiltersReceipts");
                let oSelectedExpTypeModel = [];
                let sExpTypeSelected = oEvent.getSource().getSelectedItems();

                sExpTypeSelected.forEach(item => {
                    oSelectedExpTypeModel.push({ expType: item.oBindingContexts["global"].getObject().Expensetypeid });
                });

                oListFilterTypes.forEach(item => {
                    if (item.key === "kFilterExType") {
                        item.qtdSelected++;
                        item.selectedIndices = oSelectedExpTypeModel;
                    }
                });

                oModel.setProperty("/listFiltersReceipts", oListFilterTypes);
            },

            onSelectAmountFilter(oEvent) {
                this.getOwnerComponent.popListAmount = oEvent.getSource();
                const oModel = this.getModel("oViewMaster");
                let oListFilterTypes = oModel.getProperty("/listFiltersReceipts");
                let oSelectedAmountModel = [];
                let sAmuntSelected = oEvent.getSource().getSelectedItems();

                sAmuntSelected.forEach(item => {
                    oSelectedAmountModel.push({ amount: item.oBindingContexts["oViewMaster"].getObject().amountId });
                });

                oListFilterTypes.forEach(item => {
                    if (item.key === "kFilterAmount") {
                        item.qtdSelected = 1;
                        item.selectedIndices = oSelectedAmountModel;
                    }
                });

                oModel.setProperty("/listFiltersReceipts", oListFilterTypes);
            },

            onSelectArStatusFilter(oEvent) {
                this.getOwnerComponent.popListArStatus = oEvent.getSource();
                const oModel = this.getModel("oViewMaster");
                let oListFilterTypes = oModel.getProperty("/listFiltersReceipts");
                let oSelectedArStatusModel = [];
                let sArStatusSelected = oEvent.getSource().getSelectedItems();

                sArStatusSelected.forEach(item => {
                    oSelectedArStatusModel.push({ arStatus: item.oBindingContexts["oViewMaster"].getObject().arStatusId });
                });

                oListFilterTypes.forEach(item => {
                    if (item.key === "kFilterArchStatus") {
                        item.qtdSelected++;
                        item.selectedIndices = oSelectedArStatusModel;
                    }
                });

                oModel.setProperty("/listFiltersReceipts", oListFilterTypes);
            },

            onConfirmFilterReceiptsDialog: function (oEvent) {
                const oModel = this.getModel("oViewMaster");
                const oListsContent = oModel.getProperty("/listFiltersReceipts");
                let sContext = oModel.getProperty("/filterByContext");

                if (sContext !== "kNGroup") {
                    FilterReceiptsDialog.onNavBackFilterReciptsDialog(this);
                    return;
                }

                FilterReceiptsDialog.onConfirmFilterReceiptsDialog(sContext, this, oListsContent);
            },

            onResetSelectionFilters(oEvent) {
                const oModel = this.getModel("oViewMaster");
                let oListFilterTypes = oModel.getProperty("/listFiltersReceipts");
                oListFilterTypes.forEach(item => {
                    item.qtdSelected = 0;
                    item.selectedIndices = [];
                });

                if (this.getOwnerComponent.popListMonth) {
                    this.getOwnerComponent.popListMonth.removeSelections();
                }

                if (this.getOwnerComponent.popListExType) {
                    this.getOwnerComponent.popListExType.removeSelections();
                }

                if (this.getOwnerComponent.popListAmount) {
                    this.getOwnerComponent.popListAmount.removeSelections();
                }

                if (this.getOwnerComponent.popListArStatus) {
                    this.getOwnerComponent.popListArStatus.removeSelections();
                }
                FilterReceiptsDialog.onNavBackFilterReciptsDialog(this);
            },

            onCreateExpense: function () {
                const oSelectedItems = this.byId("receiptsTable").getSelectedItems();
                //console.log(oSelectedItems[0].getBindingContext("oViewMaster").getObject())
                const oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                oCrossAppNavigator.isIntentSupported(["ZTravelExpense-create"]).done(function (e) {
					var hash = oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
						target: {
							semanticObject: "ZTravelExpense",
							action: "create"
						}
					}) || "";
					var url = window.location.href.split("#")[0] + hash;
					sap.m.URLHelper.redirect(url, false)
				}).fail(function () {
					new sap.m.MessageToast("Provide corresponding intent to navigate")
				})
            },

            onNavAttachment: function (oEvent) {
                const oGlobalModel = this.getModel("global");
                const oObjectModel = oEvent.getSource().getBindingContext("oViewMaster").getObject();
                let sReceipt = oObjectModel.FileInternalId;
                let sItemNumber = oObjectModel.ItemNumber;
                oGlobalModel.setProperty("/ArchiveId", oObjectModel.ArchiveId);
                oGlobalModel.setProperty("/FileInternalId", oObjectModel.FileInternalId);
                this.setLayout("EndColumnFullScreen");
                this.oRouter.navTo("deepdetail", { itemNumber: sItemNumber, receiptId: sReceipt });
            },
            /**
             * @override
             */
            onAfterRendering: function() {
                const oGlobalModel = this.getModel("global");
                oGlobalModel.setProperty("/gIdList", this.byId("receiptsTable"));
            }
        });
    });
