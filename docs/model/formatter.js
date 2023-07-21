sap.ui.define(function () {
    "use strict";

    return {

        formatStatusReceipts: function (sStatus) {
            return sStatus ? 'Success' : 'Warning';
        },

        formatStatusText: function (svalue, sId, sErrorType) {
            let sTextTrue = sId === "OCRStatus" ? "Extracted" : sId === "ArchStatus" ? "Archived" : sId === "ReviewStatus" ? "Validated" : false;
            let sTextFalse = sId === "ReviewStatus" ? "To review" : "Pending";
            if (sErrorType) {
                return 'Error'
            }
            if (svalue) {
                return sTextTrue;
            }
            return sTextFalse

        },

        formatStatus: function (svalue, sId, sErrorType) {
            if (sErrorType) {
                return 'Error';
            }
            let sStatus = sId === "OCRStatus" ? 'Information' : 'Warning';
            if (svalue) {
                return 'Success';
            }
            return sStatus
        },

        formatIconStatus: function (svalue, sId, sErrorType) {
            if (sErrorType) {
                return 'sap-icon://error';
            }
            let sIconFalse = sId === "OCRStatus" ? "sap-icon://information" : "sap-icon://warning";
            if (svalue) {
                return 'sap-icon://message-success';
            }
            return sIconFalse;
        },

        formatAdress: function(pCountry, pCity){
            let sCountry = pCountry !== "" ? `${pCountry}, `:"";
            let sCity = pCity !== "" ? `${pCity}`:"";
            
            return `${sCountry}${sCity}`;
        },

        formatTotalAmountReceipts: function () {
            let oData = this.getView().getModel("oViewMaster").getData();
            let totalAmount = 0.00;

            if (oData.ReceiptsCollection.lenght > 0) {
                oData.ReceiptsCollection.map(item => {
                    totalAmount = (+totalAmount + item.amount).toFixed(2)
                })
                totalAmount.toString();
            } else {
                totalAmount = "0,00"
            }

            return `Amount: ${totalAmount} EUR`
        },

        formatFloatString: function (sValue) {
            if (sValue) {
                return sValue.toFixed(2)
            }

        },

        formatURLFile: function(sFileId, sArchId){
            if (sFileId && sArchId) {
                return `/sap/opu/odata/sap/ZSRFI_DGT_RCPT_SRV/ReceiptAttachments(ArchiveId='${sArchId}',FileInternalId=guid'${sFileId}')/$value`
            }
        },

        formatDate: function(sValue){
            return sValue === '0000-00-00' ? '' : sValue;
        }
    };
});