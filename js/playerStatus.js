class PlayerStatus
{
	constructor()
	{
		this.refreshTimeoutId = null;

		this.initAutoUpdateOnCharge();
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
