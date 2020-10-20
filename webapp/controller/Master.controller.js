sap.ui.define([
	"./BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("zpoly.zpolyplanung.controller.Master", {

		onInit: function () {

			// set up an event so I know when someone has deleted something

			var bus = this.getOwnerComponent().getEventBus();
			bus.subscribe("zpolyplanung", "delete", this.onDelete, this);

			// Note that locco is already there at this stage 

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

					// init the calendar control

					this.getView().byId("calenderAuswahl").setDateValue(new Date());

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
								if (item.getKey() === oData.Id) { // the chosen one 
									this.getView().byId("selPP").setSelectedItem(item);

									this.loadGrob(oData.Id, this.getView().byId("calenderAuswahl").getValue());
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

		onPPSelected: function (oEvent) {
			this.loadGrob(oEvent.getParameters().selectedItem.getKey());
		},

		loadGrob: function (oId, oWeek) {

			var factory = function (sId, oContext) {

				var itemFactory = new sap.m.ColumnListItem({
					type: "Inactive"
				});

				itemFactory.addCell(new sap.m.Label({
					text: oContext.getObject().ZzExtOfrId + " " + oContext.getObject().OfrName
				}));

				itemFactory.addCell(new sap.m.Label({
					text: oContext.getObject().OfrSubStateDescr
				}));

				var campaign = "";
				var campaigns = this.getModel("Offers").getProperty(oContext.getPath() + "/toCampaign");

				// get the first campaign in case it has more - not sure if this is ok
				for (var x in campaigns) {
					campaign = this.getModel("Offers").getProperty("/" + campaigns[x]);
					break;
				}
				itemFactory.addCell(new sap.m.Label({
					text: campaign.CampaignName
				}));

				itemFactory.addCell(new sap.m.Label({
					text: oContext.getObject().ZzUmsbudget.replace(".00", "")
				}));

				return itemFactory;
			};

			var oLoccoFilter = new sap.ui.model.Filter("Locco",
				sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().locco);

			var oWeekFilter = new sap.ui.model.Filter("Week",
				sap.ui.model.FilterOperator.EQ, oWeek);

			this.getView().byId("AngeboteTable").bindItems({
				path: "Offers>/OfrHeadSet",
				filters: [oLoccoFilter, oWeekFilter],
				//template: itemTemplate,
				factory: factory.bind(this),
				parameters: {
					expand: "toCampaign"
				}
			});

			// now generate a series of tables, one for each entry in zpp_flaeche_Stpl for that flaeche id 

			var _box = this.getView().byId("itemsBox");
			_box.removeAllItems();

			this.getModel().read("/FlaechenSet(guid'" + oId + "')/FlaecheToStellplatz", {
				success: function (oData) {
					for (var x in oData.results) {
						var _data = oData.results[x];
						// add a Header 

						var _vbox = new sap.m.FlexBox({
							direction: "Row",
							alignItems: "Center"
						}).addStyleClass("sapUiTinyMargin");
						_vbox.addItem(new sap.m.Label({
							text: "Stellplatz: "
						}).addStyleClass("sapUiSmallMargin"));
						_vbox.addItem(new sap.m.Label({
							text: _data.Name
						}).addStyleClass("sapUiSmallMargin"));
						_vbox.addItem(new sap.m.Label({
							text: "WT: "
						}).addStyleClass("sapUiSmallMargin"));
						_vbox.addItem(new sap.m.Label({
							text: _data.WtName
						}).addStyleClass("sapUiSmallMargin"));
						_box.addItem(_vbox);

						var _vbox2 = new sap.m.FlexBox({
							direction: "Row",
							alignItems: "Center"
						}).addStyleClass("sapUiTinyMargins");
						_vbox2.addItem(new sap.m.Label({
							text: "Anzahl: "
						}).addStyleClass("sapUiSmallMargin"));
						_vbox2.addItem(new sap.m.Label({
							text: _data.Anzahl
						}).addStyleClass("sapUiSmallMargin"));
						_vbox2.addItem(new sap.m.Label({
							text: "Belegung"
						}).addStyleClass("sapUiSmallMargin"));
						_vbox2.addItem(new sap.m.Label({
							text: "20%"
						}).addStyleClass("sapUiSmallMargin"));

						_box.addItem(_vbox2);
						var _table = new sap.m.Table().addStyleClass("zpolytableblack");
						_table.addColumn(new sap.m.Column({
							header: new sap.m.Text({
								text: "Angebot"
							})
						}));
						_table.addColumn(new sap.m.Column({
							header: new sap.m.Text({
								text: "Status"
							})
						}));
						_table.addColumn(new sap.m.Column({
							header: new sap.m.Text({
								text: "Campagne"
							})
						}));
						_table.addColumn(new sap.m.Column({
							header: new sap.m.Text({
								text: "WT"
							}),
							width: "20%"
						}));
						_table.addColumn(new sap.m.Column({
							header: new sap.m.Text({
								text: "H"
							}),
							width: "20%"
						}));
						_table.addColumn(new sap.m.Column({
							header: new sap.m.Text({
								text: "G"
							}),
							width: "10%"
						}));
						_table.addColumn(new sap.m.Column({
							header: new sap.m.Text({
								text: "ST"
							}),
							width: "5%"
						}));

						// Test Zeile...

						var _row1 = new sap.m.ColumnListItem({
							type: "Inactive"
						});
						_row1.addCell(new sap.m.Label({
							text: "Drei für Zwei"
						}));
						_row1.addCell(new sap.m.Label({
							text: "Genehmigt"
						}));
						_row1.addCell(new sap.m.Label({
							text: "Unser M"
						}));

						var _sel1 = new sap.m.Select().addStyleClass("sapUiTinyMargins");
						_sel1.addItem(new sap.ui.core.Item({
							key: "1",
							text: "1"
						}));
						_sel1.addItem(new sap.ui.core.Item({
							key: "2",
							text: "2"
						}));
						_sel1.addItem(new sap.ui.core.Item({
							key: "3",
							text: "3"
						}));
						_row1.addCell(_sel1);

						var _sel2 = new sap.m.Select().addStyleClass("sapUiTinyMargins");
						_sel2.addItem(new sap.ui.core.Item({
							key: "1",
							text: "1"
						}));
						_sel2.addItem(new sap.ui.core.Item({
							key: "2",
							text: "2"
						}));
						_sel2.addItem(new sap.ui.core.Item({
							key: "3",
							text: "3"
						}));
						_row1.addCell(_sel2);

						_row1.addCell(new sap.m.Label({
							text: "6"
						}));

						_row1.addCell(new sap.m.Label({
							text: "X"
						}));

						_table.addItem(_row1);

						var _row2 = new sap.m.ColumnListItem({
							type: "Inactive"
						});
						_row2.addCell(new sap.m.Label({
							text: "Drei für Zwei"
						}));
						_row2.addCell(new sap.m.Label({
							text: "Genehmigt"
						}));
						_row2.addCell(new sap.m.Label({
							text: "Unser M"
						}));

						var _sel3 = new sap.m.Select().addStyleClass("sapUiTinyMargins");
						_sel3.addItem(new sap.ui.core.Item({
							key: "1",
							text: "1"
						}));
						_sel3.addItem(new sap.ui.core.Item({
							key: "2",
							text: "2"
						}));
						_sel3.addItem(new sap.ui.core.Item({
							key: "3",
							text: "3"
						}));
						_row2.addCell(_sel3);

						var _sel4 = new sap.m.Select().addStyleClass("sapUiTinyMargins");

						_sel4.addItem(new sap.ui.core.Item({
							key: "1",
							text: "1"
						}));
						_sel4.addItem(new sap.ui.core.Item({
							key: "2",
							text: "2"
						}));
						_sel4.addItem(new sap.ui.core.Item({
							key: "3",
							text: "3"
						}));
						_row2.addCell(_sel4);

						_row2.addCell(new sap.m.Label({
							text: "3"
						}));

						_row2.addCell(new sap.m.Label({
							text: " "
						}));

						_table.addItem(_row2);

						_box.addItem(_table);
					}

				}
			});

		}

	});
});