/* global browser */

const tipCollection = [
  "The active tab is always selected",
  "Hold CTRL to select addional tabs",
  "Hold SHIFT to select a range of tabs",
  "You can set custom shortcuts for all copy actions",
  "All actions are can also be found in the tab context menu",
  "You can disable this popup on the addons preference page",
  "Use the 3rd/middle mouse button to invoke the direct action",
  "Set the direct copy action in the toolbar buttons context menu",
  "Give the developer some feedback so he'll know whats good and what needs impovement",
];

function onDOMContentLoaded() {
  const tip = document.getElementById("tip");

  const text = tipCollection[Math.floor(Math.random() * tipCollection.length)];

  tip.innerText = text;

  const manifest = browser.runtime.getManifest();
  const btncontainer = document.getElementById("btncontainer");

  let breakToggle = false;

  //let fs = document.createElement("fieldset");

  //fs.style = 'display:flex;';

  for (const cmd of Object.keys(manifest.commands)) {
    // create Button
    let btn = document.createElement("button");
    let tmp = manifest.commands[cmd].description;

    if (cmd.endsWith("np")) {
      btn.innerText = "✂️";
      btn.setAttribute("title", "strip params");
      btn.style = "";
    } else {
      btn.innerText = tmp;
      btn.style = "";
      /*
        if (cmd.endsWith("lnk")) {
            btn.innerText = tmp + " 🔗";
        }else
        if (cmd.endsWith("txt")) {
            btn.innerText = tmp + " ✏️";
        }
        */
    }

    btn.addEventListener("click", async () => {
      browser.runtime.sendMessage({
        cmd: cmd,
      });
    });

    btncontainer.appendChild(btn);
    if (breakToggle) {
      breakToggle = false;
      //btncontainer.appendChild(fs);
      //fs = document.createElement("fieldset");
    } else {
      breakToggle = true;
    }
  }
}

document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
