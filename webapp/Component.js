sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"zpoly/zpolyplanung/model/models",
	"sap/ui/model/json/JSONModel",
	"zpoly/zpolyplanung/artifacts/Globals"
], function (UIComponent, Device, models, JSONModel, Globals) {
	"use strict";

	return UIComponent.extend("zpoly.zpolyplanung.Component", {

	 
		//last_new_flaeche_id: null, // the id of the Flaeche das als neu eingetragen worden ist.
		// das ist wegen der Sortierung der Masterliste: wenn eine neue Zeile hinzugefügt wird,
		// muss sie immer als Letzte erscheinen, damit sie nicht rumspringt beim Ändern vom Text
		// wenn eine andere Zeile hinzugefügt wird, oder nochmal gelesen, ist dann normal sortiert.
		last_new_stellplatz_id: null,
		_AngebotDetailPopover: null,

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

			// local model for data
			
			this.setModel(new sap.ui.model.json.JSONModel(), "local");
			
			// Datepicker

			this.getModel("local").setProperty("/CalWeek", Globals.getDayNextWeek());
			this.getModel("local").setProperty("/CalWeekAsDate", Globals.getDayNextWeekAsDate());
		 
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

		 

		}
	});
});