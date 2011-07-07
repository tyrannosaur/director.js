/* 
Create and bind Director behaviours.

Syntax:
   $$.behavior(function name, [ options ], [ eval=false ]);

   where 'function name' is one of the following (usually corresponding to 
   a Director function in the global namespace):
   
      description : A description returned from getBehaviorDescription()
      properties  : An object of properties of the format
                    var_name : {"comment" : [comment description], "format" : [string, sprite, etc.], "default" : [default value]}
            
      mouseup     : Callback for when mouseDown is triggered
      mousedown   : Callback for when mouseUp is triggered      
      
   and 'eval' is whether the returned function is placed in the current global namespace

For example:   

   $$.behavior({
        'description' : 'Responds to mouse clicks',        
        'mouseup'     : function(script) {            
            _player.alert(script.userName + ' clicked the mouse');
         })
      .param('userName', {
         comment : 'The username', 
         defaultValue : 'No user'
       });
      .global();
*/

function Behavior() {
   selected = new DeferredSet();
   description = null;
   params = {};
}

Beahvior.prototype = Object.create(dTools

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

Behavior.prototype.eventHandlers = [   
   "getBehaviorDescription",
   "getPropertyDescriptionList",
   "mouseUp",
   "mouseDown",
   "prepareMovie",
   "prepareFrame",
   "beginSprite",
   "startMovie",
   "stepFrame",
   "enterFrame",
   "exitFrame",
   "endSprite",
   "stopMovie"
]

Behavior.prototype.add = function(name) {      
   this.deferred.push(name, args);
}

Behavior.prototype.param = function() {   

   var addParam = function(key, val) {
      var defaults = {
         comment : 'No comment provided',
         defaultValue : null,
         format : 'string'
      }
      
      
   }

   // Key/value pairs
   if (arguments.length == 1) {
      if (typeof arguments[0] == 'object')
         $$.map(arguments[0], addParam);
      else
         throw new TypeError();
   }
   // Param name and options
   else if (arguments.length == 2) {
      addParam(
   }
   else {
      throw new TypeError();
   }   
}

/* Creates and evals functions in the current script
   environment.
   */
Behavior.prototype.bind = function() {   
   $$.forEach(this.deferred, function(key, val) {
      eval(
   });   
}