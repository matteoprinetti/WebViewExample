// Export to Excel

sap.ui.define([
	"/sap/ui/base/Object",
	"/sap/ui/export/library",
	"zpoly/zpolyplanung/artifacts/Globals",
	'sap/ui/export/Spreadsheet',
	'sap/m/MessageToast',
], function (Object, exportLibrary, Globals, SpreadSheet, MessageToast) {

	var _class = Object.extend("zpoly.zpolyplanung.artifacts.ExcelExporter", {
		constructor: function () {
		 
		},

		// returns the date in 1 week time  as a dd.mm.yyyy String
		export: function (oModel,oCalWeek) {
			var _filters = [];
			_filters.push(new sap.ui.model.Filter("Locco",
				sap.ui.model.FilterOperator.EQ, Globals.getLocco()));

			_filters.push(new sap.ui.model.Filter("Woche",
				sap.ui.model.FilterOperator.EQ, oCalWeek));

			oModel.read("/FlatViewSet", {
				filters: _filters,
				success: function (oData, oResponse) {
					var aCols, aProducts, oSettings, oSheet;

					aCols = this.createExcelColumnConfig();
					aProducts = oData.results;

					oSettings = {
						workbook: {
							columns: aCols
						},
						dataSource: aProducts
					};

					oSheet = new SpreadSheet(oSettings);
					oSheet.build()
						.then(function () {
							MessageToast.show('Spreadsheet export has finished');
						})
						.finally(oSheet.destroy);
				}.bind(this)
			});
		},

		createExcelColumnConfig: function () {
			var EdmType = exportLibrary.EdmType;
			return [{
				label: 'Locco',
				property: 'Locco',
				type: EdmType.String
			}, {
				label: 'Woche',
				property: 'Woche',
				type: EdmType.String
			}, {
				label: 'Fläche',
				property: 'Name',
				type: EdmType.String
			}, {
				label: 'Flächentyp',
				property: 'Type',
				type: EdmType.String
			}, {
				label: 'Sortimentsbereich',
				property: 'Sortber',
				type: EdmType.String
			}, {
				label: 'Stellplatz',
				property: 'StellPlatzName',
				type: EdmType.String
			}, {
				label: 'Warenträger',
				property: 'WtName',
				type: EdmType.String
			}, {
				label: 'Anzahl WT',
				property: 'AnzWtItem',
				type: EdmType.String
			}, {
				label: 'Angebotsname',
				property: 'AngebotsName',
				width: '40',
				type: EdmType.String
			}, {
				label: 'Artikel',
				property: 'Artikel',
				width: '15',
				type: EdmType.String
			}, {
				label: 'Artikelbeschreibung',
				property: 'Beschreibung',
				width: '40',
				type: EdmType.String
			}, {
				label: 'Zusatz',
				property: 'ZusatzArtikel',
				type: EdmType.String
			}];
		}
	});
	return new _class();
}); // true so that Globals is visible globally in the browser.