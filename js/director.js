 /* director.js - an ECMAScript wrapper for Adobe Director
   
   This library attempts to wrap the inconsistencies, missing documentation and common pitfalls
   of ECMAScript in Adobe Director. New functionality is also provided, such astimers, wrapping 
   of network requests and file I/O.
   
   director.js includes a minified version of the standard JSON parser and stringifier from
   https://github.com/douglascrockford/JSON-js/blob/master/json2.js

   ---
   
   The MIT License (MIT)

   Copyright (c) 2012 Charlie Liban

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

var MODIFY_PROTOTYPE = false;     // If true, add functions to built-in objects' prototypes. This may break iteration over objects.

/* An Event data structure. */
function Event(type, data, dispatcher, error) {
   this.type = type;
   this.data = data || {};
   this.dispatcher = dispatcher;   
   this.error = error;
};

var exports = {},
    here = this;

// Native Director functions
var nativeMember = member,
    nativeSprite = sprite,
    nativeSymbol = symbol,
    nativePropList = propList,
    nativeXtra = xtra,
    nativeFilter = filter;

exports.version = '1.1.0';

if (MODIFY_PROTOTYPE) {
   /* Trim a string of whitespace. */
   String.prototype.trim = function() {
      return String(this).replace(/^\s+|\s+$/g, '');
   };

   /* Reverse a string. */
   String.prototype.reverse = function() {
      return this.split('').reverse().join('');
   };  
}

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
   if (!x)
      throw new Error('director.getXtra: ' + name + ' xtra must be included' + (caller ? (' to use ' + caller) : ''));         
   return x;
};

/***
 Core functions. 
 ***/

/* Whether a value is valid */
exports.valid = function(obj) {
   return (obj !== null) && (obj !== undefined) && (obj !== false);
};  

/* Whether an object has a property */
exports.has = function(obj, key) {
   return exports.valid(obj) && obj.hasOwnProperty(key);
};

/* Iterates over an iterable, calling function on each item's key and value.
   If the function returns false, iteration is stopped.
*/
exports.each = function(iter, func, context) {      
   if (!iter) throw new TypeError('director.each: cannot iterate over ' + iter);
   
   if (iter.length == +iter.length) {      
         var len = iter.length >>> 0;
         for (var i = 0; i < len; i++) {
            if (exports.has(iter, i) && func.call(context, i, iter[i]) === false) return;               
         }
   }
   else {
      for (var key in iter) {
         if (exports.has(iter, key) && func.call(context, key, iter[key]) === false) return;                     
      }
   }
};

/* Iterates over an iterable, calling function on each item's key and value.
   Returns an array containing the results of each function call.
*/
exports.map = function(iter, func, context) {
   if (!iter) throw new TypeError('director.map: cannot map ' + iter);

   var results = [];  
   exports.each(iter, function(key, val) {
      results.push(func.call(context, key, val));
   });
   return results;
};

/* Filter over an iterable, returning a mutated shallow copy of the original.
   The test function does not need to return a strictly false result.
*/
exports.filter = function(iter, test, context) {
   if (!iter) throw new TypeError('director.filter: cannot itemize ' + iter);
   
   var results;
   if (iter.length == +iter.length) {
      results = [];
      exports.each(iter, function(i, val) {   
         if (test.call(context, i, val)) results.push(val);
      });           
   }
   else {
      results = {};
      exports.each(iter, function(key, val) {         
         if (test.call(context, key, val)) results[key] = val;
      });      
   }
   return results;
};

/* Produces a list of key/value pairs from an object.         
   
   { key1 : val1, key2 : val2, ... } 
   becomes 
   [key1, val1, key2, val2, ...]
   
   If an array is given, returns the array. All other values raise an exception.
*/
exports.itemize = function(iter) {   
   if (!iter) throw new TypeError('director.itemize: cannot itemize ' + iter);

   if (iter.length == +iter.length) {
      return iter;
   }
   else if (typeof iter == 'object') {
      var results = [];
      exports.each(iter, function(key, val) { results.push(key, val); });         
      return results;
   }
   else {
      throw new TypeError('director.itemize: cannot itemize ' + iter);      
   }
};

