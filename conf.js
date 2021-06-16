/*jslint node: true */
"use strict";

// these can be overridden with conf.json file in data folder
exports.deviceName = 'Obyte Stablecoin V2 Trigger Bot';
exports.bLight = true;
exports.hub = process.env.testnet ? 'obyte.org/bb-test' : 'obyte.org/bb';
exports.bNoPassphrase = true;
exports.bIgnoreUnpairRequests = true;
exports.payout_address = ''; // where Bytes can be moved manually.
exports.admin_email = '';
exports.from_email = '';
//
exports.base_aas = ['3DGWRKKWWSC6SV4ZQDWEHYFRYB4TGPKX', 'CD5DNSVS6ENG5UYILRPJPHAB3YXKA63W']; 
exports.factory_aas = ['CX56T625MQDCRCQTJGYZYYWUAMCEZT2Q','YSVSAICPH5XOZPZL5UVH56MVHQKMXZCM'];
exports.interval = 1; // 60; // 60 seconds;
exports.data_feed_change_tolerance_pct = 0.0000001;
exports.p2_change_tolerance_pct = 0.0000001;
// do not change
exports.bSingleAddress = true;  // set to true in stablecoin-t1-arbitrage config
exports.bStaticChangeAddress = true; 
// prarms set in stablecoin-t1-arbitrage config & bot-example
exports.storage = 'sqlite';
exports.permanent_pairing_secret = '*'; // * allows to pair with any code
exports.control_addresses = [''];
exports.KEYS_FILENAME = 'keys.json';
//
console.log('finished conf');
