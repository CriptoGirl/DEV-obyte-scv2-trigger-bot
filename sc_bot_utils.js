'use strict';
const device = require('ocore/device.js');
const conf = require('ocore/conf');

// ** calculate pct diff ** //
async function calculateDifferenceAsPct (old_value, new_value) {
	let average = (old_value + new_value) / 2
	let diff = Math.abs(old_value - new_value)	
	let diff_pct = (diff / average) * 100
	return diff_pct;
}

// ** send message to all paired bots ** //
async function sendMessage (message, paired_bots) {
	console.error(message);
	for (let user_address of paired_bots) {
		device.sendMessageToDevice(user_address, 'text', message);
	}
	return
}

// ** send greeting messages and check parms when user pairs with the bot ** //
function paired (user_address) {
	device.sendMessageToDevice(user_address, 'text', "Welcome to Obyte Stablecoin V2 bot!");
	device.sendMessageToDevice(user_address, 'text', "Type `operator` to get operator address ");
	// ** check config ** //
	if (!conf.base_aas) device.sendMessageToDevice(user_address, 'text', 
		"Error: missing list of base AAs from the config.");
}

// ** respond to user's message ** //
function respond (user_address, text, operator_address) {
	//analyze the text and respond
	text = text.trim();
	// user send operator command
	if ( text.match(/^operator/) )
		device.sendMessageToDevice(user_address, 'text', "Operator: " + operator_address);
	else if ( text.match(/^params/) ) {
		let base_aas = conf.base_aas, base_aas_list = "base_aas: "
		for (let base_aa of base_aas) {
			base_aas_list += base_aa + ' '
		}
		device.sendMessageToDevice( user_address, 'text', base_aas_list );
		
		let factory_aas = conf.factory_aas, factory_aas_list = "factory_aas: "
		for (let factory_aa of factory_aas) {
			factory_aas_list += factory_aa + ' '
		}
		device.sendMessageToDevice( user_address, 'text', factory_aas_list );

		device.sendMessageToDevice( user_address, 'text', 
			"interval: " + conf.interval );
		
		device.sendMessageToDevice( user_address, 'text', 
			"data_feed_change_tolerance_pct: " + 
			conf.data_feed_change_tolerance_pct + '%' );
		device.sendMessageToDevice( user_address, 'text', 
			"p2_change_tolerance_pct: " + 
			conf.p2_change_tolerance_pct + '%' );
	}
	else 
		device.sendMessageToDevice(user_address, 'text', 
			"Unknown command.  Type `operator` to see operator address or `parms` to see list of bot parameters." );
}

exports.sendMessage = sendMessage;
exports.paired = paired;
exports.respond = respond;
exports.calculateDifferenceAsPct = calculateDifferenceAsPct;