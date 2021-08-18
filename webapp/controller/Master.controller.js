sap.ui.define([
	"./BaseController",
 	"zpoly/zpolyplanung/controls/StellPlatz",
	"zpoly/zpolyplanung/controls/StellPlatzDetail",
	"zpoly/zpolyplanung/factories/FlaecheItemFactory",
	"zpoly/zpolyplanung/factories/OffersItemFactory",
	"../model/formatter",
	'sap/ui/core/Fragment'
], function (BaseController, StellPlatz, StellPlatzDetail, FlaecheItemFactory, OffersItemFactory, Formatter, Fragment) {
	"use strict";

	//template: this.getView().byId("AngeboteTableColumnListItem").clone(),

	return BaseController.extend("zpoly.zpolyplanung.controller.Master", {
		formatter: Formatter,
		_template_angebote: null,
		_stellplatz_id: null,
		_lastDraggedControl: null,

		onInit: function () {

			// get a copy of the template
			this._template_angebote = this.getView().byId("AngeboteTableColumnListItem").clone();

			// set up an event so I know when someone has deleted something

			var bus = this.getOwnerComponent().getEventBus();
			//bus.subscribe("zpolyplanung", "delete", this.onDelete, this);

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
						sorter: new sap.ui.model.Sorter("Name"),
						parameters: {
							expand: "FlaecheToBossnr"
						}
					});

					// save the filiale for the next screens

					this.setFilialeData(oResponse);

					// init the calendar control

					this.getView().byId("calenderAuswahl").setDateValue(this.getModel("local").getProperty("/CalWeekAsDate"));

				}.bind(this)
			});

			this.byId("idSelDefault").addEventDelegate({
				onmouseover: function () {
					// Open popover here
					this._timeId = setTimeout(() => {

						// bind the list in case the switch is set

						this.byId("defaultPopoverList").removeAllItems();
						if (this.byId("idSelDefault").getSelected()) {

							// print the filter that has been set.
							for (var _filter in this.byId("AngeboteTable").getBindingInfo("items").filters) {

								// exclude some filter...

								var _filtervalue = this.byId("AngeboteTable").getBindingInfo("items").filters[_filter];

								if (_filtervalue.sPath.indexOf("Locco") >= 0 ||
									_filtervalue.sPath.indexOf("Week") >= 0 ||
									_filtervalue.sPath.indexOf("IncludedOfr") >= 0) continue;

								var _item = new sap.m.CustomListItem().addStyleClass("sapUiTinyMargin");
								_item.addContent(new sap.m.Label({
									text: _filtervalue.sPath + " = " + _filtervalue.oValue1
								}));
								this.byId("defaultPopoverList").addItem(_item);
							}
						};

						this.byId("defaultPopover").openBy(this.byId("idSelDefault"));
					}, 500);
				}.bind(this),
				onmouseout: function () {
					clearTimeout(this._timeId);
					this.byId("defaultPopover").close();
				}.bind(this)
			});

			if (!this.getOwnerComponent()._AngebotDetailPopover) {
				this.getOwnerComponent()._AngebotDetailPopover = Fragment.load({
					id: this.getView().getId(),
					name: "zpoly.zpolyplanung.view.AngebotPopOver",
					controller: this
				}).then(function (oPopover) {
					this.getView().addDependent(oPopover);
					return oPopover;
				}.bind(this));
			}
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
				this.getView().byId("Detail").setEnabled(true);
				this.getView().byId("tabDetail").setEnabled(true);
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
									
									this.loadDetail(oData.Id, this.getView().byId("calenderAuswahl").getValue());
								}
							}

						}.bind(this)
					}
				});

				// same for the select element im Detail

				this.getView().byId("selPPDetail").bindItems({
					path: "/FlaechenSet",
					filters: [oLoccoFilter],
					factory: selPPFactory.bind(this),
					sorter: new sap.ui.model.Sorter("Name"),
					events: {
						dataReceived: function (oData2) {

							// position on the Id that was chosen 

							for (var x = 0; x < this.getView().byId("selPPDetail").getItems().length; x++) {
								var item = this.getView().byId("selPPDetail").getItems()[x];
								if (item.getKey() === oData.Id) { // the chosen one 
									this.getView().byId("selPPDetail").setSelectedItem(item);

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
				factory: FlaecheItemFactory.factory.bind(this),
				sorter: new sap.ui.model.Sorter("Name"),
				parameters: {
					expand: "FlaecheToBossnr"
				}
			});

		},

		onCalWeekChange: function (oEvent) {
			this.getView().byId("AngeboteTable").destroyItems();
		},

		onTabbarSelect: function (oEvent) {
			if (oEvent.getParameters().key === "Ueber") {
				this.getView().byId("Detail").setEnabled(false);
				this.getView().byId("tabDetail").setEnabled(false);
			}
			// Detail 
			if (oEvent.getParameters().key === "Detail") {
				var _ppf=this.getModel("local").getProperty("/selectedPPF");
			}
		},

		onPPSelected: function (oEvent) {
			this.loadGrob(oEvent.getParameters().selectedItem.getKey(), this.getView().byId("calenderAuswahlGrob").getValue());
		},

		onPPSelectedDetail: function (oEvent) {
			this.loadDetail(oEvent.getParameters().selectedItem.getKey(), this.getView().byId("calenderAuswahlDetail").getValue());
		},
		/*onBeforeRebindAngeboteTable: function (oEvent) {

			// 12.05.2021 Prinetti
			// check the search flags and ACT

			var _default = this.getView().byId("idSelDefault").getSelected();
			var _searchText = this.getView().byId("idSelSearch").getValue();

			var binding = oEvent.getParameter("bindingParams");
			var oLoccoFilter = new sap.ui.model.Filter("Locco",
				sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().locco);

			var oWeekFilter = new sap.ui.model.Filter("Week",
				sap.ui.model.FilterOperator.EQ, this.getView().byId("calenderAuswahlGrob").getValue());

			binding.parameters["expand"] = "toCampaign";
			binding.filters.push(oLoccoFilter);
			binding.filters.push(oWeekFilter);

			// now the custom filter 
			// only if this.All is not true

			if (_default) {
				// add the filters according to the type of polyflaeche				
			}

			if (_searchText && _searchText !== "") {
				binding.filters.push(new sap.ui.model.Filter("OfrName",
					sap.ui.model.FilterOperator.EQ, _searchText));
			}

		},*/

		loadGrob: function (oId, oWeek) {

			this._stellplatz_id = oId;

			sap.ui.core.BusyIndicator.show();

			var _stellplatz = this.getView().byId("idStellPlatz");

			//20.04.2021 set Container height

			/*var _stellplatzcontainer = this.getView().byId("idMasterPage");
			var _height = $("#" + this.getView().byId("idSplitter").getId()).css("height");
			_stellplatzcontainer.setHeight(_height);

			var _angebotcontainer = this.getView().byId("AngeboteTable");
			_height = $("#" + this.getView().byId("idSplitter").getId()).css("height");
			_angebotcontainer.setHeight(_height);*/

			var _template_stellplatz = new sap.m.CustomListItem({
				content: [
					new StellPlatz({
						week: '{local>/CalWeek}',
						key: '{Key}',
						PopOverControl: this.getOwnerComponent()._AngebotDetailPopover
					})
				]
			});

			// Read ExpiredSellouts then bind , we need the expired sellouts later in the angebot search

			var _selloutFilters = [];
			_selloutFilters.push(new sap.ui.model.Filter("Locco",
				sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().locco));

			_selloutFilters.push(new sap.ui.model.Filter("Week",
				sap.ui.model.FilterOperator.EQ, this.getView().byId("calenderAuswahlGrob").getValue()));

			this.getView().getModel().read("/ExpiredSelloutsSet", {
				filters: _selloutFilters,
				success: function (oData, oResponse) {

					//this.internalRebind();

					_stellplatz.bindItems({
						path: "/FlaechenSet(guid'" + oId + "')/FlaecheToStellplatz",
						template: _template_stellplatz,
						events: {
							dataReceived: function () {
								this.internalRebind(this.getView().byId("idSelDefault").getSelected());
							}.bind(this)
						}

					});

					sap.ui.core.BusyIndicator.hide();

				}.bind(this)
			})

		},

		loadDetail: function (oId, oWeek) {

			this._stellplatz_id = oId;

			sap.ui.core.BusyIndicator.show();

			var _stellplatz_detail = this.getView().byId("idStellPlatzDetail");

			//20.04.2021 set Container height

			/*var _stellplatzcontainer = this.getView().byId("idMasterPage");
			var _height = $("#" + this.getView().byId("idSplitter").getId()).css("height");
			_stellplatzcontainer.setHeight(_height);

			var _angebotcontainer = this.getView().byId("AngeboteTable");
			_height = $("#" + this.getView().byId("idSplitter").getId()).css("height");
			_angebotcontainer.setHeight(_height);*/

			var _template_stellplatz_detail = new sap.m.CustomListItem({
				content: [
					new StellPlatzDetail({
						week: '{local>/CalWeek}',
						key: '{Key}',
						mode: 'Detail',
						PopOverControl: this.getOwnerComponent()._AngebotDetailPopover
					})
				]
			});

			_stellplatz_detail.bindItems({
				path: "/FlaechenSet(guid'" + oId + "')/FlaecheToStellplatz",
				template: _template_stellplatz_detail,
				events: {
					dataReceived: function () {
						//this.internalRebind(this.getView().byId("idSelDefault").getSelected());
					}.bind(this)
				}

			});

		},

		onStellPlatzItemDelete: function (oEvent) {
			// dragging here means deleting from the stellplatzitem table
			// but only if this really comes from there..

			if (!oEvent.getParameters().draggedControl) return;

			this._lastDraggedControl = oEvent.getParameters().draggedControl;

			var _path = oEvent.getParameters().draggedControl.getBindingContextPath();
			if (_path.indexOf("/PlanungItemSet") >= 0) // prevent self-drop, only PlanungItems can be handled 
				this.getModel().remove(_path, {
				success: function () {
					for (var _x in this.getView().byId("AngeboteTable").getItems()) {
						var _item = this.getView().byId("AngeboteTable").getItems()[_x];
						if (this._lastDraggedControl.getCells()[2].getDescription() ===
							_item.getCells()[1].getDescription())
							_item.setVisible(true);
					}
				}.bind(this)
			});

		},

		onAngebotSelectIconHover: function (oEvent) {

			var _source = oEvent.getSource();
			var _params = oEvent.getParameters();

			this.getOwnerComponent()._AngebotDetailPopover.then(function (oPopover) {

				if (_params.state) {
					oPopover.bindElement({
						path: _params.path,
						model: "Offers"
					});
					oPopover.openBy(_source);
				} else
					oPopover.close();
			}.bind(this));

			// show some picture 
		},

		onAngebotDefaultHover: function (_params) {

			if (!this._AngebotDefaultPopover) {
				this._AngebotDefaultPopover = Fragment.load({
					id: this.getView().getId(),
					name: "zpoly.zpolyplanung.view.AngebotDefaultPopOver",
					controller: this
				}).then(function (oPopover) {
					this.getView().addDependent(oPopover);
					return oPopover;
				}.bind(this));
			}
			this._AngebotDefaultPopover.then(function (oPopover) {

				if (_params.state) {
					/*oPopover.bindElement({
						path: _params.path,
						model: "Offers"
					});*/
					console.log("open");
					oPopover.openBy(_source);
				} else {
					console.log("close");
					oPopover.close();
				}
			}.bind(this));

		},

		onSearch: function (oEvent) {
			// call internalRebind
			var _selected = this.getView().byId("idSelDefault").getSelected();
			var _search = this.getView().byId("idSelSearch").getValue();

			// get the data for the polyflaeche and build a filter

			this.internalRebind(_selected, _search.trim());

		},

		disablePlannedOffers: function () {

			// turn the offers that are already in the stellplatz not selectable
			for (var _x in this.getView().byId("AngeboteTable").getItems()) {
				var _item = this.getView().byId("AngeboteTable").getItems()[_x];

				// get the ofr id 

				var _ofr_id = _item.getCells()[1].data("offerguid");

				// look up in PlanungItemSet for this week and if there - set it disabled.

				for (var [key, value] of Object.entries(this.getView().getModel().oData)) {
					if (key.indexOf("PlanungItemSet") >= 0) {

						if (value.Woche === this.getView().byId("calenderAuswahlGrob").getValue()) {
							if (_ofr_id === value.Angebot) {
								if (this.getView().byId("idUngeplant").getSelected())
								// but only when Default is not set
									_item.setVisible(false);

							}
						}
					}
				}

			}

		},

		internalRebind: function (_defsearch, _textfilter) {
			// rebind the filter

			var filters = [];
			var oLoccoFilter = new sap.ui.model.Filter("Locco",
				sap.ui.model.FilterOperator.EQ, this.getOwnerComponent().locco);

			var oWeekFilter = new sap.ui.model.Filter("Week",
				sap.ui.model.FilterOperator.EQ, this.getView().byId("calenderAuswahlGrob").getValue());

			filters.push(oLoccoFilter);
			filters.push(oWeekFilter);

			//  Default search: entweder Direktion oder 

			if (_defsearch === undefined || _defsearch === true) {
				var _flaeche = this.getModel().getProperty("/FlaechenSet(guid'" + this._stellplatz_id + "')");

				// if type = 1 - Direktion
				if (_flaeche.Type === "1")
					filters.push(
						new sap.ui.model.Filter("Organisation",
							sap.ui.model.FilterOperator.EQ, _flaeche.Org));

				// if type = 2 - add boss filter 
				if (_flaeche.Type === "2") {

					// Prinetti 16.08.2021 added Sortber
					filters.push(
						new sap.ui.model.Filter("Sortber",
							sap.ui.model.FilterOperator.EQ, _flaeche.Sortber));

					for (var [key, value] of Object.entries(this.getView().getModel().oData)) {
						if (key.indexOf("BossSet") >= 0) {
							if (value.FlaecheId === this._stellplatz_id) // yes this boss belongs to my stellplatz
								filters.push(
								new sap.ui.model.Filter("ZzBossnummer",
									sap.ui.model.FilterOperator.EQ, value.Bossnr));

						}
					}
				}

			}

			// 28.06.2021 Text Filter

			if (_textfilter) {
				filters.push(new sap.ui.model.Filter("ExtSearch",
					sap.ui.model.FilterOperator.EQ, _textfilter));
			}

			// 28.06.2021 sellouts filter
			// 29.07.2021 show only the sellouts relevant to the week

			for (var [key, value] of Object.entries(this.getView().getModel().oData)) {
				if (key.indexOf("ExpiredSelloutsSet") >= 0 &&
					value.Week === this.getView().byId("calenderAuswahlGrob").getValue()) {
					filters.push(
						new sap.ui.model.Filter("IncludedOfr",
							sap.ui.model.FilterOperator.EQ, value.Angebot));
				}
			}

			this.getView().byId("AngeboteTable").setModel(this.getView().getModel("Offers"));
			this.getView().byId("AngeboteTable").bindItems({
				path: "/OfrHeadSet",
				filters: filters,
				template: this._template_angebote,
				parameters: {
					expand: "toCampaign"
				},
				events: {
					dataReceived: this.disablePlannedOffers.bind(this)
				}
			});

		}

	});
});