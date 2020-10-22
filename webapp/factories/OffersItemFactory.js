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

			itemFactory.addCell(new sap.m.Label({
				text: oContext.getObject().OfrSubStateCd,
				tooltip: oContext.getObject().OfrSubStateDescr
			}));

			var campaignname = "";
			var campaigntooltip = "";
			var campaigns = this.getModel("Offers").getProperty(oContext.getPath() + "/toCampaign");

			// get the first campaign in case it has more - not sure if this is ok
			for (var x in campaigns) {
				campaignname = this.getModel("Offers").getProperty("/" + campaigns[x]).CampaignName;
				if (campaigns.length > 0) {
					// campaignname = campaignname + "(*)";
				}
				break;
			}
			itemFactory.addCell(new sap.m.Label({
				text: campaignname,
				tooltip: campaigntooltip
			}));

			itemFactory.addCell(new sap.m.Label({
				text: oContext.getObject().ZzUmsbudget.replace(".00", "")
			}));

			return itemFactory;
		}
	};
});