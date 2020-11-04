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
				$('.chrome-plugin-info-box').remove();
			})
			.on('mousemove', function(event){
				// Update position of info box
				$('.chrome-plugin-info-box').css({
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

		let type = '';

		// Check if link match weapon
		if (href.search('/Vendor/Display/') > -1 && edraniaConfig.hooverWeaponsActive) {
			type = 'weapon';			
		}
		else if (href === '/MyGlad/Profile/Attributes' && edraniaConfig.hooverAttributesActive) {
			type = 'attributes';
		}

		if (type === '') {
			return false;
		}

		if (this.cache[href] !== undefined) {
			if (type === 'weapon') {
				this.renderWeaponInfoBox(this.cache[href], true);
			}
			else if (type === 'attributes') {
				this.renderAttributesInfoBox(this.cache[href], true);
			}
		}
		else {
			this.isLoading = true;
			$.get(href, (html) => {
				if (type === 'weapon') {
					this.cache[href] = this.renderWeaponInfoBox(html, false);
				}
				else if (type === 'attributes') {
					this.cache[href] = this.renderAttributesInfoBox(html, false);
				}
				this.isLoading = false;
			});
		}
	}

	/**
	 * Render the box
	 */
	renderBox(content)
	{
		const $div = $('<div class="chrome-plugin-info-box">');

		$div.css({
			'top': this.mouseY + 20,
			'left': this.mouseX + 20
		})
		.html(content);

		$('body').prepend($div);
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
			// Remove things we dont want to show
			container.find('.nav-arrow, .description, br:first, br:last').remove();
			container = container.html();
		}

		this.renderBox(container);

		return container;
	}

	/**
	 * Render attributes info box
	 */
	renderAttributesInfoBox(html, fromCache)
	{
		let container;

		if (fromCache) {
			container = html;
		}
		else {
			container = $(html).find('.container');
			// Rremove go back link
			container.find('td').each(function(){
				if ($(this).html() === '0') {
					$(this).parents('tr').remove();
				}
			});
			container = container.html();
		}

		this.renderBox(container);

		return container;
	}
}