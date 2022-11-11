/* global browser */

const manifest = browser.runtime.getManifest();
const extname = manifest.name;

function getTimeStampStr() {
    const d = new Date();
    let ts = "";
    [   d.getFullYear(), d.getMonth()+1, d.getDate()+1,
        d.getHours(), d.getMinutes(), d.getSeconds()].forEach( (t,i) => {
        ts = ts + ((i!==3)?"-":"_") + ((t<10)?"0":"") + t;
    });
    return ts.substring(1);
}

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

async function saveTabsAsText(tabs){
        const text = tabs.map( t => t.url ).join('\n') + '\n';
	try {
		let link = document.createElement('a');
		link.style.display = 'none';
		const href = 'data:plain/text;charset=utf-8,' + encodeURIComponent(text);
		link.setAttribute('href', href);
		link.setAttribute('target','_blank');
		link.setAttribute('download', getTimeStampStr() + ' ' + extname + '.txt');
		document.body.append(link);
		link.click();
		setTimeout(()=>{link.remove()},3000);
		return true;
	}catch(e){
		console.error(e);
	}
	return false;
}

async function saveTabsAsHtml(tabs){
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
	    const text = div.innerHTML;
	    let link = document.createElement('a');
	    link.style.display = 'none';
	    const href = 'data:text/html;charset=utf-8,' + encodeURIComponent(text);
	    link.setAttribute('href', href);
	    link.setAttribute('target','_blank');
	    link.setAttribute('download', getTimeStampStr() + ' ' + extname + '.txt');
	    document.body.append(link);
	    link.click();
	    setTimeout(()=>{link.remove()},3000);
            div.remove();
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
	// action  cpy|sav
	// amount  sel|all
	// output  txt|htm
	switch(cmd){
		case 'cpyallhtm':
			qryObj = {
			    hidden:false,
			    currentWindow:true
			};
			tabs  = await browser.tabs.query(qryObj);
			ret = copyTabsAsHtml(tabs);
			break;
		case 'cpyalltxt':
			qryObj = {
			    hidden:false,
			    currentWindow:true
			};
			tabs  = await browser.tabs.query(qryObj);
			ret = copyTabsAsText(tabs);
			break;
		case 'cpyselhtm':
			qryObj = {
			    highlighted: true,
			    hidden:false,
			    currentWindow:true
			};
			tabs  = await browser.tabs.query(qryObj);
			ret = copyTabsAsHtml(tabs);
			break;
		case 'cpyseltxt':
			qryObj = {
			    highlighted: true,
			    hidden:false,
			    currentWindow:true
			};
			tabs  = await browser.tabs.query(qryObj);
			ret = copyTabsAsText(tabs);
			break;
		case 'savalltxt':
			qryObj = {
			    hidden:false,
			    currentWindow:true
			};
			tabs  = await browser.tabs.query(qryObj);
			ret = saveTabsAsText(tabs);
			break;
		case 'savseltxt':
			qryObj = {
			    highlighted: true,
			    hidden:false,
			    currentWindow:true
			};
			tabs  = await browser.tabs.query(qryObj);
			ret = saveTabsAsText(tabs);
			break;
		case 'savallhtm':
			qryObj = {
			    hidden:false,
			    currentWindow:true
			};
			tabs  = await browser.tabs.query(qryObj);
			ret = saveTabsAsHtml(tabs);
			break;
		case 'savselhtm':
			qryObj = {
			    highlighted: true,
			    hidden:false,
			    currentWindow:true
			};
			tabs  = await browser.tabs.query(qryObj);
			ret = saveTabsAsHtml(tabs);
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
    (data /*, sender*/) => {
	  if(typeof data.cmd === 'string'){
		return Promise.resolve(onCommand(data.cmd));
	  }
	  return false;
});

