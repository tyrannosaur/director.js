/* Writing to (or updating) the cache:
   
      $$.member('first_name', 'last_name', 'phone')    
        .cache('save', 'survey');
     
   Settings values from the cache
   
      $$.member('first_name', 'last_name', 'phone')
        .cache('restore', 'survey');
   
   Saving the cache to disk in JSON format
   
      $$.file('survey_results.json', 'w', {
            'write' : function() {
               return $$.cache('serialize', 'survey', {'format' : 'json'});
             }
          });
          
*/

$$.static.cache = function() {
   
}  

/* 
Perform operations on a file.

Syntax:
   $$.file( filename, mode, options );
   
   'mode' is one of 'w' (write) 'r' (read) 
   
   'options' is an object of key/value pairs:
      
   on_open      :  A function to be called once a fil
   on_created   :  A function to be called if a file is created 
   on_close     :   
   on_error     : 
   write       
   read

$$.static.file = function() {
   if (arguments.length == 2) {
      throw new TypeError();
   }
   else if ({
   
}        