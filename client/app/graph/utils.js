import * as d3 from 'd3';
import { cube } from './curves';

//////// Composers

export function sum( ...fns ) {
	return function summationAt( t ) {
		return fns.reduce(
			function sumFn( res, fn ) { return res + fn( t ); },
			0
		);
	};
}

export function comp( ...fns ) {
	return function copositionAt( t ) {
		return fns.reduceRight(
			function compFn( res, fn ) { return fn( res ); },
			t
		);
	}
}



//////// Some useful scales.

/**
 * Convenience scale function to convert a progress ([0, 1])
 * to a percent. ([0, 100])
 * @type {Function}
 */
export const percentScale = d3.scale.linear().domain([ 0, 1 ]).range([ 0, 100 ]);

/**
 * Simple function which takes a linear-dimension domain and a mass range
 * and returns a function which accepts a linear dimension and returns the
 * cubic mass for it.
 * @param  {Array<number>} linearDomain
 *         A two-element array where the first element is the lower bound of
 *         the input domain and the second element is the upper.
 *         You can still pass values outside of this domain and receive an
 *         appropriate value back.
 * @param  {Array<number>} massRange
 *         A two-element array where the first element is the lower bound of
 *         the output mass range and the second is the upper bound.
 * @return {Function} A linear-to-cubic scale.
 */
export function cubicScale( linearDomain, massRange ) {
  return comp(
    cube,
    // C = ((L - L0) / (L1 - L0) * (C1^1/3 - C0^1/3))^3
    d3.scale.linear()
      .domain( linearDomain )
      .range( massRange.map( r => Math.pow( r, 1/3 ) ) )
  );
}



//////// Spans

/*
type SpanDef = {
  // Value this span starts from.
  // At least the first span must have a value here or else
  // all of the returned values will be NaN.
  from?: number,
  // Value this span runs until.
  to: number,
  // Size of each step.
  increment: number,
};
 */

// This is currently pretty crude, using it with float values may lead to oddities.
export function spanner( spanDefs ) {
  if( ! spanDefs || ! spanDefs.length ) {
    throw new Error( `spanner requires an array of span definitions` );
  }

  return {
    [Symbol.iterator]() {
      // init state here,
      // create next() stepper.
      // return first iteration. (by calling next() the first time if possible.)

      let state = {
        finalized: false,
        stopped: true,
        // Remaining spans to go through after the current one.
        restSpans: spanDefs.concat(),
        // Current span.
        span: null,
        // Next value.
        t: undefined,
      };

      function next() {
        const stateAfterInit = (
          state.stopped
          ? spanner_init( state )
          : state
        );

        const stateAfterStep = (
          stateAfterInit.stopped
          ? spanner_finalize( stateAfterInit )
          : spanner_step( stateAfterInit )
        );

        const iteration = {
          done: stateAfterInit.stopped && stateAfterInit.finalized,
          value: stateAfterInit.t,
        };

        state = stateAfterStep;
        return iteration;
      }

      return { next };
    },
  };
}

// function spanner_init({ t, restSpans, finalized }) {
function spanner_init( state ) {
  // Mutation...
  const span = state.restSpans.shift();

  if( ! span ) return { ...state, span, stopped: true };

  return {
    ...state,
    span,
    stopped: false,
    t: span.from != null ? span.from : state.t,
  };
}

function spanner_getSpanIncrement( span ) {
  if( span.increment != null ) return span.increment;
  return 1;
}

function spanner_step( state ) {
  const nextT = state.t + spanner_getSpanIncrement( state.span );
  const spanIsDone = nextT >= state.span.to;

  return {
    ...state,
    stopped: spanIsDone,
    span: spanIsDone ? null : state.span,
    t: nextT,
  };
}

function spanner_finalize( state ) {
  return {
    ...state,
    finalized: true,
  };
}
