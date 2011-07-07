/* Validation extension
   Given a field name
*/

function Validate() {
}

Validate.decide = function(decider, test, member_names) {
  var c = 0;
  for (var n in member_names)
    c += test(member(member_names[n]).text) ? 1 :0;
    
  decider(c, member_names);
}

Validate.any = function(test, on_true, on_false, member_names) {
  Validate.decide(function(c, mn) {
    if (c > 0)
      on_true();
    else
      on_false();
  }, test, member_names);
}

Validate.all = function(test, on_true, on_false, member_names) {
  Validate.decide(function(c, mn) {
    if (c == member_names.length - 1)
      on_true();
    else
      on_false();
  }, test, member_names);
}