sap.ui.define([], function () {
	"use strict";
	return {

		factory: function (sId, oContext) {

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

			itemFactory.addCell(new sap.ui.core.Icon({
				src: "sap-icon://restart"
			}).addStyleClass("zPolyLargeIcon"));


			var campaign = { CampaignId: "", CampaignName: ""};
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
				text: oContext.getObject().PromoTypeTxt.substring(0,10)
			}));
			
			// Kommunikationsrolle
			
			itemFactory.addCell(new sap.m.Label({
				text: "Defcon 5"
			}));

			return itemFactory;
		}
	};
});