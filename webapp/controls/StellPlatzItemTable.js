sap.ui.define([
	"sap/m/Table",
	"sap/uxap/ObjectPageHeaderContent",
	"sap/ui/layout/VerticalLayout",
	"sap/m/ObjectStatus"
], function (Table, ObjectPageHeaderContent, VerticalLayout, ObjectStatus) {
	"use strict";
	return Table.extend("zpoly.zpolyplanung.controls.StellPlatzItemTable", {

		// Tabelle für die Stellplatz Items rechts

		_vbox1: null,

		metadata: {
			properties: {
				container: {
					type: "sap.m.FlexBox"
				},
				headerData: {
					type: "object"
				},
				customBinding: {
					type: "object"
				},
				key: {
					type: "string"
				},
				week: {
					type: "string"
				}
			}
		},
		init: function () {

			this._vbox1 = new ObjectPageHeaderContent();

			// Header part (on top of table)

			var vert1 = new VerticalLayout();
			vert1.addContent(new ObjectStatus({
				title: "Stellplatz"
			}));
			vert1.addContent(new ObjectStatus({
				title: "Anzahl"
			}));
			this._vbox1.addContent(vert1);

			var vert2 = new VerticalLayout();
			vert2.addContent(new ObjectStatus({
				title: "WT"
			}));
			vert2.addContent(new ObjectStatus({
				title: "Belegung"
			}));
			this._vbox1.addContent(vert2);

			// Columns 

			this.addColumn(new sap.m.Column({
				width: "35%",
				header: new sap.m.Text({
					text: "Angebot"
				})
			}));
			this.addColumn(new sap.m.Column({
				header: new sap.m.Text({
					text: "Status"
				})
			}));
			this.addColumn(new sap.m.Column({
				header: new sap.m.Text({
					text: "Angebotsart"
				})
			}));

			this.addColumn(new sap.m.Column({
				header: new sap.m.Text({
					text: "Planungsart"
				})
			}));
			this.addColumn(new sap.m.Column({
				header: new sap.m.Text({
					text: "WT"
				})
			}));
			this.addColumn(new sap.m.Column({
				header: new sap.m.Text({
					text: "H"
				})
			}));
			this.addColumn(new sap.m.Column({
				header: new sap.m.Text({
					text: "G"
				})
			}));

			this.addStyleClass("zpolytableblack");

			// drag  

			this.addDragDropConfig(new sap.ui.core.dnd.DropInfo({
				drop: this.onDragDrop.bind(this)
			}));

			this.addDragDropConfig(new sap.ui.core.dnd.DragInfo({
				sourceAggregation: "items"
			}));
		},

		setContainer: function (oContainer) {
			if (!oContainer) return;

			oContainer.addItem(this._vbox1);

			this.setProperty("container", oContainer);
		},

		setHeaderData: function (oData) {

			if (!oData) return;

			this._vbox1.getContent()[0].getContent()[0].setText(oData.Name);
			this._vbox1.getContent()[0].getContent()[1].setText(oData.Anzahl);

			this._vbox1.getContent()[1].getContent()[0].setText(oData.WtName);
			this._vbox1.getContent()[1].getContent()[1].setText("20%");

			this.setProperty("headerData", oData);
		},

		setCustomBinding: function (oCustom) {
			if (!oCustom) return;

			this.setProperty("key", oCustom.Key);
			this.setProperty("week", oCustom.Week);

			var _filters = [];
			_filters.push(new sap.ui.model.Filter("StellplatzId",
				sap.ui.model.FilterOperator.EQ, oCustom.Key));

			_filters.push(new sap.ui.model.Filter("Woche",
				sap.ui.model.FilterOperator.EQ, oCustom.Week));

			this.bindItems({
				path: "/PlanungItemSet",
				filters: _filters,
				factory: this.tableDetailFactory.bind(this)
			});

		},

		onDragDrop: function (oEvent) {

			// in case of dragging: if the row with that key, week and offer does not exist in /PlanungItemSet, 
			// create it. 

			// 1.12.2020 for some reason sometime draggedControl is empty ...

			if (!oEvent.getParameters().draggedControl) return;

			var _path = oEvent.getParameters().draggedControl.getBindingContextPath();
			var _angebot_or_article_key = "";
			var _von = null;
			var _bis = null;
			var _matnr = "";
			var _article_flag = "";

			if (_path.indexOf("/OfrHeadSet") >= 0) { // we just dropped an Angebot
				_angebot_or_article_key = this.getModel("Offers").getProperty(_path).OfferGuid;
				_von = this.getModel("Offers").getProperty(_path).Startdat;
				_bis = this.getModel("Offers").getProperty(_path).Enddat;
			}

			if (_path.indexOf("/ArtikelsucheSet") >= 0) { // we just dropped an Artikel
				_angebot_or_article_key = this.getModel("ZSRSDATAFEED").getProperty(_path).matnr;
				_matnr = this.getModel("ZSRSDATAFEED").getProperty(_path).matnr;
				_article_flag = "X";

			}

			if (_angebot_or_article_key === "") return; // we dropped something but we cannot handle it (for example itself)

			// check if this key exist PlanungItemSet(StellplatzId=guid'525400d5-610f-1edb-84bf-25f3fcc806c7',Woche='432020',Angebot='OFFER1')
			// this.getModel().createKey("PlanungItemSet", { StellplatzId: "123", Woche: "012020", Angebot: "123"})

			var _objectkey = {
				StellplatzId: this.getKey(),
				Woche: this.getWeek(),
				ArtikelFlag: _article_flag === 'X' ? true : false,
				Angebot: _angebot_or_article_key,
				Matnr: _matnr
			};

			// a CREATE need to be issued in any case. 
			// because this could be a virtual or excluded entry, that needs to be made permanent

			// create and also save the from..to date of angebot

			var _object;
			if (_article_flag !== 'X')
				_object = Object.assign(_objectkey, {
					Von: _von,
					Bis: _bis
				});
			else
				_object = _objectkey;

			this.getModel().create("/PlanungItemSet", _object);

		},

		renderer: {},

		//================================================
		// Utility functions 
		//===============================================

		tableDetailFactory: function (sId, oContext) {

			var oItemTemplate = new sap.m.ColumnListItem({
				type: "Inactive"
			});

			// take care of the fact that this could be an artikel. 

			// get hold of Angebot details from Offers model
			// ACTUALL it should READ or better bind the element to OfrHeadSet ! 

			var _objectid = oContext.getObject().Angebot;

			if (oContext.getObject().ArtikelFlag === false) {
				var _objectkey = this.getModel("Offers").createKey("OfrHeadSet", {
					OfferGuid: _objectid
				});

				var _object = this.getModel("Offers").getProperty("/" + _objectkey);

				// This is an OFFER 

				if (_object) {

					// Offer ID 

					/*				oItemTemplate.addCell(new sap.m.ObjectIdentifier({
						title: _object.ZzExtOfrId,
						text: _object.OfrName
					}));
*/
					var _angebotdetails = new sap.m.StandardListItem({
						title: _object.ZzExtOfrId,
						description: _object.OfrName
					}).addStyleClass("zPolySqueezedArticle");

					// I did not manage to get this one solved... expand does not understand that this is media not data
					_angebotdetails.setIcon("/sap/opu/odata/sap/ZR_MEDIAEXPORT_SRV/AngebotSet(AngebotNr='" + _object.ZzExtOfrId +
						"')/$value");

					oItemTemplate.addCell(_angebotdetails);
					// Status
					oItemTemplate.addCell(new sap.ui.core.Icon({
						src: "sap-icon://restart"
					}).addStyleClass("zPolyLargeIcon"));

					// Angebotsart 

					oItemTemplate.addCell(new sap.m.ObjectIdentifier({
						title: _object.PromoType,
						text: _object.PromoTypeTxt.substring(0, 10)
					}));

					// Planungsart 

					oItemTemplate.addCell(new sap.m.Label({
						text: _object.ZzPlaartTxt
					}));

					oItemTemplate.addCell(new sap.m.Input({
						width: "5%",
						value: oContext.getObject().AnzWt,
						change: this.onWTChange
					}));
					oItemTemplate.addCell(new sap.m.Input({
						width: "5%",
						value: oContext.getObject().Hoehe,
						change: this.onHChange
					}));
					oItemTemplate.addCell(new sap.m.Label({
						text: "10"
					}));
					/*	oItemTemplate.addCell(new sap.ui.core.Icon({
							src: "sap-icon://accept"
						}));*/
				}
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
				_artikeldetails.setIcon("/sap/opu/odata/sap/ZR_MEDIAEXPORT_SRV/HauptBildSet(Artnr='" + oContext.getObject().Matnr +
					"',Format='web240x310')/$value");

				var _articlekey = this.getModel("ZSRSDATAFEED").createKey("/ArtikelSet", {
					matnr: _objectid
				});

				_artikeldetails.bindElement({
					path: _articlekey,
					model: "ZSRSDATAFEED"
				});

				oItemTemplate.addCell(_artikeldetails);

				// 2 empty columns ..

				oItemTemplate.addCell(new sap.m.Label({
					width: "5%"
				}));
				oItemTemplate.addCell(new sap.m.Label({
					width: "5%"
				}));
				oItemTemplate.addCell(new sap.m.Label({
					width: "5%"
				}));
				// the input data for detail

				oItemTemplate.addCell(new sap.m.Input({
					width: "5%",
					value: oContext.getObject().AnzWt,
					change: this.onWTChange
				}));
				oItemTemplate.addCell(new sap.m.Input({
					width: "5%",
					value: oContext.getObject().Hoehe,
					change: this.onHChange
				}));
				oItemTemplate.addCell(new sap.m.Label({
					text: "10"
				}));
			}

			return oItemTemplate;
		},

		onWTChange: function (oEvent) {
			var _path = this.getBindingContext().getPath();
			var data = {};
			data["AnzWt"] = parseInt(oEvent.getParameters().value, 10);
			this.getModel().update(_path, data, {});

		},
		onHChange: function (oEvent) {
			var _path = this.getBindingContext().getPath();
			this.getModel().update(_path, {
				Hoehe: parseInt(oEvent.getParameters().value, 10)
			}, {});
		}
	});

});