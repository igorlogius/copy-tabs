/* global browser */
async function onLoad() {
    try {
        const status = await browser.runtime.sendMessage({currentWindow: true, active: true});
        if(status === 'ok'){
            const msg = document.getElementById('msg');
            const body = document.querySelector('body');
            msg.innerText = "Copied URL";
            body.style.backgroundColor = 'lightgreen';
            setTimeout(window.close, 600);
            return;
        }
    }catch(e){
        console.error(e);
    }
    window.close();
}

document.addEventListener('DOMContentLoaded', onLoad);

