sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Table",
	"sap/m/VBox",
	"sap/m/FlexBox",
	"sap/uxap/ObjectPageHeaderContent",
	"sap/ui/layout/HorizontalLayout",
	"sap/m/ObjectStatus",
	"sap/m/Input",
	"sap/m/Label",
	"sap/ui/core/Icon",
	"zpoly/zpolyplanung/model/formatter",
	"zpoly/zpolyplanung/controls/IconHover",
	'sap/ui/core/Fragment',
	"sap/m/InputType"
], function (Control, Table, VBox, FlexBox, ObjectPageHeaderContent, HorizontalLayout, ObjectStatus, Input,
	Label, Icon, Formatter, IconHover, Fragment, InputType) {
	"use strict";
	return Control.extend("zpoly.zpolyplanung.controls.StellPlatzItemTable", {

		// Tabelle für die Stellplatz Items rechts
		_lastDraggedControl: null,
		_belegungIcon: null,
		_anzwtInput: null,

		metadata: {
			properties: {
				StellplatzId: {
					type: "string"
				},
				WtId: {
					type: "string"
				},
				Woche: {
					type: "string"
				},
				Anzahl: {
					type: "string"
				},
				Table: {
					type: "sap.m.Table" // ref to inner Table
				},
				AnzahlBelegt: {
					type: "int"
				}
			},
			aggregations: {

				_vbox: {
					type: "sap.m.VBox",
					multiple: false,
					visibility: "hidden"
				}
			}
		},

		init: function () {

			// a VBOX containg a ObjectPageHeaderContent and a Table

			this.setAggregation("_vbox", new VBox());
			this.setProperty("AnzahlBelegt", 0);

			var pageheader = new ObjectPageHeaderContent();

			// Header part (on top of table)

			var vert = new FlexBox();
			vert.setDirection("Row");
			vert.setAlignItems("Center");
			vert.setBackgroundDesign(sap.m.BackgroundDesign.Translucent);
			vert.addStyleClass("sapUiResponsiveMargin");

			vert.addItem(new ObjectStatus({
				title: "WT",
				text: "{WtId} {WtName} ",
				width: "40%"
			}).addStyleClass("sapUiLargeMarginEnd"));

			/*	vert.addContent(new ObjectStatus({
					title: "Anzahl"
				}).addStyleClass("sapUiLargeMarginEnd")); */

			vert.addItem(new Label({
				text: "Anzahl"
			}).addStyleClass("sapUiLargeMarginEnd"));

			this._anzwtInput = new Input({
				value: "{AnzWt}",
				width: "3em",
				type: InputType.Number,
				change: this.onWTAnzChange
					/*,
									liveChange: function (oEvent) {
											var _oInput = oEvent.getSource();
											var val = _oInput.getValue();
											val = val.replace(/[^\d]/g, '');
											_oInput.setValue(val);
										}*/
			});

			vert.addItem(this._anzwtInput.addStyleClass("sapUiTinyMarginEnd")).addEventDelegate({
				onfocusin: function (oEvent) {
					$("#" + oEvent.originalEvent.target.id).select();
				}
			});

			// new Icon.
			this._belegungIcon = new Icon( {
						src: "sap-icon://alert",
						color: sap.ui.core.IconColor.Critical,
						size: "2.5em",
						visible: false } ); 
						
			vert.addItem(this._belegungIcon.addStyleClass("sapUiLargeMarginEnd"));

			//vert.addItem(new ObjectStatus({
			//	title: "Belegung"
			//}).addStyleClass("sapUiLargeMarginEnd"));
			//pageheader.addContent(vert);

			// table 

			var _table = new Table();
			// Columns 

			_table.addColumn(new sap.m.Column({ // the mehrfach flag
				width: "5%",
				header: new sap.m.Text({
					text: ""
				})
			}));

			_table.addColumn(new sap.m.Column({ // the status icon
				width: "10%",
				header: new sap.m.Text({
					text: ""
				})
			}));
			_table.addColumn(new sap.m.Column({
				width: "45%",
				header: new sap.m.Text({
					text: "Angebot"
				})
			}));
			/*_table.addColumn(new sap.m.Column({
				header: new sap.m.Text({
					text: "Status"
				})
			}));*/
			_table.addColumn(new sap.m.Column({
				header: new sap.m.Text({
					text: "Angebotsart"
				})
			}));
			/*
			_table.addColumn(new sap.m.Column({
				header: new sap.m.Text({
					text: "Planungsart"
				})
			}));*/
			_table.addColumn(new sap.m.Column({
				header: new sap.m.Text({
					text: "WT"
				})
			}));
			/*	_table.addColumn(new sap.m.Column({
				header: new sap.m.Text({
					text: "H"
				})
			}));
			_table.addColumn(new sap.m.Column({
				header: new sap.m.Text({
					text: "G"
				})
			}));
*/
			_table.addStyleClass("zpolytableblack");

			// drag  

			_table.addDragDropConfig(new sap.ui.core.dnd.DropInfo({
				drop: this.onDragDrop.bind(this)
			}));

			_table.addDragDropConfig(new sap.ui.core.dnd.DragInfo({
				sourceAggregation: "items"
			}));

			this.getAggregation("_vbox").addItem(vert);
			this.getAggregation("_vbox").addItem(_table);

			// set ref to table
			this.setProperty("Table", this.getAggregation("_vbox").getItems()[1]);
		},

		setTable: function (oValue) {}, // prevent tampering with table

		setStellPlatzId: function (oValue) {
			this.setProperty("StellPlatzId", oValue);
			this.bindInternal();
		},
		setWtId: function (oValue) {
			this.setProperty("WtId", oValue);
			this.bindInternal();
		},
		setWoche: function (oValue) {
			this.setProperty("Woche", oValue);
			this.bindInternal();
		},

		/*
		bindItems: function (oBindingInfo) {
			this.getAggregation("_vbox").getContent()[1].bindAggregation("items", oBindingInfo);
		},*/

		bindInternal: function () {

			// when all 3 params are set, bind.

			if (!(this.getStellplatzId() && this.getWtId() && this.getWoche())) return;

			/*			this.getAggregation("_vbox").getContent()[1].setProperty("key", oCustom.Key);
						this.getAggregation("_vbox").getContent()[1].setProperty("week", oCustom.Week);
			*/
			var _filters = [];
			_filters.push(new sap.ui.model.Filter("StellplatzId",
				sap.ui.model.FilterOperator.EQ, this.getStellplatzId()));
			_filters.push(new sap.ui.model.Filter("WtId",
				sap.ui.model.FilterOperator.EQ, this.getWtId()));

			_filters.push(new sap.ui.model.Filter("Woche",
				sap.ui.model.FilterOperator.EQ, this.getWoche()));

			this.getTable().bindItems({
				path: "/PlanungItemSet",
				filters: _filters,
				factory: this.tableDetailFactory.bind(this)
			});

		},

		onDragDrop: function (oEvent) {

			// in case of dragging: if the row with that key, week and offer does not exist in /PlanungItemSet, 
			// create it. 

			// 1.12.2020 for some reason sometime draggedControl is empty ...

			if (!oEvent.getParameters().draggedControl) {
				return;
			}

			var _path = oEvent.getParameters().draggedControl.getBindingContextPath();
			this._lastDraggedControl = oEvent.getParameters().draggedControl;
			var _angebot_or_article_key = "";
			var _von = null;
			var _bis = null;
			var _matnr = "";
			var _article_flag = "";

			// 20.04.2021 we can drag drop between warenträger. In this case we have a delete 
			// followed by an Insert.

			if (_path.indexOf("/OfrHeadSet") >= 0) { // we just dropped an Angebot
				_angebot_or_article_key = this.getModel("Offers").getProperty(_path).OfferGuid;
				_matnr = this.getModel("Offers").getProperty(_path).ZzExtOfrId; // also used for ofr id
				_von = this.getModel("Offers").getProperty(_path).Startdat;
				_bis = this.getModel("Offers").getProperty(_path).Enddat;
			}

			if (_path.indexOf("/ArtikelsucheSet") >= 0) { // we just dropped an Artikel
				_angebot_or_article_key = this.getModel("ZSRSDATAFEED").getProperty(_path).matnr;
				_matnr = this.getModel("ZSRSDATAFEED").getProperty(_path).matnr;
				_article_flag = "X";

			}

			// warenträger to warenträger

			if (_path.indexOf("/PlanungItemSet") >= 0) { // we just dropped from another warenträger
				_angebot_or_article_key = this.getModel().getProperty(_path).Angebot;
				_article_flag = this.getModel().getProperty(_path).ArtikelFlag ? "X" : "";

				if (_article_flag)
					_matnr = this.getModel().getProperty(_path).Angebot; // also used for ofr id

				_von = this.getModel().getProperty(_path).Von;
				_bis = this.getModel().getProperty(_path).Bis;
			}

			if (_angebot_or_article_key === "") {
				return;
			} // we dropped something but we cannot handle it (for example itself)

			// create the record

			var _objectkey = {
				StellplatzId: this.getStellplatzId(),
				WtId: this.getWtId(),
				Woche: this.getWoche(),
				ArtikelFlag: _article_flag === "X" ? true : false,
				Angebot: _angebot_or_article_key,
				Matnr: _matnr
			};

			// create and also save the from..to date of angebot

			var _object;
			if (_article_flag !== "X") {
				_object = Object.assign(_objectkey, {
					Von: _von,
					Bis: _bis
				});
			} else {
				_object = _objectkey;
			}

			// between warentraeger delete then insert 
			if (_path.indexOf("/PlanungItemSet") >= 0) {

				// if the same key is there this is a insert / remove of the same item but so be it

				this.getModel().remove(_path, {
					refreshAfterChange: false,
					success: function () {
						this.getModel().create("/PlanungItemSet", _object, {
							success: function () {
								this._lastDraggedControl.setVisible(false);
							}.bind(this)
						});
					}.bind(this)
				});
			} else // or just insert
				this.getModel().create("/PlanungItemSet", _object, {
				success: function () {
					this._lastDraggedControl.setVisible(false);
				}.bind(this)
			});

		},

		refreshIconBelegt: function (_lastWt) {

			// find out offer/article wt anzahl
			var _wt_items = 0;

			for (var x in this.getTable().getItems()) {
				_wt_items += parseInt(this.getTable().getItems()[x].getCells()[4].getValue(),10);
			}

			if (_lastWt) _wt_items += parseInt(_lastWt,10);

			// now the icon
			if (parseInt(this._anzwtInput.getValue(),10) !== _wt_items) {
				this._belegungIcon.setVisible(true);
		
			}
			else
				this._belegungIcon.setVisible(false) ;
		},

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

			// 11.08.2021 also take care of the icon src in the parent

			// 12.08 the current WT is not in the table yet.
			this.refreshIconBelegt(oContext.getObject().AnzWt);

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

				// I did not manage to get this one solved... expand does not understand that this is media not data
				if (oContext.getObject().Mehrfach)
					oItemTemplate.addCell(new Icon({
						src: "sap-icon://warning",
						color: sap.ui.core.IconColor.Critical
					}));
				else
					oItemTemplate.addCell(new sap.m.Label({
						text: " "
					}));

				// 28.07.2021 iconhover instead of pic

				//<poly:IconHover src="{ parts: [ {path: 'Startdat' }, { path: 'Enddat' } , { path: 'Duration' } ], formatter: '.formatter.getAngebotStatus'}"
				//color="{ parts: [ {path: 'Startdat' }, { path: 'Enddat' } , { path: 'Duration' }], formatter: '.formatter.getAngebotColor'}" size="2.5em"
				//hover="onAngebotSelectIconHover" class="zPolyIconHover"></poly:IconHover>

				var _hover = new IconHover();
				//var _data = this.getModel("Offers").getProperty(_angebotPath);
				_hover.setSrc(Formatter.getAngebotStatus(oContext.getObject().Von, oContext.getObject().Bis, null, this.getWoche()));
				_hover.setColor(Formatter.getAngebotColor(oContext.getObject().Von, oContext.getObject().Bis, null, this.getWoche()));
				_hover.setSize("2.5em");
				_hover.addStyleClass("zPolyIconHover");

				_hover.attachHover(function (oEvent) {

					var _source = oEvent.getSource();
					var _params = oEvent.getParameters();

					this.getParent().getParent().getParent().getParent().getPopOverControl().then(function (oPopover) {

						if (_params.state) {
							var _angebot = this.getModel().getProperty(_params.path).Angebot;
							var _path = "/OfrHeadSet(guid'" + _angebot + "')";
							oPopover.bindElement({
								path: _path,
								model: "Offers"
							});
							oPopover.openBy(_source);
						} else
							oPopover.close();
					}.bind(this));

				}.bind(this));

				oItemTemplate.addCell(_hover);

				//				_angebotdetails.setIcon("/sap/opu/odata/sap/ZR_MEDIAEXPORT_SRV/AngebotSet(AngebotNr='" + oContext.getObject().Matnr +
				//					"')/$value");

				oItemTemplate.addCell(_angebotdetails);
				// Status
				/*oItemTemplate.addCell(new sap.ui.core.Icon({
					src: "sap-icon://restart"
				}).addStyleClass("zPolyLargeIcon"));*/

				// Angebotsart 

				var _promotype = new sap.m.ObjectIdentifier({
					//	title: _object.PromoType,
					//	text: _object.PromoTypeTxt.substring(0, 10)
				});

				_promotype.bindElement({
					path: _angebotPath,
					model: "Offers"
				});

				//IMPORTANT NEVER FORGET THE MODEL NAME IN THE MAPPING !!!!
				_promotype.bindProperty("title", "Offers>PromoType");
				_promotype.bindProperty("text", {
					path: "Offers>PromoTypeTxt",
					formatter: function (oValue) {
						return oValue === null ? "" : oValue.substring(0, 10);
					}
				});

				oItemTemplate.addCell(_promotype);

				// Planungsart 

				/*var planungsart = new sap.m.Label({
					//	text: _object.ZzPlaartTxt
				});

				planungsart.bindElement({
					path: _angebotPath,
					model: "Offers"
				});

				//IMPORTANT NEVER FORGET THE MODEL NAME IN THE MAPPING !!!!
				planungsart.bindProperty("text", "Offers>ZzPlaartTxt");

				oItemTemplate.addCell(planungsart);*/

				oItemTemplate.addCell(new sap.m.Input({
					width: "5%",
					value: oContext.getObject().AnzWt,
					change: this.onWTChange
						/*,
											liveChange: function (oEvent) {
												var _oInput = oEvent.getSource();
												var val = _oInput.getValue();
												val = val.replace(/[^\d]/g, '');
												_oInput.setValue(val);
											}*/
				}).addEventDelegate({
					onfocusin: function (oEvent) {
						$("#" + oEvent.originalEvent.target.id).select();
					}
				}));
				/*
				oItemTemplate.addCell(new sap.m.Input({
					width: "5%",
					value: oContext.getObject().Hoehe,
					change: this.onHChange
				}));
				oItemTemplate.addCell(new sap.m.Label({
					text: "10"
				}));*/
				/*	oItemTemplate.addCell(new sap.ui.core.Icon({
						src: "sap-icon://accept"
					}));*/

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

				if (oContext.getObject().Mehrfach)
					oItemTemplate.addCell(new Icon({
						src: "sap-icon://warning",
						color: sap.ui.core.IconColor.Critical
					}));
				else
					oItemTemplate.addCell(new sap.m.Label({
						text: " "
					}));

				oItemTemplate.addCell(_artikeldetails);

				// 2 empty columns ..

				/*oItemTemplate.addCell(new sap.m.Label({
					width: "5%"
				}));
				oItemTemplate.addCell(new sap.m.Label({
					width: "5%"
				}));*/
				oItemTemplate.addCell(new sap.m.Label({
					width: "5%"
				}));
				// the input data for detail

				oItemTemplate.addCell(new sap.m.Input({
					width: "5%",
					value: oContext.getObject().AnzWt,
					type: InputType.Number,
					change: this.onWTChange.bind(this)
						/*,
											liveChange: function (oEvent) {
												var _oInput = oEvent.getSource();
												var val = _oInput.getValue();
												val = val.replace(/[^\d]/g, '');
												_oInput.setValue(val);
											}*/
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
			data.AnzWt = parseInt(oEvent.getParameters().value, 10);
			if (!isNaN(data.AnzWt) && !isNaN(parseFloat(data.AnzWt))) {
				this.getModel().update(_path, data, {
					refreshAfterChange: false,
					success: function (oData) {
						this.addStyleClass("zPolyGreenBackground");
						this.getParent().getParent().getParent().getParent().refreshIconBelegt();
						//this.setValueState(sap.ui.core.ValueState.Information);//red
					}.bind(this)

				});
			} else sap.m.MessageToast.show("Bitte numerischen Wert eingeben !", {
				"duration": 3000
			});

		},

		onWTAnzChange: function (oEvent) {
			var _path = this.getBindingContext().getPath();
			var data = {};
			var _id = oEvent.getSource().getId();
			data.AnzWt = parseInt(oEvent.getParameters().value, 10);

			if (!isNaN(data.AnzWt) && !isNaN(parseFloat(data.AnzWt))) {

				this.getModel().update(_path, data, {
					refreshAfterChange: false,
					success: function (oData) {
						this.addStyleClass("zPolyGreenBackground");
						this.getParent().getParent().getParent().refreshIconBelegt();
						// focus on next input
						var inputs = $(':input');
						var index = $(':input').index($("#" + _id + "-inner")[0]);
						inputs.get(index + 1).focus();
						//this.setValueState(sap.ui.core.ValueState.Information);//red
					}.bind(this)

				});
				//oEvent.getSource().addStyleClass("zPolyGreenBorder");
			} else sap.m.MessageToast.show("Bitte numerischen Wert eingeben !", {
				"duration": 3000
			});

		},

		onHChange: function (oEvent) {
			var _path = this.getBindingContext().getPath();
			this.getModel().update(_path, {
				Hoehe: parseInt(oEvent.getParameters().value, 10)
			}, {});
		},
		renderer: function (oRm, oControl) {
			oRm.renderControl(oControl.getAggregation("_vbox"));
		}
	});

});