'use strict'

function Song(name = "Untitled", tempo = 120, keySignature = "Cmaj") {
  this.name = name;
  this.tempo = tempo;
  this.keySignature = keySignature;
  this.structure = [];
  this.getInstrumentList = this.searchForInstruments;
  this.phrases = {};
  this.scale = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  this.sectionMap=new WeakMap;
  this.sectionLetter = "A".charCodeAt(0) - 1;
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

  function checkOnScreenInstruments() {
    let instrumentSelector = document.getElementById('sequencer-transport-bar-instrument-selector');
    instrumentSelector.childNodes.forEach(function(optionElement) {
      instrumentList.push(optionElement.value);
    });
  }

  iterateOverObject(this.phrases);
  checkOnScreenInstruments();

  return instrumentList.length == 0 ? ["Piano"] : instrumentList; // get the current instruments onscreen ready if there aren't any instruments being used at all
};

Song.prototype.generateSection = function(phrase) {
  if (!this.sectionMap.has(phrase)) this.sectionMap.set(phrase,++this.sectionLetter);
  return String.fromCharCode(this.sectionMap.get(phrase));
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
