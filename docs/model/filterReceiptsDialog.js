sap.ui.define([
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/Sorter"
], function (Fragment,
	Filter,
	FilterOperator,
	BusyIndicator,
    Sorter) {
    "use strict";

    return {
        onOpenFilterReciptsDialog: function (that, oEvent) {
            if (!that._oFilterReciptsDialog) {
                Fragment.load({
                    name: "com.vesi.zfafidgtrcpt.view.fragment.filtersBy.DialogFilterRecipts",
                    controller: that
                }).then(function (oFilterReciptsDialog) {
                    that._oFilterReciptsDialog = oFilterReciptsDialog;
                    that.getView().addDependent(that._oFilterReciptsDialog);
                    that._oFilterReciptsDialog.open();
                }.bind(that));
            } else {
                that._oFilterReciptsDialog.open();
            }
        },

        onCloseFilterReceiptsDialog(that) {
            //that.onNavBackFilterReciptsDialog();
            const oModel = that.getModel("oViewMaster");
            let oListFilterTypes = oModel.getProperty("/listFiltersReceipts");
            oListFilterTypes.forEach(item => {
                item.qtdSelected = 0;
                item.selectedIndices = []
            });

            if (that.getOwnerComponent.popListMonth) {
                that.getOwnerComponent.popListMonth.removeSelections();
            }

            if (that.getOwnerComponent.popListExType) {
                that.getOwnerComponent.popListExType.removeSelections();
            }

            if (that.getOwnerComponent.popListAmount) {
                that.getOwnerComponent.popListAmount.removeSelections();
            }

            if (that.getOwnerComponent.popListArStatus) {
                that.getOwnerComponent.popListArStatus.removeSelections();
            }

            oModel.setProperty("/listFiltersReceipts", oListFilterTypes);
            oModel.setProperty("/filterByContext", "kNGroup");
            that._oFilterReciptsDialog.close();
        },

        onNavToDetailFilterTypes(that, oEvent) {
            const oModel = that.getModel("oViewMaster");
            const oSelectedItem = oEvent.getSource().getSelectedItem();
            let bVisibleFilterList = oModel.getProperty("/visibleFilterTypesList")
            let sItemSelected = oSelectedItem.getProperty("title");
            let sItemSelectedKey = oSelectedItem.oBindingContexts["oViewMaster"].getObject().key;
            let filterByTitle = `By: ${sItemSelected}`;

            oModel.setProperty("/filterByTileText", filterByTitle);
            oModel.setProperty("/visibleFilterTypesList", !bVisibleFilterList);
            oModel.setProperty("/filterByContext", sItemSelectedKey);

            oEvent.getSource().removeSelections(true);
        },

        onNavBackFilterReciptsDialog(that) {
            const oModel = that.getModel("oViewMaster");
            let bVisibleFilterList = oModel.getProperty("/visibleFilterTypesList");

            oModel.setProperty("/filterByTileText", "");
            oModel.setProperty("/filterByContext", "kNGroup");
            oModel.setProperty("/visibleFilterTypesList", !bVisibleFilterList);
        },

        onConfirmFilterReceiptsDialog(sContext, that, oListFilterTypes) {
            const fMonth = oListFilterTypes.filter(field => field.key === "kFilterMonth");
            const fExpType = oListFilterTypes.filter(field => field.key === "kFilterExType");
            const fAmount = oListFilterTypes.filter(field => field.key === "kFilterAmount");
            const fArchStatus = oListFilterTypes.filter(field => field.key === "kFilterArchStatus");
            let aSearch = [];
            let aFilters = [];
            fMonth[0].selectedIndices.forEach(month => {
                aSearch.push(new Filter("InvoiceDate", FilterOperator.EQ, month.month));
            });
            fAmount[0].selectedIndices.forEach(amount => {
                if (amount.amount === "200") {
                    aSearch.push(new Filter("Amount", FilterOperator.LT, amount.amount));
                } else if (amount.amount === "500") {
                    aSearch.push(new Filter("Amount", FilterOperator.BT, "200", amount.amount));
                } else if (amount.amount === "501") {
                    aSearch.push(new Filter("Amount", FilterOperator.GT, "500"));
                }
            });
            fExpType[0].selectedIndices.forEach(fExpType => {
                aSearch.push(new Filter("CategoryId", FilterOperator.EQ, fExpType.expType));
            });
            fArchStatus[0].selectedIndices.forEach(fArchStatus => {
                aSearch.push(new Filter("IsArchived", FilterOperator.EQ, fArchStatus.arStatusId));
            });
            aFilters.push(new Filter({ filters: aSearch, and: false, }));

            const oModel = that.getModel("oViewMaster");
            const oGlobalModel = that.getModel("global");
            const oModelData = that.getOwnerComponent().getModel();

            BusyIndicator.show();
            oModelData.read("/Receipts", {
                filters: aFilters,
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
                        oModel.setProperty("/visibleCreateExpense", true);
                        oGlobalModel.setProperty("/receiptListToReview", oReceiptsListToReview);
                    } else {
                        oGlobalModel.setProperty("/receiptListToReview", []);
                    }

                    const oTable = this.byId("receiptsTable");
                    let oBinding = oTable.getBinding("items");
                    let oSorter = new Sorter("CreatedAt", true);
                    oBinding.sort(oSorter);
                    oTable.getModel().refresh();
                }.bind(that),
                error: function (oError) {
                    BusyIndicator.hide();
                }
            });

            this.onCloseFilterReceiptsDialog(that);
        },

        onSearchFilterList: function (that, oEvent) {
            const oModel = that.getModel("oViewMaster");
            const sFilterContext = oModel.getProperty("/filterByTileText").substr(4);
            const oContextList = oEvent.getSource().getParent().getAggregation("content");
            let oList;
            let pFilter;
            let aFilter = [];
            let sQuery = oEvent.getParameter("query");
            switch (sFilterContext) {
                case "Month":
                    oList = oContextList.find(list => list.sId == "listFilterMonths");
                    pFilter = new Filter("month", FilterOperator.Contains, sQuery);
                    break;
                case "Expense Type":
                    oList = oContextList.find(list => list.sId == "listFilterExpTypes");
                    pFilter = new Filter("expType", FilterOperator.Contains, sQuery);
                    break;
                case "Amount":
                    oList = oContextList.find(list => list.sId == "listFilterAmount");
                    pFilter = new Filter("amount", FilterOperator.Contains, sQuery);
                    break;
                case "Archiving Status":
                    oList = oContextList.find(list => list.sId == "listFilterArStatus");
                    pFilter = new Filter("arStatus", FilterOperator.Contains, sQuery);
                    break;
                default:
                    break;
            }
            if (sQuery) {
                aFilter.push(new Filter({
                    filters: [pFilter],
                    and: false
                }));
            }
            let oBinding = oList.getBinding("items");
            oBinding.filter(aFilter);
        }
    };
});