Datenmodell Struktur
==============================================

zpp_flaechen: für jede Locco gibt es eine Anzahl von  Flächen: 

	Key: ZPP_FLAECHEN-FLAECHE_ID
	Entity: Flaechen und FlaechenSet
	
	
Für jede Fläche kann es mehrere Stellplätze geben, die werden von der Planung hinzugefügt: ZPP_FLAECH_STPL

	Key: FLAECHE_ID die Fläche aus zpp_flaechen
	     ZUORD_KEY  den Stellplatz innherhalb der Fläche  => Unique ID
	     
	Entity: Stellplatz
	     
Innerhalb einen Stellplatz, für eine gegebene Woche kann es Warenträger mit angebote oder artikel

	Kopf: ZPP_FP_STP_HEAD
	Line-Items: PP_FP_STP_ITEM
	
    Key: ZUORD_KEY den Stellplatz, wo die Woche ist. 
         WOCHE		die Woche
         WTTYP_ID   Warenträger typ 
         
    Entity: PlanungsItemHead
         
Die Einzelzeilen ZPP_FP_STP_ITEM hat noch die Details (OFR_ID, ARTIKEL usw)
	     
	Entity: PlanungsItem


