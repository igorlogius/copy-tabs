/* global browser */

const manifest = browser.runtime.getManifest();
const extname = manifest.name;

let toolbarAction = 'cpyalllnk';
let showNotifications = true;
let noURLParams = false;
let ready = false;

async function getFromStorage(type, id, fallback) {
    let tmp = await browser.storage.local.get(id);
    return (typeof tmp[id] === type) ? tmp[id] : fallback;
}

function notify(title, message = "", iconUrl = "icon.png") {
	if(showNotifications) {
	    return browser.notifications.create(""+Date.now(),
		{
		   "type": "basic"
		    ,iconUrl
		    ,title
		    ,message
		}
	    );
	}
}

async function copyTabsAsText(tabs){
        const text = tabs.map( t => {
		if(noURLParams){
			try {
				let tmp = new URL(t.url);
				console.debug(tmp);
				if(tmp.origin !== "null"){ // origin seems to be "null" when not available which is a strange value, might be worth raising a bug on bugzilla for
					tmp = tmp.origin + tmp.pathname;
					return tmp;
				}
			}catch(e){
				console.error(e);
			}
		}
		return t.url;
	}).join('\r\n') + '\r\n'+ '\r\n';
	try {
		await navigator.clipboard.writeText(text);
		return true;
	}catch(e){
		console.error(e);
	}
	return false;
}

async function copyTabsAsHtml(tabs){
	try {
            let div = document.createElement('div');
	    div.style.position = 'absolute';
	    div.style.bottom = '-9999999';  // move it offscreen 
	    document.body.append(div);
            for(const t of tabs) {
                let br = document.createElement('br');
                let a = document.createElement('a');

		if(noURLParams){
			let tmp = new URL(t.url);
			tmp = tmp.origin + tmp.pathname;
			a.href = tmp;
		}else{
			a.href = t.url;
		}

                a.textContent = t.title;
                div.append(a);
                div.append(br);
            }
            div.focus();
            document.getSelection().removeAllRanges();
            var range = document.createRange();
            range.selectNode(div);
            document.getSelection().addRange(range);
            document.execCommand("copy");
            div.remove();
	    return true;
	}catch(e){
	    console.error(e);
	}
	return false;
}

async function onCommand(cmd) {
	if(!ready){
		return;
	}
	console.debug(cmd, showNotifications);
	let qryObj = { hidden: false, currentWindow: true }, tabs, ret = false;
	switch(cmd){
		case 'cpyalllnk':
			tabs  = await browser.tabs.query(qryObj);
			ret = copyTabsAsHtml(tabs);
			break;
		case 'cpyalltxt':
			tabs  = await browser.tabs.query(qryObj);
			ret = copyTabsAsText(tabs);
			break;
		case 'cpysellnk':
			qryObj['highlighted'] = true;
			tabs  = await browser.tabs.query(qryObj);
			ret = copyTabsAsHtml(tabs);
			break;
		case 'cpyseltxt':
			qryObj['highlighted'] = true;
			tabs  = await browser.tabs.query(qryObj);
			ret = copyTabsAsText(tabs);
			break;
	}
	if(ret){
		browser.browserAction.disable();
		setTimeout( () => {
			browser.browserAction.enable();
		},300); // make the icon blink 

		const nid = await notify(extname, manifest.commands[cmd].description.substr(5));
		if(nid > -1){
			setTimeout( () => {
				browser.notifications.clear(nid);
			},3000); // hide notification after 3 seconds
		}
	}
	return ret;
}

async function onStorageChange() {

  	toolbarAction = await getFromStorage('string', 'toolbarAction', 'cpyalllnk'); 
	showNotifications = await getFromStorage('boolean', 'showNotifications', true);
	noURLParams = await getFromStorage('boolean', 'noURLParams', false);

	browser.browserAction.setTitle({ title: manifest.commands[toolbarAction].description });

	let txt = toolbarAction[3] +''+ toolbarAction[6];
	txt = txt.toUpperCase();
	browser.browserAction.setBadgeText({text: txt });
}

(async ()=>  {

	// add the 4 context entries 
	let abbr = '';
	for(const cmd of Object.keys(manifest.commands)){
		abbr = " (" + cmd[3] + cmd[6] + ")";
		abbr = abbr.toUpperCase();
		browser.menus.create({
			id: ""+cmd,
			title: manifest.commands[cmd].description + abbr,
			contexts: ["browser_action"],
			onclick: (info) => {
				onCommand(info.menuItemId);
			}
		});
	}

	await onStorageChange();
	ready = true;
})();

browser.storage.onChanged.addListener(onStorageChange);
browser.commands.onCommand.addListener(onCommand);

// proxy toolbar button click 
browser.browserAction.onClicked.addListener( () => {
	onCommand(toolbarAction);
});

// add some slight transparancy
browser.browserAction.setBadgeBackgroundColor({color: [0,0,0, 115]});

// show the user the options page on first installation
browser.runtime.onInstalled.addListener( (details) => {
	if(details.reason === "install"){
		browser.tabs.create({
			url: "options.html"
		});
	}
});

