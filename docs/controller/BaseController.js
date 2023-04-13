sap.ui.define([

    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
  ], function (Controller, UIComponent) {
  
    "use strict";
   
    return Controller.extend("com.vesi.zfafidgtrcpt.controller.BaseController", {
   
      // some basic functionalities
   
      // just this.getRouter() ...
      getRouter: function() {
       
        // ... instead of
        return UIComponent.getRouterFor(this);
   
      },
   
      // just this.getModel() ...
      getModel: function(sName) {
     
        // ... instead of
        return this.getView().getModel(sName);
   
      },
   
      // just this.setModel() ...
      setModel: function(oModel, sName) {
   
        // ... instead of
        return this.getView().setModel(oModel, sName);
   
      },
   
      // just this.getResoureBundle() ... 
      getResourceBundle: function () {
   
        // ... instead of
        return this.getOwnerComponent().getModel("i18n").getResourceBundle();
   
      },
   
      // Check user access device to set column layout
      checkDevice: function(sParam){
        if (navigator.userAgent.match(/Android/i)
          || navigator.userAgent.match(/webOS/i)
          || navigator.userAgent.match(/iPhone/i)
          || navigator.userAgent.match(/iPad/i)
          || navigator.userAgent.match(/iPod/i)
          || navigator.userAgent.match(/BlackBerry/i)
          || navigator.userAgent.match(/Windows Phone/i)
        ) {
          return "OneColumn"; // está utilizando celular
        }
        else {
          return sParam || "ThreeColumnsMidExpanded"; // não é celular
        }
      }
   
    });
   
  });