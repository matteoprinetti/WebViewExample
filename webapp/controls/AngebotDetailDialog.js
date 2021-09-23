sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Dialog",
	"sap/m/Table",
	"sap/m/VBox",
	"sap/m/HBox",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/m/Label",
	"sap/m/Column",
	"sap/m/Text",
	"sap/m/ObjectHeader",
	"sap/ui/layout/Splitter",
	"sap/ui/layout/SplitterLayoutData",
	"sap/m/SearchField",
	"sap/m/ScrollContainer",
	"sap/ui/core/Icon",
	"sap/m/Image",
	"sap/m/ObjectAttribute",
	"sap/m/Button",
	"sap/m/ButtonType"
], function (Control, Dialog, Table, VBox, HBox, IconTabBar, IconTabFilter, Label, Column, Text,
	ObjectHeader, Splitter, SplitterLayoutData, SearchField, ScrollContainer, Icon, Image, ObjectAttribute, Button, ButtonType) {
	"use strict";
	return Control.extend("zpoly.zpolyplanung.controls.AngebotDetailDialog", {

		metadata: {
			aggregations: {
				_dialog: {
					type: "sap.m.Dialog",
					multiple: false,
					visibility: "hidden"
				},
				_topcontainer: {
					type: "sap.m.HBox",
					multiple: false,
					visibility: "hidden"
				}

			},
			properties: {
				ParentControl: {
					type: "sap.m.Table" // ref to inner Table
				},
				TableTop: {
					type: "sap.m.Table" // ref to inner Table
				},
				TableAngebot: {
					type: "sap.m.Table" // ref to inner Table
				},
				TableZusatz: {
					type: "sap.m.Table" // ref to inner Table
				},
				StellplatzId: {
					type: "string"
				},
				WtId: {
					type: "string"
				},
				Woche: {
					type: "string"
				},
				Angebot: {
					type: "any"
				}
			}
		},

		init: function () {
			this.setAggregation("_dialog", new Dialog({
				title: "Artikel im Angebot",
				stretch: true,
				customHeader: [
					new sap.m.Bar({
						contentRight: new Button({
							type: ButtonType.Transparent,
							icon: "sap-icon://decline",
							width: "20px",
							press: function (oEvent) {

								this.getAggregation("_dialog").close();
							}.bind(this)
						}).addStyleClass("sapUiSmallMarginBottom"),
						contentMiddle: [
							new sap.m.Title({
								text: "Angebotsdetail"
							})
						]
					})

				]
			}));

			var _tabletop = new Table().setLayoutData(new SplitterLayoutData({
				minSize: 250,
				resizable: false
			}));
			var _tableangebot = new Table();
			var _tablezusatz = new Table();

			this.setProperty("TableTop", _tabletop);
			this.setProperty("TableAngebot", _tableangebot);
			this.setProperty("TableZusatz", _tablezusatz);

			// ANGEBOT (Unten Links)

			_tableangebot.addColumn(new Column().setHeader(new Text({
				text: "" //Artikelbild
			})));

			/*_tableangebot.addColumn(new Column().setHeader(new Text({
				text: "Angebotsname"
			})));*/

			_tableangebot.addColumn(new Column().setHeader(new Text({
				text: "ArtikelBezeichnung"
			})));

			_tableangebot.addColumn(new Column().setHeader(new Text({
				text: "ArtikelNummer"
			})));

			/*_tableangebot.addColumn(new Column().setHeader(new Text({
				text: "Zuteilung aus Aufteiler"
			})));

			_tableangebot.addColumn(new Column().setHeader(new Text({
				text: "Bestand"
			})));

			_tableangebot.addColumn(new Column().setHeader(new Text({
				text: "Prognose"
			})));*/

			_tableangebot.addColumn(new Column().setHeader(new Text({
				text: "Werbeartikel"
			})));

			// ZUSATZ (Unten Rechts)

			_tablezusatz.addColumn(new Column().setHeader(new Text({
				text: "Artikelbild" //Artikelbild
			})));

			_tablezusatz.addColumn(new Column().setHeader(new Text({
				text: "Artikelbezeichnung"
			})));

			_tablezusatz.addColumn(new Column().setHeader(new Text({
				text: "Artikelnummer"
			})));

			/*_tablezusatz.addColumn(new Column().setHeader(new Text({
				text: "Zuteilung aus Aufteiler"
			})));

			_tablezusatz.addColumn(new Column().setHeader(new Text({
				text: "Bestand"
			})));

			_tablezusatz.addColumn(new Column().setHeader(new Text({
				text: "Prognose"
			})));

			_tablezusatz.addColumn(new Column().setHeader(new Text({
				text: "Werbeartikel"
			})));*/

			// TOP

			_tabletop.addColumn(new Column().setHeader(new Text({
				text: "" // Artikelbild
			})));

			_tabletop.addColumn(new Column().setHeader(new Text({
				text: "Artikelbezeichnung"
			})));

			_tabletop.addColumn(new Column().setHeader(new Text({
				text: "Artikelnummer"
			})));

			/*_tabletop.addColumn(new Column().setHeader(new Text({
				text: "Zuteilung aus Aufteiler"
			})));

			_tabletop.addColumn(new Column().setHeader(new Text({
				text: "Bestand"
			})));

			_tabletop.addColumn(new Column().setHeader(new Text({
				text: "Prognose"
			})));*/

			_tabletop.addColumn(new Column().setHeader(new Text({
				text: "Werbeartikel"
			})));

			// drag and drops 

			_tabletop.addDragDropConfig(new sap.ui.core.dnd.DropInfo({
				drop: this.onDragDropTop.bind(this)
			}));

			_tabletop.addDragDropConfig(new sap.ui.core.dnd.DragInfo({
				sourceAggregation: "items"
			}));

			_tableangebot.addDragDropConfig(new sap.ui.core.dnd.DropInfo({
				drop: this.onDragDropAngebot.bind(this)
			}));

			_tableangebot.addDragDropConfig(new sap.ui.core.dnd.DragInfo({
				sourceAggregation: "items"
			}));

			_tablezusatz.addDragDropConfig(new sap.ui.core.dnd.DropInfo({
				drop: this.onDragDropZusatz.bind(this)
			}));

			_tablezusatz.addDragDropConfig(new sap.ui.core.dnd.DragInfo({
				sourceAggregation: "items"
			}));

			var _vbox = new VBox({
				width: "100%",
				height: "100%"
			});

			var _tabbar = new IconTabBar().setLayoutData(new SplitterLayoutData({
				minSize: 300,
				resizable: false
			}));

			this._topcontainer = new HBox();

			var _objheader = new ObjectHeader({

			});

			_objheader.bindProperty("title", "Offers>OfrName");

			_objheader.addAttribute(new ObjectAttribute({
				title: "Angebotsnummer",
				text: "{Offers>ZzExtOfrId}"
			}));

			_objheader.addAttribute(new ObjectAttribute({
				title: "Angebotsart",
				text: "{Offers>PromoTypeTxtShort} "
			}));

			_objheader.addAttribute(new ObjectAttribute({
				title: "Rabattwert",
				text: "{Offers>ZzRedText} {Offers>ZzRedTypText} "
			}));

			this._topcontainer.addItem(new Image({
				height: "10rem"
			}).addStyleClass("sapUiSmallMargin"));

			this._topcontainer.addItem(_objheader);

			// also WT data

			var _objheaderWt = new ObjectHeader({

			});

			_objheaderWt.bindProperty("title", "WtName");

			_objheaderWt.addAttribute(new ObjectAttribute({
				title: "Anzahl Wt.",
				text: "{AnzWt}"
			}));

			this._topcontainer.addItem(_objheaderWt);

			_vbox.addItem(this._topcontainer);

			//this.setAggregation("_topcontainer",_vbox.getItems()[0]);	

			// Splitter 

			var _splitter = new Splitter({
				orientation: "Vertical"
			});

			/*_splitter.addContentArea(new ScrollContainer({
				height: "300px",
				vertical: true }).addContent(this.getProperty("TableTop"))); */

			_splitter.addContentArea(this.getProperty("TableTop"));

			_splitter.addContentArea(_tabbar);

			_vbox.addItem(_splitter);

			var _tabfilter1 = new IconTabFilter({
				text: "Angebot"
			});
			var _tabfilter2 = new IconTabFilter({
				text: "Zusatz"
			});

			var _searchFieldAngebot = new SearchField();
			var _searchFieldZusatz = new SearchField().attachSearch(this.onZusatzSearch.bind(this));

			_tabfilter1.addContent(_searchFieldAngebot);
			_tabfilter1.addContent(new ScrollContainer({
				height: "150px",
				vertical: true
			}).addContent(this.getProperty("TableAngebot")));

			_tabfilter2.addContent(_searchFieldZusatz);
			_tabfilter2.addContent(new ScrollContainer({
				height: "150px",
				vertical: true
			}).addContent(this.getProperty("TableZusatz")));

			_tabbar.addItem(_tabfilter1);
			_tabbar.addItem(_tabfilter2);

			this.getAggregation("_dialog").addContent(_vbox);

			// after open

			this.getAggregation("_dialog").attachAfterOpen(function () {
				this.bindAngebot(this.getAngebot());
			}.bind(this));

		},

		onZusatzSearch: function (oEvent) {

			var sValue = oEvent.getParameters().query;
			var aFilter = [];
			if (sValue.match(/^[0-9]+$/)) {
				aFilter.push(new sap.ui.model.Filter("matnr", sap.ui.model.FilterOperator.StartsWith, sValue));
			} else {
				aFilter.push(new sap.ui.model.Filter("maktx", sap.ui.model.FilterOperator.StartsWith, sValue));
			}
			
			// 20.09.2021 add allsort as filter to get all the products
			
			aFilter.push(new sap.ui.model.Filter("allsort", sap.ui.model.FilterOperator.EQ, true));

			var oItemFactory = function (sId, oContext) {

				var oItemTemplate = new sap.m.ColumnListItem({
					type: "Inactive"
				});

				oItemTemplate.addCell(new Image({
					height: "2rem",
					src: "/sap/opu/odata/sap/ZR_MEDIAEXPORT_SRV/HauptBildSet(Artnr='" + oContext.getObject().matnr +
						"',Format='web240x310')/$value"
				}).addStyleClass("sapUiSmallMargin"));

				oItemTemplate.addCell(new Text({
					text: oContext.getObject().maktx
				}));
				oItemTemplate.addCell(new Text({
					text: oContext.getObject().matnr
				}));

				return oItemTemplate;
			};

			this.getTableZusatz().bindAggregation("items", {
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

		open: function () {
			this.getAggregation("_dialog").open();
		},

		bindAngebot: function (oAngebot) {

			// head
			// note this needs to be done for the other 2 tables 

			this._topcontainer.getItems()[0].setSrc("/sap/opu/odata/sap/ZR_MEDIAEXPORT_SRV/AngebotSet(AngebotNr='" + oAngebot.Matnr +
				"')/$value");

			var _path = "/OfrHeadSet(guid'" + oAngebot.Angebot + "')";

			this._topcontainer.getItems()[1].bindElement({
				path: _path,
				model: "Offers"
			});

			var _objectKey = this.getModel().createKey("/PlanungItemHeadSet", {
				StellplatzId: this.getStellplatzId(),
				WtId: this.getWtId(),
				Woche: this.getWoche()
			});

			this._topcontainer.getItems()[2].bindElement({
				path: _objectKey
			});

			// Stellplatz - wt - top table

			this.getTableTop().bindAggregation("items", {
				path: "/PlanungItemDetailSet",
				filters: [
					new sap.ui.model.Filter("StellplatzId",
						sap.ui.model.FilterOperator.EQ, this.getStellplatzId()),
					new sap.ui.model.Filter("WtId",
						sap.ui.model.FilterOperator.EQ, this.getWtId()),
					new sap.ui.model.Filter("Woche",
						sap.ui.model.FilterOperator.EQ, this.getWoche()),
					new sap.ui.model.Filter("Angebot",
						sap.ui.model.FilterOperator.EQ, oAngebot.Angebot)
				],
				factory: function (sId, oContext) {

					var oItemTemplate = new sap.m.ColumnListItem({
						type: "Inactive"
					});

					oItemTemplate.addCell(new Image({
						height: "2rem",
						src: "/sap/opu/odata/sap/ZR_MEDIAEXPORT_SRV/HauptBildSet(Artnr='" + oContext.getObject().Artikel +
							"',Format='web240x310')/$value"
					}).addStyleClass("sapUiSmallMargin"));

					oItemTemplate.addCell(new Text({
						text: oContext.getObject().Beschreibung
					}));
					oItemTemplate.addCell(new Text({
						text: oContext.getObject().Artikel
					}));
				/*	oItemTemplate.addCell(new Text({
						text: "0"
					}));
					oItemTemplate.addCell(new Text({
						text: "0"
					}));
					oItemTemplate.addCell(new Text({
						text: "0"
					}));*/
					oItemTemplate.addCell(new Text({
						text: oContext.getObject().WerbeArtikel ? "Ja" : "Nein"
					}));

					return oItemTemplate;
				},
				events: {
					dataReceived: function () {
						//this.getAggregation("_dialog").open();
					}.bind(this)

				}
			});

			// Angebot - unten links 

			this.getTableAngebot().bindAggregation("items", {
				path: "/OfrHeadSet(guid'" + oAngebot.Angebot + "')/toOfrItemSet",
				model: "Offers",
				filters: [
					new sap.ui.model.Filter("AllArtikel",
						sap.ui.model.FilterOperator.EQ, true)
				],
				factory: function (sId, oContext) {

					var oItemTemplate = new sap.m.ColumnListItem({
						type: "Inactive"
					});

					oItemTemplate.addCell(new Image({
						height: "2rem",
						src: "/sap/opu/odata/sap/ZR_MEDIAEXPORT_SRV/HauptBildSet(Artnr='" + oContext.getObject().ExtProdId +
							"',Format='web240x310')/$value"
					}).addStyleClass("sapUiSmallMargin"));

					/*
					var _angebotTitle = new Text();
					_angebotTitle.bindElement(  {
						path: "/OfrHeadSet(guid'" + oContext.getObject().OfferGuid + "')",
						model: "Offers"});
						
					_angebotTitle.bindProperty("text","Offers>OfrName");*/
					
					//oItemTemplate.addCell(_angebotTitle);
					
					oItemTemplate.addCell(new Text({
						text: oContext.getObject().Bezeichnung
					}));
					oItemTemplate.addCell(new Text({
						text: oContext.getObject().ExtProdId
					}));
					/*oItemTemplate.addCell(new Text({
						text: "0"
					}));
					oItemTemplate.addCell(new Text({
						text: "0"
					}));
					oItemTemplate.addCell(new Text({
						text: "0"
					}));*/
					oItemTemplate.addCell(new Text({
						text: oContext.getObject().Werbeartikel ? "Ja" : "Nein"
					}));

					return oItemTemplate;
				},
				events: {
					dataReceived: function () {
						//this.getAggregation("_dialog").open();
					}.bind(this)
				}
			});

			/*window.setTimeout(function() {
				this.getAggregation("_dialog").open();
			}.bind(this),0);*/

		},

		onDragDropTop: function (oEvent) {

			if (!oEvent.getParameters().draggedControl) {
				return;
			}

			var _path = oEvent.getParameters().draggedControl.getBindingContextPath();
			this._lastDraggedControl = oEvent.getParameters().draggedControl;

			// data from Angebot 

			var _objectData = null;
			var _object = null;

			if (_path.indexOf("/OfrItemSet") >= 0) {
				_object = this.getModel("Offers").getProperty(_path);
				_objectData = {
					StellplatzId: this.getStellplatzId(),
					WtId: this.getWtId(),
					Woche: this.getWoche(),
					Angebot: _object.OfferGuid,
					Artikel: _object.ExtProdId,
					WerbeArtikel: _object.Werbeartikel,
					Beschreibung: _object.Bezeichnung
				};

			}

			// data from Zusatz

			if (_path.indexOf("/ArtikelsucheSet") >= 0) {
				_object = this.getModel("ZSRSDATAFEED").getProperty(_path);
				_objectData = {
					StellplatzId: this.getStellplatzId(),
					WtId: this.getWtId(),
					Woche: this.getWoche(),
					Angebot: this.getAngebot().Angebot,
					Artikel: _object.matnr,
					Beschreibung: _object.maktx,
					Zusatz: true 
				};
			}

			this.getModel().create("/PlanungItemDetailSet", _objectData, {
				success: function () {
					this.getParentControl().getCells()[1].getItems()[0].getElementBinding().refresh(true);
					this.getParentControl().getCells()[1].getItems()[1].getElementBinding().refresh(true);
				}.bind(this)
			});

		},
		onDragDropAngebot: function (oEvent) {

			if (!oEvent.getParameters().draggedControl) {
				return;
			}

			var _path = oEvent.getParameters().draggedControl.getBindingContextPath();

			if (_path.indexOf("PlanungItemDetailSet") < 0) return;

			this._lastDraggedControl = oEvent.getParameters().draggedControl;

			this.getModel().remove(_path, {
				success: function () {
					this.getParentControl().getCells()[1].getItems()[0].getElementBinding().refresh(true);
					this.getParentControl().getCells()[1].getItems()[1].getElementBinding().refresh(true);
				}.bind(this)
			});

		},
		onDragDropZusatz: function (oEvent) {

			if (!oEvent.getParameters().draggedControl) {
				return;
			}

			var _path = oEvent.getParameters().draggedControl.getBindingContextPath();

			if (_path.indexOf("PlanungItemDetailSet") < 0) return;

			this._lastDraggedControl = oEvent.getParameters().draggedControl;

			this.getModel().remove(_path, {
				success: function () {
					this.getParentControl().getCells()[1].getItems()[0].getElementBinding().refresh(true);
					this.getParentControl().getCells()[1].getItems()[1].getElementBinding().refresh(true);
				}.bind(this)
			});
		},

	});
});