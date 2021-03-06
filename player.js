'use strict'

function Player() {
  this.currentSong = {};
  this.noteBuffer = [];
  this.visualiser = new Visualiser(this);
  this.sequencer = new Sequencer(this);
  this.context = new (window.AudioContext || window.webkitAudioContext)();
  this.loop = false;
  this.isPlaying = false;
};

Player.prototype.loopToggle = function() {
  this.loop = !this.loop
  const button = document.getElementById('left-workspace-button-loop');
  const toggleState = this.loop === true ? 'toggledOn' : 'toggledOff';
  button.setAttribute('class', toggleState) 
}

Player.prototype.toggleSongDialogue = function(typeOfDialogue) {
  let dialogueBox = document.getElementById(typeOfDialogue + '-song-dialogue-box');
  if (dialogueBox.classList.contains('collapsed')) {
    expandSongDialogueArea(dialogueBox);
  }
  else {
    collapseSongDialogueArea(dialogueBox);
  }
};

function expandSongDialogueArea(dialogueBox) {
  dialogueBox.style.marginTop = "0px";
  dialogueBox.classList.remove('collapsed');
  setTimeout(function() {
    dialogueBox.style.transform = "scaleY(1)"
  }, 250)
};

function collapseSongDialogueArea(dialogueBox) {
  dialogueBox.style.transform = "scaleY(0)"
  dialogueBox.classList.add('collapsed');
  setTimeout(function() {
    dialogueBox.style.marginTop = "-" + dialogueBox.clientHeight + "px";
  }, 400)
};

Player.prototype.load = function(song) {
  let loadDialogue = document.getElementById('load-song-dialogue-box');
  let createDialogue = document.getElementById('create-song-dialogue-box');
  collapseSongDialogueArea(loadDialogue);
  collapseSongDialogueArea(createDialogue);
  this.clear();
  this.currentSong = song;
  let sections = song.structure;
  let phrases = song.phrases;

  for (var section in sections) {
    let phrase = phrases[sections[section]];
    for (var bar in phrase.bars) {
      for (var beat = 1; beat <= phrase.bars[bar].timeSig.beatCount; beat++) {
        for (var semiquaver in phrase.bars[bar].beats[beat]) {
          let noteData = phrase.bars[bar].beats[beat][semiquaver];
          this.noteBuffer.push(noteData);
        };
      };
    };
  };
  this.sequencer.renderGridArea(song, song.structure[0], song.instruments[0])
  this.sequencer.showSongInfo(song);
  this.visualiser.renderGridArea(song)
};

Player.prototype.refreshNoteBuffer = function() {
  this.noteBuffer = [];
  let sections = this.currentSong.structure;
  let phrases = this.currentSong.phrases;

  for (var section in sections) {
    let phrase = phrases[sections[section]];
    for (var bar in phrase.bars) {
      for (var beat = 1; beat <= phrase.bars[bar].timeSig.beatCount; beat++) {
        for (var semiquaver in phrase.bars[bar].beats[beat]) {
          let noteData = phrase.bars[bar].beats[beat][semiquaver];
          this.noteBuffer.push(noteData);
        };
      };
    };
  };
}

Player.prototype.clear = function() {
  this.currentSong = {};
  this.noteBuffer = [];
};

Player.prototype.playToggle = function() {
  this.isPlaying = !this.isPlaying
  
  if (this.isPlaying === true) {
    this.visualiser.play(this.loop);
  }
  
  const button = document.getElementById('left-workspace-button');
  button.innerHTML = this.isPlaying === true ? "◼︎" : "▶"; 
};

function generateSongName() {
  const today = new Date()
  return ["Sunday Song", "Monday Mix", "Tuesday Tune", "Wednesday Wiggle", "Thursday Thang", "Friday Funk", "Saturday Set"][today.getDay()]
}

Player.prototype.createSong = function(givenName = "Automatic Song", givenTempo = 120) {
  if (JSON.stringify(this.currentSong) == "{}") {
    let tempo = givenTempo;
    let name = givenName || generateSongName();
    let timeSig = [4, 4];
    let song = new Song(name, tempo);
    song.addPhrase(new Phrase([new Bar(timeSig[0], timeSig[1])]));
    this.currentSong = song; // too magic?
    this.load(song);
    return song;
  } else {
    this.clear();
    this.createSong(givenName, givenTempo);
  }
};

Player.prototype.unpackEncodedSong = function(sqntfile) {
  let decodedSongData = sqntfile ? atob(sqntfile) : atob(document.getElementById('load-sqnt-textarea').value);
  document.getElementById('load-sqnt-textarea').value = "";
  let loadedSongData = JSON.parse(decodedSongData) || {};
  if (JSON.stringify(loadedSongData) == "{}" || !loadedSongData.name) {
    alert("sequent did not understand the song you are trying to load. sorry.");
  }
  else {
    let loadedSong = new Song(loadedSongData.name, loadedSongData.tempo, loadedSongData.keySignature)
    loadedSongData.instruments.forEach(function(instrument) {
      loadedSong.addInstrument(instrument.name, instrument.sounds, instrument.octave, instrument.duration)
    });
    for (var phrase in loadedSongData.phrases) {
      let currentPhraseData = loadedSongData.phrases[phrase];
      let currentLoadingPhrase = new Phrase();
      for (var bar in currentPhraseData.bars) {
        let currentBarData = currentPhraseData.bars[bar];
        let currentLoadingBar = new Bar(currentBarData.timeSig.beatCount, currentBarData.timeSig.beatUnit);
        for (var beat in currentBarData.beats) {
          let currentBeatData = currentBarData.beats[beat];
          for (var semi in currentBeatData) {
            let currentSemiData = currentBeatData[semi];
            for (var note in currentSemiData) {
              let currentNoteData = currentSemiData[note];
              let currentLoadingNote = new Note(loadedSong.getInstrumentByName(currentNoteData.instrument.name), currentNoteData.note, currentNoteData.octave, currentNoteData.duration);
              currentLoadingBar.beats[beat][semi].push(currentLoadingNote);
            };
          };
        };
        currentLoadingPhrase.addBar(currentLoadingBar)
      };
      loadedSong.addPhrase(currentLoadingPhrase);
    };
    removeAllChildren(document.getElementById('sequencer-transport-bar-instrument-selector')) // to avoid instrument duplication in the visualiser
    removeAllChildren(document.getElementById('playback-grid')) // to avoid instrument duplication in the visualiser
    this.load(loadedSong);
  };
};
