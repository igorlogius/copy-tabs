/* global browser */

async function setToStorage(id, value) {
    let obj = {};
    obj[id] = value
    return browser.storage.local.set(obj);
}

async function getFromStorage(type, id, fallback) {
    let tmp = await browser.storage.local.get(id);
    return (typeof tmp[id] === type) ? tmp[id] : fallback;
}

browser.menus.create({
    id: 'allTabsMode',
    title: "Check to enable all tabs mode",
    contexts: ["browser_action"],
    type: 'checkbox',
    onclick: async function(info /*,tab*/) {
        setToStorage('allTabsMode', info.checked);
    }
});

browser.menus.create({
    id: 'txtOnlyMode',
    title: "Check to enable text only mode",
    contexts: ["browser_action"],
    type: 'checkbox',
    onclick: async function(info/*,tab*/) {
        setToStorage('txtOnlyMode', info.checked);
    }
});

browser.menus.onShown.addListener(async (info /*, tab*/) => {
    if(info.menuItemId === 'allTabsMode'){
        const allTabsMode = await getFromStorage('boolean','allTabsMode',false);
        await browser.menus.update('allTabsMode',{ checked: allTabsMode});
        browser.menus.refresh();
    }else
    if(info.menuItemId === 'txtOnlyMode'){
        const txtOnlyMode = await getFromStorage('boolean','txtOnlyMode',false);
        await browser.menus.update('toggleMode',{ checked: txtOnlyMode });
        browser.menus.refresh();
    }
});

