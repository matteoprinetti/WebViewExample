sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Panel",
	"sap/m/OverflowToolbar",
	"sap/m/Button",
	"sap/m/List",
	"zpoly/zpolyplanung/controls/StellPlatzItemTable",
	"sap/m/ColumnListItem",
	"sap/m/MessageBox"
], function (Control, Panel, OverflowToolbar, Button, List, StellPlatzItemTable, ColumnListItem, MessageBox) {
	"use strict";
	return Control.extend("zpoly.zpolyplanung.controls.StellPlatz", {

		_oValueHelpDialog: null,
		_wtid: null,

		metadata: {
			properties: {
				key: {
					type: "string"
				},
				week: {
					type: "string"
				},
				PopOverControl: {
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

			// 12.04.2021 add a new PlanungItemHeadSet for this key and week 

			var _btnAdd = new Button({
				icon: "sap-icon://add",
				visible: false,
				press: function () {
					var _thelist = this.getAggregation("_panel").getContent()[0]; // to get the stellplatz

					var _newPlanungItemHeadSet = {};
					_newPlanungItemHeadSet.StellplatzId = _thelist._getBindingContext().getObject().Key;

					_newPlanungItemHeadSet.Woche = this.getWeek();

					this.onWtValueDialog(_newPlanungItemHeadSet);

				}.bind(this)
			});

			var _btnDel = new Button({
				icon: "sap-icon://delete",
				visible: false,
				press: function () {
					var _thelist = this.getParent().getParent().getContent()[0];
					if (_thelist.getMode() === sap.m.ListMode.Delete)
						_thelist.setMode(sap.m.ListMode.None);
					else
						_thelist.setMode(sap.m.ListMode.Delete);
				}
			});

			var _list = new List();

			_list.attachDelete(function (oEvent) {
				if (oEvent.getParameters().listItem.getContent()[0].getTable().getItems().length == 0) {
					var _path = oEvent.getParameters().listItem.getBindingContextPath();
					this.getModel().remove(_path);
				} else
					MessageBox.alert("Nur leere Warenträger können gelöscht werden");

			}.bind(this));

			var _overflowtoolbar = new sap.m.OverflowToolbar();
			var _text = new sap.m.Text();

			_text.bindProperty("text", "Name");

			_overflowtoolbar.addContent(_text);
			_overflowtoolbar.addContent(new sap.m.ToolbarSpacer());
			_overflowtoolbar.addContent(_btnAdd);
			_overflowtoolbar.addContent(_btnDel);

			this.getAggregation("_panel").setHeaderToolbar(_overflowtoolbar);

			this.getAggregation("_panel").attachExpand(function (oEvent) {
				var _enabled = oEvent.getParameters().expand;
				this.getHeaderToolbar().getContent()[2].setVisible(_enabled);
				this.getHeaderToolbar().getContent()[3].setVisible(_enabled);
			});

			// Create the list and bind it to PlanungItemHeadSet

			this.getAggregation("_panel").addContent(_list);

		},
			

		setWeek: function (oValue) {
			this.setProperty("week", oValue);

			this.bindInternal();

		},

		setKey: function (oValue) {
			this.setProperty("key", oValue);

			this.bindInternal();

		},

		setPopOverControl: function (oValue) {
			this.setProperty("PopOverControl", oValue);
		},

		bindInternal: function () {
			// if both week and Key are set, its time to bind.

			if (!(this.getWeek() && this.getKey()))
				return;

			this.getAggregation("_panel").getContent()[0].bindAggregation("items", {
				path: "/PlanungItemHeadSet",
				filters: [
					new sap.ui.model.Filter("Woche",
						sap.ui.model.FilterOperator.EQ, this.getWeek()),
					new sap.ui.model.Filter("StellplatzId",
						sap.ui.model.FilterOperator.EQ, this.getKey())
				],

				factory: function (sId, oContext) {
					var _item = new sap.m.CustomListItem();
					_item.addContent(
						new StellPlatzItemTable({
							StellplatzId: oContext.getObject().StellplatzId,
							WtId: oContext.getObject().WtId,
							Woche: oContext.getObject().Woche
						})
					);
					return _item;
				}.bind(this)
			});

		},

		onWtValueDialog: function (_newEntry) {
			if (!this._oValueHelpDialog) {
				this._oValueHelpDialog = new sap.m.Dialog({
					title: "Warenträgertyp wählen",
					content: new List({
						mode: "SingleSelect",
						selectionChange: function (oEvent) {
							this._oValueHelpDialog.getBeginButton().setEnabled(true);
							this._wtid = oEvent.getParameters().listItem.getProperty("title");

						}.bind(this),
						items: {
							path: "toFreieWarenTraeger",
							filters: [
								new sap.ui.model.Filter("Woche",
									sap.ui.model.FilterOperator.EQ, this.getWeek())
							],
							template: new sap.m.StandardListItem({
								title: "{WtId}",
								info: "{WtName}"

							})
						}
					}),
					beginButton: new Button({
						type: sap.m.ButtonType.Emphasized,
						text: "OK",
						enabled: false,
						press: function () {
							_newEntry.WtId = this._wtid; // should come from a popup list
							this.getModel().create('/PlanungItemHeadSet', _newEntry);
							this._oValueHelpDialog.close();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "Schliessen",
						press: function () {
							this._oValueHelpDialog.close();
						}.bind(this)
					})
				});

				this.getParent().addDependent(this._oValueHelpDialog);
			}

			//this._oValueHelpDialog.setTokens(this._oMultiInput.getTokens());
			this._oValueHelpDialog.getContent()[0].getBinding("items").refresh(true);
			this._oValueHelpDialog.open();
		},

		renderer: function (oRm, oControl) {
			oRm.renderControl(oControl.getAggregation("_panel"));
		}

	});

});