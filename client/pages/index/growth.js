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
	m0: 1.5,
	mA: 70,
};

export const HYENA_MALE = {
	k: 0.135662,
	S0: 0.205253,
	// A: 0.991758,
	A: 0.991758 / 1.05, // when comparing percents.
	A_L: 0,
	d: 1,
	m0: 1.5,
	mA: 65,
};

export const DAVE = {
	k: 0.135662,
	S0: 0.205253,
	// A: 1.03,
	// A: 1.05,
	A: 1, // TEMP: Just comparing percents.
	A_L: 0,
	d: 2, // Dave and his ilk reach maturity at about 6 y/o rather than 3 y/o.
	m0: 1.5,
	mA: 70,
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
	mA: 90, // kg
};

export const HANDLE_T = 36;
