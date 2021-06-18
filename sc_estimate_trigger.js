'use strict';
const conf = require('ocore/conf');
const dag = require('aabot/dag.js');
const aa_state = require('aabot/aa_state.js');
// ** Utils and other modules ** //
const oracle_utils = require('./sc_oracle_utils.js');
const bot_utils = require('./sc_bot_utils.js');

// ** estimate p2 and target_p2 ** //
async function p2 (curve_aa, stable_aas) {
	await aa_state.followAA(curve_aa);  // follow curve AA

	if ( stable_aas[curve_aa] ) {
		let stable_aas_array = Object.keys( stable_aas[curve_aa] );
		for await (let stable_aa of stable_aas_array) {
			await aa_state.followAA(stable_aa);  // follow stable AA
		}
	}	

	// ** get AA params and upcomming state vars ** //
	const params = await dag.readAAParams(curve_aa);  // aa params
	const vars = aa_state.getUpcomingAAStateVars(curve_aa); // aa upcoming state vars

	await aa_state.followAA(vars.fund_aa);  // follow fund AA
	await aa_state.followAA(vars.decision_engine_aa);  // follow DE AA
	/// ??? should I follow vars.governance_aa ??? ///

	// ** calculate actual p2 ** //
	if (!vars.supply1 || !vars.supply2 || !params.decimals1 || !params.decimals2 ) {
		//console.error('INFO: Missing data for AA: ', curve_aa, ' could not calculate actual P2.')
		return false
	}
	const s1 = vars.supply1 / (10 ** params.decimals1);
	const s2 = vars.supply2 / (10 ** params.decimals2);
	const p2_actual = params.n * (s1 ** params.m) * (s2 ** (params.n - 1));

	// ** calculate target p2 ** //
	if (!vars.rate_update_ts || !vars.growth_factor) {
		//console.error('INFO: Missing data for AA: ', curve_aa, ' could not calculate target P2.')
		return false
	}
	const oracle_price = await oracle_utils.getPrice(curve_aa, params);  // get oracle price
	if (!oracle_price) return false
	//
	let leverage = 0;
	if (params.leverage) leverage = params.leverage;
	//
	let interest_rate = 0.1 // 10%
	if (vars.interest_rate) interest_rate = vars.interest_rate 
	else if (params.interest_rate) interest_rate = params.interest_rate 
	//
	let timestamp = Math.floor(Date.now() / 1000)  // Date.now() converted to seconds
	let term = (timestamp - vars.rate_update_ts) / (360 * 24 * 3600); // in years
	//
	let growth_factor = vars.growth_factor * (1 + interest_rate) ** term;
	if (!growth_factor) {
		//console.error('INFO: Could not calculate Growth Factor for AA: ', curve_aa)
		return false
	}
	//
	const p2_target = oracle_price ** (leverage - 1) * growth_factor;

	// ** check if p2_actual > p2_target and trigger DE ** //
	if (p2_actual > p2_target) {
		console.error('INFO: Actual P2=', p2_actual, ' >  Target P2=', p2_target)
		let tolerance_pct = 0.01   // tolerance is 0.01% or 0.0001
		if (conf.p2_change_tolerance_pct) tolerance_pct = conf.p2_change_tolerance_pct
		let diff_pct = await bot_utils.calculateDifferenceAsPct(p2_actual, p2_target)
		if (diff_pct >= tolerance_pct) {  // change in p2 exceeds tolerance
			if (!vars.decision_engine_aa ) {
				//console.error('INFO: Missing DE address for AA: ', curve_aa, ' could not trigger DE.')
				return false
			}
			await dag.sendAARequest(vars.decision_engine_aa, {act: 1}); // trigger DE
			return {status: 'DE Triggered'}
		}
		else {
			console.error('INFO: DE not Triggered. Change in p2 does not exseed tolerance level.')
			return {status: 'DE not Triggered'}
		}
	}
	else {
		console.error('INFO: DE not Triggered. Actual P2=', p2_actual, ' < or =  Target P2=', p2_target)
		return {status: 'DE not Triggered'}
	}
	
	/// test starts
	///console.error('INFO: Actual P2=', p2_actual, ' < or =  Target P2=', p2_target)
	///await dag.sendAARequest(vars.decision_engine_aa, {act: 1}); // trigger DE
	///return true
	/// test ends 
}

exports.p2 = p2;