sap.ui.define([
	"./BaseController",
	"../model/formatter",
		"zpoly/zpolyplanung/artifacts/Globals"
], function (BaseController, Formatter,Globals) {
	"use strict";

	return BaseController.extend("zpoly.zpolyplanung.controller.Detail", {
		formatter: Formatter,
		onInit: function () {
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			var bus = this.getOwnerComponent().getEventBus();
			//bus.subscribe("zpolyplanung", "hidedetail", this.onHideDetail, this);

			// Template for boss nr display. The issue here is that the boss name is in another model
			// and I could not work out if it is possible to do this in XML.
		},

		bossitemFactory: function (sId, oContext) {
			var oControl = new sap.m.ColumnListItem({});
			oControl.addCell(new sap.m.Text({
				text: "{Bossnr}"
			}));
			var oName = new sap.m.Text();

			oName.bindElement({
				path: "/BossSet('" + oContext.getProperty('Bossnr') + "')",
				model: "ZSRSDATAFEED"
			});
			oName.bindProperty("text", "ZSRSDATAFEED>Name");
			oControl.addCell(oName);

			return oControl;
		},

		_onObjectMatched: function (oEvent) {

			// if locco is not set yet, do not bind,
			// this happens because the framework binding is not dynamic

			if (Globals.getLocco() === null) {
				return;
			}

			// reset eventual delete state of tables

			this.getView().byId("idBossTable").setMode("None");
			this.getView().byId("idSPTable").setMode("None");
			// set a sorter on idSPTable

			var oSorter = new sap.ui.model.Sorter("Key", false, false, function (a, b) {

				// sort by Name, with a twist: if the Id is the actually new id, is the last one always.

				var oNamea = this.getModel().getProperty("/StellplatzSet(guid'" + a.toLowerCase() + "')").Name;
				var oNameb = this.getModel().getProperty("/StellplatzSet(guid'" + b.toLowerCase() + "')").Name;

				// if one of them is the last one, assign the "Fake" Name "ZZZZZZZZZZZZZZZZZZZZ".
				if (this.getOwnerComponent().last_new_stellplatz_id) {
					if (this.getOwnerComponent().last_new_stellplatz_id.toLowerCase() === a.toLowerCase()) oNamea = "zzzzzzzzzzzzzzzzzzzzzzzz";
					if (this.getOwnerComponent().last_new_stellplatz_id.toLowerCase() === b.toLowerCase()) oNameb = "zzzzzzzzzzzzzzzzzzzzzzzz";
				}

				return oNamea.localeCompare(oNameb);

			}.bind(this));

			this.getView().byId("idSPTable").getBinding("items").sort(oSorter);

			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("FlaechenSet", {
					Id: sObjectId
				});

				this.getView().bindElement({
					path: "/" + sObjectPath
				});

			}.bind(this));
 		},

		onRecordChanged: function (oEvent) {
			//this.getModel().update();
			var sPath = this.getView().getBindingContext().getPath();
			var sField = null;
			var sValue = null;
			if (oEvent.getParameters().id.indexOf("inpName") >= 0) {
				sField = "Name";
				sValue = oEvent.getParameters().value;
			}
			if (oEvent.getParameters().id.indexOf("inpTyp") >= 0) {
				sField = "Type";
				sValue = oEvent.getParameters().selectedItem.getKey();
			}
			if (oEvent.getParameters().id.indexOf("inpOrg") >= 0) {
				sField = "Org";
				sValue = oEvent.getParameters().selectedItem.getKey();
			}
			if (oEvent.getParameters().id.indexOf("inpSor") >= 0) {
				sField = "Sortber";
				sValue = oEvent.getParameters().selectedItem.getKey();
			}

			if (sField !== null) {
				var data = {};
				data[sField] = sValue;

				this.getView().getModel().update(sPath,
					data, {});
			}
		},

		onStellPlatzChanged: function (oEvent) {
			//this.getModel().update();
			var sPath = this.getView().getBindingContext().getPath();
			var sField = null;
			var sValue = null;
			if (oEvent.getParameters().id.indexOf("inpStellplatzName") >= 0) {
				sField = "Name";
				sValue = oEvent.getParameters().value;
			}
			if (oEvent.getParameters().id.indexOf("inpAnzahl") >= 0) {
				sField = "Anzahl";
				sValue = parseInt(oEvent.getParameters().value, 10);
			}
			if (oEvent.getParameters().id.indexOf("inpWT") >= 0) {
				sField = "WtId";
				sValue = oEvent.getParameters().selectedItem.getKey();
			}

			if (sField !== null) {
				var data = {};
				data[sField] = sValue;

				this.getView().getModel().update(oEvent.getSource().getBindingContext().getPath(),
					data, {});
			}
		 
		},
		onStellplatzDelete: function (oEvent) {
			this.getView().getModel().remove(oEvent.getParameters().listItem.getBindingContextPath(), {});
		},

		/*onBtnDelete: function (oEvent) {
			var bus = this.getOwnerComponent().getEventBus();
			var sPath = this.getView().getBindingContext().getPath();
			bus.publish("zpolyplanung", "delete", {
				path: sPath
			}); // broadcast the event

		},*/

		onBtnAddBossnr: function (oEvent) {
			var _bossSelect = this.getView().byId("bossSelect");
			_bossSelect.fireValueHelpRequest();
		},
		onBtnDelBossnr: function (oEvent) {

			if (this.getView().byId("idBossTable").getMode() !== "Delete") {
				// this.getView().byId("delmodebtn").setText("Löschmodus Ausschalten");
				this.getView().byId("idBossTable").setMode("Delete");
			} else this.getView().byId("idBossTable").setMode("None");
		},

		onBossnrDelete: function (oEvent) {
			this.getView().getModel().remove(oEvent.getParameters().listItem.getBindingContextPath(), {});

		},
		onBossSelect: function (oEvent) {
			// create a new boss record (but look that it does not exist already)
			if(oEvent.getParameters().key.length===0) return; // no choice
			
			var sPath = this.getView().getBindingContext().getPath();
			this.getModel().create("/BossSet", {
				"FlaecheId": this.getView().getModel().getProperty(sPath).Id,
				"Bossnr": oEvent.getParameters().key
			});
		},

		onBtnAddStellplatz: function (oEvent) {
			var sPath = this.getView().getBindingContext().getPath();

			this.getModel().create("/StellplatzSet", {
				"FlaecheId": this.getView().getModel().getProperty(sPath).Id
			}, {
				success: function (oData) {
					this.getOwnerComponent().last_new_stellplatz_id = oData.Key;
				}.bind(this)
			});
		},
		onBtnDelStellplatz: function (oEvent) {

			if (this.getView().byId("idSPTable").getMode() !== "Delete") {
				// this.getView().byId("delmodebtn").setText("Löschmodus Ausschalten");
				this.getView().byId("idSPTable").setMode("Delete");
			} else this.getView().byId("idSPTable").setMode("None");
		},

		onItemDelete: function (oEvent) {
			this.getView().getModel().remove(oEvent.getParameters().listItem.getBindingContextPath(), {});
		},

		onStellplatzItemSelected: function (oEvent) {
			var a = 1;
		},

		onHideDetail: function (channelId, eventId, parametersMap) {
			this.getView().byId("detailPage").setVisible(parametersMap.visible);
		},
		suggest:function(oEvent) {
			var a = 1;
		}
	});
});