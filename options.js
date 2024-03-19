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

function onLoad() {
  for (const blub of [
    "labelseltba",
    "hint_1",
    "hint_2",
    "hint_3",
    "hint_4",
    "hint_5",
  ]) {
    let el = document.getElementById(blub);
    el.innerText = browser.i18n.getMessage(blub);
  }

  const manifest = browser.runtime.getManifest();
  const toolbarActionSelect = document.getElementById("toolbarAction");
  for (const cmd of Object.keys(manifest.commands)) {
    toolbarActionSelect.add(
      new Option(manifest.commands[cmd].description, cmd)
    );
  }

  ["toolbarAction"].map((id) => {
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
        } else {
          el.value = (() => {
            switch (id) {
              case "showNotifications":
                return true;
              case "toolbarAction":
                return "cpyalllnk";
              default:
                return 0;
            }
          })();
        }
      })
      .catch(console.error);

    let el = document.getElementById(id);
    el.addEventListener("input", onChange);
  });
}

document.addEventListener("DOMContentLoaded", onLoad);
