/* global browser */

let body;
let tip;

const tips = [
	 'Each action can be assigned a custom shortcut (Defaults: F1-F4)'
	, 'The activ tab is always selected'
	, 'Hold shift to select a range of tabs'
	, 'Hold ctrl so select muliple seperate tabs'
	, 'https://support.mozilla.org/kb/keyboard-shortcuts-perform-firefox-tasks-quickly'
];

// delegate click action to background script
document.addEventListener('click', async (evt) => {
	if(evt.target.nodeName.toLowerCase() !== 'button'){
		return;
	}
	try {
		const res = await browser.runtime.sendMessage({cmd: evt.target.id});
		if(res === true){
			evt.target.style.backgroundColor = 'lightgreen';
			setTimeout(window.close, 500);
			return;
		}
	}catch(e){
		tip.innerText = "Error: " + e.toString(); 
		console.error(e);
	}
	evt.target.style.backgroundColor = 'red';
});

function onLoad() {
	// save body ref vor click action 
	body = document.querySelector('body');
	tip = document.getElementById('tip');

	tip.innerText = "Tip: " + tips[Math.floor((Math.random()*tips.length))];

	const mfest = browser.runtime.getManifest();
	// build page from manifest commands
	for(const cmd of Object.keys(mfest.commands).sort().reverse()){
		fset = document.createElement('fieldset');
		btn = document.createElement('button');
		fset.append(btn);
		btn.setAttribute('id',cmd);
		btn.innerText = mfest.commands[cmd].description;
		body.prepend(fset);
	}
}

document.addEventListener('DOMContentLoaded', onLoad);

