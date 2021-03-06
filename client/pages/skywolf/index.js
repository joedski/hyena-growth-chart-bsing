import * as d3 from 'd3';
import * as nv from 'nvd3';

import {
  graph,
  chart,
  page,
} from '../../app';

import * as growth from './growthFunctions';


const currentPage = page.getPage();
const CANVAS_SELECTOR = `#${currentPage.chartCanvasId}`;
const CANVAS_SELECTION = d3.select(CANVAS_SELECTOR);

const spans = graph.utils.spanner([
  { from: 0, to: 12 * 2.5, increment: 0.5 },
]);

function reifyData(spans, dataFn) {
  return [...spans].map(t => ({
    x: t,
    y: dataFn(t),
  }));
}

const baseSkywolfGrowth = growth.monomolecular(growth.baseSkywolf);
const baseSkywolfMassScale = growth.linearToMassScale(growth.baseSkywolf);

const chartData = [
  {
    values: reifyData(spans, graph.utils.comp(
      growth.linearToHeightScale(growth.baseSkywolf),
      baseSkywolfGrowth,
    )),
    key: "Height",
    color: '#CE4050'
  },
  {
    values: reifyData(spans, graph.utils.sum(
      graph.utils.comp(
        baseSkywolfMassScale,
        baseSkywolfGrowth,
      ),
      // add any sigmoids here...
      graph.curves.scaledPaddedFn(
        graph.curves.querp(
          graph.curves.quad,
          graph.curves.inv(graph.curves.quad)
        ),
        6, 24, 0, growth.baseSkywolf.monomolecularParams.mA2 - growth.baseSkywolf.monomolecularParams.mA1,
        1.5
      )
    )),
    bar: true,
    key: "Mass",
    color: '#3390A5',
  },
];

const danAndXirahsBabbiesBirthDay = new graph.utils.PseudoDate('2017-04-01');

const growthChart = chart.createGrowthMassChart({
  selection: CANVAS_SELECTION,
  forceY: [0, 7.5],
  xAxis: {
    label: "Date",
    formatter() {
      const fmt = d3.format('.01f');
      const dfmt = danAndXirahsBabbiesBirthDay.relativeFormatter();
      return v => {
        const yoff = Math.floor(v / 12);
        const moff = v % 12;
        return `${dfmt(v)} (+${yoff}y/${fmt(moff)}m)`;
      };
    },
  },
  yAxisMass: {
    label: "Approximate Body Mass",
    formatter() {
      const fmt = d3.format( '.01f' );
      return v => `${fmt(v)} lbs`;
    },
  },
  yAxisLinear: {
    label: "Height Standing Up",
    formatter() {
      const fmt = d3.format( '.01f' );
      return v => `${fmt(v)} ft`;
    },
  },
});

nv.addGraph(() => {
  const chartInst = growthChart.init(chartData).getChart();
  nv.utils.windowResize(() => growthChart.update());
  return chartInst;
});

currentPage.setTitle("Skywolves!");
currentPage.setPanelTitle("Dan and Xirah's Kids");
currentPage.setPanelFooterContent(`
  <p>Their kids were born on April 1, 2017 our time, and the date values provided reflect that.
    However, relative time-offsets are provided for more general reference.
    Note that the calculated dates are themselves normalized approximations that are designed
    to fit the yearly cycle more than exact months/days.</p>
  <p>The values presented here are still a work in progress pending feedback and research.</p>
  <p>The bars and left axis indicate the approximate body mass expected at a given age.
    The line and right axis indicate the linear growth, expressed as their height in feet standing up.
    The body mass is derived from the <em>un</em>normalized linear growth.</p>
  <p>Age as indicated here is in months since birth, not conception.  This is why the numbers don't start at 0.</p>
`);
