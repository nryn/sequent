'use strict'

function Bar(beatCount = 4, beatUnit = 4) {
  this.timeSig = {
    beatCount: beatCount,
    beatUnit: beatUnit
  };
  this.beats = {};
  this.createStructure(this.timeSig.beatCount, this.timeSig.beatUnit);
}

Bar.prototype.createStructure = function(beatCount, beatUnit) {
  for(var i=1; i<=beatCount; i++){
    this.beats[i] = {
      1:[],
      2:[],
      3:[], // this is the offbeat
      4:[] // 4 total in here should give sixteenth notes if used
    };
  };
};

module.exports = Bar;
