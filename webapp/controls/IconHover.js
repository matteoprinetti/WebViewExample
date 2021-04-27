sap.ui.define([
	"sap/ui/core/Icon"
], function (Icon) {
	"use strict";
	return Icon.extend("zpoly.zpolyplanung.controls.IconHover", {
			metadata: {
                events: {
                    "hover" : {}  
                }
            },

//          the hover event handler, it is called when the Button is hovered - no event registration required
            onmouseover : function(evt) {   
                this.fireHover({state: true, path: this.getBindingContext().getPath()});
            },

            onmouseout : function(evt) {   
                this.fireHover({state: false});
            },

//          add nothing, just inherit the ButtonRenderer as is
            renderer: {}            
        });  
});