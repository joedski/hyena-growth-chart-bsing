import * as d3 from 'd3';
import * as nv from 'nvd3';

// This is a factory to gather all the nv related stuff into one place.
// All the interaction is haldled elsewhere.

export default function growthChart( options ) {
	options = Object.assign({
		// The element into which the chart will go.
		selection: null,
		forceY: null,
    xAxis: {
      label: "Age (months)",
      formatter() {
        return d3.format( '.02f' );
      },
    },
    yAxisMass: {
      label: "Approximate Body Mass",
      formatter() {
        const fmt = d3.format( '.01f' );
        return v => `${fmt( v )}kg`;
      },
    },
    yAxisLinear: {
      label: "Percent Linear Body Growth",
      formatter() {
        const fmt = d3.format( '.01f' );
        return v => `${fmt( v )}%`;
      },
    },
	}, options );

	if( ! options.selection ) {
		throw new Error( `growthChart must be provided a d3 element selection` );
	}

	let chart = null;
	let currentData = [];

	let chartObject = {
		init( initialData = [] ) {
			let chartOptions = {
				// duration: 250,
				useInteractiveGuideline: true,
				focusEnable: false,
				// margin: { right: 45, bottom: 40 },
				margin: { left: 65, right: 80, bottom: 40 },
			};

			if( options.forceY ) {
				chartOptions.forceY = options.forceY;
			}

			chart = nv.models.linePlusBarChart()
				.options( chartOptions )
				;

			chart.xAxis
				.axisLabel( options.xAxis.label )
				.tickFormat( options.xAxis.formatter() )
				;

			chart.x2Axis
				.axisLabel( options.xAxis.label )
				.tickFormat( options.xAxis.formatter() )
				;

			// chart.yAxis
			// 	.axisLabel( 'Linear Dimension Growth' )
			// 	.tickFormat( d3.format( '.03f' ) )
			// 	;

			// TEMP: Just comparing percents.
			// let yAF = d3.format( '.01f' );
			chart.y2Axis
				.axisLabel( options.yAxisLinear.label )
				.tickFormat( options.yAxisLinear.formatter() )
				;

			chart.y1Axis
				.axisLabel( options.yAxisMass.label )
				.tickFormat( options.yAxisMass.formatter() )
				;

			chart.bars
				.forceY([ 0 ])
				.padData( false )
				;

			if( initialData.length ) {
				this.updateData( initialData );
			}

			return this;
		},

		updateData( data ) {
			currentData = data;
			options.selection.datum( currentData ).call( chart );
			this.update();
			return this;
		},

		update() {
			chart.update();
			return this;
		},

		getChart() {
			return chart;
		},

		getSize() {
			return {
				width: parseFloat( chart.style( 'width' ) ),
				height: parseFloat( chart.style( 'height' ) ),
			};
		},

		getDrawingBounds() {
			let size = this.getSize();
			let margin = { ...chart.margin() };

			let drawingBounds = {
				x: margin.left,
				y: margin.top,
				width: size.width - margin.left - margin.right,
				height: size.height - margin.top - margin.bottom,
			};

			drawingBounds.x2 = drawingBounds.x + drawingBounds.width;
			drawingBounds.y2 = drawingBounds.y + drawingBounds.height;

			return drawingBounds;
		},
	};

	return chartObject;
}
