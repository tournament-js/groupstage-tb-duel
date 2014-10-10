# GroupStage-Tb-Duel
[![npm status](http://img.shields.io/npm/v/groupstage-tb-duel.svg)](https://www.npmjs.org/package/groupstage-tb-duel)
[![build status](https://secure.travis-ci.org/clux/groupstage-tb-duel.svg)](http://travis-ci.org/clux/groupstage-tb-duel)
[![dependency status](https://david-dm.org/clux/groupstage-tb-duel.svg)](https://david-dm.org/clux/groupstage-tb-duel)
[![coverage status](http://img.shields.io/coveralls/clux/groupstage-tb-duel.svg)](https://coveralls.io/r/clux/groupstage-tb-duel)
[![unstable](http://img.shields.io/badge/stability-unstable-E5AE13.svg)](http://nodejs.org/api/documentation.html#documentation_stability_index)

A tourney that chains players though a `GroupStage` with possible `TieBreaker` round(s) (aka [groupstage-tb](https://www.npmjs.org/package/groupstage-tb)), then pipes the winners through to a final `Duel` elimination round.

## Usage
Require, specify rules and start sending scores to it:

```js
var GsDuel = require('groupstage-tb-duel');
var opts = {
  groupStage: { groupSize: 4, limit: 8 }, // opts from groupstage-tb
  duel: { last: 2 } // opts from duel
};
var trn = GsDuel(32, opts);
// score it like it was a tournament
trn.stageDone(); // when done scoring this is true
trn.createNextStage();
// if groupstage didn't tie we can start scoring duel now
// otherwise we will start scoring the tiebreaker
```

See [tourney](https://npmjs.org/tourney) for usage details.

## License
MIT-Licensed. See LICENSE file for details.
