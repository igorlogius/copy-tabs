/*global browser */

async function onMessage(/*data , sender*/) {
    try {
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
    }catch(e){
        console.error(e);
    }
    return false;
}

browser.runtime.onMessage.addListener(onMessage);

