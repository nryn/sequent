'use strict'

function Song(phrases = {}, tempo = 120, keySignature = "Cmaj", name = "Untitled") {
  this.name = name;
  this.tempo = tempo;
  this.keySignature = keySignature;
  this.structure = [];
  this.phrases = phrases;
}

let sectionMap=new WeakMap, sectionLetter = "A".charCodeAt(0) - 1;
Song.prototype.generateSection = function(phrase) {
  if (!sectionMap.has(phrase)) sectionMap.set(phrase,++sectionLetter);
  return String.fromCharCode(sectionMap.get(phrase));
};

Song.prototype.addPhrase = function() {
  for (var phrase in arguments) {
    let section = this.generateSection(arguments[phrase]);
    this.structure.push(section);
    if (!this.phrases[section]) {
      this.phrases[section] = arguments[phrase];
    };
  };
};

Song.prototype.movePhrase = function(fromPos, toPos) {
  let thePhrase = this.removePhrase(fromPos-1);
  this.structure.splice(toPos-1,0,thePhrase[0]);
};

Song.prototype.removePhrase = function(pos) {
  return this.structure.splice(pos,1);
};

Song.prototype.duplicatePhrase = function(section) {
  this.structure.push(section);
};

module.exports = Song;
