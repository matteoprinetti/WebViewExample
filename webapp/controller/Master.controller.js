sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("zpoly.zpolyplanung.controller.Master", {
		/*
				oTheSorter: new sap.ui.model.Sorter("Id", false, false, function (a, b) {

					// sort by Name, with a twist: if the Id is the actually new id, is the last one always.

					var oNamea = this.getModel().getProperty("/FlaechenSet(guid'" + a.toLowerCase() + "')").Name;
					var oNameb = this.getModel().getProperty("/FlaechenSet(guid'" + b.toLowerCase() + "')").Name;

					// if one of them is the last one, assign the "Fake" Name "ZZZZZZZZZZZZZZZZZZZZ".
					if (this.getOwnerComponent().last_new_flaeche_id) {
						if (this.getOwnerComponent().last_new_flaeche_id.toLowerCase() === a.toLowerCase()) oNamea = "zzzzzzzzzzzzzzzzzzzzzzzz";
						if (this.getOwnerComponent().last_new_flaeche_id.toLowerCase() === b.toLowerCase()) oNameb = "zzzzzzzzzzzzzzzzzzzzzzzz";
					}

					return oNamea.localeCompare(oNameb);

				}),
		*/
		firstCall: true,

		onInit: function () {

			// set up an event so I know when someone has deleted something

			var bus = this.getOwnerComponent().getEventBus();
			bus.subscribe("zpolyplanung", "delete", this.onDelete, this);

			// read the locco from user and load the initial list 

			this.getOwnerComponent().getModel("User").read("/UserSet('DUMMY')", {
				success: function (oResponse) {

					this.getOwnerComponent().locco = oResponse.Locco;

					var oLoccoFilter = new sap.ui.model.Filter("Locco",
						sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().locco);

					this.getView().byId("flTable").bindItems({
						path: "/FlaechenSet",
						filters: [oLoccoFilter],
						factory: this.flaecheItemFactory.bind(this),
						sorter: new sap.ui.model.Sorter("Name")
					});

					this.getView().byId("filialeInputDescr").bindElement({
						model: "ZSRSDATAFEED",
						path: "/FilialenSet('" + oResponse.Filiale + "')"
					});

					this.getView().byId("filialeInput").setValue(oResponse.Filiale);

				}.bind(this)
			});
		},

		onSelectionChange: function (oEvent) {
			var oList = oEvent.getSource(),
				bSelected = oEvent.getParameter("selected");

			// skip navigation when deselecting an item in multi selection mode
			if (!(oList.getMode() === "MultiSelect" && !bSelected)) {
				// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
				// enable the filter before selecting
				this.getView().byId("tabGrob").setEnabled(true);
				this.getView().byId("idIconTabBar").setSelectedKey("Grob");
			}
		},

		onFilialeSelected: function (oEvent) {
			var filiale = oEvent.getParameters().filiale;
			this.getView().byId("filialeInput").setValue(filiale);
			this.getView().byId("filialeInputDescr").setText(this.getModel("ZSRSDATAFEED").getProperty("/FilialenSet('" + filiale + "')").Name1);

			this.getOwnerComponent().locco = this.getModel("ZSRSDATAFEED").getProperty("/FilialenSet('" + filiale + "')").Locco;

			var oLoccoFilter = new sap.ui.model.Filter("Locco",
				sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().locco);

			this.getView().byId("flTable").bindItems({
				path: "/FlaechenSet",
				filters: [oLoccoFilter],
				factory: this.flaecheItemFactory.bind(this),
				sorter: new sap.ui.model.Sorter("Name")
			});

		},

		createSortBerContent: function (sId, oContext) {
			var sortber = oContext.getProperty('Sortber');
			var sortberText = new sap.m.Text();
			sortberText.bindElement({
				path: "/SortimentSet('" + sortber + "')"
			});
			sortberText.bindProperty("text", "Descr");
			return sortberText;
		},

		onTabbarSelect: function (oEvent) {
			if (oEvent.getParameters().key === "Ueber") {
				this.getView().byId("tabGrob").setEnabled(false);
			}
		},

		flaecheItemFactory: function (sId, oContext) {

			var oItemTemplate = new sap.m.ColumnListItem({
				type: "Navigation",
				title: "{Name}",
				press: this.onSelectionChange.bind(this)
			});
			oItemTemplate.addCell(new sap.m.Text({
				text: "{Id}"
			}));
			oItemTemplate.addCell(new sap.m.Text({
				text: "{Name}"
			}));
			oItemTemplate.addCell(new sap.m.Text({
				text: "{Belegung}" // TODO this is calculated
			}));
			var sortberText = new sap.m.Text();

			// bind only if there is a valid Sortber (which is not the case for Promofläche)
			if (oContext.getProperty('Sortber') !== "") {
				sortberText.bindElement({
					path: "/SortimentSet('" + oContext.getProperty('Sortber') + "')"
				});
				sortberText.bindProperty("text", "Name");
			}
			oItemTemplate.addCell(sortberText);

			return oItemTemplate;
		}
	});
});