var Tourney = require('tourney');
var GsTb = require('groupstage-tb');
var Duel = require('duel');

var GsTbDuel = Tourney.sub('GroupStage-Tb-Duel', function (opts, initParent) {
  initParent(new GsTb(this.numPlayers, opts.groupStage)); // stored on this._inst
});

GsTbDuel.configure({
  // NB: this simple version works only because Duel has `np` agnostic statics
  // it would fail if the last stage was FFA which relies on correct `np`
  // TODO: figure out what to do in this case
  defaults: function (np, opts) {
    opts.gsTbOpts = opts.gsTbOpts || {};
    GsTb.defaults(np, opts.gsTbOpts);
    opts.duelOpts = opts.duelOpts || {};
    Duel.defaults(np, opts.duelOpts);
  },
  invalid: function (np, opts) {
    var invReason = GsTb.invalid(np, opts.gsTbOpts);
    if (invReason !== null) {
      return invReason;
    }
    invReason = Duel.invalid(np, opts.duelOpts);
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

GsTbDuel.prototype._createNext = function (stg) {
   // only called when _mustPropagate && stageComplete => !inDuel
   // either GsTb needs a TieBreaker round, or we must forward to the final Duel
   if (!this._inst.stageDone()) {
     return this._inst.createNextStage(stg); // GsTb can do its thing
   }
   // create duel - this._inst is a Tourney whose ._inst is the last TieBreaker
   return Duel.from(this._inst._inst, this.opts.duelOpts);   
};

//------------------------------------------------------------------

module.exports = GsTbDuel;
