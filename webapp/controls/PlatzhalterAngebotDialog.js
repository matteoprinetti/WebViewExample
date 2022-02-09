sap.ui.define([
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/ButtonType",
	'sap/m/Text',
	'sap/m/Label',
	'sap/m/Input',
	'sap/m/DatePicker',
	'sap/ui/layout/form/SimpleForm',
	"sap/m/VBox",
	"sap/m/MessageBox"
], function (Dialog, Button, ButtonType, Text, Label, Input, DatePicker, SimpleForm, VBox, MessageBox) {
	"use strict";
	return Dialog.extend("zpoly.zpolyplanung.controls.PlatzhalterAngebotDialog", {

		metadata: {
			events: {
				"confirm": {
					parameters: {
						Bezeichnung: {
							type: "String"
						},
						BisWoche: {
							type: "String"
						}
					}
				},
				"cancel": {}
			},
			aggregations: {
				inputBez: {
					type: "sap.m.Input",
					multiple: false,
					visibility: "hidden"
				},
				inputBiswoche: {
					type: "sap.m.DatePicker",
					multiple: false,
					visibility: "hidden"
				}
			},

		},

		init: function () {
			sap.m.Dialog.prototype.init.apply(this, arguments);

			this.setTitle("Neuer Platzhalter");
			this.setContentWidth("550px");
			this.setContentHeight("300px");
			var _beginButton = new Button({
				type: ButtonType.Emphasized,
				text: "Anlegen",
				press: function (oEvent) {
					if (this.inputBez.getValue() === "")
						return MessageBox.error("Bezeichnung fehlt");
					if (this.inputBiswoche.getValue() === "")
						return MessageBox.error("Gültig bis fehlt");

					this.fireEvent("confirm", {
						Bezeichnung: this.inputBez.getValue(),
						BisWoche: this.inputBiswoche.getValue().substr(0, 2) + "." + this.inputBiswoche.getValue().substr(2, 4)
					});
				}.bind(this)
			});
			var _endButton = new Button({
				text: "Schliessen",
				press: function (oEvent) {
					this.fireCancel(oEvent);
				}.bind(this)
			});
			this.setBeginButton(_beginButton);
			this.setEndButton(_endButton);

			var form = new SimpleForm();
			this.inputBez = new Input({
				id: "idNewPhBez"
			});
			form.addContent(new Label({
				text: "Bezeichnung"
			}));
			form.addContent(this.inputBez);
			form.addContent(new Label({
				text: "Gültig bis"
			}));

			//<DatePicker id="calenderAuswahlGrob" placeholder="{i18n>Kalenderwoche}" displayFormat="w.YYYY" valueFormat="wwYYYY" class="sapUiSmallMargin"
			//value="{local>/CalWeek}" editable="false" width="40%"/> 

			this.inputBiswoche = new DatePicker({
				id: "idNewPhBisWoche",
				placeholder: "{i18n>Kalenderwoche}",
				displayFormat: "w.YYYY",
				valueFormat: "wwYYYY",
				style: "sapUiSmallMargin"
			});

			form.addContent(this.inputBiswoche);

			var vbox = new VBox();
			vbox.addStyleClass("sapUiSmallMargin");
			vbox.addItem(form);
			this.addContent(vbox);
		},

		renderer: {}
	});
});