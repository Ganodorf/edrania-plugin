class HoverInfo
{
	constructor()
	{
		// Cache info to avoid loading the same content twice
		this.cache = [];
		this.ajaxRequest = null;
		this.playerItemsRequest = null;
		this.playerStatisticsRequest = null;
		this.playerProfileRequest = null;
		this.hoverTimeout = null;
		this.teamGameTeamRequests = [];

		// Init hover
		this.initHover();
	}

	/**
	 * Init hover listener
	 */
	initHover()
	{
		$('a').off('mouseenter mouseleave mousemove')
		.on('mouseenter', (event) => {
			// Wait 100 ms in case of user is hovering on multiple links in a short time
			this.hoverTimeout = setTimeout(() => {
				this.hover(event);
			}, 100);
		})
		.on('mouseleave', (event) => {
			clearTimeout(this.hoverTimeout);

			if (this.ajaxRequest !== null) {
				this.ajaxRequest.abort();
			}
			if (this.playerItemsRequest !== null) {
				this.playerItemsRequest.abort();
			}
			if (this.playerStatisticsRequest !== null) {
				this.playerStatisticsRequest.abort();
			}
			if (this.playerProfileRequest !== null) {
				this.playerProfileRequest.abort();
			}

			for (const request of this.teamGameTeamRequests) {
				request.abort();
			}

			$('.chrome-plugin-info-box').remove();
		})
		.on('mousemove', (event) => {
			// Update position of info box
			this.mouseX = event.pageX;
			this.mouseY = event.pageY;
			this.setBoxPosition();
		});
	}

	/**
	 * Init hover boxes for
	 */
	hover(event)
	{
		this.mouseX = event.pageX;
		this.mouseY = event.pageY;

		const $a = $(event.currentTarget);
		let href = $a.attr('href');
		let cacheHref = href;

		let type = '';

		// Check if link match weapon
		if (href.search('/Vendor/Display/') > -1 && edraniaConfig.hoverWeaponsActive) {
			type = 'weapon';
		}
		else if (href === '/MyGlad/Profile/Attributes' && edraniaConfig.hoverAttributesActive) {
			type = 'attributes';
		}
		else if (href.search('/Profile/View/') > -1 && edraniaConfig.hoverPlayerActive) {
			type = 'player';
			href += '/Arsenal'
		}
		else if (href.search(/\/TeamGame\/[\d]+\/Join/g) > -1 && edraniaConfig.hoverPlayerActive) {
			type = 'teamGameTeam';
		}

		if (type === '') {
			return false;
		}

		if (this.cache[cacheHref] !== undefined) {
			this.renderBox(this.cache[cacheHref]);
		}
		else if (type === 'player') {
			this.playerItemsRequest = $.get(href);
			this.playerStatisticsRequest = $.get(cacheHref + '/Stats');
			this.playerProfileRequest = $.get(cacheHref);

			$.when(this.playerItemsRequest, this.playerStatisticsRequest, this.playerProfileRequest).then((a1, a2, a3) => {
				const itemsHtml = a1[0];
				const statisticsHtml = a2[0];
				const profileHtml = a3[0];

				this.cache[cacheHref] = this.renderPlayerInfoBox(itemsHtml, statisticsHtml, profileHtml);
			});
		}
		else if (type === 'teamGameTeam') {
			this.loadTeamGameTeam($a, cacheHref);
		}
		else {
			this.ajaxRequest = $.get(href, (html) => {
				if (type === 'weapon') {
					this.cache[cacheHref] = this.renderWeaponInfoBox(html);
				}
				else if (type === 'attributes') {
					this.cache[cacheHref] = this.renderAttributesInfoBox(html);
				}
			});
		}
	}

	/**
	 * Render the box
	 */
	renderBox(content)
	{
		const $div = $('<div class="chrome-plugin-info-box">');

		$div.html(content);

		$('body').prepend($div);

		this.setBoxPosition();
	}

	/**
	 * Set position of box
	 */
	setBoxPosition()
	{
		const $div = $('.chrome-plugin-info-box');
		let top = this.mouseY + 20;
		let left = this.mouseX + 20;

		if (this.mouseY + $div.height() + 20 > window.innerHeight) {
			top = this.mouseY - $div.height() - 20;
			left = this.mouseX - $div.width() - 20;
		}

		$div.css({
			'top': top,
			'left': left
		})
	}

	/**
	 * Render weapon info box
	 */
	renderWeaponInfoBox(html)
	{
		let container = $(html).find('.container');

		// Remove things we dont want to show
		container.find('.nav-arrow, .description, br:first, br:last, img').remove();
		container = container.html();

		this.renderBox(container);

		return container;
	}

	/**
	 * Render attributes info box
	 */
	renderAttributesInfoBox(html)
	{
		let container = $(html).find('.container');
		// Remove go back link
		container.find('td').each(function(){
			if ($(this).html() === '0') {
				$(this).parents('tr').remove();
			}
		});
		container = container.html();

		this.renderBox(container);

		return container;
	}

	/**
	 * Render info about a player equipment
	 */
	renderPlayerInfoBox(itemsHtml, statisticsHtml, profileHtml)
	{
		const hardestHit = this.getHardestHit(statisticsHtml);
		const mostEvasions = $(statisticsHtml).find('.compact-table:nth(2) tbody tr:nth(2) td:nth(1)').html();
		const mostBlocks = $(statisticsHtml).find('.compact-table:nth(2) tbody tr:nth(3) td:nth(1)').html();
		const race = $(profileHtml).find('.col-lg-12 .container table tbody tr:nth(4) td').html();
		const level = $(profileHtml).find('.col-lg-12 .container table tbody tr:nth(7) td').html();
		const items = $(itemsHtml).find('.indent-2');
		const container = $('<div style="width: 500px;">').append(items);

		container.append(
			'<div><b>Högsta skada:</b> ' + hardestHit + '</div>' +
			'<div><b>Mest undvikningar:</b> ' + mostEvasions + '</div>' +
			'<div><b>Mest pareringar:</b> ' + mostBlocks + '</div>');

		if (race !== undefined) {
			container.prepend(
				'<div><b>Ras:</b> ' + race + ' (grad ' + level + ')</div>');
		}

		// Check if biography contains any plugin text
		const biography = $(profileHtml).find('.indent-1:nth(2)').html();
		if (biography !== undefined) {
			const regex = /(?<=\[plugin\])[\w\W]*(?=\[\/plugin\])/g;
			const matches = biography.match(regex);

			if (matches !== null) {
				const text = matches[0].replaceAll(/[<>]*/g, '').substring(0, 200);
				container.append('<div><b>Info:</b> ' + text + '</div>');
			}
		}

		this.renderBox(container);

		return container;
	}

	/**
	 * Load team game team highest damage
	 */
	loadTeamGameTeam($a, cacheHref)
	{
		const $ul = $a.parent().find('ul');
		this.teamGameTeamRequests = [];

		$ul.find('li').each((index, element) => {
			const href = $(element).find('a').attr('href') + '/Stats';
			this.teamGameTeamRequests.push($.get(href));
		});

		$.when(...this.teamGameTeamRequests).then((...results) => {
			this.renderTeamGameTeamBox(results);
		});
	}

	/**
	 * Render team game team hardest hit
	 */
	renderTeamGameTeamBox(results)
	{
		let hardestHit = 0;

		// 0 is an array if there are more than one member in the team
		if (Array.isArray(results[0])) {
			for (const result of results) {
				const hit = this.getHardestHit(result[0]);

				if (hit > hardestHit) {
					hardestHit = hit;
				}
			}
		}
		else {
			hardestHit = this.getHardestHit(results[0]);
		}

		if (hardestHit === undefined) {
			hardestHit = 0;
		}

		const html = '<b>Högsta skada i laget:</b> ' + hardestHit;

		this.renderBox(html);
	}

	/**
	 * Get hardest hit from html
	 */
	getHardestHit(html)
	{
		return $(html).find('.compact-table:nth(2) tbody tr:first td:nth(1)').html();
	}
}
