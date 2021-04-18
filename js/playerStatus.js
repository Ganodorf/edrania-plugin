class PlayerStatus
{
	constructor()
	{
		if ($('#gladStatus').length === 0) {
			return;
		}

		this.refreshTimeoutId = null;

		this.initAutoUpdateOnCharge();
		this.initHealthStatusTooltip();
	}

	refresh()
	{
		$('#gladStatus').trigger('click');
	}

	calculateTimeUntilNextCharge()
	{
		const currentDate = new Date();
		const minutesLeft = 2 - (currentDate.getMinutes() % 3);
		const secondsLeft = 60 - currentDate.getSeconds();

		return 1000 * (60 * minutesLeft + secondsLeft);
	}

	toHealthStatusLabel(healhPercentage)
	{
		if (healhPercentage < 11) {
			return "Kritisk";
		}
		if (healhPercentage < 40) {
			return "Allvarligt skadad";
		}
		if (healhPercentage < 60) {
			return "Halvskadad";
		}
		if (healhPercentage < 90) {
			return "Lätt skadad";
		}
		if (healhPercentage < 100) {
			return "Skråmor";
		}
		
		return "Frisk";
	}

	calculateChargesUntilFullHealth(healthPercentage)
	{
		if (healthPercentage < 30) {
			return 3;
		}
		if (healthPercentage < 65) {
			return 2;
		}
		if (healthPercentage < 100) {
			return 1;
		}

		return 0;
	}

	updateHealthStatusTooltip()
	{
		const $healthStatus = $('#gladStatHealth');
		const healthStatus = $healthStatus.text();
		const [currentHealth, maxHealth] = healthStatus.split('/').map(parseInteger);
		const healthPercentage = 100 * currentHealth / maxHealth;
		const healthStatusLabel = this.toHealthStatusLabel(healthPercentage);
		const titleParts = [healthStatusLabel];

		if (healthPercentage < 100) {
			const chargesUntilFullHealth =
				this.calculateChargesUntilFullHealth(healthPercentage);
			const fullHealthDate = new Date(
				Date.now() + this.calculateTimeUntilNextCharge()
			);
			fullHealthDate.setMinutes(
				fullHealthDate.getMinutes() + 3 * (chargesUntilFullHealth - 1)
			);
			const fullHealthTimestamp = new Intl.DateTimeFormat(
				'sv-SE', {timeStyle: 'short'}
			).format(fullHealthDate);

			titleParts.push(
				`(${chargesUntilFullHealth} ladd – ${fullHealthTimestamp})`
			);
		}
		
		$healthStatus.attr('title', titleParts.join(' '));
	}

	initHealthStatusTooltip()
	{
		this.updateHealthStatusTooltip();
		new EdraniaObserver($('#gladStatHealth')[0], () => {
			this.updateHealthStatusTooltip()
		});
	}

	initAutoUpdateOnCharge()
	{
		this.startAutoUpdateOnCharge();
		this.handlePageFocusChange();
	}

	startAutoUpdateOnCharge()
	{
		// Wait an extra second just to be on the safe side
		const getRefreshDelay = () => this.calculateTimeUntilNextCharge() + 1000;
		const refreshOnSchedule = () => {
			this.refresh();
			this.refreshTimeoutId = setTimeout(refreshOnSchedule, getRefreshDelay());
		};

		this.refreshTimeoutId = setTimeout(refreshOnSchedule, getRefreshDelay());
	}

	stopAutoUpdateOnCharge()
	{
		clearTimeout(this.refreshTimeoutId);
	}

	handlePageFocusChange()
	{
		$(window).on('focus', () => {
			this.refresh();
			this.startAutoUpdateOnCharge();
		})
		$(window).on('blur', () => {
			this.stopAutoUpdateOnCharge();
		})
		$(document).on('visibilitychange', () => {
			if (document.visibilityState === 'visible') {
				this.refresh();
				this.startAutoUpdateOnCharge();
			} else {
				this.stopAutoUpdateOnCharge();
			}
		});
	}
}
