/* wait-on-frame.js

   Waits on the current frame for a specified number of seconds, hours or minutes (or indefinitely)
*/

var djs = _global.director,
    lastTime;

if (djs) {
  djs.behavior({
    description : 'Waits on the current frame for a specified number of seconds, hours or minutes (or indefinitely)'
  })
  .addParameter({
    name : 'successMarker',
    format : 'marker',
    comment : 'Marker to jump to after the specified time has elapsed'
  })   
  .addParameter({
    name : 'unitOfTime',
    format : 'string',
    range : list('seconds', 'minutes', 'hours'),
    comment : 'Unit of time'
  })  
  .addParameter({
    name : 'unitNumber',
    format : 'integer',
    range : djs.propList({min : 1, max : 60}),
    comment : 'Number of units to wait'
  })
  .addParameter({
    name : 'waitForever',
    format : 'boolean',    
    comment : 'Wait forever'
  })    
  .bind(this);  
}

function beginSprite(context) {
  lastTime = (new Date()).getTime();
}

function exitFrame(context) {
   var next = _movie.frame;

   if (!context.waitForever) {
      var now = (new Date()).getTime(),         
          seconds;
      
      if (context.unitOfTime == 'seconds')
         seconds = context.unitNumber;
      else if (context.unitOfTime == 'minutes')
         seconds = context.unitNumber * 60;
      else if (context.unitOfTime == 'hours')
         seconds = context.unitNumber * 3600;
      
      if (now - lastTime >=  seconds * 1000)
         next = context.successMarker;
    
      nextTime = now;        
   }
   _movie.go(next);
}