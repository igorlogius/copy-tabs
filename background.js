/*global browser */

(async function() {

    let hasTabPerm = false;

    async function onMessage(/*data , sender*/) {
            const data = {currentWindow: true, active: true};
            const tabs  = await browser.tabs.query(data);
            const tab = tabs[0];

            let anchor = document.createElement('a');
            anchor.href = tab.url;
            anchor.textContent = tab.title;
            document.body.prepend(anchor);
            anchor.focus();
            document.getSelection().removeAllRanges();
            var range = document.createRange();
            range.selectNode(anchor);
            document.getSelection().addRange(range);
            document.execCommand("copy");
            anchor.remove();
            return Promise.resolve(true);
    }

    async function updatePADisplay(tabId){
        const tab = await browser.tabs.get(tabId);
        if(typeof tab.url && 'string' && /^https?:/.test(tab.url) ){
            if(hasTabPerm){
                browser.pageAction.show(tabId);
                return;
            }
        }
        browser.pageAction.hide(tabId);
    }

    function onTabActivated(info){
        updatePADisplay(info.tabId);
    }

    function onTabUpdated(tabId, changeInfo/*, tab*/) {
        if (changeInfo.status === 'complete' ) {
            updatePADisplay(tabId);
        }
    }

    async function updatePADisplayForAllVisibleTabs(){
            const data = {active: true};
            const tabs  = await browser.tabs.query(data);
            for(const tab of tabs){
                updatePADisplay(tab.id);
            }
    }

    function onCommand(command) {
        if (command === "copy-action") {
            if(hasTabPerm){
                browser.pageAction.openPopup();
            }else{
                browser.browserAction.openPopup();
            }
        }
    }

    async function onPermissionAdded(permissions) {
        hasTabPerm = await hasPermission(['tabs']);
        if(hasTabPerm) {
            browser.tabs.onActivated.addListener(onTabActivated);
            browser.tabs.onUpdated.addListener(onTabUpdated, { urls: ["<all_urls>"], properties: ["status"] });
            updatePADisplayForAllVisibleTabs();
        }
    }

    async function onPermissionRemoved(permissions) {
        hasTabPerm = await hasPermission(['tabs']);
        if(!hasTabPerm) {
            updatePADisplayForAllVisibleTabs();
        }
    }

    async function hasPermission(permissions){
        const p = { permissions: permissions };
        return await browser.permissions.contains(p);
    }

    // dynamically registered listeners
    hasTabPerm = await hasPermission(['tabs']);
    if(hasTabPerm){
        browser.tabs.onActivated.addListener(onTabActivated);
        browser.tabs.onUpdated.addListener(onTabUpdated, { urls: ["<all_urls>"], properties: ["status"] });
    }

    // static registered listeners
    browser.commands.onCommand.addListener(onCommand);
    browser.permissions.onAdded.addListener(onPermissionAdded);
    browser.permissions.onRemoved.addListener(onPermissionRemoved);
    browser.runtime.onMessage.addListener(onMessage);

}());
