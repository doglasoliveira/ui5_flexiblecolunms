sap.ui.loader.config({
    // activate real async loading and module definitions
    async: true,

    // load thirparty from cdn
    paths: {
        "thirdparty/canvg": "https://cdnjs.cloudflare.com/ajax/libs/canvg/3.0.10/umd.min",
        "thirdparty/jsPDF": "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min"
    },

    // provide dependency and export metadata for non-UI5 modules
    // canvg is already laoded by sap/viz/libs/canvg sap-ui-core l.1829
    // but it's an older version, like that we dont have conflict
    shim: {
        "thirdparty/canvg": {
            amd: true,
            exports: "canvg"
        },
        "thirdparty/jsPDF": {
            amd: true,
            exports: "jspdf",
            deps: ["thirdparty/canvg"]
        }
    }
});
sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/f/library",
    "com/vesi/zfafidgtrcpt/model/models",
    "sap/ui/Device"
    ],
    function (UIComponent,
	JSONModel,
	library,
	models,
	Device) {
        "use strict";

        return UIComponent.extend("com.vesi.zfafidgtrcpt.Component", {
            metadata: {
                manifest: "json"
            },

            init: function () {

                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                //set model device informations
                this.setModel(models.createDeviceModel(), "device");

                //set global model to use in all views 
                this.setModel(models.createGlobalModel(), "global");

                //iniitial router
                const oRouter = this.getRouter();
                // oRouter.attachBeforeRouteMatched(this._onBeforeRouteMatched, this);
                oRouter.initialize();

                this.popListMonth;
                this.popListExType;
                this.popListExType;
                this.popListArStatus;

                jQuery.sap.addUrlWhitelist("blob");
            },

            removeTreeColumnPage: function(){
                this.getRootControl().byId("flexibleColumnLayout").removeEndColumnPage(0)
              }
        });
    }
);