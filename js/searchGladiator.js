const DefaultValue = Object.freeze({
	name: "",
	username: "",
	clan: "",
	race: "5",
	"min-level": "1",
	"max-level": "99",
	age: "4"
});

class SearchGladiator {
	constructor() 
	{
		this.filter = {};
		this.fieldByName = {
			name: $('#GladiatorName'),
			username: $('#Username'),
			clan: $('#ClanName'),
			race: $('#Race'),
			'min-level': $('#MinimumLevel'),
			'max-level': $('#MaximumLevel'),
			age: $('#Age'),
		};
		this.$reset = this.createFilterReset();

		this.initPersistentFilter();
		this.initFilterReset();
	}

	persistFilterInURL() 
	{
		const url = new URL(window.location.href);
		const queryParameters = new URLSearchParams(url.search);
		Object.entries(this.filter).forEach(([key, value]) => {
			if (value !== DefaultValue[key]) {
				queryParameters.set(key, value);
			}
			else {
				queryParameters.delete(key);
			}
		});
		url.search = queryParameters;
		history.replaceState(null, '', url.toString());
	}

	readFilterFromURL() 
	{
		const url = new URL(window.location.href);
		const queryParameters = new URLSearchParams(url.search);
		[...queryParameters.entries()]
			.filter(([key, value]) => value !== DefaultValue[key])
			.forEach(([key, value]) => {
				this.filter[key] = value;
			});
	}

	resetFilter()
	{
		this.setFieldValues(DefaultValue);
	}

	createFilterReset()
	{
		return $('<input/>', {
			type: 'reset',
			value: 'Återställ',
			css: {
				display: 'none',
				marginLeft: '4px'
			},
			click: (event) => {
				event.preventDefault();

				this.resetFilter();
			}
		});
	}

	setFieldValues(valueByName)
	{
		Object.entries(valueByName).forEach(([key, value]) => {
			this.fieldByName[key].val(value).trigger('change');
		});
	}

	initFilterReset()
	{
		$('#btnChallenge').after(this.$reset);
		this.updateResetVisibility();
	}

	updateResetVisibility()
	{
		const isDirty = Object.entries(this.fieldByName).some(
			([name, $field]) => {
				const value = $field.val();

				return typeof value !== "undefined" &&
					value !== DefaultValue[name];
			}
		);

		this.$reset.toggle(isDirty);
	}

	initPersistentFilter() {
		// Sync filter and URL
		if (window.window.location.search.length > 0) {
			this.readFilterFromURL();
			this.setFieldValues(this.filter);

			$('#centerContent form').submit();
		}
		else {
			Object.entries(this.fieldByName)
				.filter(([name, $field]) => {
					const value = $field.val();
					
					return (
						typeof value !== 'undefined' &&
						value.trim() !== DefaultValue[name]
					);
				})
				.forEach(([name, $field]) => {
					this.filter[name] = $field.val().trim();
				});

			this.persistFilterInURL();
		}
		
		// Sync filter changes to URL
		Object.entries(this.fieldByName).forEach(([name, $field]) => {
			$field.on('change', () => {
				this.filter[name] = $field.val().trim();
				this.persistFilterInURL();
				this.updateResetVisibility();
			});
		});
	}
}
