chrome.storage.sync.get('edraniaConfig', function(data){
	let edraniaConfig = data.edraniaConfig;
	if (edraniaConfig === undefined) {
		edraniaConfig = {};
	}

	function saveConfig()
	{
		const setting = this.name;

		let current = edraniaConfig[setting];
		if (current === undefined) {
			current = false;
		}

		edraniaConfig[setting] = current ? false : true;

		chrome.storage.sync.set({'edraniaConfig': edraniaConfig});
	}

	const elements = document.getElementsByClassName('js-set-config');

	for (let i = 0; i < elements.length; i++) {
		if (data.edraniaConfig[elements[i].name]) {
			elements[i].checked = true;
		}

		elements[i].addEventListener('change', saveConfig);
	}
});