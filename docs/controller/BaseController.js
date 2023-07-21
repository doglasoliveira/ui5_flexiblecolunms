sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/UIComponent",
  "sap/m/Image",
  "sap/ui/core/Fragment",
  "sap/ui/core/BusyIndicator"
], function (Controller,
  UIComponent,
  Image,
  Fragment,
  BusyIndicator) {

  "use strict";

  return Controller.extend("com.vesi.zfafidgtrcpt.controller.BaseController", {

    // some basic functionalities

    // just this.getRouter() ...
    getRouter: function () {

      // ... instead of
      return UIComponent.getRouterFor(this);

    },

    // just this.getModel() ...
    getModel: function (sName) {

      // ... instead of
      return this.getView().getModel(sName);

    },

    // just this.setModel() ...
    setModel: function (oModel, sName) {

      // ... instead of
      return this.getView().setModel(oModel, sName);

    },

    // just this.getResoureBundle() ... 
    getResourceBundle: function () {

      // ... instead of
      return this.getOwnerComponent().getModel("i18n").getResourceBundle();

    },

    // Check user access device to set column layout
    checkDevice: function (sParam) {
      const oDevice = this.getModel("device").getData();

      if (oDevice.system.desktop) {
        return sParam || "OneColumn"; // in desktop app
      }

      return "OneColumn"; // in mobile app
    },

    createPreviewPhoto: function (sViewId, sTitle, SPath) {
      const oGlobalModel = this.getModel("global");
      const oCarousel = this.getView().byId(sViewId);

      if (SPath) {
        let oSelectedFile = new Image({
          src: SPath
        });

        oCarousel.addPage(oSelectedFile);
        oGlobalModel.setProperty("/gPhotoCount", oCarousel.getPages().length);
        oCarousel.setActivePage(oCarousel.getPages()[oCarousel.getPages().length - 1].sId);
      }
    },

    setLayout: function (pLayout) {
      const oGlobalModel = this.getModel("global");
      oGlobalModel.setProperty("/layout", pLayout);
    },
    createExpenseTypes: function () {
      const oDataModel = this.getOwnerComponent().getModel();
      const oGlobalModel = this.getOwnerComponent().getModel("global");

      oDataModel.read("/ExpenseTypes", {
        success: function (oData) {
          oGlobalModel.setProperty("/ExpenseTypes", oData.results);
        }.bind(this),
        error: function (oError) {
          console.error(oError)
        }.bind(this)
      })
    },

    _onCheckRestaurantAlert: function () {
      this._getDisplayFlag().then((oData) => this._onOpenRestaurantDialog(oData.NotDisplayMsg));
    },
    _getDisplayFlag: function () {
      return new Promise(function (res, rej) {
        this.getOwnerComponent().getModel().read("/MessagesInformation(MessageId='RESTALERT')", {
          success: function (oData) {
            res(oData);
          },
          error: function (oError) {
            rej(oError);
          }
        });
      }.bind(this));
    },

    _onOpenRestaurantDialog: function (showMessage) {
      if (showMessage) {
        this.onShowRestaurantAlert();
      }
    },

    onShowRestaurantAlert: function () {
      const oGlobalModel = this.getOwnerComponent().getModel("global");
      const oBundle = this.getView().getModel("i18n").getResourceBundle();
      let sRestaurantType = `<p>${oBundle.getText('dialogRestaurantAlertMessage1th')}</p>
                             <p>${oBundle.getText('dialogRestaurantAlertMessage2th')}</p>`;
      oGlobalModel.setProperty("/restaurantTypeMessage", sRestaurantType)
      if (!this._oRestaurantAlertDialog) {
        Fragment.load({
          name: "com.vesi.zfafidgtrcpt.view.fragment.dialogMessages.DialogRestaurantAlert",
          controller: this
        }).then(function (oRestaurantAlertDialog) {
          this._oRestaurantAlertDialog = oRestaurantAlertDialog;
          this.getView().addDependent(this._oRestaurantAlertDialog);
          this._oRestaurantAlertDialog.open();
        }.bind(this));
      } else {
        this._oRestaurantAlertDialog.open();
      }
    },

    onCloseRestaurantAlert: function () {
      const messageId = "RESTALERT";
      const oGlobalModel = this.getOwnerComponent().getModel("global");
      let doNotShowAgain = oGlobalModel.getProperty("/bRestaurantDialog");
      this._oRestaurantAlertDialog.close();

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
      }
    },
  });

});