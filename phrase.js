'use strict'

function Phrase(bars=[]) {
  this.bars = bars;
}

Phrase.prototype.addBar = function() {
  for (var bar in arguments) {
    this.bars.push(arguments[bar])
  }
};

Phrase.prototype.moveBar = function(fromPos, toPos) {
  let theBar = this.removeBar(fromPos-1);
  this.bars.splice(toPos-1,0,theBar[0]);
};

Phrase.prototype.removeBar = function(pos) {
  return this.bars.splice(pos,1);
};

Phrase.prototype.duplicateBar = function(pos) {
  this.addBar(this.bars[pos]);
};

const testPhrase = new Phrase();
testPhrase.addBar("bar1","bar2","bar3");
testPhrase.duplicateBar(0);
console.log(testPhrase);

module.exports = Phrase;
