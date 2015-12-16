var GsTbDuel = require(process.env.GS_TB_DUEL_COV ? '../gstbduel-cov.js' : '../')
  , GS = require('groupstage')
  , Duel = require('duel')
  , $ = require('autonomy');

exports.invalid = function (t) {
  var inv = GsTbDuel.invalid;
  t.equal(inv(1), 'numPlayers cannot be less than 2', 'gs reason');
  t.equal(inv(4), 'need to specify a non-zero limit', 'gstb reason');
  t.equal(inv(8, { groupStage: { groupSize: 8, limit: 4 }, duel: { last: 3 } }),
    'last elimination bracket must be either WB or LB',
    'duel reason - everything else valid'
  );
  t.equal(inv(8, { groupStage: { groupSize: 8, limit: 4 }, duel: { last: 1 } }),
    null, 'all valid now'
  );
  t.done();
};

exports.sixteenIntoTbP3SE = function (t) {
  var opts = {
    groupStage: { groupSize: [4], limit: 8 },
    duel: { last: Duel.WB }
  };
  var trn = new GsTbDuel(16, opts);

  // T1 - GroupStage
  t.ok(trn.inGroupStage() && !trn.inTieBreaker() && !trn.inDuel(), 't1 GS');
  var expT1 = new GS(16, opts.groupStage).matches;
  t.deepEqual(trn.matches, expT1, 't1 gs matches');
  trn.matches.forEach(function (m) {
    if (m.id.s === 1) {
      trn.score(m.id, [5,5]); // tie-score group 1
    }
    else {
      trn.score(m.id, m.p[0] < m.p[1] ? [1,0] : [0,1]);
    }
  });
  t.ok(trn.stageDone(), 't1 done');
  t.ok(trn.createNextStage(), 't2 created');

  // T2 - TieBreaker for G1
  t.ok(trn.inGroupStage() && trn.inTieBreaker() && !trn.inDuel(), 't2 TB');
  t.deepEqual(trn.players(), [1,5,12,16], 't3 contains g1');
  t.equal(trn.matches.length, 6, '3+2+1 matches for a group');
  trn.matches.forEach(function (m) {
    if (m.p.indexOf(1) >= 0) {
      trn.score(m.id, m.p[0] < m.p[1] ? [1,0] : [0,1]); // progress 1.
    }
    else {
      trn.score(m.id, [0,0]);
    }
  });
  t.ok(trn.stageDone(), 't2 done');
  t.ok(trn.createNextStage(), 't3 created');

  // T3 - TieBreaker for some of G1
  t.ok(trn.inGroupStage() && trn.inTieBreaker() && !trn.inDuel(), 't2 TB');
  t.deepEqual(trn.players(), [5,12,16], 't3 contains <g1');
  t.equal(trn.matches.length, 3, '2+1 matches for a group');
  trn.matches.forEach(function (m) {
    trn.score(m.id, m.p[0] < m.p[1] ? [1,0] : [0,1]); // resolve
  });
  // NB: this scoring means even though top 8 proceeds, it's not in seed order
  // because while p1 won his group he only got 3pts in it (gpos 1 due to TB)
  // similarly g5 did get gpos 2 he only got 3pts in his group
  var top8 = $.pluck('seed', trn.results()).slice(0, 8);
  t.deepEqual(top8, [2,3,4,1,6,7,8,5], 'tiebreakers demoted');
  t.ok(trn.stageDone(), 't3 done');
  t.ok(trn.createNextStage(), 't4 created');

  // T4 - Duel
  t.ok(!trn.inGroupStage() && !trn.inTieBreaker() && trn.inDuel(), 't4 Duel');
  var expT4 = [
    { id: {s: 1, r: 1, m: 1}, p: [2,5] }, // seed 1 vs seed 8
    { id: {s: 1, r: 1, m: 2}, p: [6,1] }, // seed 5 vs seed 4
    { id: {s: 1, r: 1, m: 3}, p: [4,7] }, // seed 3 vs seed 6
    { id: {s: 1, r: 1, m: 4}, p: [8,3] }  // seed 7 vs seed 2
  ];
  t.deepEqual(trn.matches.slice(0, 4), expT4, 't4 duel matches');
  trn.matches.forEach(function (m) {
    trn.score(m.id, m.p[0] < m.p[1] ? [0,1] : [1,0]); // score by reverse seed
  });
  t.ok(trn.stageDone(), 't4 done');
  t.ok(trn.isDone(), 'trn done');
  trn.complete();

  // verify results are calculated well between tourneys:
  var lastRes = trn.results();
  // top8: due to the Duel layout inherited from the weird seed numbers:
  // 1,2,3,4 are knocked out in first round (see expT4)
  // 5vs6 7vs8 in second => 7,5 are knocked out in second rnd
  // 8 plays 6 in final
  t.deepEqual($.pluck('seed', lastRes.slice(0, 8)), [8,6,7,5,1,2,3,4]
    , 'top 8 are expectedly weird duel winners'
  );

  // for the bottom 8, mostly normal except [1,5,12,16] tied weirdly
  // thus 12 and 16 are shoehorned in at the top of their gpos location
  t.deepEqual($.pluck('seed', lastRes.slice(8)), [
    12,9,10,11, // gpos 3 (12 first - almost got 2nd in TB)
    16,13,14,15], // gpos 4 (16 first - almost got 2nd in TB)
    '9th-16th are expectedly shifted from tiebreakers'
  );

  t.deepEqual($.pluck('pos', lastRes), [
    1,2,3,4,5,5,5,5,   // top 8 from Duel (since SE 4x5th rather than 2x7th)
    9,9,9,9,           // 9th placers are 3rd placers in their group
    13,13,13,13 ],     // 13th placers are 4th placers in their group
    'result positions'
  );

  t.done();
};

