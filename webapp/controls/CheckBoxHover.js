sap.ui.define([
	"sap/m/CheckBox"
], function (CheckBox) {
	"use strict";
	return CheckBox.extend("zpoly.zpolyplanung.controls.CheckBoxHover", {
			metadata: {
                events: {
                    "hover" : {}  
                }
            },

//          the hover event handler, it is called when the Button is hovered - no event registration required
            onmouseover : function(evt) {   
                this.fireHover({state: true});
            },

            onmouseout : function(evt) {   
                this.fireHover({state: false});
            },

//          add nothing, just inherit the ButtonRenderer as is
            renderer: {}            
        });  
});