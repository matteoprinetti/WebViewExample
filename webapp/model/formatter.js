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
		}
	};
});