function Store() {
}

Store._global_prefix = "Store_";

Store.fromGlobal = function(key_name) {
  return _global[Store._global_prefix + key_name];
}

Store.toGlobal = function(key_name, obj) {
  _global[Store._global_prefix + key_name] = obj;
}

Store.save = function(key_name, member_names) {
  if (Store.fromGlobal(key_name) == undefined)  
    Store.toGlobal(key_name, {});
  
  var g = Store.fromGlobal(key_name);
  
  for (var n in member_names)
    g[member_names[n]] = member(member_names[n]).text;
}

Store.restore = function(key_name) {
  var g = Store.fromGlobal(key_name);
  if (g != undefined) {
    for (var n in g)
      member(n).text = g[n];
  }
}

Store.clear = function(key_name) {
  Store.toGlobal(key_name, undefined);
}