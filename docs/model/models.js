sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function (JSONModel, Device) {
    "use strict";

    return {
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        createGlobalModel: function () {
            const oModel = new JSONModel({
                listFiles: [],
                currentFile: {},
                bFirstDialog: false,
                bIsToSplitDialog: false,
                bRestaurantDialog: false,
                layout: "OneColumn",
                bShowIsToSplit: false
            });
            return oModel;
        },

        createListFitersTypesModel: function () {
            const oModel = new JSONModel({
                listFiltersReceipts: [
                    { filterField: "Month", key: "kFilterMonth", qtdSelected: 0, selectedIndices: [] },
                    { filterField: "Expense Type", key: "kFilterExType", qtdSelected: 0, selectedIndices: [] },
                    { filterField: "Amount", key: "kFilterAmount", qtdSelected: 0, selectedIndices: [] },
                    { filterField: "Archiving Status", key: "kFilterArchStatus", qtdSelected: 0, selectedIndices: [] }
                ],
                listFilterMonths: [
                    { month: "January", monthId: "01" },
                    { month: "February", monthId: "02" },
                    { month: "March", monthId: "03" },
                    { month: "April", monthId: "04" },
                    { month: "May", monthId: "05" },
                    { month: "June", monthId: "06" },
                    { month: "July", monthId: "07" },
                    { month: "August", monthId: "08" },
                    { month: "September", monthId: "09" },
                    { month: "October", monthId: "10" },
                    { month: "November", monthId: "11" },
                    { month: "December", monthId: "12" }
                ],
                ListFilterExpType: [
                    { expType: "Hotel France province", exptId: "exp001" },
                    { expType: "Hotel Paris", exptId: "exp002" },
                    { expType: "Hotel France province 2", exptId: "exp003" },
                    { expType: "Individual transport", exptId: "exp004" },
                    { expType: "Reception Fees", exptId: "exp005" },
                    { expType: "Restaurant", exptId: "exp006" },
                    { expType: "Train + Flight", exptId: "exp007" },
                    { expType: "Various", exptId: "exp008" }
                ],
                listFilterAmount: [
                    { amount: "Less than 200", amountId: "200" },
                    { amount: "Between 200 and 500", amountId: "500" },
                    { amount: "More than 500", amountId: "501" }
                ],
                listFilterArStatus: [
                    { arStatus: "Archived", arStatusId: "X" },
                    { arStatus: "To Review", arStatusId: "" }
                ]
            });
            return oModel;
        }
    };
});