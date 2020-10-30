sap.ui.define([], function () {
	"use strict";
	
	function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    return [d.getUTCFullYear(), weekNo];
   }

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
		},
		
		// Status als Icon 
		// neu (Angebot startet in der ausgewählten Woche)
		// auslaufend (Enddatum liegt in der selektierten Woche)
		// läuft (Angebot lief bereits in der Vorwoche)
		// abgelaufen
		// SE Angebote (Sellout) dürfen nach dem Ablaufdatum auf der Fläche bleiben
		
		getOfferIcon: function(sStartDatum,sEndDatum) {
			if( sStartDatum === undefined) return "";
			
		}
		
		
	};
});