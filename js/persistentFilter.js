class PersistentFilter {
	constructor(fieldByName, defaultValueByName)
	{
		this.fieldByName = fieldByName;
		this.defaultValueByName = defaultValueByName;

		this.filter = {};
		this.$reset = this.createFilterReset();

		this.initPersistentFilter();
		this.initFilterReset();
	}

	persistFilterInURL()
	{
		const url = new URL(window.location.href);
		const queryParameters = new URLSearchParams(url.search);
		Object.entries(this.filter).forEach(([key, value]) => {
			if (value !== this.defaultValueByName[key]) {
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
			.filter(([key, value]) => value !== this.defaultValueByName[key])
			.forEach(([key, value]) => {
				this.filter[key] = value;
			});
	}

	resetFilter()
	{
		this.setFieldValues(this.defaultValueByName);
		this.applyFilter();
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
		$('#centerContent input[type="submit"]:last').after(this.$reset);
		this.updateResetVisibility();
	}

	applyFilter()
	{
		$('#centerContent input[type="submit"]:first').click();
	}

	updateResetVisibility()
	{
		const isDirty = Object.entries(this.fieldByName).some(
			([name, $field]) => {
				const value = $field.val();

				return typeof value !== "undefined" &&
					value !== this.defaultValueByName[name];
			}
		);

		this.$reset.toggle(isDirty);
	}

	initPersistentFilter() {
		// Sync filter and URL
		if (window.window.location.search.length > 0) {
			this.readFilterFromURL();
			this.setFieldValues(this.filter);
			this.applyFilter();
		}
		else {
			Object.entries(this.fieldByName)
				.filter(([name, $field]) => {
					const value = $field.val();

					return (
						typeof value !== 'undefined' &&
						value.trim() !== this.defaultValueByName[name]
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
