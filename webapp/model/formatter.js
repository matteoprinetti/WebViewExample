sap.ui.define([], function () {
	"use strict";
	return {
		isPromoFlaeche: function (sStatus) {
			if (sStatus === "1") return !true;
			return !false;
		},

		isPolyFlaeche: function (sStatus) {
			if (sStatus === "2") return !true;
			return !false;
		},

		test: function (sBossnr) {
		 return "{Bossnr}";
		},
		
		getMediaStream: function (oValue) {
			if (oValue === undefined) return "";
			// only the last 12 char are the product 
			return "/sap/opu/odata/sap/ZR_MEDIAEXPORT_SRV/HauptBildSet(Artnr='" + oValue.substr(oValue.length - 12) +
				"',Format='web240x310')/$value";
		} 
	};
});