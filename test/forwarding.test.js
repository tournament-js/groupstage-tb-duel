var GsTbDuel = require(process.env.GS_TB_DUEL_COV ? '../gstbduel-cov.js' : '../')
  , GS = require('groupstage')
  , Duel = require('duel')
  , $ = require('autonomy');

/*exports.invalid = function (t) {
  var inv = GsTbDuel.invalid;
  t.equal(inv(1), "numPlayers cannot be less than 2", "gs reason");
  t.equal(inv(4), "need to specify a non-zero limit", "1st limitation");
  t.equal(inv(8, { groupSize: 4, limit: 3}), "number of groups must divide limit",
    'limit must be sensible'
  );
  t.done();
};*/

exports.thirtytwoIntoP3DE = function (t) {
  var opts = {
    groupStage: { groupSize: [4], limit: 8 },
    duel: { last: Duel.LB }
  };
  var trn = new GsTbDuel(32, opts);
  
  // T1 - GroupStage
  t.ok(trn.inGroupStage() && !trn.inTieBreaker() && !trn.inDuel(), "t1 GS");
  var expT1 = new GS(32, opts.groupStage).matches;
  t.deepEqual(trn.matches, expT1, "t1 gs matches");
  trn.matches.forEach(function (m) {
    trn.score(m.id, m.p[0] < m.p[1] ? [0,1] : [1,0]); // score by reverse seed
  });
  t.ok(trn.stageDone(), 't1 done');
  t.ok(trn.createNextStage(), 't2 created');

  // T2 - Duel
  t.ok(!trn.inGroupStage() && !trn.inTieBreaker() && trn.inDuel(), "t2 Duel");
  var expT2 = new Duel(8, opts.duel).matches.map(function (m) {
    m.p = m.p.map(function (p) {
      return (!p) ? 0 : 32 - p + 1; // scored by reverse seed so players 32 -> 24
    }).reverse();
    return m;
  }); // NB: if the score in T1 was reversed it would be equal before the map
  t.deepEqual(trn.matches, expT2, "t2 duel matches");
  trn.matches.forEach(function (m) {
    trn.score(m.id, m.p[0] < m.p[1] ? [1,0] : [0,1]); // score by seed
  });
  t.ok(trn.stageDone(), 't2 done');
  t.ok(trn.isDone(), 'trn done');
  trn.complete();

  var res = trn.results();
  t.deepEqual($.pluck('seed', res.slice(0, 8)), [25,26,27,28,29,30,31,32]
    , "top 8 are the winners of gs in seed order"
  );
  t.deepEqual($.pluck('seed', res.slice(8)), [
      17,18,19,20,21,22,23,24, // reverse seed score so worst seeds got gpos 2
      9,10,11,12,13,14,15,16,  // gpos 3
      1,2,3,4,5,6,7,8          // gpos 4 (lost all their matches)
    ],
    "9th-32th are top 24 seeds three sections (gpos)"
  );

  t.deepEqual($.pluck('pos', res), [
      1,2,3,4,5,5,7,7,          // top 8 from Duel
      9,9,9,9,9,9,9,9,          // 9th placers are 2nd placers in their group
      17,17,17,17,17,17,17,17,  // 17th placers are 3rd placers in their group
      25,25,25,25,25,25,25,25   // 25th placers are 4th placers in their group
    ], "result positions"
  );

  t.done();
};