/* Shallow merge two iterables, mutating the first one. 
   Returns 'iter' with any value found in 'defaults' if that value
   is not already in 'iter'. 
*/
exports.merge = function(iter, defaults) {
   if (!iter) iter = {};
   exports.each(defaults, function(key, val) {
      if (!exports.has(iter, key)) iter[key] = val;
   });
   return iter;
};   

/* Returns a function to generate unique keys from a pool.
   Source: https://github.com/tyrannosaur/keypool

   Example:
      var pool = exports.keyPool();
      pool.newKey();                   // returns 0, which is allocated immedately
      pool.newKey();                   // returns 1
      pool.del(0);                  // deletes 0
      pool.set('some value');          // assigns a value and returns its key                                    
      pool.get(0);                     // gets the value with key 0
*/
exports.keyPool = function() {
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
      },
      'get' : function(key) {
         return data[parseInt(key)];
      },
      'newKey' : function() {
         return newKey();
      },    
      'del' : function(key) {
         var key = parseInt(key);
         if (key < 0 || key > Infinity || isNaN(key))
            return delete data[key]; 

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
var uniqueKP = exports.keyPool();

/* Get a unique id, backed by a keyPool */
exports.unique = uniqueKP.get;   

/* Create an RFC4122 version 4 (random) UUID.
   Source: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
*/
exports.uuid4 = function() {
   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
   });
}

/***
 Director-specific functionality.
 ***/   

/* Tries to determine the type of an object, including Director members and sprites */
exports.type = function type(obj) {
   if (obj == null || obj == undefined) return typeof obj;   
   if (+obj.spriteNum === obj.spriteNum) return 'sprite';
   else if (obj.member == obj) return 'member';
   else return typeof obj;
}

/* Converts the object to a proplist. 
   Arrays will be interpreted as a list of keys and values, like in Lisp.
   
      // propList('a', 1, 'b', 2);
      director.propList(['a', 1, 'b', 2]);
      
      // propList('a', 1, 'b', 2);
      director.propList({
         a : 1,
         b : 2
      });
*/
exports.propList = function(iter) {
   if (!exports.valid(iter)) throw new TypeError('director.propList: cannot convert ' + iter + ' to propList');
   
   var results = [];
   if (iter.length == +iter.length)
      results = iter;      
   else if (typeof iter == 'object')
      exports.each(iter, function(key, val) { results.push(nativeSymbol(key), val); });                        
   else
      throw new TypeError('director.propList: cannot convert ' + iter + ' to propList');
   return nativePropList.apply(here, results);
};

/* Returns members with the given names. */
exports.member = function() {
   var m = exports.map(arguments, function(key, val) { 
      return nativeMember(val); 
   });
   var f = exports.filter(m, function(key, val) {
      return exports.valid(val) && val.type !== symbol('empty');
   });      
   return unpack(f);        
}
   
/* Returns sprites with the given names.      
   
      // Sprite 'boat' does not exist
      var names = ['anchor', 'boat', 'coral'];
      
      // <(sprite 1)> <(sprite 2)>
      var sprites = director.sprite.apply(this, name);      
      
   If the sprite number does not exist, attempting to access
   a property on the resulting sprite object will result in
   an uncatchable error         
*/
exports.sprite = function() {
   var m = exports.map(arguments, function(key, val) { 
      return nativeSprite(val); 
   });
   var f = exports.filter(m, function(key, val) {
      return exports.valid(val) && val.type !== symbol('empty');
   });      
   return unpack(f);          
}

/* Returns the highlighted members of a radio group, given member names or numbers.   
*/
exports.radio = function() {
   var m = exports.map(arguments, function(key, val) {
      var type = exports.type(val);
      if (type == 'sprite' || type == 'member') return exports.isSelected(val);      
      else return val;
   });
   var f = exports.filter(m, function(key, val) {
      return exports.valid(val) && (val.type !== nativeSymbol('empty')) && val.hilite;
   });
   return unpack(f);
}

/* Whether a member or sprite is selected. 
   The 'hilite' property of a sprite (or member) is used to determine whether it is selected.
*/
exports.isSelected = function() {
   var m = exports.map(arguments, function(key, val) {
      var type = exports.type(val);
      try {
         if (type == 'sprite') return nativeSprite(val).member.hilite;
         else if (type == 'member') return nativeMember(val).hilite;
      }
      catch (e) {
         return null;
      }
      return null;
   });      
   return unpack(m);         
};   

