/* global browser */

const manifest = browser.runtime.getManifest();
const extname = manifest.name;

let toolbarAction = "cpyalllnk";
let noURLParams = false;
let ready = false;

async function setToStorage(id, value) {
  let obj = {};
  obj[id] = value;
  return browser.storage.local.set(obj);
}

function iconBlink() {
  browser.browserAction.disable();
  setTimeout(() => {
    browser.browserAction.enable();
  }, 300); // make the icon blink
}

async function getFromStorage(type, id, fallback) {
  let tmp = await browser.storage.local.get(id);
  return typeof tmp[id] === type ? tmp[id] : fallback;
}

function notify(title, message = "", iconUrl = "icon.png") {
  try {
    const nid = browser.notifications.create("" + Date.now(), {
      type: "basic",
      iconUrl,
      title,
      message,
    });
    if (nid > -1) {
      setTimeout(() => {
        browser.notifications.clear(nid);
      }, 3000); // hide notification after 3 seconds
    }
  } catch (e) {
    // noop permission missing
  }
}

async function copyTabsAsText(tabs) {
  const text = tabs
    .map((t) => {
      if (noURLParams) {
        try {
          let tmp = new URL(t.url);
          if (tmp.origin !== "null") {
            // origin seems to be "null" when not available which is a strange value, might be worth raising a bug on bugzilla for
            tmp = tmp.origin + tmp.pathname;
            return tmp;
          }
        } catch (e) {
          console.error(e);
        }
      }
      return t.url;
    })
    .join("\n");
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    console.error(e);
  }
  return false;
}

async function copyTabsAsHtml(tabs) {
  try {
    let div = document.createElement("span"); // needs to be a <span> to prevent the final linebreak
    div.style.position = "absolute";
    div.style.bottom = "-9999999"; // move it offscreen
    document.body.append(div);
    const tabs_len = tabs.length;
    for (let i = 0; i < tabs.length; i++) {
      let t = tabs[i];
      let a = document.createElement("a");

      if (t.url.startsWith("http") || t.url.startsWith("file")) {
        if (noURLParams) {
          let tmp = new URL(t.url);
          tmp = tmp.origin + tmp.pathname;
          a.href = tmp;
        } else {
          a.href = t.url;
        }
      }
      a.textContent = t.title;
      div.append(a);
      if (i !== tabs_len - 1) {
        let br = document.createElement("br");
        div.append(br);
      }
    }

    if (
      typeof navigator.clipboard.write === "undefined" ||
      typeof ClipboardItem === "undefined"
    ) {
      div.focus();
      document.getSelection().removeAllRanges();
      var range = document.createRange();
      range.selectNode(div);
      document.getSelection().addRange(range);
      document.execCommand("copy");
    } else {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": new Blob([tabs.map((t) => a.href).join("\n")], {
            type: "text/plain",
          }),
          "text/html": new Blob([div.innerHTML], {
            type: "text/html",
          }),
        }),
      ]);
    }
    div.remove();
    return true;
  } catch (e) {
    console.error(e);
  }
  return false;
}

async function onCommand(cmd) {
  if (!ready) {
    return;
  }

  if (cmd.endsWith("np")) {
    noURLParams = true;
  } else {
    noURLParams = false;
  }

  let qryObj = { hidden: false, currentWindow: true },
    tabs,
    ret = false;
  switch (cmd) {
    case "cpyalllnk":
    case "cpyalllnknp":
      tabs = await browser.tabs.query(qryObj);
      ret = copyTabsAsHtml(tabs);
      break;
    case "cpyalltxt":
    case "cpyalltxtnp":
      tabs = await browser.tabs.query(qryObj);
      ret = copyTabsAsText(tabs);
      break;
    case "cpysellnk":
    case "cpysellnknp":
      qryObj["highlighted"] = true;
      tabs = await browser.tabs.query(qryObj);
      ret = copyTabsAsHtml(tabs);
      break;
    case "cpyseltxt":
    case "cpyseltxtnp":
      qryObj["highlighted"] = true;
      tabs = await browser.tabs.query(qryObj);
      ret = copyTabsAsText(tabs);
      break;
  }
  if (ret) {
    iconBlink();
    notify(extname, manifest.commands[cmd].description);
  }
  return ret;
}

