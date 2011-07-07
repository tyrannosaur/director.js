/* 
Helpers for creating Javascript behaviours.

Syntax:
   $.behavior(function name, [ options ], [ eval=false ]);

   where 'function name' is one of the following (usually corresponding to 
   a Director function in the global namespace):
   
      description : A description returned from getBehaviorDescription()
      properties  : An object of properties of the format
                    var_name : {"comment" : [comment description], "format" : [string, sprite, etc.], "default" : [default value]}
            
      mouseup     : Callback for when mouseDown is triggered
      mousedown   : Callback for when mouseUp is triggered      
      
   and 'eval' is whether the returned function is placed in the current global namespace

For example:   

   // Equivalent
   getBehaviorDescription     = $.behavior('description', 'Annoys the user with a popup');
   getBehaviorDescription     = $.behavior({'description' : 'Annoys the user with a popup'}).func('description');
   $.behavior({'description' : 'Annoys the user with a popup'}).func('description').global();
*/

var $.behavior = function() {   
   if (arguments.length == 1 && typeof arguments[0] == "object") {
      
   }
   else if (arguments.length == 2 && typeof arguments[0] == "string" && arguments[1] != undefined) {
   }
   else {
   }
   
   var Behavior = function() {
      this._funcs = {};
      this._last_return = {'func' : undefined, 'params' : undefined};
   }
   
   Behavior._return = function(val) {
      this._last_return.func = val;
      return val;
   }
   
   Behavior.func = function(name){
      return this._return(this._funcs[name]);
   }
   
   // Evaluates the function
   Behavior.global = function() {
      eval(
   }
   
   var choices = {
      'description' : '',
      'properties' : function() {
         var props = propList();
         for (var key in options) {
            var val = options[key];
            var comment = (val["comment"] == undefined) ? throw Exception("Comment must be given for property list") : val["comment"];
            var def = (val["default"] == undefined) ? "" : val["default"];
            var format = (val["format"] == undefined) ? "string" : val["format"];
            
            props.addProp(symbol("spriteList"), propList(symbol("comment"), comment, symbol("format"), symbol(format), symbol("default"), def));
         }
      }
   }
   
   var behavior = function() {
   }   
   behavior.getFunction = function(name) { 
      
      return this;
   }
}



function getBehaviorDescription() {
  return "Save a radio group selection to the cache.";
}

function getPropertyDescriptionList() {
  var props = propList();

  props.addProp(symbol("spriteList"), 
    propList(symbol("comment"), "Sprite numbers of the radio group (separate with commas. Use \\ to escape a comma).", symbol("format"), symbol("string"), symbol("default"), ""));

  props.addProp(symbol("spriteValues"), 
    propList(symbol("comment"), "Value to be written for each sprite (separate with commas. Use \\ to escape a comma).", symbol("format"), symbol("string"), symbol("default"), ""));

  props.addProp(symbol("defaultValue"), 
    propList(symbol("comment"), "Default value", symbol("format"), symbol("sprite"), symbol("default"), null));

  props.addProp(symbol("radioKeyName"), 
    propList(symbol("comment"), "Radio group key name.", symbol("format"), symbol("string"), symbol("default"), "field_radio_group"));

  props.addProp(symbol("keyName"), 
    propList(symbol("comment"), "Key name for the cache.", symbol("format"), symbol("string"), symbol("default"), "default_cache"));

  return props;
}
