// import * as d3 from 'd3';

// import './bargraph-hori';
// import './bargraph-vert-with-data';

import * as g from './growth';
import * as d3 from 'd3';
import * as nv from 'nvd3';
import * as c from './curves';
// import { growthChart as createGrowthChart } from './growth-chart';
import { growthChart as createGrowthChart } from './growth-mass-chart';

const RESOLUTION = 1;
// const TIME_SPAN = 60; // 10 years.
const TIME_SPAN = 30 * 12; // 15 years.

function dataHyena( params ) {
	let i = 0;
	// Add one more item so we have both the first and last.
	let n = (TIME_SPAN * RESOLUTION);
	let res = [];
	// let tScale = 'tScale' in params ? params.tScale : 1;
	let t = i => TIME_SPAN * (i / n);
	let growthFn = g.monomolecular( params.A, params.A_L, params.S0, params.k, params.d );

	for( i = 0; i <= n; ++i ) {
		let ti = t( i );
		res.push({
			x: ti,
			// y: growthFn( ti )
			y: growthFn( ti ) * 100 // TEMP: Just comparing percents.
		});
	}

	return res;
}

function dataGeneral( params ) {
	let { fn } = params;
	let n = (TIME_SPAN * RESOLUTION);
	let t = i => TIME_SPAN * (i / n);
	let res = [];

	for( let i = 0; i <= n; ++i ) {
		let ti = t( i );
		res.push({
			x: ti,
			y: fn( ti ),
		});
	}

	return res;
}

let dataAvgFemale = dataHyena( g.HYENA_FEMALE );
let dataAvgMale = dataHyena( g.HYENA_MALE );
let dataDave = dataHyena( g.DAVE );
// let dataBabbies = dataHyena( g.BABBIES );

let percent = d3.scale.linear().domain([ 0, 1 ]).range([ 0, 100 ])

let babbiesMassCbrtScale = d3.scale.linear()
	// .domain([ g.BABBIES.S0, 1 ])
	.domain([ g.BABBIES.S0, g.BABBIES.A ])
	// 65 kg = 143 lbs
	.range([ Math.pow( g.BABBIES.m0, 1/3 ), Math.pow( g.BABBIES.mA, 1/3 ) ])
	;

let babbiesMassScale = c.comp( c.cube, babbiesMassCbrtScale );
let babbiesLinearGrowth = c.sum(
	g.monomolecular( g.BABBIES.A * 0.75, g.BABBIES.A_L, g.BABBIES.S0, g.BABBIES.k, g.BABBIES.d ),
	c.scaledPaddedFn(
		// c.querp( c.quad, c.inv( c.quart ) ),
		c.lerp( c.quad, c.inv( c.quart ) ),
		12, 8 * 12, 0, g.BABBIES.A * 0.07, // percent; 75% -> 85%
		1.5
	),
	c.scaledPaddedFn(
		c.querp( c.quad, c.inv( c.quart ) ),
		8 * 12, 14 * 12, 0, g.BABBIES.A * 0.13, // percent; 85% -> 95%
		1.5
	),
	c.scaledPaddedFn(
		c.lerp( c.quad, c.inv( c.quart ) ),
		13*12, 30*12, 0, g.BABBIES.A * 0.05, // percent; 95% -> 100%
		1.5
	)
);

let babbiesLinearGrowthNormalized = c.comp(
	d3.scale.linear().domain([ 0, g.BABBIES.A ]).range([ 0, 1 ]),
	babbiesLinearGrowth
);

let babbiesMassGrowth = c.comp( babbiesMassScale, babbiesLinearGrowth );

// let dataBabbies = dataGeneral({
// 	fn: babbiesLinearGrowth,
// });

// let curvesTest = dataGeneral({
// 	fn: c.scaledFn(
// 		// c.lerp( c.quad, c.inv( c.quad ) ),
// 		// c.lerp( c.quad, c.inv( c.quad ) ),
// 		c.lerp( c.quad, c.inv( c.quart ) ),
// 		10, TIME_SPAN - 10, 0, 100 // TEMP: Just comparing percents.
// 	),
// 	// fn: t => c.sum(
// 	// 	g.monomolecular( g.BABBIES.A, g.BABBIES.A_L, g.BABBIES.S0, g.BABBIES.k, g.BABBIES.d ),
// 	// ),
// });

let selChartCanvas = () => d3.select( '#hyena-chart-canvas' );
let chartSize = () => ({
	width: parseFloat( selChartCanvas().style( 'width' ) ),
	height: parseFloat( selChartCanvas().style( 'height' ) ),
});

let data = [
	// {
	// 	values: dataAvgMale,
	// 	key: "Average Male",
	// 	color: '#3390A5'
	// },
	// {
	// 	values: dataAvgFemale,
	// 	// key: "Average Female",
	// 	key: "Average Feral", // TEMP: Just comparing percents.
	// 	color: '#CE4050'
	// },
	// {
	// 	values: dataDave,
	// 	key: "Dave",
	// 	color: '#E09655'
	// },
	{
		// values: dataBabbies,
		// values: dataGeneral({ fn: babbiesLinearGrowth }),
		values: dataGeneral({ fn: c.comp( percent, babbiesLinearGrowthNormalized ) }),
		key: "Normalized Linear Growth",
		// color: '#73B26B'
		color: '#CE4050'
	},
	{
		values: dataGeneral({ fn: babbiesMassGrowth }),
		bar: true,
		key: "Mass",
		color: '#3390A5',
	},
	// {
	// 	values: curvesTest,
	// 	key: "Curves Test",
	// 	color: '#821C68',
	// }
];

let growthChart = createGrowthChart({
	selection: selChartCanvas(),
	// forceY: [ 0, 1.2 ],
	forceY: [ 0, 110 ],
});

nv.addGraph( function() {
	let chart = growthChart.init( data ).getChart();

	nv.utils.windowResize( () => growthChart.update() );

	return chart;
});

function logSize( chart ) {
	// let size = {
	// 	width: chart.width(),
	// 	height: chart.height(),
	// };
	let size = chartSize();
	let margin = { ...chart.margin() };
	// since the chart takes up the entire SVG area, we can just use the margins the chart specifies
	// with the SVG canvas's size to determine the bounds of the chart graphics.
	// Unfortunately, I don't see a good way to extract the calculated x and y bounding values,
	// so those have to be determined by the data we have along with the forced range.

	console.log( `Chart is ${ size.width } wide by ${ size.height } tall.` );
	console.log( `Chart data is ${ size.width - (margin.left || 0) - (margin.right || 0) } wide by ${ size.height - (margin.top || 0) - (margin.bottom || 0) } tall.` );
	console.log( `Margins:`, JSON.stringify( margin ) );
}