async function onStorageChange() {
  toolbarAction = await getFromStorage("string", "toolbarAction", "cpyalllnk");

  browser.browserAction.setTitle({
    title: manifest.commands[toolbarAction].description,
  });

  let txt = "";

  // first letter

  if (toolbarAction.includes("cpyall")) {
    txt = txt + "A";
  } else if (toolbarAction.includes("cpysel")) {
    txt = txt + "S";
  } else if (toolbarAction.includes("cpytab")) {
    txt = txt + "T";
  }

  // second letter

  if (toolbarAction.includes("lnk")) {
    txt = txt + "L";
  } else if (toolbarAction.includes("txt")) {
    txt = txt + "T";
  }

  browser.browserAction.setBadgeText({ text: txt });
}

(async () => {
  // add context entries to copy the clicked tab
  browser.menus.create({
    title: browser.i18n.getMessage("cpytablnk"),
    contexts: ["tab"],
    onclick: async (info, tab) => {
      noURLParams = false;
      const ret = copyTabsAsHtml([tab]);
      if (ret) {
        iconBlink();
        notify(extname, browser.i18n.getMessage("cpytablnk"));
      }
    },
  });
  browser.menus.create({
    title: browser.i18n.getMessage("cpytablnknp"),
    contexts: ["tab"],
    onclick: async (info, tab) => {
      noURLParams = true;
      const ret = copyTabsAsHtml([tab]);
      if (ret) {
        iconBlink();
        notify(extname, browser.i18n.getMessage("cpytablnk"));
      }
    },
  });

  browser.menus.create({
    title: browser.i18n.getMessage("cpytabtxt"),
    contexts: ["tab"],
    onclick: async (info, tab) => {
      noURLParams = false;
      const ret = copyTabsAsText([tab]);
      if (ret) {
        iconBlink();
        notify(extname, browser.i18n.getMessage("cpytabtxt"));
      }
    },
  });
  browser.menus.create({
    title: browser.i18n.getMessage("cpytabtxtnp"),
    contexts: ["tab"],
    onclick: async (info, tab) => {
      noURLParams = true;
      const ret = copyTabsAsText([tab]);
      if (ret) {
        iconBlink();
        notify(extname, browser.i18n.getMessage("cpytabtxt"));
      }
    },
  });

  // add the 4 context entries
  for (const cmd of Object.keys(manifest.commands)) {
    browser.menus.create({
      id: "" + cmd,
      title: manifest.commands[cmd].description,
      contexts: ["tab"],
      onclick: (info) => {
        onCommand(info.menuItemId);
      },
    });
  }

  // add selection menu to toolbar button to switch action

  browser.menus.create({
    id: "basela",
    title: browser.i18n.getMessage("selectaction"),
    contexts: ["browser_action"],
  });

  // add the 4 context entries
  for (const cmd of Object.keys(manifest.commands)) {
    browser.menus.create({
      parentId: "basela",
      title: manifest.commands[cmd].description,
      contexts: ["browser_action"],
      onclick: (info) => {
        setToStorage("toolbarAction", cmd);
      },
    });
  }

  await onStorageChange();
  ready = true;
})();

browser.storage.onChanged.addListener(onStorageChange);
browser.commands.onCommand.addListener(onCommand);

// proxy toolbar button click
browser.browserAction.onClicked.addListener((tab, info) => {
  onCommand(toolbarAction);
});

// add some slight transparancy
browser.browserAction.setBadgeBackgroundColor({ color: [0, 0, 0, 115] });

// show the options page on first installation
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    browser.runtime.openOptionsPage();
  }
});
