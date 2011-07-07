/* Add this in case it doesn't exist */
if (!Array.prototype.filter)
{
  Array.prototype.filter = function(fun /*, thisp */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t)
      {
        var val = t[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, t))
          res.push(val);
      }
    }

    return res;
  };
}

(function() {   

   function Event(type, data, dispatcher, target) {
      this.type = type;
      this.data = data || {};
      this.dispatcher = dispatcher;
      this.target = target;
   };

   /* A deferred set */   
   function DeferredSet() {
      var currentItems = [];
      var mutators = [];
            
      // TODO: Proxy this
      this.items = currentItems;
      
      /* Select the ith item from the current items */
      this.select = function(i) {
         mutators.push(function() {
            currentItems = currentItems[i];
         });
      };
      
      /* Call the mutator function with the current items */
      this.mutate = function(func) {
         if (typeof func !== 'function')
            throw new TypeError();
            
         mutators.push(function() { 
               func.apply(top, arguments.slice(1));
         });
      };
      
      /* Evaluate all mutators. */
      this.eval = function() {
         // Simply evaluate all the mutators. The results will be available in items()
         if (arguments.length == 0) {
//            dTools.forEach(mutators, 
         }
         // Otherwise call the given function and pass in the mutated items
         else if (arguments.length == 1 && typeof arguments[0] === 'function') {
//            arguments[0].call(
         }
         else {
            throw new TypeError();
         }
      }      
   }
   
   /* Top-level scope */
   var top = this;

   /* Previous $d binding */   
   var _$d = top['$d'];

   var dTools = function() {
      this.selected = new DeferredSet();
   }
   
   dTools.version = '1.0';

   /* Selectors */

   /* Get or set attributes.
      If attributes are set, then the current dTools object is returned.
      Getting attributes returns the value of the attribute on the first
      item in the selection.
      */
   dTools.prototype.attr = function() {
      // TODO
   };

   /* Select a subset of the items in the selection. */
   dTools.prototype.select = function() {
      // TODO
   };
   
   /* Get the first item in the selection. */
   dTools.prototype.first = function() {
     return this.selected.select(0);
   };

   /* Get the last item in the selection. */
   dTools.prototype.last = function() {
     return this.selected.select(-1);
   };
   
   /* Get the nth item in the selection. */
   dTools.prototype.nth = function(n) {
     return this.selected.select(n);
   };   
   
   /* Attach an event listener and callback to all items in the selection
      that are sprites. Director only supports custom events on sprites.
      
      For Director behaviours, use dTools.behavior
   */
   dTools.prototype.bind = function(options) {
      // TODO
   };
   
   dTools.prototype.unbind = function(options) {
      // TODO
   }
   
   /* Mutators */
   
   /* Applies the given function 'func' for each item in the selection. 
   Returns the current dTools object.
   */
   dTools.prototype.forEach = function(func) {
      this.selected.mutate(dTools.forEach, this.selected.items, func);
      return this;
   };
   
   /* Map each item in the selection with the given function 'func'. 
   Returns the array of results.
   */
   dTools.prototype.map = function(func) {
      return this.selected.mutate(dTools.map, this.selected.items, func);
   };
   
   /* Function programming functions */
         
   /* We all know what map does.
   */
   dTools.map = function(iter, func) {   
      var ret = [];
      
      if (typeof func !== 'function')
         throw new TypeError();
         
      if (typeof iter === 'array') {
         // Ensure termination
         var len = iter.length >>> 0;
         for (var i = 0; i < len; i++) {
            if (i in iter)
               ret.push(func.call(top, i, iter[key]));
         }
      }
      else {
         for (var key in iter) {
            if (key in iter)
               ret.push(func.call(top, key, iter[key]));
         }
      }
      return ret;
   };

   /* Calls each function 'func' for each key, value pair in iterable 'iter'. 
      Returns the iterable.
   */
   dTools.forEach = function(iter, func) {
      if (typeof func !== 'function')
         throw new TypeError();
         
      if (typeof iter === 'array') {
         // Ensure termination
         var len = iter.length >>> 0;
         for (var i = 0; i < len; i++) {
            if (i in iter)
               func.call(null, i, iter[key]);
         }
      }
      else {
         for (var key in iter) {
            if (key in iter)
               func.call(null, key, iter[key]);
         }
      }   
      return iter;
   };

   /* Applies the function 'func' to each key and value in the iterable 'iter'.
      If any function returns true, 'any' returns true. Otherwise false.
   */
   dTools.any = function(iter, func) {   
      return dTools.map(iter, func).some(function(e, i, a) { return e; });   
   };

   /* Applies the function 'func' to each key and value in the iterable 'iter'.
      If all functions return true, 'all' returns true. Otherwise false.
   */
   dTools.all = function(iter, func) {
      return dTools.map(iter, func).every(function(e, i, a) { return e; });
   };

   /* Produces a list of key/value pairs from an object.
      
      For instance:
         { key1 : val1, key2 : val2, ... }
      becomes
         [key1, val1, key2, val2, ...]
         
      If an array is given, returns the array. All other values
      raise an exception.
   */
   dTools.itemize = function(iter) {           
      if (typeof iter === 'object') {
         var results = [];
         for (var key in iter) {
            if (key in iter)
               results.push(key, iter[key]);               
         }      
         return results;
      }
      else if (typeof iter === 'array') {
         return iter;
      }
      else {
         throw new TypeError();
      }
   };
   
   /* Zips two or more arrays. If the arrays are not the same length, 'undefined'
      is inserted.
   */
   dTools.zip = function() {      
   };
   
   /* Generate a range of numbers. Just like xrange in Python (returns an iterator) */
   dTools.range = function(start, end, step) {     
   };
   
   /* Enumerate an iterable */
   dTools.enumerate = function(iter) {
   };
   
   /* Memoize the function, returning a cached (memoized) result given
      the same function and parameters.        
   */
   dTools.memoize = function(func) {
      var memo = {};            
      return function() {
         var hash = dTools.map(arguments, function(key, val) { return val.toString(); });
         if (hash in memo)
            return memo[hash];
         return memo[hash] = func.apply(this, arguments);
      };
   };
   
   /* Runs the function n times, after which the last
      result is always returned.
   */
   dTools.limit = function(func, n) {
      var run = 0;
      var memo;      
      return function() {
         if (run > n)
            return memo;
         run += 1;
         return memo = func.apply(this, arguments);
      };
   };
   
   /* Runs the function once, after which the same value
      is returned.
   */
   dTools.once = function(func) {
      return dTools.limit(func, 1);
   };
   
   /* Shallow merge two objects. Returns 'obj' with any value found in
      defaults if that value is not already in 'obj'. 
   */
   dTools.merge = function(obj, defaults) {
      if (typeof defaults !== 'object' || typeof obj !== 'object')
         throw new TypeError();

      dTools.forEach(defaults, function(key, val) {
         if (!obj.hasOwnProperty(key))
            obj[key] = val;
      });
      return obj;
   };

   /* Deep merge two objects 'defaults' and 'obj' iteratively by copying a value
      in 'defaults' to 'obj' if it does not exist in 'obj'. Returns 'obj'.
      
      Only objects, arrays, numbers and literals are copied by value. Everything
      else is copied by reference.
      
      There is no cycle detection, so pass in simple objects only.      
   */
   dTools.deepMerge = function(obj, defaults) {
      if (typeof defaults !== 'object' || typeof obj !== 'object')
         throw new TypeError();
       
      var stack = [];
      var def_cur = defaults;
      var obj_cur = obj;
  
      // Breadth-first search
      while (stack.length > 0) {
         for (var key in cur) {
            var val = cur[key];
            if (typeof val === 'object' || typeof val == 'array') {
               if (!(key in obj_cur))
                  stack.push(key);
            }
            else {
               if (!(key in obj_cur))
                  obj_cur[key] = val;
            }
         }
      }
   };
       
   /* Returns a function to generate unique keys from a pool.
      Example:
         var pool = dTools.keyPool();
         pool.get();                      // returns 0
         pool.get();                      // returns 1
         pool.del(0);                     // deletes 0
         pool.add('some value');          // returns 0, since it has been freed and
                                          // also adds 
         pool[0];                         
   */
   dTools.keyPool = function() {
      var data = {};
      var free = [[0, Infinity]];       /* Contains ranges of free ids */      
      
      var is_taken = function(i, key) {
         return (i == 0) ? key < free[i][0] 
                         : key > free[i-1][1] && key < free[i][0];
      };       
      
      var merge_and_add = function(i, key) {
        free.splice(i, 0, [key, key]);
        if (i < free.length - 1 && free[i+1][0] === free[i][1] + 1) {
            free[i+1][0] = free[i][0];
            free.splice(i, 1);
        }
        if (i > 0 && free[i-1][1] === free[i][0] - 1) {
            free[i-1][1] = free[i][1]
            free.splice(i, 1);
        }
        delete data[key];
      };

      var newKey = function() {
         var ret = free[0][0];
         (free[0][0] === free[0][1]) ? free.splice(0, 1) : free[0][0] += 1;
         return ret;
      };

      return {
         'set' : function() {
            if (arguments.length == 1) {
               var key = newKey();
               data[key] = arguments[0];
               return key;
            }
            else if (arguments.length == 2) {
               data[arguments[0]] = arguments[1];
               return arguments[0];
            }
            else {
               throw new ValueError();
            }
         },
         'get' : function(key) {
            return data[parseInt(key)];
         },
         'newKey' : function() {
            return newKey();
         },    
         'delKey' : function(key) {
            key = parseInt(key);
            if (key < 0 || key > Infinity)
               throw new ValueError();

            var p = Math.floor(Math.random() * free.length);
            var d = 0;
            var max_d = Math.log(free.length) + 1;
              
            while (d <= max_d) {
               if (is_taken(p, key))      
                  return merge_and_add(p, key);
               else if (key < free[p][0]) 
                  p = Math.floor(p/2);            
               else if (key > free[p][1])
                  p += Math.floor((free.length - p)/2);            
               d += 1;
            }                  
         }
      }
   }

   /* Director-specific functions */

   /* Converts the object to a proplist */
   dTools.propList = function(obj) {
      return propList.apply(top, dTools.itemize(obj));
   };

   /* Selects members by name */
   dTools.member = function() {
      return dTools(
         dTools.map(arguments, function(key, val) {
            return member(val);
         }).filter(function(e, i, a) {
            return e.type !== symbol('empty');
         })
      );
   }
   
   /* Selects sprites by name */
   dTools.sprite = function() {
      return dTools(
         dTools.map(arguments, function(key, val) {
            return sprite(val);
         }).filter(function(e, i, a) {
            return e.type !== symbol('empty');
         })
      );   
   }
   
   /* Selects the highlighted member of a radio group.
      Members of a radio group are given either as sprite numbers
      or member name strings.
   */
   dTools.radio = function() {
      return dTools(
         dTools.map(arguments, function(key, val) {
            if (typeof val == 'number')
               return sprite(val);
            else if (typeof val == 'string')
               return member(val);
            else
               return val;
         })
         .filter(function(e, i, a) {
            return (e !== undefined) && (e !== null) &&
                   (e.type !== symbol('empty')) && e.hilight;
         })
      );
   }

   /* Active timers */
   var timerPool = dTools.keyPool();

   /* Returns a timer that calls a function after the given duration has
      elapsed.
      
      'duration'     : A duration in seconds.
      'count'        : The number of times to repeated call the timer function.
                       If 0, undefined or null is given, the timer will run forever.
      'callback'     : A callback that is called after the duration has elapsed.
   */
   dTools.timer = function(options) {              
      if (typeof options.callback !== 'function')
         throw new ValueError();         
  
      if (typeof options.duration !== 'number')
         throw new ValueError();

      options = dTools.merge(options, {
         count : Infinity
      });   

      options.count = !options.count ? Infinity : options.count;

      function Timer(key) {
        this.currentCount = 0;
        this.duration = options.duration;
        this.count = options.count;
        
        this.stop = function() {
          var timer = timerPool.get(key);
          if (timer)
            timer.forget();
          timerPool.delKey(key);
        };
      }

      var timeoutWrapper = function(callback, duration) {
         var key = timerPool.newKey().toString();
         var timer = new Timer(key);  
         return timerPool.set(key, new timeout(key, duration * 1000, 'callback', {
            callback: function() { callback.call(top, timer); }
         }));
         return timer;
      };
      
      timeoutWrapper(function(timer) {
         timer.currentCount += 1;
         options.callback.apply(top, [new Event('timer', {}, timer)]);

         if (timer.currentCount > timer.count)
            timer.stop();
      }, options.duration);
   };

   /* Binds callbacks to a network request. 

      'uri'        : The URI to load

      'method'     : The HTTP method, one of 'post' or 'get'. Defaults to 'get'
      'data'       : Any post data.
      'dataType'   : The type of data expected in the response. Defaults to 'json'
                     'json' - A JSON object is constructed from the body and passed to the 'complete' handler
                     'text' - The body text is passed to the 'complete' handler as plain text
      'complete'   : Callback for when the request has completed      
      'error'      : Callback if there was an error with the request
   */
   dTools.net = function(uri, options) {
      if (typeof options !== 'object')
         throw new ValueError();

      options = dTools.merge(options, {      
         method : 'get',
         dataType : 'json',
         data : {}
      });

      var netID;
      if (options.method == 'get')      
         netID = getNetText(uri, dTools.propList(options.data));
      else if (options.method == 'post')
         netID = postNetText(uri, dTools.propList(options.data));
      else
         throw new ValueError();  
   
      dTools.timer({
         'duration' : 0.1,
         'callback' : function(event) {
            if (netDone(netID) == 1) {
               if (typeof options.complete === 'function')
                  options.complete.call(top, new Event('net', netTextResult(netID)));
               if (netError(netID) != 'OK' && typeof options.error === 'function')
                  options.error.call(top, new Event('net', {'error' : netError(netID)}));
               event.dispatcher.stop();
            }
          }
      });      
   };

   /* Like Underscore's noConflict. Returns the dTools
      object and restores $d to its original value.
   */   
   dTools.noConflict = function() {    
      $d = _$d;
      return dTools;
   };

   /* Alias $d as a global, much like jQuery's $ */       
   top['dTools'] = top['$d'] = dTools;
})();   
