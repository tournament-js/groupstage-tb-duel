var Tourney = require('tourney');
var GsTb = require('groupstage-tb');
var Duel = require('duel');

var GsTbDuel = Tourney.sub('GroupStage-Tb-Duel', function (opts, initParent) {
  this.opts = opts;
  initParent(new GsTb(this.numPlayers, opts.groupStage)); // stored on this._inst
});

GsTbDuel.configure({
  defaults: function (np, opts) {
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

//------------------------------------------------------------------
// Stage identifiers
//------------------------------------------------------------------

GsTbDuel.prototype.inGroupStage = function () {
  var rnd = this._inst;
  return rnd.name === 'GroupStage-Tb' && rnd.inGroupStage();
};

GsTbDuel.prototype.inTieBreaker = function () {
  var rnd = this._inst;
  return rnd.name === 'GroupStage-Tb' && rnd.inTieBreaker();
};

GsTbDuel.prototype.inDuel = function () {
  return this._inst.name !== 'GroupStage-Tb';
};

//------------------------------------------------------------------
// Expected methods
//------------------------------------------------------------------

GsTbDuel.prototype._mustPropagate = function () {
  return !this.inDuel();
};

GsTbDuel.prototype._createNext = function () {
   // only called when _inst.isDone, but _mustPropagate
   return Duel.from(this._inst, this.opts.groupStage.limit, this.opts.duel);
};

//------------------------------------------------------------------

module.exports = GsTbDuel;
