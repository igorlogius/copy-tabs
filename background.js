/* global browser */

const manifest = browser.runtime.getManifest();
const extname = manifest.name;

let toolbarAction = "cpyalllnk";
let noURLParams = false;
let ready = false;
let runtab = null;
let popupmode = false;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let noURLParamsFunctionCode = "return url;";

async function setToStorage(id, value) {
  let obj = {};
  obj[id] = value;
  return browser.storage.local.set(obj);
}

function iconBlink() {
  browser.browserAction.disable();
  setTimeout(() => {
    browser.browserAction.enable();
  }, 300);
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
      }, 3000);
    }
  } catch (e) {
    // noop
  }
}

async function copyTabsAsText(tabs) {
  runtab = await browser.tabs.create({
    active: false,
    url: "empty.html",
  });

  const text = (
    await Promise.all(
      tabs.map(async (t) => {
        if (noURLParams) {
          try {
            tmp = await browser.tabs.executeScript(runtab.id, {
              code: `((url) => { ${noURLParamsFunctionCode} ;return url;})("${t.url}")`,
            });
            if (Array.isArray(tmp) && typeof tmp[0] === "string") {
              return tmp[0].replace(/\s+/g, "");
            }
          } catch (e) {
            console.error(e);
          }
        }
        return t.url;
      }),
    )
  ).join("\n");
  browser.tabs.remove(runtab.id);
  try {
    navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    console.error(e);
  }
  return false;
}

async function copyTabsAsHtml(tabs) {
  runtab = await browser.tabs.create({
    active: false,
    url: "empty.html",
  });

  try {
    let fallbackTextClipboardItem = "";
    let span = document.createElement("span"); // needs to be a <span> to prevent the final linebreak
    span.style.position = "absolute";
    span.style.bottom = "-9999999"; // move it offscreen
    document.body.append(span);

    const tabs_len = tabs.length;
    for (let i = 0; i < tabs.length; i++) {
      let t = tabs[i];
      let a = document.createElement("a");

      if (noURLParams) {
        try {
          tmp = await browser.tabs.executeScript(runtab.id, {
            code: `((url) => { ${noURLParamsFunctionCode} ;return url;})("${t.url}")`,
          });

          if (Array.isArray(tmp) && typeof tmp[0] === "string") {
            a.href = tmp[0].replace(/\s+/g, "");
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        a.href = t.url;
      }
      a.textContent = t.title;
      span.append(a);
      fallbackTextClipboardItem += a.href;
      if (i !== tabs_len - 1) {
        let br = document.createElement("br");
        span.append(br);
        fallbackTextClipboardItem += "\n";
      }
    }

    browser.tabs.remove(runtab.id);

    if (
      typeof navigator.clipboard.write === "undefined" ||
      typeof ClipboardItem === "undefined"
    ) {
      span.focus();
      document.getSelection().removeAllRanges();
      var range = document.createRange();
      range.selectNode(span);
      document.getSelection().addRange(range);
      document.execCommand("copy");
    } else {
      navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": new Blob([fallbackTextClipboardItem], {
            type: "text/plain",
          }),
          "text/html": new Blob([span.innerHTML], {
            type: "text/html",
          }),
        }),
      ]);
    }
    span.remove();
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

  let qryObj = {
      currentWindow: true,
      hidden: false,
      url: "<all_urls>",
      discarded: false,
      status: "complete",
    },
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
  popupmode = await getFromStorage("boolean", "popupmode", false);

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

  noURLParamsFunctionCode = await getFromStorage(
    "string",
    "noURLParamsFunction",
    "",
  );
}

// proxy toolbar button click
function onBAClicked(tab, info) {
  if (popupmode) {
    if (info.button === 1) {
      browser.browserAction.setPopup({
        popup: "popup.html",
      });
      browser.browserAction.openPopup();
    } else {
      onCommand(toolbarAction);
    }
  } else {
    if (info.button === 1) {
      onCommand(toolbarAction);
    } else {
      // default
      browser.browserAction.setPopup({
        popup: "popup.html",
      });
      browser.browserAction.openPopup();
    }
  }
}

async function onInstalled(details) {
  noURLParamsFunctionCode = await getFromStorage(
    "string",
    "noURLParamsFunction",
    "",
  );
  if (details.reason === "install" || noURLParamsFunctionCode === "") {
    let tmp = await fetch("noURLParamsFunction.js");
    noURLParamsFunctionCode = await tmp.text();
    browser.storage.local.set({ noURLParamsFunction: noURLParamsFunctionCode });
  }
}

function onMessage(req) {
  onCommand(req.cmd);
}

(async () => {
  // add some transparancy
  browser.browserAction.setBadgeBackgroundColor({ color: [0, 0, 0, 115] });

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

browser.runtime.onInstalled.addListener(onInstalled);
browser.runtime.onMessage.addListener(onMessage);
browser.browserAction.onClicked.addListener(onBAClicked);
browser.commands.onCommand.addListener(onCommand);
browser.storage.onChanged.addListener(onStorageChange);
// EOF
