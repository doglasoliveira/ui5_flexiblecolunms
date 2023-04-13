/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/f/library"
    ],
    function (UIComponent, JSONModel, fioriLibrary) {
        "use strict";

        return UIComponent.extend("com.vesi.zfafidgtrcpt.Component", {
            metadata: {
                manifest: "json"
            },

            init: function () {

                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                //Chenge theme
                //sap.ui.getCore().applyTheme("sap_fiori_3")

                const oModel = new JSONModel();
                this.setModel(oModel);

                // set products demo model on this sample
                const oProductsModel = new JSONModel(sap.ui.require.toUrl("com/vesi/zfafidgtrcpt/mockdata/receipts.json"));
                oProductsModel.setSizeLimit(1000);
                this.setModel(oProductsModel, "receipts");

                //iniitial router
                const oRouter = this.getRouter();
                oRouter.attachBeforeRouteMatched(this._onBeforeRouteMatched, this);
                oRouter.initialize();
            },

            _onBeforeRouteMatched: function (oEvent) {
                var oModel = this.getModel("receipts"),
                    sLayout = "ThreeColumnsMidExpanded";

                // If there is no layout parameter, set a default layout (normally OneColumn)
                if (!sLayout) {
                    sLayout = fioriLibrary.LayoutType.ThreeColumnsEndExpanded;
                }

                oModel.setProperty("/layout", sLayout);
            },
        });
    }
);