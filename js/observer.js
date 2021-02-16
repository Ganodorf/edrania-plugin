class EdraniaObserver
{
	constructor(element, callback)
	{
		const config = {
			childList: true,
			subtree: true
		};

		const observer = new MutationObserver(callback);
		observer.observe(element, config);
	}
}