//const temporary = browser.runtime.id.endsWith('@temporary-addon'); // debugging?
browser.pageAction.onClicked.addListener(async (tab) => {
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
}); 
//setTimeout(function(){link.remove();},500);`});
