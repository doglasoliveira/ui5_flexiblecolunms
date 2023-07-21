sap.ui.define(
  [
    "com/vesi/zfafidgtrcpt/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "com/vesi/zfafidgtrcpt/model/formatter",
    "sap/ui/model/Binding",
    "sap/m/MessageToast"
  ],
  function (BaseController,
    JSONModel,
    formatter,
    Binding,
    MessageToast) {
    "use strict";

    return BaseController.extend("com.vesi.zfafidgtrcpt.controller.Detail", {
      formatter: formatter,
      onInit() {
        const oModel = new JSONModel({
          receiptDetail: {}
        });
        this.getView().setModel(oModel, "oDetailModel")
        this.oRouter = this.getOwnerComponent().getRouter();

        this.oRouter.getRoute("detail").attachMatched(this._onReceiptMatched, this);
        this._getExpenseTypes()
      },

      _onReceiptMatched: function (oEvent) {
        this.setLayout("TwoColumnsMidExpanded");
        this._receipt = oEvent.getParameter("arguments").receiptId || this._receipt || "0";
        this._itemNumber = oEvent.getParameter("arguments").itemNumber || this._receipt || "0";
        this.getDetailReceipts(this._receipt, this._itemNumber);
      },
      onNavToAttach: function () {
        this.setLayout("ThreeColumnsMidExpanded");
        this.oRouter.navTo("deepdetail", { itemNumber: this._receipt, receiptId: this._itemNumber });
      },
      getDetailReceipts: function (pFInternalId, pItemNumber) {
        const oDataModel = this.getOwnerComponent().getModel();
        const oGlobalModel = this.getModel("global");
        const oMomdel = this.getModel("oDetailModel");
        const oReceiptToReview = oGlobalModel.getProperty("/receiptListToReview");

        if (oReceiptToReview && oReceiptToReview.length > 0) {
          let iReceiptPosition = oReceiptToReview.findIndex(receipt => receipt.FileInternalId === pFInternalId);
          let sSubheaderCount = `Receipt ${iReceiptPosition + 1} of ${oReceiptToReview.length}`;

          oGlobalModel.setProperty("/subHeaderText", sSubheaderCount);
          oGlobalModel.setProperty("/subHeaderDetailShow", true);
        } else {
          oGlobalModel.setProperty("/subHeaderText", "");
          oGlobalModel.setProperty("/subHeaderDetailShow", false);
        }
        oMomdel.setProperty("/receiptDetail", []);
        oGlobalModel.setProperty("/ReceiptFileName", '');
        oGlobalModel.setProperty("/FileInternalId", '');
        oGlobalModel.setProperty("/ArchiveId", '');

        let sURL = encodeURI(`/Receipts(FileInternalId=guid'${pFInternalId}',ItemNumber='${pItemNumber}')`);
        oDataModel.read(sURL, {
          success: function (oData) {
            if (oData.IsReviewed) {
              oGlobalModel.setProperty("/buttonValidateSaveShow", false);
            } else {
              oGlobalModel.setProperty("/buttonValidateSaveShow", true);
            }

            if (oData.CategoryId === "REST") {
              this._onCheckRestaurantAlert();
            }

            oMomdel.setProperty("/receiptDetail", oData);
            oMomdel.setProperty("/CategoryId", oData.Category);
            oGlobalModel.setProperty("/ReceiptFileName", oData.MerchantName);
            oGlobalModel.setProperty("/FileInternalId", oData.FileInternalId);
            oGlobalModel.setProperty("/ArchiveId", oData.ArchiveId);
          }.bind(this),
          error: function (oError) {
            console.error(oError)
          }.bind(this)
        })
      },
      onDeleteReceipt: function (oEvent) {
        const oDataModel = this.getOwnerComponent().getModel();
        const oMomdel = this.getModel("oDetailModel");
        let oEntry = oMomdel.getProperty("/receiptDetail");
        let sURL = encodeURI(`/Receipts(FileInternalId=guid'${oEntry.FileInternalId}',ItemNumber='${oEntry.ItemNumber}')`);
        oDataModel.remove(sURL, {
          success: function (oData) {
            this.setLayout("OneColumn");
            this.oRouter.navTo("master");
          }.bind(this),
          error: function (oError) {
            console.error(oError)
          }.bind(this)
        })
      },
      onValidateReceipt: function (oEvent) {
        const oDataModel = this.getOwnerComponent().getModel();
        const oGlobalModel = this.getModel("global");
        const oMomdel = this.getModel("oDetailModel");
        const oTable = oGlobalModel.getProperty("/gIdList");
        const oItems = oTable.getAggregation("items");
        let oEntry = oMomdel.getProperty("/receiptDetail");
        let sURL = encodeURI(`/Receipts(FileInternalId=guid'${oEntry.FileInternalId}',ItemNumber='${oEntry.ItemNumber}')`);
        oDataModel.update(sURL, oEntry, {
          success: function (oData) {
            this._clearDetailModel();
            this.oRouter.navTo("master", true);
            oTable.getModel().refresh();
            for (let i = 0; i < oItems.length; i++) {
              const oReceiptIndex = oItems[i].getBindingContext("oViewMaster").getObject();
              if (oReceiptIndex.FileInternalId === oEntry.FileInternalId) {
                let oReceiptNextIndex = oItems.find(items => {
                  let oItemsNext = items.getBindingContext("oViewMaster").getObject();
                  if (oItemsNext.FileInternalId && oItemsNext.ItemNumber && oItemsNext.IsReviewed === false && oItemsNext.FileInternalId !== oEntry.FileInternalId && oItemsNext.ItemNumber) {
                    return oItemsNext;
                  }
                });
                if (oReceiptNextIndex) {
                  let receiptNavNext = oReceiptNextIndex.getBindingContext("oViewMaster").getObject()
                  this.oRouter.navTo("detail", { itemNumber: receiptNavNext.ItemNumber, receiptId: receiptNavNext.FileInternalId }, true);
                  return;
                }
              }
            }
            this.setLayout("OneColumn");
          }.bind(this),
          error: function (oError) {
            console.error(oError)
          }.bind(this)
        })
      },

      onSaveReceipt: function (oEvent) {
        const oDataModel = this.getOwnerComponent().getModel();
        const oMomdel = this.getModel("oDetailModel");
        let oEntry = oMomdel.getProperty("/receiptDetail");
        let sURL = encodeURI(`/Receipts(FileInternalId=guid'${oEntry.FileInternalId}',ItemNumber='${oEntry.ItemNumber}')`);

        oDataModel.update(sURL, oEntry, {
          success: function (oData) {
            this.setLayout("OneColumn");
            this.oRouter.navTo("master");
            this._clearDetailModel();
          }.bind(this),
          error: function (oError) {
            console.error(oError)
          }.bind(this)
        })

      },

      onViewAttachments(oEvent) {
        this.setLayout("ThreeColumnsMidExpanded");
      },

      onBackToReceiptList: function (oEvent) {
        this.setLayout("OneColumn");
        this.oRouter.navTo("master");
        this._clearDetailModel();
      },

      _clearDetailModel: function () {
        const oMomdel = this.getModel("oDetailModel");
        oMomdel.setProperty("/receiptDetail", []);
      },

      _getExpenseTypes: function () {
        const oDataModel = this.getOwnerComponent().getModel();
        const oMomdel = this.getModel("oDetailModel");

        oDataModel.read("/ExpenseTypes", {
          success: function (oData) {
            oMomdel.setProperty("/ExpenseTypes", oData.results);
          }.bind(this),
          error: function (oError) {
            console.error(oError)
          }.bind(this)
        })
      }
    });
  });