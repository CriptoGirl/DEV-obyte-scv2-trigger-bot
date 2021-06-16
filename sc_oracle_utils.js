'use strict';
const conf = require('ocore/conf');
const dag = require('aabot/dag.js');
const light_data_feeds = conf.bLight ? require('aabot/light_data_feeds.js') : null;

// ** update oracle data feed ** //
async function updateDataFeed (oracle, feed_name) {
	if (conf.bLight) {
		let updated = await light_data_feeds.updateDataFeed(oracle, feed_name, true);
		let message = 'INFO: Data feed: ' + feed_name + ' from Oracle: ' + oracle + ' updated.'
		if (updated) console.error(message)
	}
	return
}

// ** get oracle price ** //
async function getPrice (curve_aa, params) {
	if (!params.oracle1 || !params.feed_name1) {
		//console.error('INFO: Missing oracle data feed info for AA: ', curve_aa)
		return false
	}

	await updateDataFeed(params.oracle1, params.feed_name1);
	let price1 = await dag.getDataFeed(params.oracle1, params.feed_name1);
	if (!price1) {
		//console.error('INFO: Missing data feed price for: ', params.feed_name1, ' from: ', params.oracle1)
		return false
	}
	// ** calculate price based on 1st oracel data feed ** //
	let price = 1
	if (params.op1 === '/') price = price / price1 
	else price = price * price1
	// ** calculate price based on 2nd oracel data feed ** //
	if (params.oracle2 && params.feed_name2) {
		await updateDataFeed(params.oracle2, params.feed_name2);
		let price2 = await dag.getDataFeed(params.oracle2, params.feed_name2);
		if (price2) {
			if (params.op2 === '/') price = price / price2
			else price = price * price2
		}
	}
	// ** calculate price based on 3rd oracel data feed ** //
	if (params.oracle3 && params.feed_name3) {
		await updateDataFeed(params.oracle3, params.feed_name3);
		let price3 = await dag.getDataFeed(params.oracle3, params.feed_name3);
		if (price3) {
			if (params.op3 === '/') price = price / price3
			else price = price * price3
		}
	}
	return price;
}

exports.getPrice = getPrice;