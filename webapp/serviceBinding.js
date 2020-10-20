function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZISMAP_OFR_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}