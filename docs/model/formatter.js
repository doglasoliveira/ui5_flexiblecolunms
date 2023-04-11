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
            let oData = this.getView().getModel("receipts").getData();
            let totalAmount= 0.00;
            oData.ReceiptsCollection.map(item => {
                totalAmount = (+totalAmount + item.amount).toFixed(2)
            })

            totalAmount.toString();

            return `Amount: ${totalAmount} EUR`
        },

        formatFloatString: function(sValue){
            return sValue.toFixed(2)
        }
    };
});