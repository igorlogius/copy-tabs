//const temporary = browser.runtime.id.endsWith('@temporary-addon'); // debugging?
browser.pageAction.onClicked.addListener((tab) => {
	browser.tabs.executeScript({ code: `var link = document.createElement('a');
link.href = window.location.href;
link.textContent = document.title;
document.body.appendChild(link);
document.getSelection().removeAllRanges();
var range = document.createRange();
range.selectNode(link);
document.getSelection().addRange(range);
document.execCommand("copy");
setTimeout(function{link.remove();},1500);`});
}); 
