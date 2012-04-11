# director.js - a Javascript wrapper for Adobe Director
   
This library attempts to wrap some of the inconsistencies and common pitfalls
of ECMAScript in Adobe Director. New functionality is also provided, such as
timers, wrapping of network requests and file i/o.

## Requirements

1. Adobe Director 11.5
1. A JSON implementation. `director.js` includes the [standard one](https://github.com/douglascrockford/JSON-js/blob/master/json2.js)

## Installation

1. Save `director.js` as cast member 1 and set its type to "Movie Script"
1. Save the `json.js` and `cache.js` as additional cast members.
   
That's it!

## One huge caveat

In order to avoid internal state corruption in Director, the following safeguard should surround all code using `director.js`:

```javascript
   var djs = _global.director;
   if (djs) {
      ...
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