exports.thirtytwoIntoP3DE = function (t) {
  var opts = {
    groupStage: { groupSize: [4], limit: 8 },
    duel: { last: Duel.LB }
  };
  var trn = new GsTbDuel(32, opts);

  // T1 - GroupStage
  t.ok(trn.inGroupStage() && !trn.inTieBreaker() && !trn.inDuel(), 't1 GS');
  var expT1 = new GS(32, opts.groupStage).matches;
  t.deepEqual(trn.matches, expT1, 't1 gs matches');
  trn.matches.forEach(function (m) {
    trn.score(m.id, m.p[0] < m.p[1] ? [0,1] : [1,0]); // score by reverse seed
  });
  t.ok(trn.stageDone(), 't1 done');
  t.ok(trn.createNextStage(), 't2 created');

  // T2 - Duel
  t.ok(!trn.inGroupStage() && !trn.inTieBreaker() && trn.inDuel(), 't2 Duel');
  var expT2 = new Duel(8, opts.duel).matches.map(function (m) {
    m.p = m.p.map(function (p) {
      return (!p) ? 0 : 32 - p + 1; // scored by reverse seed so players 32 -> 24
    }).reverse();
    return m;
  }); // NB: if the score in T1 was reversed it would be equal before the map
  t.deepEqual(trn.matches, expT2, 't2 duel matches');
  trn.matches.forEach(function (m) {
    trn.score(m.id, m.p[0] < m.p[1] ? [1,0] : [0,1]); // score by seed
  });
  t.ok(trn.stageDone(), 't2 done');
  t.ok(trn.isDone(), 'trn done');
  trn.complete();

  var res = trn.results();
  t.deepEqual($.pluck('seed', res.slice(0, 8)), [25,26,27,28,29,30,31,32]
    , 'top 8 are the winners of gs in seed order'
  );
  t.deepEqual($.pluck('seed', res.slice(8)), [
    17,18,19,20,21,22,23,24, // reverse seed score so worst seeds got gpos 2
    9,10,11,12,13,14,15,16,  // gpos 3
    1,2,3,4,5,6,7,8 ],       // gpos 4 (lost all their matches)
    '9th-32th are top 24 seeds three sections (gpos)'
  );

  t.deepEqual($.pluck('pos', res), [
    1,2,3,4,5,5,7,7,           // top 8 from Duel
    9,9,9,9,9,9,9,9,           // 9th placers are 2nd placers in their group
    17,17,17,17,17,17,17,17,   // 17th placers are 3rd placers in their group
    25,25,25,25,25,25,25,25 ], // 25th placers are 4th placers in their group
    'result positions'
  );

  // verify .restore
  var copy = GsTbDuel.restore(32, opts, trn.state);
  t.ok(copy.isDone(), 'copy is done');
  t.deepEqual(copy.oldMatches, trn.oldMatches, 'matches fully restored');
  t.deepEqual(copy.state, trn.state, 'state fully restored');

  t.done();
};
