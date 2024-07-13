/* global browser */

function onDOMContentLoaded() {
  const manifest = browser.runtime.getManifest();
  const btncontainer = document.getElementById("btncontainer");

  let breakToggle = false;

  let fs = document.createElement("fieldset");

  for (const cmd of Object.keys(manifest.commands)) {
    // create Button
    let btn = document.createElement("button");
    let tmp = manifest.commands[cmd].description;

    if (tmp.includes("✂️")) {
      btn.innerText = "✂️";
      btn.setAttribute("title", "Strip Params");
    } else {
      btn.innerText = tmp;
      //btn.setAttribute('title', "");
    }

    btn.addEventListener("click", async () => {
      browser.runtime.sendMessage({
        cmd: cmd,
      });
    });

    //btncontainer.appendChild(btn);
    fs.appendChild(btn);
    if (breakToggle) {
      breakToggle = false;
      btncontainer.appendChild(fs);
      //let br = document.createElement("br");
      //btncontainer.appendChild(br);
      fs = document.createElement("fieldset");
    } else {
      breakToggle = true;
    }
  }
}

document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
