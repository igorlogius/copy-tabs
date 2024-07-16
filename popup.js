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

    if (cmd.endsWith("np")) {
      btn.innerText = "✂️";
      btn.setAttribute("title", "Strip Params");
    } else {
      btn.innerText = tmp;
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

    fs.appendChild(btn);
    if (breakToggle) {
      breakToggle = false;
      btncontainer.appendChild(fs);
      fs = document.createElement("fieldset");
    } else {
      breakToggle = true;
    }
  }
}

document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
