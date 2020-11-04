class HooverInfo
{
	constructor()
	{
		// Cache info to avoid 
		this.cache = [];
		this.isLoading = false;

		// Init hoover
		$('a').on('mouseenter', (event) => {this.hoover(event)})
			.on('mouseleave', function(event){
				$('.js-hoover-info').remove();
			})
			.on('mousemove', function(event){
				// Update position of info box
				$('.js-hoover-info').css({
					'top': event.pageY + 20,
					'left': event.pageX + 20,
				});
			});
	}

	/**
	 * Init hoover boxes for 
	 */
	hoover(event)
	{
		// Avoid fetching multiple pages on the same time
		if (this.isLoading) {
			return false;
		}

		this.mouseX = event.pageX;
		this.mouseY = event.pageY;

		const $a = $(event.currentTarget);
		const href = $a.attr('href');

		// Check if link match weapon
		if (href.search('/Vendor/Display/') > -1) {
			if (this.cache[href] !== undefined) {
				this.renderWeaponInfoBox(this.cache[href], true);
			}
			else {
				this.isLoading = true;
				$.get(href, (html) => {
					this.cache[href] = this.renderWeaponInfoBox(html, false);
					this.isLoading = false;
				});
			}			
		}
	}

	/**
	 * Render weapon info box
	 */
	renderWeaponInfoBox(html, fromCache)
	{
		let container;

		if (fromCache) {
			container = html;
		}
		else {
			container = $(html).find('.container');
			// Rremove go back link
			container.find('.nav-arrow, .description, br:first, br:last').remove();
			container = container.html();
		}

		const $div = $('<div class="js-hoover-info">');

		$div.css({
			'position': 'absolute',
			'background': '#fff',
			'padding': '5px',
			'border': '1px solid black',
			'border-radius': '3px',
			'top': this.mouseY + 20,
			'left': this.mouseX + 20,
			'z-index': 1000
		})
		.html(container);

		$('body').prepend($div);

		return container;
	}
}