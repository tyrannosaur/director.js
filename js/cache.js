/* cache.js
   Rudimentary caching.
*/

var djs = _global.djs;

if (djs) {
   function Cache() {};

   function Container(cName, itemName, type, sprite) {
      this.sprite = sprite;
      this.itemName = itemName;
      this.type = type;
      this.cachedValue = null;
   }

   Container.prototype.update = function() {
      if (this.type == 'boolean') {         
         if (this.sprite && (typeof this.sprite.hilite == 'number' || typeof this.sprite.hilite == 'boolean'))
            this.cachedValue = this.sprite.hilite;
         else
            this.cachedValue = nativeMember(this.itemName).hilite;
      }
      else {
         this.cachedValue = nativeMember(this.itemName).text;
      }
   };

   Container.prototype.getValue = function() {
      return this.cachedValue;
   }

   var caches = {};

   Cache.getCache = function(cName) {
      if (!cName) throw new TypeError();
      if (!caches[cName]) return null;
      
      var results = {};
      djs.each(caches[cName], function(key, val) {
         results[key] = val.getValue();
      });
      return results;
   }

   Cache.addCache = function(cName) {
      if (!cName) throw new TypeError();
      if (!caches[cName]) caches[cName] = {};
      return Cache;
   };

   Cache.clearCache = function(cName) {      
      delete caches[cName];
      return Cache;
   };

   Cache.restoreCache = function(cName) {          
     if (caches[cName]) {
       djs.map(caches[cName], function(key, val) {
         try {
            if (val === false || val === true)
               nativeMember(key).hilite = val;
            else
               nativeMember(key).text = val;
         } catch(e) {}
       });
     }
   };

   Cache.registerItem = function(cName, options) {
      if (!cName) throw new TypeError();
      Cache.addCache(cName);
      
      djs.merge(options, {
         type : 'string'
      });
      
      if (!options.itemName) throw new TypeError();       
      var sprite;
      if (options.type == 'boolean' && typeof options.itemName == 'number') {
         sprite = nativeSprite(options.itemName);
         options.itemName = sprite.member.name;
      }
         
      caches[cName][options.itemName] = new Container(cName, options.itemName, options.type, sprite);
      return Cache;
   };

   Cache.update = function(cName) {
      if (!cName) throw new TypeError();
      djs.map(caches[cName], function(itemName, cont) {
         cont.update();
      });
      return Cache;
   }

   Cache.updateItem = function(cName, itemName) {
      if (!cName) throw new TypeError();
      if (!itemName) throw new TypeError();
      caches[cName][itemName].update();
   };  

   _global.cache = Cache;
}