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

/**
 * Create a function of time which returns the linear growth value at that
 * particular time using a basic monomolecular growth model, basically an upside
 * down backwards exponential graph.
 *
 * Note that time here is measured in months.
 *
 * @param  {number} A
 *         Top asymptote, the maximum value that the graph tends towards.
 *         Since this is a linear growth scale, it's useful to set it to 1.
 * @param  {number} A_L
 *         Lower bounds.  Usually 0.
 * @param  {number} S0
 *         Initial linear size, relative to A.
 * @param  {number} k
 *         Time scale.
 *         Given k=~0.135, S0=~0.205, A_L = 0, A = 1,
 *         then f(t=20)=~0.95 and f(t=35)=~0.99.
 * @param  {number} d
 *         Time dilation factor.
 * @return {Function} A function of time in months that returns a linear factor
 *                    of growth at that given time.
 */
export function monomolecular( A, A_L, S0, k, d ) {
	let B = B0( A, A_L, S0 );
	return function growthAt( t ) {
		return A * (1 - B * Math.exp(-k * t / d));
	};
}

/**
 * A k value that, in the basic monomolecular function above,
 * Given k=~0.135, S0=~0.205, A_L = 0, A = 1,
 * then f(t=20)=~0.95 and f(t=35)=~0.99.
 * @type {Number}
 */
const MONOMOLECULAR_95_T1_K = 0.135662;

export function monomolecular95t1( A, A_L, S0, t95 ) {
  return monomolecular( A, A_L, S0, MONOMOLECULAR_95_T1_K, t95 / 20 );
}
