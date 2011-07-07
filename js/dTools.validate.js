/* Validates one or more text fields.
   Also provides behaviours.
   */

/* Requires dTools.js */
(function require() {   
      var a = function(r) { if (r.length > 0) _player.alert("Lib(s) "+r.join()+" required but could not found in your cast as a global script(s)")};
      try {a((!$) ? ["dTools.js"] : arguments.filter(function(v,i,a){return !$.lib[v];}));}catch(e){a(["dTools.js"]);}
});

// In the style of jQuery plugins
(function ($$) {

   
   

})(dTools);
