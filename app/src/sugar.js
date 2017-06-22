Array.prototype.each = Array.prototype.forEach;

function log() {
  if (DEBUG) console.log.apply(console, arguments);
}
function error(str, obj) {
  Rollbar.error(str, obj);
  if (DEBUG) console.error(str, obj);
  if (toast_something_wrong) toast_something_wrong();
}