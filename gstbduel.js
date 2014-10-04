var Tourney = require('tourney');
var GsTb = require('groupstage-tb');
var Duel = require('duel');

var GsTbDuel = Tourney.sub('GroupStage-Tb-Duel', function (opts, initParent) {
  this._current = new GsTb(this.numPlayers, opts.groupStage);
  initParent();
});

GsTbDuel.configure({
  defaults: function (np, opts) {
    // TODO: use GroupStageTb.defaults
    // TODO: use Duel.defaults
  },
  invalid: function (np, opts) {
    // TODO: validate GroupStage-Tb style
    // TODO: validate Duel style based on how many should proceed
  }
});

//------------------------------------------------------------------
// Stage identifiers
//------------------------------------------------------------------

GsTbDuel.prototype.inGroupStage = function () {
  var rnd = this._current;
  return rnd.name === 'GroupStage-Tb' && !rnd.isTieBreakerRound();
};

GsTbDuel.prototype.inTieBreaker = function () {
  var rnd = this._current;
  return rnd.name === 'GroupStage-Tb' && rnd.isTieBreakerRound();
};

GsTbDuel.prototype.inDuel = function () {
  return this._current.name !== 'GroupStage-Tb';
};

//------------------------------------------------------------------
// Stage advancer
//------------------------------------------------------------------

GsTbDuel.prototype._createNext = function () {
  if (this.isDone()) {
    return false;
  }

  // GsTb should do its own thing
  
  // NB: this is the reason Tourney does not own _current:
  // now we can use _current as a Tourney
  
};