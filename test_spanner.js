import * as utils from './client/app/graph/utils';

//// testing!

const twoManualSpans = utils.spanner([
  { from: 0, to: 2 },
  { to: 6, increment: 2 },
]);

let step;

for( step of twoManualSpans ) {
  console.log( `step: ${step}` );
}
