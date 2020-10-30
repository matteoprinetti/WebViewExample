sap.ui.define([], function () {
	"use strict";

	return {

		factory: function (sId, oContext) {

			function getWeekNumber(d) {
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
			};

			var itemFactory = new sap.m.ColumnListItem({
				type: "Inactive"
			});

			itemFactory.addCell(new sap.m.ObjectIdentifier({
				title: oContext.getObject().ZzExtOfrId,
				text: oContext.getObject().OfrName
			}));

			// Status is now an Icon.

			/*			itemFactory.addCell(new sap.m.Label({
							text: oContext.getObject().OfrSubStateCd,
							tooltip: oContext.getObject().OfrSubStateDescr
						}));*/

			var actualweek = getWeekNumber(new Date(this.getView().byId("calenderAuswahl").getDateValue()));
			var startweek = getWeekNumber(new Date(oContext.getObject().Startdat));
			var endweek = getWeekNumber(new Date(oContext.getObject().Enddat));

			// different cases: 
			// neu (Angebot startet in der ausgewählten Woche)
			// auslaufend (Enddatum liegt in der selektierten Woche)
			// läuft (Angebot lief bereits in der Vorwoche)
			// abgelaufen	SE Angebote (Sellout) dürfen nach dem Ablaufdatum auf der Fläche bleiben

			var iconsrc="";
			
			if(actualweek[1]===startweek[1]) iconsrc="sap-icon://begin"; // start now
			if(actualweek[1] > startweek[1]) iconsrc="sap-icon://restart"; // start already
			if(actualweek[1] === endweek[1]) iconsrc="sap-icon://end"; // start already

			itemFactory.addCell(new sap.ui.core.Icon({
				src: iconsrc
			}).addStyleClass("zPolyLargeIcon"));

			var campaign = {
				CampaignId: "",
				CampaignName: ""
			};
			var campaigns = this.getModel("Offers").getProperty(oContext.getPath() + "/toCampaign");

			// get the first campaign in case it has more - not sure if this is ok
			for (var x in campaigns) {
				campaign = this.getModel("Offers").getProperty("/" + campaigns[x]);
				break;
			}
			itemFactory.addCell(new sap.m.ObjectIdentifier({
				title: campaign.CampaignId,
				text: campaign.CampaignName
			}));

			// Planungsart 

			itemFactory.addCell(new sap.m.Label({
				text: oContext.getObject().ZzPlaartTxt
			}));

			// Angebotsart 

			itemFactory.addCell(new sap.m.ObjectIdentifier({
				title: oContext.getObject().PromoType,
				text: oContext.getObject().PromoTypeTxt.substring(0, 10)
			}));

			// Kommunikationsrolle

			itemFactory.addCell(new sap.m.Label({
				text: "Defcon 5"
			}));

			return itemFactory;
		}
	};
});