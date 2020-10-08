sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("zpoly.zpolyplanung.controller.Master", {

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

					// save the filiale for the next screens

					this.setFilialeData(oResponse);

				}.bind(this)
			});

		},

		onSelectionChange: function (oEvent) {
			var oList = oEvent.getSource(),
				bSelected = oEvent.getParameter("selected"),
				oData = oEvent.getSource().getBindingContext().getObject();

			// skip navigation when deselecting an item in multi selection mode
			if (!(oList.getMode() === "MultiSelect" && !bSelected)) {
				// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
				// enable the filter before selecting
				this.getView().byId("tabGrob").setEnabled(true);
				this.getView().byId("idIconTabBar").setSelectedKey("Grob");

				// set the binding for the selPP element 

				var oLoccoFilter = new sap.ui.model.Filter("Locco",
					sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().locco);

				this.getView().byId("selPP").bindItems({
					path: "/FlaechenSet",
					filters: [oLoccoFilter],
					factory: this.selPPFactory.bind(this),
					sorter: new sap.ui.model.Sorter("Name"),
					events: {
						dataReceived: function (oData2) {

							// position on the Id that was chosen 

							for (var x = 0; x < this.getView().byId("selPP").getItems().length; x++) {
								var item = this.getView().byId("selPP").getItems()[x];
								if (item.getKey() === oData.Id) {
									this.getView().byId("selPP").setSelectedItem(item);
									this.loadGrob(oData.Id);
								}
							}

						}.bind(this)
					}
				});

				// if there is at least on

			}
		},

		setFilialeData: function (oData) {

			this.getView().getModel("local").setProperty("/Filiale", oData.Filiale);
			this.getView().getModel("ZSRSDATAFEED").read("/FilialenSet('" + oData.Filiale + "')", {
				success: function (oResponse2) {
					this.getView().getModel("local").setProperty("/FilialeDescr", oResponse2.Name1);
				}.bind(this)
			});

			this.getView().byId("filialeInput").setValue(oData.Filiale);
		},

		onFilialeSelected: function (oEvent) {
			var filiale = oEvent.getParameters().filiale;
			this.setFilialeData({
				"Filiale": filiale
			});

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

		onCalWeekChange: function (oEvent) {
			var a = 1;
		},
		/*		
				createSortBerContent: function (sId, oContext) {
					var sortber = oContext.getProperty('Sortber');
					var sortberText = new sap.m.Text();
					sortberText.bindElement({
						path: "/SortimentSet('" + sortber + "')"
					});
					sortberText.bindProperty("text", "Descr");
					return sortberText;
				},*/

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
		},

		selPPFactory: function (sId, oContext) {

			var oItemTemplate = new sap.ui.core.Item({
				key: "{Id}",
				text: "{Name}"
			});

			return oItemTemplate;
		},
		
		onPPSelected:function(oEvent) {
			this.loadGrob(oEvent.getParameters().selectedItem.getKey());
		},
		
		loadGrob: function(oId) {
			console.log(oId);
		}

	});
});