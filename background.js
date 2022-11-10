/* global browser */

async function copyTabsAsText(tabs){
        const text = tabs.map( t => t.url ).join('\n') + '\n\n';
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
                a.href = t.url;
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
	let qryObj, tabs, ret = false;
	switch(cmd){
		case 'allhtm':
			qryObj = {
			    hidden:false,
			    currentWindow:true
			};
			tabs  = await browser.tabs.query(qryObj);
			ret = copyTabsAsHtml(tabs);
			break;
		case 'alltxt':
			qryObj = {
			    hidden:false,
			    currentWindow:true
			};
			tabs  = await browser.tabs.query(qryObj);
			ret = copyTabsAsText(tabs);
			break;
		case 'selhtm':
			qryObj = {
			    highlighted: true,
			    hidden:false,
			    currentWindow:true
			};
			tabs  = await browser.tabs.query(qryObj);
			ret = copyTabsAsHtml(tabs);
			break;
		case 'seltxt':
			qryObj = {
			    highlighted: true,
			    hidden:false,
			    currentWindow:true
			};
			tabs  = await browser.tabs.query(qryObj);
			ret = copyTabsAsText(tabs);
			break;
		default:
			console.error('unknown command', cmd);
			break;
	}
	if(ret){
		browser.browserAction.disable();
		setTimeout( () => {
			browser.browserAction.enable();
		},300);
	}
	return ret;
}

browser.commands.onCommand.addListener(onCommand);

browser.runtime.onMessage.addListener(
    (data, sender) => {
	  if(typeof data.cmd === 'string'){
		return Promise.resolve(onCommand(data.cmd));
	  }
	  return false;
});


