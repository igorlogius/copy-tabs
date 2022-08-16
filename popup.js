/* global browser */

async function onLoad() {
    const msg = document.getElementById('msg');
    const body = document.querySelector('body');
    try {
        await browser.runtime.sendMessage({});
        msg.innerText = " Copied URL ";
        body.style.backgroundColor = 'lightgreen';
    }catch(e){
        //console.error(e);
        msg.innerText = " Error: " + e.toString();
        body.style.backgroundColor = 'red';
    }
    setTimeout(window.close, 600);
}

document.addEventListener('DOMContentLoaded', onLoad);

