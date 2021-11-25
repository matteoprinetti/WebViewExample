sap.ui.define([], function () {
	"use strict";
	return {

		factory: function (sId, oContext) {

			var oItemTemplate = new sap.m.ColumnListItem({
				type: "Navigation",
				//	title: "{Name}",
				press: this.onSelectionChange.bind(this)
			});
			oItemTemplate.addCell(new sap.m.Text({
				text: "{Id}"
			}));
			oItemTemplate.addCell(new sap.m.Text({
				text: "{Name}"
			}));

			// Promo or Poly 

			if (oContext.getProperty('Type') === "1")
				oItemTemplate.addCell(new sap.m.Text({
					text: "Poly"
				}));
			else
				oItemTemplate.addCell(new sap.m.Text({
					text: "Promo"
				}));

			var sortberText = new sap.m.Text();

			// bind only if there is a valid Sortber (which is not the case for Promofläche)
			if (oContext.getProperty('Sortber') !== "") {
				sortberText.bindElement({
					path: "/SortimentSet('" + oContext.getProperty('Sortber') + "')"
				});
				sortberText.bindProperty("text", "Name");
			} else {

				if (oContext.getProperty('Org') !== "") {
					sortberText.bindElement({
						path: "/OrganisationSet('" + oContext.getProperty('Org') + "')"
					});
					sortberText.bindProperty("text", "Name");
				}
			}

			oItemTemplate.addCell(sortberText);

			// 25.11.2021 get the Belegung 
			
			var _belegung = new sap.m.Text({
				text: "{Belegung} %" // TODO this is calculated
			});
		
		  	var _belegungkey = "/FlaecheBelegungSet(Key=guid'" + 
				  oContext.getProperty("Id") + "',Woche='" +
				  this.getModel("local").getProperty("/CalWeek") + "')";
				  _belegung.bindElement({ path: _belegungkey }); 
			
			oItemTemplate.addCell(_belegung);

			return oItemTemplate;
		}
	};
});