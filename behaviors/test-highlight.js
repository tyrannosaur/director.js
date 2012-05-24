/* test-highlight.js

   If the specified sprite is highlighted, jumps to successMarker.
   Otherwise, jumps to failureMarker.
*/

var djs = _global.director;

if (djs) {
   djs.behavior({
      description : 'If the specified sprite is highlighted, jumps to successMarker. Otherwise, jumps to failureMarker.'
   })
   .addParameter({
      name : 'spriteNumber',
      format : 'integer',
      comment : 'Sprite number'
   })
   .addParameter({
      name : 'successMarker',
      format : 'marker',
      comment : 'Marker to jump to if the sprite is highlighted'
   })
   .addParameter({
      name : 'failureMarker',
      format : 'marker',
      comment : 'Marker to jump to if the sprite is not highlighted'
   })      
   .addParameter({
      name : 'onMouseUp',
      format : 'boolean',
      comment : 'on mouseUp'
   })
   .addParameter({
      name : 'onMouseDown',
      format : 'boolean',
      comment : 'on mouseDown'
   })   
   .addParameter({
      name : 'onEnterFrame',
      format : 'boolean',
      comment : 'on enterFrame'
   })   
   .addParameter({
      name : 'onExitFrame',
      format : 'boolean',
      comment : 'on exitFrame'
   })   
   .bind(this);
}

function isHilighted(spriteNumber) {
   var djs = _global.director;   
   if (djs) {
      var s = djs.sprite(spriteNumber);
      return s && s.hilite;
   }
   return false;
}

function mouseUp(context) { 
   if (context.onMouseUp && isHilighted(context.spriteNumber))
      _movie.go(context.successMarker);   
}

function mouseDown(context) { 
   if (context.onMouseDown && isHilighted(context.spriteNumber))
      _movie.go(context.successMarker);   
}

function enterFrame(context) { 
   if (context.onEnterFrame && isHilighted(context.spriteNumber))
      _movie.go(context.successMarker);   
}

function exitFrame(context) { 
   if (context.onExitFrame && isHilighted(context.spriteNumber))
      _movie.go(context.successMarker);   
}