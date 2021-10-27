(async function () {

		// get current activ tab
		const tabs = await browser.tabs.query({active: true, currentWindow: true});

		if (            !Array.isArray(tabs) ) { throw 'tabs query return no array'; }
		if (                 tabs.length < 1 ) { throw 'tabs length is less than 1'; }
		if ( typeof tabs[0].url !== 'string' ) { throw 'tab.url is not a string';    }

		console.log(tabs[0].url, tabs[0].title);

		const link = document.getElementById('link');

		link.href = tabs[0].url 
		link.textContent = tabs[0].title;

		var range = document.createRange();
		range.selectNode(link);
		document.getSelection().addRange(range);
		document.execCommand("copy");

		window.close();
}());


