// Prinetti 09.02.2022 Globals is a singleton class, accessible from every app 
// simply with Globals.<method>. Example Globals.getAppComponent()
// Needs to be included in the extension like this: example
// 
// sap.ui.define([
// 	"zpoly/zpolyplanung/artifacts/Globals"
// ], function (Globals) {
// 	"use strict";
// 
// 	return UIComponent.extend("zpoly.zpolyplanung.Component", {
// 
//     		init: function () {
// 		        var something=Globals.getNewDate();
//     		}
// 	}));


sap.ui.define([], function () {
 
	var instance;
	var locco;
	
	var Globals = function () {
	};

	// returns the date in 1 week time  as a dd.mm.yyyy String
	Globals.prototype.getDayNextWeek = function () {

			var nextweek = this.getDayNextWeekAsDate();
			
			var dd = String(nextweek.getDate()).padStart(2, "0");
			var mm = String(nextweek.getMonth() + 1).padStart(2, "0"); //January is 0!
			var yyyy = nextweek.getFullYear();

			return dd + "." + mm + "." + yyyy;
	};
	
	// returns the date in 1 week time 
	Globals.prototype.getDayNextWeekAsDate = function () {

			var today = new Date();
		 
			return new Date(today.getTime() + 86400000*6);
			
			 
	};
	
	Globals.prototype.setLocco = function (_locco) {
		 this.locco = _locco;
	};

	Globals.prototype.getLocco = function () {
		 return this.locco;
	};

	// return the class as module value
	if (!instance) {
		instance = new Globals();
	}
	return instance;

},true);  // true so that Globals is visible globally in the browser.