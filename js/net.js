function(url, method) {  
   if (method == undefined)
      method = 'get';

   var methods = {
      get : function(url, vars) {
         return getNetText.call([url].concat(dTools.itemize(vars)));
      },
      post : function(url, vars) {
         return postNetText.call([url].concat(dTools.itemize(vars)));
      }
   }
    
   /* Create a new timer */
   var check = function() {
   }
  
}