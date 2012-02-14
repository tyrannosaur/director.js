# dTools - a Javascript wrapper for Adobe Director
   
This library attempts to wrap some of the inconsistencies and common pitfalls
of ECMAScript in Adobe Director. New functionality is also provided, such as
timers and wrapping of network requests and file i/o.

Note that popular JavaScript libraries such as [Underscore](http://documentcloud.github.com/underscore) and [jQuery](http://jquery.org) can be adapted
to run in Director. This is not a replacement for them, although it includes some of their functional programming functionality.

## Requirements

1. Adobe Director 11.5
1. A JSON implementation. `dTools` includes the [standard one](https://github.com/douglascrockford/JSON-js/blob/master/json2.js)

## Installation

There are two choices:

+ Import the `dTools.cst` cast file into your Director project
+ Copy and paste the text of each JavaScript file into a new movie script with JavaScript syntax.
   
That's it!

## Some examples

Create a behavior programmatically

```javascript
   if (!dTools) throw new Error('dTools not found!');

   dTools.behavior({
      description : 'Trace on mouse clicks'
   }, {
      mouseName : { 'comment' : 'Name your mouse', 'default' : 'Algernon' }
   })
   .addHandler('mouseUp', function(context) {
      trace(context.mouseName + ' was released');
   })
   .bind(this);
```

Add a delayed function call

```javascript
   dTools.timer({
      duration : 0.5,
      count : 0,      
      callback : function(event) {
         var t = event.dispatcher;
         dTools.member('message').text = (t.duration * t.currentCount) + ' seconds have elapsed';
      }
   });
```   