// A Behavior
function Behavior(options) {
   exports.merge(options, {
      'description' : 'No description was given',
      'handlers' : {},
      'parameters' : {}
   });      
   
   var handlers = {
      'getBehaviorDescription' : function() { 
         return options.description;
      },
      'getPropertyDescriptionList' : function() { 
         return options.parameters; 
      }
   };
   
   this.addParameter = function(pOpts) {
      var name = pOpts.name;
      if (exports.valid(pOpts) && name) {
         delete pOpts.name;
         options.parameters[name] = pOpts;
      }
      return this;
   };
   
   this.removeParameter = function(name) {
      delete options.parameters[name];
      return this;
   };
   
   this.addHandler = function(name, func) {
      if (typeof func == 'function') handlers[name] = func;
      return this;
   };
   
   this.removeHandler = function(name) {
      delete handlers[name];
      return this;
   };
   
   // TODO: Adding parameters is not supported from the options yet      
   // Add handlers
   
   exports.each(options.handlers, function(key, val) {
      this.addHandler(key, val);
   }, this);
   
   var bound = false;
   
   // Attach this globally to the current script. Can only be done once!
   this.bind = function(context) {
      if (bound)
         throw new Error('Behavior.bind: this Behavior has already been bound to a script');
      
      // Add parameters
      if (exports.valid(options.parameters)) {
         var converted = {};
         exports.each(options.parameters, function(key, opts) {
            exports.merge(opts, {
               'comment' : 'No comment was given',
               'default' : '',
               'format' : 'string',
               'range' : null
            });
            
            if (opts.format == 'boolean' && opts['default'] == '') {
              opts['default'] = false;
            }
            
            opts.format = nativeSymbol(opts.format);
            
            if (opts.range != null) {
              if (opts.range.length == +opts.range.length) {
                 opts.range = nativeList(opts.range);   
              }
              else if (opts.range.hasOwnProperty('min') && opts.range.hasOwnProperty('max')) {
                 opts.range = nativePropList('min', opts.range.min, 'max', opts.range.max);
                 opts.format = 'integer';
              }
            }
            
            converted[key] = exports.propList(opts);
         });
         options.parameters = exports.propList(converted);
      }
      else {
         options.parameters = exports.propList([]);
      }
                        
      exports.each(handlers, function(key, val) { 
         context[key] = val; 
         val.name = key;
      });
      bound = true;
   };
}   

/* Creates a new Behavior; behaviors are attached to non-script cast members
   and contain callback functions for Director events.
   
   Options are:
   
      description :  a description displayed in the Behaviors info panel 
      handlers    :  an object whose keys are Director handler names and
                     values are functions for those handlers.
   
   Parameters are variables configurable from the Behaviors panel. Valid options
   for parameters are:
            
      comment : (optional) a string
      
      format  : (optional) a string, and one of the following valid formats:
                  integer, float, string, symbol, member, bitmap, filmloop, 
                  field, palette, picture, sound, button, shape, movie, 
                  digitalvideo, script, richtext, ole, transition, xtra, 
                  frame, marker, ink, boolean
                
                defaults to 'string'
                
      default : (optional) the default value of the parameter
                defaults to null
                
      range   : (optional) an array of values, which will be generated in a
                dropdown box. If an object is given (with the keys 'min'
                and 'max') a numeric slider is generated with the range of
                values specified.
   
   An example:
   
      var director = _global.director;
   
      // Check to see if director is available. Otherwise Director
      // is left in an unstable state.
      if (director) {      
         director.behavior({
            description : 'Trace mouse clicks'
         })
         .addHandler('mouseDown', function(context) {
            trace('Mouse pressed down');
         })
         .bind(this);
      }
*/
exports.behavior = function(options, properties) {      
   return new Behavior(options, properties);
};   

// Active timers
var timerPool = exports.keyPool();

