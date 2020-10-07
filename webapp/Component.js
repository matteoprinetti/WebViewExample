sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"zpoly/zpolyplanung/model/models",
	"sap/ui/model/json/JSONModel"
], function (UIComponent, Device, models, JSONModel) {
	"use strict";

	return UIComponent.extend("zpoly.zpolyplanung.Component", {

		locco: null,
		last_new_flaeche_id: null, // the id of the Flaeche das als neu eingetragen worden ist.
		// das ist wegen der Sortierung der Masterliste: wenn eine neue Zeile hinzugefügt wird,
		// muss sie immer als Letzte erscheinen, damit sie nicht rumspringt beim Ändern vom Text
		// wenn eine andere Zeile hinzugefügt wird, oder nochmal gelesen, ist dann normal sortiert.
		last_new_stellplatz_id: null,

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// set the manifest for all components to see 

			this.setModel(new sap.ui.model.json.JSONModel(this.getManifestEntry("sap.app")), "manifest");

			// set the user info

			this.setModel(new sap.ui.model.json.JSONModel("/services/userapi/currentUser"), "user");

			// size limit of Suggestions and error Handler
			// (assuming a oData provider is set as default model)
			if (this.getModel() !== undefined) {
				this.getModel().setSizeLimit(2000);

				// attach standard error handler to standard model 

				this.getModel().attachRequestFailed(function (oEvent) {
					var errorDialog = new zism.zismlibrary.controls.ODataError({ // eslint-disable-line no-undef
						close: function () {}
					});
					errorDialog.show(oEvent.getParameter("response"));

				});
			}

			// model containing the choices for Selection type 

			// take care of language 

			var bundle = this.getModel("i18n").getResourceBundle();

			var oData = {

				"TypCollection": [{
					"Typ": "1",
					"Name": bundle.getText("typ1")
				}, {
					"Typ": "2",
					"Name": bundle.getText("typ2")
				}]
			};

			var oModel = new JSONModel(oData);
			this.setModel(oModel, "Typ");

			// model containing suggestions for possible names of fläche

			var namenCollection = [];
			for (var x = 0; x < 5; x++)
				namenCollection.push({
					"SuggestedName": bundle.getText("Suggestion" + (x+1))
				});

			var oData2 = {
				"NamenCollection": namenCollection
			};

			var oModel2 = new JSONModel(oData2);
			this.setModel(oModel2, "Namen");

		}
	});
});