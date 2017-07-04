import test from 'ava';

import { spanner } from '../client/app/graph/utils';

test(t => {
  const spans = spanner([
    { from: 0, to: 2 },
    { to: 6, increment: 2 },
  ]);

  t.deepEqual(
    [...spans],
    [0, 1, 2, 4, 6],
    'should yield same values as handl-calculated outputs'
  );
});
