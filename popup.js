/* global browser */

function onDOMContentLoaded() {
  const manifest = browser.runtime.getManifest();
  const btncontainer = document.getElementById("btncontainer");

  let breakToggle = false;

  for (const cmd of Object.keys(manifest.commands)) {
    let btn = document.createElement("button");
    let tmp = manifest.commands[cmd].description;

    if (cmd.endsWith("np")) {
      btn.innerText = "✂️";
      btn.setAttribute("title", "strip params");
      btn.className = "browser-style";
    } else {
      btn.innerText = tmp;
      btn.className = "browser-style";
    }

    btn.addEventListener("click", async () => {
      browser.runtime.sendMessage({
        cmd: cmd,
      });
    });

    btncontainer.appendChild(btn);
    if (breakToggle) {
      breakToggle = false;
    } else {
      breakToggle = true;
    }
  }
}

document.addEventListener("DOMContentLoaded", onDOMContentLoaded);
