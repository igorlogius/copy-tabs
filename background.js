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
    id: 'toggleMode',
    title: "Check to enable all tabs mode",
    contexts: ["browser_action"],
    type: 'checkbox',
    onclick: async function(info,tab) {
        //console.log('checked', info);
        setToStorage('mode', info.checked);
    }
});

browser.menus.onShown.addListener(async (info, tab) => {
    console.log('onShown');
    if(info.menuItemId === 'toggleMode'){
        const mode = await getFromStorage('boolean','mode',false);
        await browser.menus.update('toggleMode',{ checked: mode });
        browser.menus.refresh();
    }

  // Now use menus.create/update + menus.refresh.

});

