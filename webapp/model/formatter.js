sap.ui.define([], function () {
	"use strict";
 
	return {
		
			
		getWeekNumber: function(d) {
			if(d===null) return"";
			
				// Copy date so don't modify original
				d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
				// Set to nearest Thursday: current date + 4 - current day number
				// Make Sunday's day number 7
				d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
				// Get first day of year
				var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
				// Calculate full weeks to nearest Thursday
				var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
				// Return array of year and week number
				return [d.getUTCFullYear(), weekNo];
			},
			
				_getAngebotAttribs: function (_startdat, _enddat,_aweek) {
			
			 
			
			// neu: Neu: status-positive in grün wenn diese woche gleich wie angebot start woche ist (jahr mitnehmen)
			// aktiv: wekk > start < end sap-icon://physical-activity in blau
			// auslaufend: week = end : Sap-icon://past in orange
			// abgelaufen - week > end :  Sap-icon://stop
			
			var _weekNumber = this.getWeekNumber(_aweek);
			var _startNumber = this.getWeekNumber(_startdat);
			var _endNumber = this.getWeekNumber(_enddat);
			
			// convert to a easier format : year *100+week for comparison
			
			var _week = _weekNumber[0]*100+_weekNumber[1];
			var _start = _startNumber[0]*100+_startNumber[1];
			var _end = _endNumber[0]*100+_endNumber[1];
			
			
			
			if(_start  == _week ) return { src: "sap-icon://status-positive", color: "green" };
			if(_start  <= _week  && _end >= _week ) return { src: "sap-icon://physical-activity",  color: "blue" };
			if(_end  == _week ) return  { src: "sap-icon://past", color: "orange" };
			
			// ist sonst abgelaufen baby
			return { src: "sap-icon://stop", color: "red" };
		},
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

	 

		// 27.04.2021 new functions due to smarttable instead of normal tabel and OffersFactory no more usabe
		// 13.07.2021 _duration is now one of NEU, AUSL und LAUF. 
		getAngebotStatus: function (_startdat, _enddat,_duration) {
			 if(_duration===null) return "";
			 //return this.formatter._getAngebotAttribs(_startdat,_enddat,this.getView().byId("calenderAuswahl").getDateValue()).src; 
			if(_duration === "NEU" ) return  "sap-icon://status-positive";
			if(_duration === "AUSL" ) return  "sap-icon://physical-activity";
			if(_duration === "LAUF" ) return   "sap-icon://past";
			
		
		},
		
		getAngebotColor: function (_startdat, _enddat,_duration) {
			if(_startdat===null) return "";
			// return this.formatter._getAngebotAttribs(_startdat,_enddat,this.getView().byId("calenderAuswahl").getDateValue()).color; 
			if(_duration === "NEU" ) return  "green";
			if(_duration === "AUSL" ) return  "blue";
			if(_duration === "LAUF" ) return   "orange";
			
		
			

		},
		
		getFirstWord: function (_value) {
			if(_value===null) return "";
			if(Object.prototype.toString.call(_value) === "[object String]")
				return _value.replace(/ .*/,'');
			return "";
		},
		getFirstCampaignId: function (_value) {
			if(_value===null) return "";
			if(_value.length > 0)
				return this.getModel("Offers").getProperty("/"+_value[0]).CampaignId;
			return "";
		},
		getFirstCampaignName: function (_value) {
			if(_value===null) return "";
			if(_value.length > 0)
				return this.getModel("Offers").getProperty("/"+_value[0]).CampaignName;
			return "";
		},
		
		getDateAsWeek: function(_date) {
			if(!_date) return "";
			var _res=_date.toLocaleString().split(',')[0];
			_res = _res + " Woche " + this.formatter.getWeekNumber(_date)[1];
			//return this.formatter.getWeekNumber(_date);
			return _res;
		}
		
		
	};

});