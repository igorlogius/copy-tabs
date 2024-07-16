/*
 *  Strip Parameter Code
 *  Add key/value pairs to to the allowedMap to add exceptions
 *  (aka. allow parameter for certain domains)
 *  the `url` variable is globally available
 *  learn more: https://developer.mozilla.org/en-US/docs/Web/javascript
 */

let old_urlobj = new URL(url);
let old_params = new URLSearchParams(old_urlobj.search);
let new_params = [];
let allowedParams = [];
const allowedMap = new Map();

// Examples:
// allowedMap.set("www.facebook.com",['yclid','track']);
// allowedMap.set("addons.mozilla.org",['umt_source']);
// allowedMap.set("^https://.*",['yclid','dadasd']);
// allowedMap.set("^https://.*\wikipedia\.org\/.*",['yclid']);

for (let [key, val] of allowedMap) {
  //if( (new RegExp(key)).test(url) ){
  if (urlobj.hostname === key) {
    allowedParams = allowedParams.concat(val);
  }
}

for (const [key, val] of old_params) {
  if (allowedParams.includes(key)) {
    new_params.push([key, val]);
  }
}
new_params = new URLSearchParams(new_params);

url = old_urlobj.origin + old_urlobj.pathname;

if (new_params.size > 0) {
  url = url + "?" + new_params;
}
