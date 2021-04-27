sap.ui.define([
	"sap/ui/core/Item"
], function (Item) {
	"use strict";
	return Item.extend("zpoly.zpolyplanung.controls.StatusSelectItem", {

		metadata: {
			properties: {
				color: {
					type: "string"
				}
			}
		},

		init: function () {
			// register onafterrendering 
			this._myDelegate = {
				"onAfterRendering": function () {
					var a = 1;
					var b = a + 1;
				}
			};
			this.addEventDelegate(this._myDelegate, this);
		},

		onExit: function () {
			// ...
			this.removeEventDelegate(this._myDelegate);
			this._myDelegate = null;
		},

		renderer: function (oRM, oControl) {
		 
		},
		
		setColor: function (_color) {
			var a = _color;
		}

	});
});