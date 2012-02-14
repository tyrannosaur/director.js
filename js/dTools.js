/* dTools - a Javascript wrapper for Adobe Director
   
   This library attempts to wrap some of the inconsistencies and common pitfalls
   of ECMAScript in Adobe Director. New functionality is also provided, such as
   timers and wrapping of network requests and file i/o.
   
   The only requirement is a JSON implementation. dTools includes the standard
   one available at:
   https://github.com/douglascrockford/JSON-js/blob/master/json2.js
        
   ---
   
   The MIT License (MIT)

   Copyright (c) 2011 Charlie Liban

   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal
   in the Software without restriction, including without limitation the rights
   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be included in
   all copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   THE SOFTWARE.
*/
(function() {

   if (!JSON) throw new Error('JSON.js must be included to use dTools');

   var here = this;

   // Native Director functions
   var nativeMember = member,
       nativeSprite = sprite.
       nativeSymbol = symbol,
       nativePropList = propList,
       nativeXtra = xtra;
   
   // Native Director event handler names
   var nativeHandlers = [   
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
   ];
   
   var dTools = function() {};
   dTools.VERSION = '0.1';

   /* An Event data structure. */
   function Event(type, data, dispatcher, target) {
      this.type = type;
      this.data = data || {};
      this.dispatcher = dispatcher;
      this.target = target;
   };

   /* Returns undefined if an array has 0 elements, the first element if it 
      has 1 element and the array otherwise.
   */
   function unpack(arr) {   
      if (arr.length == 0) return;
      else if (arr.length == 1) return arr[0];
      else return arr;   
   }

   /* Include an xtra or throw an error */
   function getXtra(name, caller) {
      var x = new nativeXtra(name);
      if (!x) throw new Error(
         name + ' xtra must be included' + (caller ? (' to use ' + caller) : ''));
      return x;
   };

   // Core functions.
   // This may look suspiciously Underscorish. I referenced Underscore for code style,
   // but otherwise there are only so many ways to write iterators that take in context.   
   
   /* Whether a value is valid */
   var valid = dTools.valid = function(obj) {
      return (obj !== null) && (obj !== undefined) && (obj !== false);
   };  
   
   /* Whether an object has a property */
   var has = dTools.has = function(obj, key) {
      return valid(obj) && obj.hasOwnProperty(key);
   };
   
   /* Iterates over an iterable, calling function on each item's key and value.
      If the function returns false, iteration is stopped.
   */
   var each = dTools.each = function(iter, func, context) {      
      if (iter === null) return;
      if (typeof iter === 'array') {      
            var len = iter.length >>> 0;
            for (var i = 0; i < len; i++) {
               if (has(iter, i) && func.call(context, i, iter[i]) === false) return;               
            }
      }
      else {
         for (var key in iter) {
            if (has(iter, key) && func.call(context, key, iter[key]) === false) return;                     
         }
      }
   };

   /* Iterates over an iterable, calling function on each item's key and value.
      Returns an array containing the results of each function call.
   */
   var map = dTools.map = function(iter, func, conext) {
      var results = [];
      if (iter === null) return results;
      each(iter, function(key, val) {
         results.push(func.call(context, key, val));
      });
      return results;
   }
   
   /* Produces a list of key/value pairs from an object.         
      
      { key1 : val1, key2 : val2, ... } 
      becomes 
      [key1, val1, key2, val2, ...]
      
      If an array is given, returns the array. All other values raise an exception.
   */
   var itemize = dTools.itemize = function(iter) {           
      if (typeof iter === 'object') {
         var results = [];
         each(iter, function(key, val) { results.push(key, val); });         
         return results;
      }
      else if (typeof iter === 'array') {
         return iter;
      }
      else {
         throw new TypeError();
      }
   };
   
   /* Shallow merge two iterables, mutating the first one. 
      Returns 'iter' with any value found in 'defaults' if that value
      is not already in 'iter'. 
   */
   var merge = dTools.merge = function(iter, defaults) {
      if (!iter) iter = {};
      each(defaults, function(key, val) {
         if (!has(iter, key)) iter[key] = val;
      });
      return iter;
   };   

   /* Returns a function to generate unique keys from a pool.
      Source: https://github.com/tyrannosaur/keypool
   
      Example:
         var pool = dTools.keyPool();
         pool.newKey();                   // returns 0, which is allocated immedately
         pool.newKey();                   // returns 1
         pool.delKey(0);                  // deletes 0
         pool.set('some value');          // assigns a value and returns its key                                    
         pool.get(0);                     // gets the value with key 0
   */
   var keyPool = dTools.keyPool = function() {
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

   // Keypool for the unique ids
   var uniqueKP = keyPool();

   /* Get a unique id, backed by a keyPool */
   var unique = dTools.unique = uniqueKP.get;   

   /* Create an RFC4122 version 4 (random) UUID.
      Source: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
   */
   var uuid4 = dTools.uuid4 = function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
         var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
         return v.toString(16);
      });
   }

   // Director-specific functionality.
   
   /* Converts the object to a proplist */
   dTools.propList = function(obj) {
      return nativePropList.apply(here, itemize(obj));
   };

   /* Returns members with the given names. */
   dTools.member = function() {
      var m = map(arguments, function(key, val) { 
         return nativeMember(val); 
      });
      var f = filter(m, function(key, val) {
         return val.type !== symbol('empty');
      });      
      return unpack(f);        
   }
      
   /* Selects sprites by name */
   dTools.sprite = function() {
      var m = map(arguments, function(key, val) { 
         return nativeSprite(val); 
      });
      var f = filter(m, function(key, val) {
         return val.type !== symbol('empty');
      });      
      return unpack(f);          
   }
   
   /* Selects the highlighted member of a radio group.
      Members of a radio group are given either as sprite numbers
      or member name strings.
   */
   dTools.radio = function() {
      var m = map(arguments, function(key, val) {
         if (typeof val == 'number') return nativeSprite(val);
         else if (typeof val == 'string') return nativeMember(val);
         else return val;
      });
      var f = filter(m, function(key, val) {
         return valid(val) && (val.type !== nativeSymbol('empty')) && e.hilight;
      });
      return unpack(f);
   }

   // A Behavior
   function Behavior(options, properties) {
      merge(options, {
         'description' : 'No description was given',
         'handlers' : {}
      });      
      
      if (valid(properties)) {
         var converted = [];
         each(properties, function(key, opts) {
            merge(opts, {
               'comment' : 'No comment was given',
               'default' : '',
               'format' : 'string'
            });
            
            converted.push(nativeSymbol(key), dTools.propList(opts));
         });
         properties = dTools.propList(converted);
      }
      else {
         properties = dTools.propList([]);
      }
      
      var handlers = {
         'getBehaviorDescription' : function() { 
            return options.description;
         },
         'getPropertyDescriptionList' : function() { return properties; }
      };
      
      this.addHandler = function(name, func) {
         if (typeof func === 'function') handlers[name] = func;
      };
      
      this.removeHandler = function(name) {
         delete handlers[name];
      };
      
      each(options.handlers, function(key, val) {
         this.addHandler(key, val);
      }, this);
      
      var bound = false;
      
      // Attach this globally to the current script. Can only be done once!
      this.bind = function(context) {
         if (bound) throw new Error('This Behavior has already been bound to a script');
         each(handlers, function(key, val) { 
            context[key] = val; 
         });
         bound = true;
      };
   }   
   
   /* Creates a new Behavior; behaviors are attached to non-script cast members
      and contain callback functions for Director events.
      
      Options are:
      'description'  a description displayed in the Behaviors info panel 
      'handlers'     an object whose keys are Director handler names and
                     values are functions for those handlers.

      Properties (configurable from the Behaviors panel) can also be provided
   */
   dTools.behavior = function(options, properties) {      
      return new Behavior(options, properties);
   };   

   // Active timers
   var timerPool = dTools.keyPool();

   /* Returns a timer that calls a function after the given duration has
      elapsed.
      
      Options are:
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
         if (timer.currentCount > timer.count) timer.stop();
      }, options.duration);
   };

   // Network I/O
   dTools.net = {};

   /* Retrieves the contents of the given URL.

      Options are:
      'method'     : The HTTP method, one of 'post' or 'get'. Defaults to 'get'
      'data'       : Any post data.
      'dataType'   : The type of data expected in the response. Defaults to 'json'
                     'json' - A JSON object is constructed from the body and passed to 
                              the 'complete' handler
                     'text' - The body text is passed to the 'complete' handler as plain text
      'complete'   : Callback for when the request has completed      
      'error'      : Callback if there was an error with the request
   */
   dTools.net.open = function(uri, options) {
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
                  options.complete.call(
                     here, 
                     new Event('net.open', netTextResult(netID)));
               if (netError(netID) != 'OK' && typeof options.error === 'function')
                  options.error.call(
                     here, 
                     new Event('net.open', {'error' : netError(netID)}));
               event.dispatcher.stop();
            }
          }
      });      
   };   

   // File I/O
   dTools.file = {};
   
   /* A File object, which can be written to and read from as best as
      is possible in Director.
   */
   function File(path, xtra) {
      this.read = function() {
         return xtra.readChar();
      }
      
      this.readLines = function() {
         this.setPosition(0);
         return xtra.readFile().split(/[\r\n]/);
      }
      
      this.readLine = function() {
         return xtra.readLine();
      }
   
      this.write = function(str) {
         xtra.writeString(str);
      }
      
      this.close = function() {
         xtra.closeFile();
      }
      
      this.length = function() {
         return xtra.getLength();
      }
      
      this.getPosition = function() {
         return xtra.getPosition();
      }
      
      this.setPosition = function(pos) {
         return xtra.setPosition(pos);
      }
   };
     
   /* See if a file exists */
   dTools.file.exists = function(path) {
      var xtra = getXtra('fileio', 'dTools.file.exists');
      var exists;      
      
      xtra.openFile(path, 0)
      exists = xtra.status() == 0;      
      xtra.closeFile();
      return exists;      
   };
   
   /* Open a path with the given mode and return an object that
      can be written to and read from.
      
      Modes are 'w' for write, 'r' for read and 'a' for append (to the end).
      Suffing '+' to the mode allows reading and writing at the same time.         
   */
   dTools.file.open = function(path, mode) {   
      var xtra = getXtra('fileio', 'dTools.file.open');      
      var mode = /^\s*([rwa])(\+){0,1}\s*$/i.exec(mode);
      if (!mode) throw new Error(
         'valid modes for dTools.file.open are r, w, a, r+, w+ and a+');
      
      var type = mode[1],
          rw = Boolean(mode[2]);
      
      function open() {          
         if (rw) xtra.openFile(path, 0);         
         else if (type == 'r') xtra.openFile(path, 1);
         else xtra.openFile(path, 2);         
      }
   
      open();
      var status = xtra.status();
      // Create the file if it doesn't exist
      if (type != 'r' && status == -37) {
         xtra.createFile(path);
         open();
      }      
      else if (status == 0) {
      }
      else {
         throw new Error(path + ' ' + xtra.error(xtra.status()));
      }
      
      if (type == 'a')
         xtra.setPosition(xtra.getLength());               
   
      return new File(path, xtra);
   }
   
   // Assign to the global object
   this.dTools = dTools;
   
}).call(this);