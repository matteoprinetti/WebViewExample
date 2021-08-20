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
	"sap/ui/core/Icon"
], function (Control, Dialog, Table, VBox, HBox, IconTabBar, IconTabFilter, Label, Column, Text, 
		ObjectHeader, Splitter, SplitterLayoutData, SearchField, ScrollContainer, Icon) {
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
				TableTop: {
					type: "sap.m.Table" // ref to inner Table
				},
				TableAngebot: {
					type: "sap.m.Table" // ref to inner Table
				},
				TableZusatz: {
					type: "sap.m.Table" // ref to inner Table
				}
			}
		},

		init: function () {
			this.setAggregation("_dialog", new Dialog({
				title: "Artikel im Angebot",
				stretch: true
			}));

			var _tabletop = new Table().setLayoutData(new SplitterLayoutData({minSize: 300, resizable: false}) );
			var _tableangebot = new Table();
			var _tablezusatz = new Table();

			this.setProperty("TableTop", _tabletop);
			this.setProperty("TableAngebot", _tableangebot);
			this.setProperty("TableZusatz", _tablezusatz);

			_tableangebot.addColumn(new Column().setHeader(new Text({
				text: "Artikel"
			})));

			_tableangebot.addColumn(new Column().setHeader(new Text({
				text: "Bezeichnung"
			})));

			_tablezusatz.addColumn(new Column().setHeader(new Text({
				text: "Artikel"
			})));

			_tablezusatz.addColumn(new Column().setHeader(new Text({
				text: "Bezeichnung"
			})));

			_tabletop.addColumn(new Column().setHeader(new Text({
				text: "Artikel"
			})));

			_tabletop.addColumn(new Column().setHeader(new Text({
				text: "Bezeichnung"
			})));


			var _vbox = new VBox( { width:"100%",
									height:"100%" });
									
			var _tabbar = new IconTabBar().setLayoutData(new SplitterLayoutData({minSize: 300, resizable: false}) );

			
			this._topcontainer = new HBox();
			
			var _objheader = new ObjectHeader({
			 
			});

			this._topcontainer.addItem(_objheader);
			_vbox.addItem(this._topcontainer);
			
			//this.setAggregation("_topcontainer",_vbox.getItems()[0]);	
		
			// Splitter 
			
			var _splitter = new Splitter({orientation: "Vertical"});
			
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
			var _searchFieldZusatz = new SearchField();
			
			_tabfilter1.addContent(_searchFieldAngebot);
			_tabfilter1.addContent(new ScrollContainer({height : "150px", vertical: true }).addContent(this.getProperty("TableAngebot")));
			
			_tabfilter2.addContent(_searchFieldZusatz);
			_tabfilter2.addContent(new ScrollContainer({height : "150px", vertical: true }).addContent(this.getProperty("TableZusatz")));

			_tabbar.addItem(_tabfilter1);
			_tabbar.addItem(_tabfilter2);

			this.getAggregation("_dialog").addContent(_vbox);

			// set ref to table

		},

		open: function () {
			this.getAggregation("_dialog").open();
		},

		bindAngebot: function (oAngebot) {
	
			// head
			
			this._topcontainer.getItems()[0].setTitle(oAngebot.Matnr);
			this._topcontainer.getItems()[0].setIcon("/sap/opu/odata/sap/ZR_MEDIAEXPORT_SRV/AngebotSet(AngebotNr='" + oAngebot.Matnr +
				"')/$value");

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
					oItemTemplate.addCell(new Text({
						text: oContext.getObject().ExtProdId
					}));
					oItemTemplate.addCell(new Text({
						text: oContext.getObject().Bezeichnung
					}));
					return oItemTemplate;
				},
				events: {
					dataReceived: function () {
						this.getAggregation("_dialog").open();
					}.bind(this)
				}
			});
		}
	});
});