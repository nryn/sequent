'use strict'

function Song(phrases = {}, tempo = 120, keySignature = "Cmaj", name = "Untitled") {
  this.name = name;
  this.tempo = tempo;
  this.keySignature = keySignature;
  this.structure = [];
  this.getInstrumentList = this.searchForInstruments;
  this.phrases = phrases;
}

Song.prototype.searchForInstruments = function () {

  let instrumentList = [];

  function iterateOverObject(obj) {
    for (var property in obj) {
      if (obj.hasOwnProperty(property)) {
        if (typeof obj[property] == "object") {
          iterateOverObject(obj[property]);
        }
        else {
          if (property == "instrument" && !instrumentList.includes(obj[property])) { instrumentList.push(obj[property]) };
        };
      };
    };
  };
  
  iterateOverObject(this.phrases);
  return instrumentList;
};

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
