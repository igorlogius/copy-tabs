/* global browser */

async function onLoad() {
    const msg = document.getElementById('msg');
    const body = document.querySelector('body');
    try {
        const data = {currentWindow: true, highlighted: true};
        const tabs  = await browser.tabs.query(data);

        let ul = document.getElementById('list');

        for(const t of tabs) {
            let br = document.createElement('br');
            let a = document.createElement('a');
            a.href = t.url;
            a.textContent = t.title;
            ul.append(a);
            ul.append(br);
        }

        ul.focus();
        document.getSelection().removeAllRanges();
        var range = document.createRange();
        range.selectNode(ul);
        document.getSelection().addRange(range);
        document.execCommand("copy");
        ul.remove();

        msg.innerText = " Copied URLs of Selected Tabs ";
        body.style.backgroundColor = 'lightgreen';
        setTimeout(window.close, 1600);
    }catch(e){
        console.error(e);
        body.style.backgroundColor = 'red';
        msg.innerText = " Failed to copy URLs: " + e.toString();
    }
}

document.addEventListener('DOMContentLoaded', onLoad);

