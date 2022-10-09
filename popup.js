/* global browser */

async function getFromStorage(id, type, fallback) {
    let tmp = await browser.storage.local.get(id);
    //console.log(typeof tmp[id]);
    return (typeof tmp[id] === type) ? tmp[id] : fallback;
}

async function onLoad() {
    const msg = document.getElementById('msg');
    const body = document.querySelector('body');
    try {
        const allTabsMode = await getFromStorage('allTabsMode','boolean', false);
        const txtOnlyMode = await getFromStorage('txtOnlyMode','boolean', false);

        let data = {
            hidden:false,
            currentWindow:true
        };
        if(!allTabsMode){
            data['highlighted'] = true;
        }
        const tabs  = await browser.tabs.query(data);

        if(txtOnlyMode){
            const text = tabs.map( t => t.url ).join('\n') + '\n';
            await navigator.clipboard.writeText(text);
        }else{

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
        }

        if(allTabsMode){
            msg.innerText = " Copied URLs of All Tabs ";
        }else{
            msg.innerText = " Copied URLs of Selected Tabs ";
        }
        body.style.backgroundColor = 'lightgreen';
        setTimeout(window.close, 1600);
    }catch(e){
        console.error(e);
        body.style.backgroundColor = 'red';
        msg.innerText = " Failed to copy URLs: " + e.toString();
    }
}

document.addEventListener('DOMContentLoaded', onLoad);

