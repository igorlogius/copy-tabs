/*global browser */

async function onMessage(data /*, sender*/) {
    try {
        let tmp  = await browser.tabs.query(data);

        const tab = tmp[0];
        var link = document.createElement('a');
        link.href = tab.url;
        link.textContent = tab.title;
        document.body.prepend(link);
        link.focus();
        document.getSelection().removeAllRanges();
        var range = document.createRange();
        range.selectNode(link);
        document.getSelection().addRange(range);
        document.execCommand("copy");
        link.remove();

        return Promise.resolve("ok");
    }catch(e){
        console.error(e);
    }
    return false;
}

browser.runtime.onMessage.addListener(onMessage);

