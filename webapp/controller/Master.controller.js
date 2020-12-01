sap.ui.define([
	"./BaseController",
	"zpoly/zpolyplanung/controls/StellPlatzItemTable",
	"zpoly/zpolyplanung/factories/FlaecheItemFactory",
	"zpoly/zpolyplanung/factories/OffersItemFactory"
], function (BaseController, StellPlatzItemTable, FlaecheItemFactory, OffersItemFactory) {
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
						factory: FlaecheItemFactory.factory.bind(this),
						sorter: new sap.ui.model.Sorter("Name")
					});

					// save the filiale for the next screens

					this.setFilialeData(oResponse);

					// init the calendar control

					this.getView().byId("calenderAuswahl").setDateValue(new Date());

				}.bind(this)
			});

		},

		onArtikelSearch: function (oEvent) {

			var sValue = oEvent.getParameters().query;
			var aFilter = [];
			if (sValue.match(/^[0-9]+$/)) {
				aFilter.push(new sap.ui.model.Filter("matnr", sap.ui.model.FilterOperator.StartsWith, sValue));
			} else {
				aFilter.push(new sap.ui.model.Filter("maktx", sap.ui.model.FilterOperator.StartsWith, sValue));
			}

			var oItemFactory = function (sId, oContext) {
				var oItemTemplate = new sap.m.StandardListItem({
					title: "{ZSRSDATAFEED>matnr}",
					description: "{ZSRSDATAFEED>maktx}"
				}).addStyleClass("sapUiTinyMargins");

				// I did not manage to get this one solved... expand does not understand that this is media not data
				oItemTemplate.setIcon("/sap/opu/odata/sap/ZR_MEDIAEXPORT_SRV/HauptBildSet(Artnr='" + oContext.getObject().matnr +
					"',Format='web240x310')/$value");

				//oItemTemplate.addContent(box);
				return oItemTemplate;
			};

			this.getView().byId("idArtikelList").bindItems({
				path: "/ArtikelsucheSet",
				filters: aFilter,
				model: "ZSRSDATAFEED",
				factory: oItemFactory
					/*,
									parameters: {
										expand: "toBild",
										faultTolerant: true
									}*/
			});

		},

		onSelectionChange: function (oEvent) {

			var selPPFactory = function (sId, oContext) {

				var oItemTemplate = new sap.ui.core.Item({
					key: "{Id}",
					text: "{Name}"
				});

				return oItemTemplate;
			};
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
					factory: selPPFactory.bind(this),
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

		onPPSelected: function (oEvent) {
			this.loadGrob(oEvent.getParameters().selectedItem.getKey(), this.getView().byId("calenderAuswahlGrob").getValue());
		},

		loadGrob: function (oId, oWeek) {

			var oLoccoFilter = new sap.ui.model.Filter("Locco",
				sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().locco);

			var oWeekFilter = new sap.ui.model.Filter("Week",
				sap.ui.model.FilterOperator.EQ, oWeek);

			this.getView().byId("AngeboteTable").bindItems({
				path: "Offers>/OfrHeadSet",
				filters: [oLoccoFilter, oWeekFilter],
				//template: itemTemplate,
				factory: OffersItemFactory.factory.bind(this),
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

						//var _table = new sap.m.Table().addStyleClass("zpolytableblack");

						var _table = new StellPlatzItemTable({
							container: _box
						});

						_table.setHeaderData(_data);

						//this.addDetailTable(_table, _box, _data); // Header and co.

						// bind the items with a custom binding using a filter on key and week

						_table.setCustomBinding({
							Key: _data.Key,
							Week: oWeek
						});

						_box.addItem(_table);
					}

				}.bind(this)
			});

		},

		onStellPlatzItemDelete: function (oEvent) {
			// dragging here means deleting from the stellplatzitem table
			// but only if this really comes from there..

			if (!oEvent.getParameters().draggedControl) return;
			
			var _path = oEvent.getParameters().draggedControl.getBindingContextPath();
			if (_path.indexOf("/PlanungItemSet") >= 0) // prevent self-drop, only PlanungItems can be handled 
				this.getModel().remove(_path, {});

		}

	});
});