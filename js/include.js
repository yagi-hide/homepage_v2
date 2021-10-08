
function include(filename, eid, callback = function(){}) {
  var req = new XMLHttpRequest();
  req.onload = function(){
    document.getElementById(eid).innerHTML = req.responseText;
    callback();
  }
  req.open("get", filename, true);
  req.send(null);
}
