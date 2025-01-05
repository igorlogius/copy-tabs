/*
 *  Add key/value pairs to to the allowedMaps to add exceptions
 *  (aka. allow parameter for urls/domains)
 *  the `url` variable is globally available
 *  learn more: https://developer.mozilla.org/en-US/docs/Web/javascript
 */

let old_urlobj = new URL(url);
let old_params = new URLSearchParams(old_urlobj.search);
let new_params = [];
let allowedParams = [];
const allowedMapHosts = new Map();
const allowedMapRegEx = new Map();

// Examples: (hostname matches)
// allowedMapHosts.set("www.facebook.com",['yclid','track']);
// allowedMapHosts.set("addons.mozilla.org",['umt_source']);
// ... add your own here ...

// Examples: (RegEx matches)
// allowedMapRegEx.set("^https://.*",['yclid','dadasd']);
// allowedMapRegEx.set("^https://.*\wikipedia\.org\/.*",['yclid']);
// ... add your own here ...

//
for (let [key, val] of allowedMapHosts) {
  if (urlobj.hostname === key) {
    allowedParams = allowedParams.concat(val);
  }
}

for (let [key, val] of allowedMapRegEx) {
  if (new RegExp(key).test(url)) {
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
