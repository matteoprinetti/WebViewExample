sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Panel",
	"sap/m/OverflowToolbar",
	"sap/m/Button",
	"sap/m/Table",
	"zpoly/zpolyplanung/controls/StellPlatzItemTableDetail",
	"zpoly/zpolyplanung/controls/AngebotDetailDialog",
	"sap/m/ColumnListItem",
	"sap/m/MessageBox",
	"sap/m/Text",
	"sap/m/ListType"
], function (Control, Panel, OverflowToolbar, Button, Table, StellPlatzItemTableDetail, 
    AngebotDetailDialog, ColumnListItem, MessageBox, Text, ListType) {
	"use strict";
	return Control.extend("zpoly.zpolyplanung.controls.StellPlatzDetail", {

		_oValueHelpDialog: null,
		_oDetailDialog: null,
		_wtid: null,
		_currentDetailObject: null,

		metadata: {
			properties: {
				key: {
					type: "string"
				},
				week: {
					type: "string"
				},
				dialog: {
					type: "any"
				}
			},
			aggregations: {
				_panel: {
					type: "sap.m.Panel",
					multiple: false,
					visibility: "hidden"
				}
			}
		},

		init: function () {

			this.setAggregation("_panel", new Panel({
				expanded: false,
				expandable: true
			}));

			var _table = new Table();

			var _overflowtoolbar = new sap.m.OverflowToolbar();
			var _text = new sap.m.Text();

		   this._oDetailDialog = new AngebotDetailDialog();
		   				
		   
			_text.bindProperty("text", "Name");

			_overflowtoolbar.addContent(_text);
			//_overflowtoolbar.addContent(new sap.m.ToolbarSpacer());
			//_overflowtoolbar.addContent(_btnAdd);
			//_overflowtoolbar.addContent(_btnDel);

			this.getAggregation("_panel").setHeaderToolbar(_overflowtoolbar);

			this.getAggregation("_panel").attachExpand(function (oEvent) {
				var _enabled = oEvent.getParameters().expand;
				//this.getHeaderToolbar().getContent()[2].setVisible(_enabled);
				//this.getHeaderToolbar().getContent()[3].setVisible(_enabled);
			});

			// Create the Table

			// Columns 

			_table.addColumn(new sap.m.Column({
				width: "45%",
				header: new sap.m.Text({
					text: "Angebot"
				})
			}));

			_table.addColumn(new sap.m.Column({
				header: new sap.m.Text({
					text: "Artikel"
				})
			}));

			_table.addColumn(new sap.m.Column({
				header: new sap.m.Text({
					text: "Zusatzartikel"
				})
			}));

			_table.addColumn(new sap.m.Column({
				header: new sap.m.Text({
					text: "WT_Typ"
				})
			}));

			_table.addColumn(new sap.m.Column({
				header: new sap.m.Text({
					text: "WT Anzahl"
				})
			}));

			_table.addStyleClass("zpolytableblack");

			// itempress event 

			_table.attachItemPress(function (oEvent) {
				this._currentDetailObject = oEvent.getParameters().listItem.getBindingContext().getObject();
                this._oDetailDialog.setModel(this.getModel("Offers"),"Offers");
                this._oDetailDialog.setModel(this.getModel());
				this._oDetailDialog.bindAngebot(this._currentDetailObject);
				
			}.bind(this));

			this.getAggregation("_panel").addContent(_table);

		},

		setWeek: function (oValue) {
			this.setProperty("week", oValue);

			this.bindInternal();

		},

		setKey: function (oValue) {
			this.setProperty("key", oValue);

			this.bindInternal();

		},

		setDialog: function (oValue) {
			this.setProperty("dialog", oValue);
		},

		bindInternal: function () {
			// if both week and Key are set, its time to bind.

			if (!(this.getWeek() && this.getKey()))
				return;

			this.getAggregation("_panel").getContent()[0].bindAggregation("items", {
				path: "/PlanungItemSet",
				filters: [
					new sap.ui.model.Filter("Woche",
						sap.ui.model.FilterOperator.EQ, this.getWeek()),
					new sap.ui.model.Filter("StellplatzId",
						sap.ui.model.FilterOperator.EQ, this.getKey())
				],

				factory: function (sId, oContext) {

					var oItemTemplate = new sap.m.ColumnListItem({
						type: ListType.Active
					});

					// take care of the fact that this could be an artikel. 

					// get hold of Angebot details from Offers model
					// ACTUALL it should READ or better bind the element to OfrHeadSet ! 

					var _objectid = oContext.getObject().Angebot;

					if (oContext.getObject().ArtikelFlag === false) {
						var _objectkey = this.getModel("Offers").createKey("OfrHeadSet", {
							OfferGuid: _objectid
						});

						//2.12.2020 this is the error: we cannot map to the offer in the model  ! we need to map to the 
						//oData entityset..

						var _angebotPath = "/" + _objectkey;
						var _angebotdetails = new sap.m.StandardListItem().addStyleClass("zPolySqueezedArticle");
						_angebotdetails.setWrapping(true);

						_angebotdetails.bindElement({
							path: _angebotPath,
							model: "Offers"
						});

						//IMPORTANT NEVER FORGET THE MODEL NAME IN THE MAPPING !!!!
						_angebotdetails.bindProperty("description", "Offers>ZzExtOfrId");
						_angebotdetails.bindProperty("title", "Offers>OfrName");

						// 28.07.2021 iconhover instead of pic

						//<poly:IconHover src="{ parts: [ {path: 'Startdat' }, { path: 'Enddat' } , { path: 'Duration' } ], formatter: '.formatter.getAngebotStatus'}"
						//color="{ parts: [ {path: 'Startdat' }, { path: 'Enddat' } , { path: 'Duration' }], formatter: '.formatter.getAngebotColor'}" size="2.5em"
						//hover="onAngebotSelectIconHover" class="zPolyIconHover"></poly:IconHover>

						//				_angebotdetails.setIcon("/sap/opu/odata/sap/ZR_MEDIAEXPORT_SRV/AngebotSet(AngebotNr='" + oContext.getObject().Matnr +
						//					"')/$value");

						oItemTemplate.addCell(_angebotdetails);

						oItemTemplate.addCell(new Text({
							text: "Art"
						}));
						oItemTemplate.addCell(new Text({
							text: "Zusa"
						}));
						oItemTemplate.addCell(new Text({
							text: oContext.getObject().WtId
						}));
						oItemTemplate.addCell(new Text({
							text: oContext.getObject().AnzWt
						}));

					}

					// this is ARTIKEL 

					if (oContext.getObject().ArtikelFlag) {
						/*
										var _artikeldetails = new sap.m.ObjectIdentifier({
											title: '{ZSRSDATAFEED>matnr}',
											text: '{ZSRSDATAFEED>maktx}'
										});*/

						var _artikeldetails = new sap.m.StandardListItem({
							title: "{ZSRSDATAFEED>matnr}",
							description: "{ZSRSDATAFEED>maktx}"
						}).addStyleClass("zPolySqueezedArticle");

						// I did not manage to get this one solved... expand does not understand that this is media not data
						//_artikeldetails.setIcon("/sap/opu/odata/sap/ZR_MEDIAEXPORT_SRV/HauptBildSet(Artnr='" + oContext.getObject().Matnr +
						//	"',Format='web240x310')/$value");

						var _articlekey = this.getModel("ZSRSDATAFEED").createKey("/ArtikelSet", {
							matnr: _objectid
						});

						_artikeldetails.bindElement({
							path: _articlekey,
							model: "ZSRSDATAFEED"
						});

						oItemTemplate.addCell(_artikeldetails);

						oItemTemplate.addCell(new Text({
							text: "Art"
						}));
						oItemTemplate.addCell(new Text({
							text: "Zusa"
						}));
						oItemTemplate.addCell(new Text({
							text: oContext.getObject().WtId
						}));
						oItemTemplate.addCell(new Text({
							text: oContext.getObject().AnzWt
						}));
					}

					return oItemTemplate;

				}.bind(this)
			});

		},

		renderer: function (oRm, oControl) {
			oRm.renderControl(oControl.getAggregation("_panel"));
		}

	});

});