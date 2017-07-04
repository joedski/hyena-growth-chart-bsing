'use strict';

/*
Typical use of these functions:

import * as c from 'curves';
let sigmoid2 = c.lerp( c.quad, c.inv( c.quad ) );
let sigmoid2Piecewise = c.scaledFn( sigmoid2, 0, 25, 1, 13 );
 */

//////// Basic Functions

// These functions are all unscaled, and should all have:
// - domain of [0, 1]
// - range of [0, 1]

export function interpLinear( a, b, t ) {
	return (1 - t) * a + t * b;
}

export function linear( t ) {
	return t;
}

export function quad( t ) {
	return t * t;
}

export function cube( t ) {
	return t * t * t;
}

export function quart( t ) {
	let t2 = t * t;
	return t2 * t2;
}



//////// Higher Order Functions

export function interpWith( tfn ) {
	return function interpArb( a, b, t ) {
		return interpLinear( a, b, tfn( t ) );
	}
}

export function interp( fnInterp, fnA, fnB ) {
	return function interpAt( t ) {
		return fnInterp( fnA( t ), fnB( t ), t );
		// return lerp( fnA( t ), fnB( t ), fnInterp( 0, 1, t ) );
	}
}

export function lerp( fnA, fnB ) {
	return interp( interpLinear, fnA, fnB );
}

export function querp( fnA, fnB ) {
	let iqfn = lerp( quad, inv( quad ) );
	return interp( interpWith( iqfn ), fnA, fnB );
}

export function inv( fn ) {
	return function invFn( t ) {
		return 1 - fn( 1 - t );
	};
}

export function power( n ) {
	return function powerOf( t ) {
		return Math.pow( t, n );
	};
}

export function piecewise( fn ) {
	return function piecewiseAt( t ) {
		if( t <= 0 ) return 0;
		else if( t >= 1 ) return 1;
		else return fn( t );
	}
}



//////// Piecewise functions to use in graphs.

export function scaledFn( fn, t0, t1, f0, f1 ) {
	let tSpan = t1 - t0;
	let fSpan = f1 - f0;
	let pfn = piecewise( fn );
	return function sigmoidAt( t ) {
		let tScaled = (t - t0) / tSpan;
		return pfn( tScaled ) * fSpan + f0;
	}
}

// Padds the t-value out by the given proportion fracPadding.
// fracPadding = 1.2 would scale the t domain by 1.2.
export function scaledPaddedFn( fn, t0, t1, f0, f1, fracPadding ) {
	let tSpanUnscaled = t1 - t0;
	let tSpan = tSpanUnscaled * fracPadding;
	let tSpanDiff = (tSpan - tSpanUnscaled) / 2;
	let t0d = t0 - tSpanDiff;
	let t1d = t1 + tSpanDiff;
	return scaledFn( fn, t0d, t1d, f0, f1 );
}
