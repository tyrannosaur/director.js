# director.js

A Javascript wrapper for Adobe Director

This library attempts to wrap some of the inconsistencies and common pitfalls
of ECMAScript in Adobe Director. New functionality is also provided, such as
timers, wrapping of network requests, file i/o and JSON (via [Douglas Crockford's JSON library](https://github.com/douglascrockford/JSON-js/blob/master/json2.js))

## Requirements

Adobe Director 11.5. That's it!

## Installation

1. Save `director.js` as cast member 1
1. Save the `json.js` and `cache.js` as additional cast members.
1. (optional) Save any behaviors (under `behaviors`) as cast members.
   
## One huge caveat

In order to avoid internal state corruption in Director, the following safeguard should surround all code using `director.js`:

```javascript
   var djs = _global.director;
   if (djs) {
      ...
   }
```

I also recommend that event handler names (mouseUp, mouseDown, etc.) be defined as explicit functions. Rare, but unpredictable errors can occur if event handlers are defined anonymously.

```javascript
   // Not recommended
   var djs = _global.director;
   
   if (djs) {
      djs.behavior({
         description : 'Sometimes throws an error'
      })
      .addHandler('mouseUp', function(context) {      
      })
      .bind(this);
   }
```

```javascript
   // Recommended
   var djs = _global.director;
   
   if (djs) {
      djs.behavior({
         description : 'Bulletproof'
      })      
      .bind(this);
   }
   
   function mouseUp(context) {
   }
```

## Some examples

Create a behavior programmatically. No more messing around with getPropertyDescriptionList.

```javascript
   var djs = _global.director;
   
   if (djs) {
      djs.behavior({
         description : 'Trace on mouse clicks'
      })
      .addParameter({
         'name' : 'mouseName',
         'comment' : 'Name your mouse' ,
         'default' : 'Algernon'
      })
      .addHandler('mouseUp', function(context) {
         trace(context.mouseName + ' was released');
      })
      .bind(this);
   }
```

Add a delayed function call.

```javascript
   var djs = _global.director;
   
   if (djs) {
      djs.timer({
         duration : 0.5,
         count : Infinity,      
         callback : function(event) {
            var t = event.dispatcher;
            dTools.member('message').text = (t.duration * t.currentCount) + ' seconds have elapsed';
         }
      });
   }
```

Fetch tweets from Twitter and parse the results as JSON without having to poll for a response!

```javascript
   var djs = _global.director;
   
   if (djs) {         
      function onComplete(evt) {         
         djs.each(evt.data, function(i, tweet) {
            trace(tweet.text);
         });         
      };
   
      var uri = 'http://api.twitter.com/1/statuses/public_timeline.json';
      var params = {
         count : 3,
         include_entities : true
      };
   
      djs.net.open(uri, {         
         type : 'json',
         data : params,          
         complete : onComplete
      });           
   }
```

# Disclaimer

Neither this code nor its author are affiliated or endorsed by Adobe in any way.