/* Returns a timer that calls a function after the given duration has
   elapsed. This is similar to setTimeout in JavaScript and is called
   immediately after this function returns.
   
   Options are:
   'duration'     : A duration in seconds.
   'count'        : The number of times to repeatedly call the timer function.
                    If 0, undefined or null is given, the timer will run forever.
   'callback'     : A callback that is called after the duration has elapsed.
*/
exports.timer = function(options) {   
   exports.merge(options, {
      count : Infinity
   });   
    
   if (typeof options.callback !== 'function')
      throw new TypeError('director.timer: callback must be a function, not ' + options.callback);

   if (typeof options.duration !== 'number')
      throw new TypeError('director.time: duration must be a number, not ' + options.duration);

   function Timer(key) {
     this.currentCount = 0;
     this.duration = options.duration;
     this.count = options.count;
     
     this.stop = function() {
       var timer = timerPool.get(key);
       if (timer)
         timer.forget();
       timerPool.del(key);
     };
   }

   var timeoutWrapper = function(callback, duration) {
      var key = timerPool.newKey().toString();
      var timer = new Timer(key);  
      return timerPool.set(key, new timeout(key, duration * 1000, 'callback', {
         callback: function() { callback.call(here, timer); }
      }));
      return timer;
   };
   
   timeoutWrapper(function(timer) {
      timer.currentCount += 1;
      options.callback.apply(here, [new Event('timer', null, timer)]);
      if (timer.currentCount > timer.count) timer.stop();
   }, options.duration);
};

/***
 Network I/O
 ***/

exports.net = {};

/* Retrieves the contents of the given URL.

   Options are:
   'method'     : The HTTP method, one of 'post' or 'get'. Defaults to 'get'
   'data'       : Any post data.
   'type    '   : The type of data expected in the response. Defaults to 'json'
                  'json' - A JSON object is constructed from the body and passed to 
                           the 'complete' handler
                  'text' - The body text is passed to the 'complete' handler as plain text
   'complete'   : Callback for when the request has completed      
   'error'      : Callback if there was an error with the request
*/
exports.net.open = function(uri, options) {
   options = exports.merge(options, {      
      method : 'get',
      type : 'json',
      data : {}
   });

   var netID;
   if (options.method == 'get') {
      netID = getNetText(uri, exports.propList(options.data));
   }
   else if (options.method == 'post') {
      netID = postNetText(uri, exports.propList(options.data));
   }
   else {
      throw new TypeError('director.net.open: ' + options.method + ' is not a valid HTTP method');
   }

   function onFailure(message, data) {
      if (typeof options.error === 'function') {            
        options.error.call(
          here, 
          new Event('net.open', data, null, message));
      }
   }

   function onSuccess() {     
      var successFunc = function(data) {
          if (typeof options.complete === 'function') {
            options.complete.call(
                  here, 
                  new Event('net.open', data));
          }
      },
      data = netTextResult(netID);          
   
      if (options.type == 'json') {
        if (!_global.JSON) {
          return onFailure('director.net.open: no JSON decoder found');          
        }
      
        try {
          successFunc(_global.JSON.parse(data));
        }
        catch (e) {
          onFailure('director.net.open: no JSON data could be decoded', data);
        }
      }
      else {
        successFunc(data);        
      }   
   }

   exports.timer({
      'duration' : 0.1,
      'callback' : function(event) {
         var status = netDone(netID),
             error = netError(netID);
         
         if (status == '') {
           return;
         }
         
         if ((status == 1 || status == 'OK') && error == 'OK') {
            event.dispatcher.stop();                   
            onSuccess();  
         }
         else {
            event.dispatcher.stop();                            
            onFailure(error, netTextResult(netID));
         }
      }
   });      
};   

/***
 File I/O
 ***/

exports.file = {};

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
exports.file.exists = function(path) {
   var xtra = getXtra('fileio', 'exports.file.exists');
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
exports.file.open = function(path, mode) {   
   var xtra = getXtra('fileio', 'exports.file.open');      
   var mode = /^\s*([rwa])(\+){0,1}\s*$/i.exec(mode);
   if (!mode)
      throw new Error('director.file.open: valid modes for exports.file.open are r, w, a, r+, w+ and a+');
   
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
      throw new Error('director.file.open: ' + path + ' ' + xtra.error(xtra.status()));
   }
   
   if (type == 'a')
      xtra.setPosition(xtra.getLength());               

   return new File(path, xtra);
}

// Export to the global object
_global.director = exports;
