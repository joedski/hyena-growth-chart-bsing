// http://file.scirp.org/Html/2-2860008_38842.htm
// http://file.scirp.org/Html/2-2860008/ce596e0b-c8d1-4209-990a-edb3fb5d8147.jpg

// Monomolecular.  It's basically the lesser side of an exponential graph flipped upside down. (1 - exp(-t))
// A - Top asymptote
// k - ... something.  A tweak parameter I guess.
// B - Derived value..?  For monomolecular it's in the domain of (0, 1)
//     Looking at the math, if it's not 1 then we don't reach full growth of A.

// From calc:
// define B0( A, A_L, S ) = 1 - (S - A_L) / (A - A_L)
// define k( t, S, A, A_L, B ) = (- ln( (1 - (S - A_L) / (A - A_L)) / B ) / t)
// define monomolecular( t, A, A_L, B, k ) = A_L + (A - A_L) * (1 - B * exp(-k * t))

function B0( A, A_L, S0 ) {
	return 1 - (S0 - A_L) / (A - A_L);
}

export function monomolecular( A, A_L, S0, k, d ) {
	let B = B0( A, A_L, S0 );
	return function growthAt( t ) {
		return A * (1 - B * Math.exp(-k * t / d));
	};
}

// Some average hyenas.
// BSed off of the growth chart from here. http://jmammal.oxfordjournals.org/content/94/6/1298
// Thes evalues are for t in months.

// handleT: t value indicating where the handle should be placed.
//   Also used to calculate the whole-graph scale values.

export const HYENA_FEMALE = {
	k: 0.135662,
	S0: 0.205253,
	A: 1.0,
	// A: 1.0/1.05,
	A_L: 0,
	d: 1,
};

export const HYENA_MALE = {
	k: 0.135662,
	S0: 0.205253,
	// A: 0.991758,
	A: 0.991758 / 1.05, // when comparing percents.
	A_L: 0,
	d: 1
};

export const DAVE = {
	k: 0.135662,
	S0: 0.205253,
	// A: 1.03,
	// A: 1.05,
	A: 1, // TEMP: Just comparing percents.
	A_L: 0,
	d: 2, // Dave and his ilk reach maturity at about 6 y/o rather than 3 y/o.
};

export const BABBIES = {
	k: 0.135662,
	S0: 0.205253,
	// A: 1.05,
	// A: 0.75, // TEMP: Just comparing percents.
	A: 1.1,
	A_L: 0,
	d: 0.6, // Dave and his ilk reach maturity at about 6 y/o rather than 3 y/o.
	m0: 1.5, // kg
	mA: 70 * 1.1, // kg
};

export const HANDLE_T = 36;
