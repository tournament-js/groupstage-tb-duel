var Tourney = require('tourney');
var GsTb = require('groupstage-tb');
var Duel = require('duel');

var GsTbDuel = Tourney.sub('GroupStage-Tb-Duel', function (opts, init) {
  init(new GsTb(this.numPlayers, opts.groupStage));
});

GsTbDuel.configure({
  defaults: function (np, opts) {
    // TODO: push opts.log onto each sub
    opts.groupStage = GsTb.defaults(np, opts.groupStage || {});
    opts.duel = Duel.defaults(np, opts.duel || {});
    return opts;
  },
  invalid: function (np, opts) {
    return GsTb.invalid(np, opts.groupStage) ||
           Duel.invalid(opts.groupStage.limit, opts.duel) ||
           null;
  }
});

// ------------------------------------------------------------------
// Stage identifiers
// ------------------------------------------------------------------

GsTbDuel.prototype.inGroupStage = function () {
  return this.getName(1) === 'GroupStage-Tb';
};
GsTbDuel.prototype.inTieBreaker = function () {
  return this.getName(2) === 'GroupStage-Tb::TieBreaker';
};
GsTbDuel.prototype.inDuel = function () {
  return this.getName(1) === 'Duel';
};

// ------------------------------------------------------------------
// Expected methods
// ------------------------------------------------------------------

GsTbDuel.prototype._mustPropagate = function () {
  return this.inGroupStage();
};

GsTbDuel.prototype._createNext = function (stg, inst, opts) {
  // called when stageDone && _mustPropagate => current is GsTb
  return Duel.from(inst, opts.groupStage.limit, opts.duel);
};

// ------------------------------------------------------------------

module.exports = GsTbDuel;
