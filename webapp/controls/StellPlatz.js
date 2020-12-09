sap.ui.define([
	"sap/ui/core/Control",
	"sap/m/Panel",
	"sap/m/OverflowToolbar",
	"sap/m/Button",
	"sap/m/List",
		"zpoly/zpolyplanung/controls/StellPlatzItemTable",
], function (Control, Panel, OverflowToolbar, Button, List, StellPlatzItemTable) {
	"use strict";
	return Control.extend("zpoly.zpolyplanung.controls.StellPlatz", {

		metadata: {
			properties: {
				key: {
					type: "string"
				},
				week: {
					type: "string"
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
			//	<OverflowToolbar>
			//		<Title text="{Name}"/>
			//		<ToolbarSpacer/>
			//		<Button id="IdStellPlatzAdd" icon="sap-icon://add" visible="false"/>
			//		<Button id="IdStellPlatzDel" icon="sap-icon://delete" visible="false"/>
			//	</OverflowToolbar>

			// Overflowtoolbar Logik.

			this.setAggregation("_panel", new Panel({
				expanded: false,
				expandable: true
			}));
			
			var _btnAdd =  new Button({
				icon: "sap-icon://add",
				visible: false
			});
			
			var _btnDel = new Button({
				icon: "sap-icon://delete",
				visible: false,
				press: function() {
					var _thelist = this.getParent().getParent().getContent()[0];
					if(_thelist.getMode()=== sap.m.ListMode.Delete)
					  _thelist.setMode(sap.m.ListMode.None)
					  else
					  _thelist.setMode(sap.m.ListMode.Delete);
				}
			});

			var _list = new List();
			
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

				factory: function (sId,oContext) {
					var _item = new sap.m.CustomListItem();
					_item.addContent(
						new StellPlatzItemTable({
							StellplatzId: oContext.getObject().StellplatzId,
							WtId: oContext.getObject().WtId,
							Woche: oContext.getObject().Woche
						})
					);
					return _item;
				}
			});

		},
	 

		renderer: function (oRm, oControl) {
			oRm.renderControl(oControl.getAggregation("_panel"));
		}

	});

});