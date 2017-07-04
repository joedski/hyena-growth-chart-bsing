import {
  graph,
  // chart,
  // page,
} from '../../app';

export const baseSkywolf = {
  monomolecularParams: {
    // 95% linear growth at 12 months.
    t95: 9, //months
    A: 1, //relative progress
    A_L: 0,
    S0: 15/12 / 7, //ft
    mt0: 5, //lbs
    SA: 7, //ft
    // NOTE: This is the body mass at the end of skeletal growth.
    // After that, the body continues to build muscle mass.
    mA1: 137, //lbs
    mA2: 250, //lbs
  },
};

export function monomolecular(skywolf) {
  const { t95, A, A_L, S0 } = skywolf.monomolecularParams;
  return graph.growth.monomolecular95t1(A, A_L, S0, t95);
}

export function linearToMassScale(skywolf) {
  const { A, S0, mt0, mA1 } = skywolf.monomolecularParams;
  return graph.utils.cubicScale(
    [S0, A],
    [mt0, mA1]
  );
}

export function linearToHeightScale(skywolf) {
  return l => l * skywolf.monomolecularParams.SA;
}
