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
	"sap/m/ListType",
	"sap/m/ObjectHeader",
	"sap/m/ObjectAttribute",
	"sap/m/VBox"
], function (Control, Panel, OverflowToolbar, Button, Table, StellPlatzItemTableDetail,
	AngebotDetailDialog, ColumnListItem, MessageBox, Text, ListType, ObjectHeader, ObjectAttribute, VBox) {
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
				},
				view: {
					type: "any"
				}
			},
			aggregations: {
				_panel: {
					type: "sap.m.Panel",
					multiple: false
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
					text: "Warenträgertyp"
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
				this.getView().addDependent(this._oDetailDialog);
				this._currentDetailObject = oEvent.getParameters().listItem.getBindingContext().getObject();

				if (this._currentDetailObject.AnzWt === 0) {
					MessageBox.error("Anzahl Warenträger im Stellplatz darf nicht 0 sein");
					return;
				}

				// 20.09.2021 do nothing if this is a matnr - they have no detail

				if (this._currentDetailObject.ArtikelFlag) return;

				//			this._oDetailDialog.setModel(this.getModel("Offers"), "Offers");
				//			this._oDetailDialog.setModel(this.getModel());
				this._oDetailDialog.setWoche(this._currentDetailObject.Woche);
				this._oDetailDialog.setStellplatzId(this._currentDetailObject.StellplatzId);
				this._oDetailDialog.setWtId(this._currentDetailObject.WtId);
				this._oDetailDialog.setAngebot(this._currentDetailObject);
				this._oDetailDialog.setParentControl(oEvent.getParameters().listItem);

				//this._oDetailDialog.bindAngebot(this._currentDetailObject);

				this._oDetailDialog.open();

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

					// ANGEBOTE
					if (oContext.getObject().ArtikelFlag === false && oContext.getObject().Angebot !== oContext.getObject().Matnr) {
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

						//create path to summary of details

						var _detailPath = this.getModel().createKey("/PlanungItemDetailSummarySet", {
							StellplatzId: oContext.getObject().StellplatzId,
							WtId: oContext.getObject().WtId,
							Woche: oContext.getObject().Woche,
							Angebot: oContext.getObject().Angebot
						});

						var _artikelBox = new VBox();
						_artikelBox.addItem(new Text().bindElement({
							path: _detailPath
						}).bindProperty("text", "Artikel1txt").addStyleClass("sapUiTinyMargin"));
						_artikelBox.addItem(new Text().bindElement({
							path: _detailPath
						}).bindProperty("text", "Artikel2txt").addStyleClass("sapUiTinyMargin"));

						oItemTemplate.addCell(_artikelBox);

						var _zusatzBox = new VBox();
						_zusatzBox.addItem(new Text().bindElement({
							path: _detailPath
						}).bindProperty("text", "Zusatz1txt").addStyleClass("sapUiTinyMargin"));
						_zusatzBox.addItem(new Text().bindElement({
							path: _detailPath
						}).bindProperty("text", "Zusatz2txt").addStyleClass("sapUiTinyMargin"));

						oItemTemplate.addCell(_zusatzBox);

						//Wtname

						var _objectHeadKey = this.getModel().createKey("/PlanungItemHeadSet", {
							StellplatzId: oContext.getObject().StellplatzId,
							WtId: oContext.getObject().WtId,
							Woche: oContext.getObject().Woche
						});

						oItemTemplate.addCell(new Text().bindElement({
							path: _objectHeadKey
						}).bindProperty("text", "WtName").addStyleClass("sapUiSmallMargin"));

						oItemTemplate.addCell(new Text({
							text: oContext.getObject().AnzWt
						}));

					};

					// PLATZHALTER
					if (oContext.getObject().ArtikelFlag === false && oContext.getObject().Angebot === oContext.getObject().Matnr) {
						var _phobjectkey = this.getModel().createKey("PlatzhalterAngebotSet", {
							PlatzhalterId: _objectid
						});

						//2.12.2020 this is the error: we cannot map to the offer in the model  ! we need to map to the 
						//oData entityset..

						var _phangebotPath = "/" + _phobjectkey;

						var _phangebotdetails = new sap.m.StandardListItem().addStyleClass("zPolySqueezedArticle");
						_phangebotdetails.setWrapping(true);

						_phangebotdetails.bindElement({
							path: _phangebotPath
						});

						//IMPORTANT NEVER FORGET THE MODEL NAME IN THE MAPPING !!!!
						_phangebotdetails.bindProperty("title", "Bezeichnung");

						// 28.07.2021 iconhover instead of pic

						//<poly:IconHover src="{ parts: [ {path: 'Startdat' }, { path: 'Enddat' } , { path: 'Duration' } ], formatter: '.formatter.getAngebotStatus'}"
						//color="{ parts: [ {path: 'Startdat' }, { path: 'Enddat' } , { path: 'Duration' }], formatter: '.formatter.getAngebotColor'}" size="2.5em"
						//hover="onAngebotSelectIconHover" class="zPolyIconHover"></poly:IconHover>

						//				_angebotdetails.setIcon("/sap/opu/odata/sap/ZR_MEDIAEXPORT_SRV/AngebotSet(AngebotNr='" + oContext.getObject().Matnr +
						//					"')/$value");

						oItemTemplate.addCell(_phangebotdetails);

						//create path to summary of details

						var _phdetailPath = this.getModel().createKey("/PlanungItemDetailSummarySet", {
							StellplatzId: oContext.getObject().StellplatzId,
							WtId: oContext.getObject().WtId,
							Woche: oContext.getObject().Woche,
							Angebot: oContext.getObject().Angebot
						});

						var _phartikelBox = new VBox();
						_phartikelBox.addItem(new Text().bindElement({
							path: _phdetailPath
						}).bindProperty("text", "Artikel1txt").addStyleClass("sapUiTinyMargin"));
						_phartikelBox.addItem(new Text().bindElement({
							path: _phdetailPath
						}).bindProperty("text", "Artikel2txt").addStyleClass("sapUiTinyMargin"));

						oItemTemplate.addCell(_phartikelBox);

						var _phzusatzBox = new VBox();
						_phzusatzBox.addItem(new Text().bindElement({
							path: _phdetailPath
						}).bindProperty("text", "Zusatz1txt").addStyleClass("sapUiTinyMargin"));
						_phzusatzBox.addItem(new Text().bindElement({
							path: _phdetailPath
						}).bindProperty("text", "Zusatz2txt").addStyleClass("sapUiTinyMargin"));

						oItemTemplate.addCell(_phzusatzBox);

						//Wtname

						var _phobjectHeadKey = this.getModel().createKey("/PlanungItemHeadSet", {
							StellplatzId: oContext.getObject().StellplatzId,
							WtId: oContext.getObject().WtId,
							Woche: oContext.getObject().Woche
						});

						oItemTemplate.addCell(new Text().bindElement({
							path: _phobjectHeadKey
						}).bindProperty("text", "WtName").addStyleClass("sapUiSmallMargin"));

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
							text: ""
						}));
						oItemTemplate.addCell(new Text({
							text: ""
						}));

						var _objectHeadKeyArticle = this.getModel().createKey("/PlanungItemHeadSet", {
							StellplatzId: oContext.getObject().StellplatzId,
							WtId: oContext.getObject().WtId,
							Woche: oContext.getObject().Woche
						});

						oItemTemplate.addCell(new Text().bindElement({
							path: _objectHeadKeyArticle
						}).bindProperty("text", "WtName").addStyleClass("sapUiSmallMargin"));

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