sap.ui.define(["zpoly/zpolyplanung/controls/StellPlatz"], function (StellPlatz) {
	"use strict";
	return {

		factory: function (sId, oContext) {

			var oItemTemplate = new sap.m.CustomListItem({
			});
			oItemTemplate.addContent( new StellPlatz({
						week: this.getModel("local").getProperty("/CalWeek"),
						key: oContext.getObject().Key,
						PopOverControl: this.getOwnerComponent()._AngebotDetailPopover}));

			return oItemTemplate;
		}
	};
});