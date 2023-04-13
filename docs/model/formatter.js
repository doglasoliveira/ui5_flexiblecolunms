sap.ui.define(function () {
    "use strict";

    return {

        formatStatusReceipts: function (sStatus) {
            switch (sStatus) {
                case 'To Review':
                    return 'Warning'
                    break;
                case 'Review OK':
                    return 'Success'
                    break;
                default:
                    return 'None'
                    break;
            }
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
            return sValue.toFixed(2)
        }
    };
});