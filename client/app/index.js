// import * as d3 from 'd3';

// import './bargraph-hori';
// import './bargraph-vert-with-data';

import * as g from './growth';
import * as d3 from 'd3';
import * as nv from 'nvd3';
import { growthChart as createGrowthChart } from './growth-chart';

const RESOLUTION = 1;
const TIME_SPAN = 60; // 10 years.

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

let dataAvgFemale = dataHyena( g.HYENA_FEMALE );
// let dataAvgMale = dataHyena( g.HYENA_MALE );
let dataDave = dataHyena( g.DAVE );
let dataBabbies = dataHyena( g.BABBIES );

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
	{
		values: dataAvgFemale,
		// key: "Average Female",
		key: "Average Feral", // TEMP: Just comparing percents.
		color: '#CE4050'
	},
	{
		values: dataDave,
		key: "Dave",
		color: '#E09655'
	},
	{
		values: dataBabbies,
		key: "Amanda + Leday?",
		color: '#73B26B'
	}
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
