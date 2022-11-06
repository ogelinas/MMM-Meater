/* global Module */

/* Magic Mirror
 * Module: MMM-Meater
 *
 * By {{AUTHOR_NAME}}
 * {{LICENSE}} Licensed.
 */

Module.register("MMM-Meater", {
	defaults: {
		updateInterval: 1000*60*2,
		token: "",
		temperature: "celcius",
		language: "en",
		retryDelay: 5000
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		this.addFilters();
		var self = this;
		var devices = [];
		var dataRequest = null;
		var dataNotification = null;

		//Flag for check if module is loaded
		this.loaded = false;

		// Schedule update timer.
		this.getData();
		setInterval(function() {
			self.updateDom();
		}, this.config.updateInterval);
	},

	/*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */
	getData: function() {
		var self = this;

		var urlApi = "https://public-api.cloud.meater.com/v1/devices";
		var retry = true;

		var dataRequest = new XMLHttpRequest();
		dataRequest.open("GET", urlApi, true);
		dataRequest.setRequestHeader('Authorization', 'Bearer ' +  self.config.token);
		dataRequest.setRequestHeader('Accept-Language', this.config.language);
		dataRequest.onreadystatechange = function() {
			console.log(this.readyState);
			if (this.readyState === 4) {
				console.log(this.status);
				if (this.status === 200) {
					self.processData(JSON.parse(this.response));
				} else if (this.status === 401) {
					this.deives = [];
					self.updateDom(self.config.animationSpeed);
					Log.error(self.name, this.status);
					retry = false;
				} else {
					this.deives = [];
					Log.error(self.name, "Could not load data.");
				}
				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		dataRequest.send();
	},

	/**
     * @function getTemplate
     * @description Nunjuck template.
     * @override
     *
     * @returns {string} Path to nunjuck template.
     */
	 getTemplate() {
        return 'templates/MMM-Meater.njk';
    },

	/**
     * @function getTemplateData
     * @description Data that gets rendered in the nunjuck template.
     * @override
     *
     * @returns {object} Data for the nunjuck template.
     */
	 getTemplateData() {
		return {
			loading: this.loading,
			config: this.config,
			devices: this.devices,
		};
    },


	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		var self = this;
		setTimeout(function() {
			self.getData();
		}, nextLoad);
	},

	getScripts: function() {
		return [];
	},

	getStyles: function () {
		return [
			"font-awesome.css",
			"MMM-Meater.css",
		];
	},

	// Load translations files
	getTranslations: function() {
		//FIXME: This can be load a one file javascript definition
		return {
			en: "translations/en.json",
			fr: "translations/fr.json"
		};
	},

	processData: function(data) {
		var self = this;
		this.dataRequest = data;
		if (this.loaded === false) { self.updateDom(self.config.animationSpeed) ; }
		this.loaded = true;

		console.log(data);
		if (data) {
			this.devices = data.data.devices;
		} else {
			this.devices = [];
		}

		// the data if load
		// send notification to helper
		this.sendSocketNotification("MMM-Meater-NOTIFICATION_TEST", data);
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === "MMM-Meater-NOTIFICATION_TEST") {
			// set dataNotification
			this.dataNotification = payload;
			this.updateDom();
		}
	},

	pad: function(num, size) {
		num = num.toString();
		while (num.length < size) num = "0" + num;
		return num;
	},

	/**
		 * @function addFilters
		 * @description Adds the filter used by the nunjuck template.
		 *
		 * @returns {void}
		 */
	addFilters() {
		this.nunjucksEnvironment().addFilter('timestamp_to_time', (timestamp) => {
			var date = new Date(null);
			date.setSeconds(timestamp); 
			return date.toISOString();
		});
		this.nunjucksEnvironment().addFilter('datetimeformat', (time, format) => {
			date = new Date(time);
			return moment(date).format(format);
		});
		this.nunjucksEnvironment().addFilter('convert_temperature', (temperature, unit) => {
			if (unit === "fahrenheit") {
				return (temperature * 9 / 5) + 32;
			} else {
				return temperature;
			}
		});
		this.nunjucksEnvironment().addFilter('secondsToHms', (seconds) => {
			d = Number(seconds);
			if (d >= 0) {
				var h = Math.floor(d / 3600);
				var m = Math.floor(d % 3600 / 60);
				var s = Math.floor(d % 3600 % 60);

				var hDisplay = h > 0 ? h + "h" : "";
				var mDisplay = m > 0 ? (h > 0  ? this.pad(m, 2)  + "m" : m + "m") : "";
				var sDisplay = s > 0 && h == 0 ? (m > 0 ? this.pad(s, 2) + "s" : s + "s" ) : "";
				return hDisplay + mDisplay + sDisplay; 
			} else {
				return "N/A";
			}
		});
		this.nunjucksEnvironment().addFilter('text_to_key', (text) => {
			
			switch(text) {
				case "Not Started":
					return "STATUS_NOT_STARTED";
				case "Configured":
					return "STATUS_CONFIGURED";
				case "Started":
					return "STATUS_STARTED";
				case "Ready For Resting":
					return "STATUS_READY_FOR_RESTING";
				case "Resting":
					return "STATUS_RESTING";
				case "Slightly Underdone":
					return "STATUS_SLIGHTLY_UNDERDONE";
				case "Finished":
					return "STATUS_FINISHED";
				case "Slightly":
					return "STATUS_SLIGHTLY";
				case "Overdone":
					return "STATUS_OVERDONE";
				case "OVERCOOK!":
					return "STATUS_OVERCOOK";
				default:
					return null;
			}
		});
	},

});
