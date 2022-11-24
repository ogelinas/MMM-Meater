/* Magic Mirror
 * Node Helper: MMM-Meater
 *
 * By {{AUTHOR_NAME}}
 * {{LICENSE}} Licensed.
 */

/**
 * @external logger
 * @see https://github.com/MichMich/MagicMirror/blob/master/js/logger.js
 */
 const Log = require('logger');

 const NodeHelper = require('node_helper');


/**
 * Derived team details of a game from API endpoint for easier usage.
 *
 * @typedef {object} Time
 * @property {number} elapsed - Time elapsed.
 * @property {number} remaining - Time remaining.
 */

/**
 * Derived team details of a game from API endpoint for easier usage.
 *
 * @typedef {object} TemperatureCook
 * @property {number} target - Time elapsed.
 * @property {number} peak - Time remaining.
 */

/**
 * Derived team details of a game from API endpoint for easier usage.
 *
 * @typedef {object} Cook
 * @property {string} id - Time elapsed.
 * @property {string} name - Time remaining.
 * @property {string} state - Time remaining.
 * @property {TemperatureCook} temperature - Time remaining.
 * @property {Time} time - Time remaining.
*/

/**
 * Derived team details of a game from API endpoint for easier usage.
 *
 * @typedef {object} Temperature
 * @property {number} internal - Time elapsed.
 * @property {number} ambient - Time remaining.
 */

/**
 * Derived team details of a game from API endpoint for easier usage.
 *
 * @typedef {object} Device
 * @property {number} id - Device identifier.
 * @property {Temperature} temperature - Full team name.
 * @property {Cook} cook - 3 letter team name.
 * @property {number} updated_at - Current score of the team.
 * @property {number} finish_at - Current score of the team.
 */

/**
 * Derived team details of a game from API endpoint for easier usage.
 *
 * @typedef {object} Devices
 * @property {Device} device - Device identifier.
 */

module.exports = NodeHelper.create({

	// Override socketNotificationReceived method.

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
	socketNotificationReceived: function(notification, payload) {
		if (notification === "MMM-Meater-NOTIFICATION_TEST") {
			// console.log("Working notification system. Notification:", notification, "payload: ", payload);
			// Send notification
            devices = this.parseDevices(payload.data.devices);
            payload.data.devices = devices;
			this.sendNotificationTest(this.anotherFunction()); //Is possible send objects :)
		}
	},

	// Example function send notification test
	sendNotificationTest: function(payload) {
		this.sendSocketNotification("MMM-Meater-NOTIFICATION_TEST", payload);
	},

	// this you can create extra routes for your module
	extraRoutes: function() {
		var self = this;
		this.expressApp.get("/MMM-Meater/extra_route", function(req, res) {
			// call another function
			values = self.anotherFunction();
			res.send(values);
		});
	},

	// Test another function
	anotherFunction: function() {
		return {date: new Date()};
	},

	/**
     * @function parseDevices
     * @description Transforms raw series information for easier usage.
     *
     * @param {object} devices - Raw series information.
     *
     * @returns {Devices} Parsed series information.
     */
	 parseDevices(devices = {}) {
        // console.log(devices);
        if (!devices || devices.length === 0) {
            return null;
        }
        d = [];
        for (let i = 0; i < devices.length; i++) {
            const device = devices[i];
            d.push(this.parseDevice(device));
        }
        return d
    },

	/**
     * @function parseDevice
     * @description Transforms raw series information for easier usage.
     *
     * @param {object} device - Raw series information.
     *
     * @returns {Device} Parsed series information.
     */
	 parseDevice(device = {}) {
        if (!device || device.length === 0) {
            return null;
        }
        return {
            id: device.id,
            temperature: this.parseTemperature(device.temperature),
			cook: this.parseCook(device.cook),
			updated_at: device.updated_at,
            finish_at:device.updated_at + 436,
        }
    },

	/**
     * @function parseTemperature
     * @description Transforms raw series information for easier usage.
     *
     * @param {object} temperature - Raw series information.
     *
     * @returns {Temperature} Parsed series information.
     */
	 parseTemperature(temperature = {}) {
        if (!temperature || temperature.length === 0) {
            return null;
        }
        return {
            internal: temperature.internal,
            ambient: temperature.ambient,
        }
    },

	/**
     * @function parseCook
     * @description Transforms raw series information for easier usage.
     *
     * @param {object} cook - Raw series information.
     *
     * @returns {Cook} Parsed series information.
     */
	 parseCook(cook = {}) {
        if (!cook || cook.length === 0) {
            return null;
        }
        return {
            id: cook.id,
            name: cook.name,
			state: cook.state,
			temperature: this.parseTemperatureCook(cook.temperature),
            time: this.parseTime(cook.time),
        }
    },

	/**
     * @function parseTemperatureCook
     * @description Transforms raw series information for easier usage.
     *
     * @param {object} temperature - Raw series information.
     *
     * @returns {TemperatureCook} Parsed series information.
     */
	 parseTemperatureCook(temperature = {}) {
        if (!temperature || temperature.length === 0) {
            return null;
        }
        return {
            target: temperature.target,
            peak: temperature.peak,
        }
    },

	/**
     * @function parseTime
     * @description Transforms raw series information for easier usage.
     *
     * @param {object} time - Raw series information.
     *
     * @returns {Time} Parsed series information.
     */
	 parseTime(time = {}) {
        if (!time || time.length === 0) {
            return null;
        }
        return {
            elapsed: time.elapsed,
            remaining: time.remaining,
        }
    },

});
