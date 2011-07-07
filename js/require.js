/* Alerts the user if a required plugin isn't present. Add required libraries as string arguments. 
   For example: require('dTools.myplugin.js');
*/
(function require() {   
      var a = function(r) { if (r.length > 0) _player.alert("Put "+r.join()+" in your cast as a movie-level script(s)")};
      try {a((!$) ? ["dTools.core.js"] : arguments.filter(function(v,i,a){return !dTools.plugin[v];}));}catch(e){a(["dTools.core.js"]);}
});
