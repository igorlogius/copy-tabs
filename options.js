/* global browser */

function onChange(evt) {
  let id = evt.target.id;
  let el = document.getElementById(id);

  let value = el.type === "checkbox" ? el.checked : el.value;
  let obj = {};

  if (value === "") {
    return;
  }
  if (el.type === "number") {
    try {
      value = parseInt(value);
      if (isNaN(value)) {
        value = el.min;
      }
      if (value < el.min) {
        value = el.min;
      }
    } catch (e) {
      value = el.min;
    }
  }

  obj[id] = value;

  browser.storage.local.set(obj).catch(console.error);
}

function onDOMContentLoaded() {
  const expbtn = document.getElementById("expbtn");
  const impbtnWrp = document.getElementById("impbtn_wrapper");
  const impbtn = document.getElementById("impbtn");
  let mainTableBody = document.getElementById("mainTableBody");
  let noURLParamsFunction = document.getElementById("noURLParamsFunction");
  let reset = document.getElementById("reset");

  [
    /* add individual settings here */
    "noURLParamsFunction",
    "popupmode",
  ].map((id) => {
    browser.storage.local
      .get(id)
      .then((obj) => {
        let el = document.getElementById(id);
        let val = obj[id];

        if (typeof val !== "undefined") {
          if (el.type === "checkbox") {
            el.checked = val;
          } else {
            el.value = val;
          }
        }
      })
      .catch(console.error);

    let el = document.getElementById(id);
    el.addEventListener("input", onChange);
  });

  reset.addEventListener("click", async () => {
    if (
      !confirm(
        "Are you sure?\nThe current data will be lost when you click on ok.",
      )
    ) {
      return;
    }

    let tmp = await fetch(browser.runtime.getURL("noURLParamsFunction.js"));
    tmp = await tmp.text();
    noURLParamsFunction.value = tmp;
    browser.storage.local.set({ noURLParamsFunction: tmp });
  });
}

document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
