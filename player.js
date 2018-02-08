'use strict'

function Player() {
  this.currentSong = {};
  this.noteBuffer = [];
  this.visualiser = new Visualiser(this);
  this.sequencer = new Sequencer(this);
};

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
  this.visualiser.renderGridArea(song)
  this.sequencer.renderGridArea(song, song.structure[0], song.getInstrumentList()[0])
  this.sequencer.showSongInfo(song);
};

Player.prototype.clear = function() {
  this.currentSong = {};
  this.noteBuffer = [];
};

Player.prototype.play = function() {
  this.visualiser.play();
};

Player.prototype.createSong = function(givenName = "Automatic Song", givenTempo = 120) {
  if (JSON.stringify(this.currentSong) == "{}") {
    let tempo = givenTempo;
    let name = givenName || "The Best Song in the World";
    let timeSig = [4, 4];
    let song = new Song(name, tempo);
    song.addPhrase(new Phrase([new Bar(timeSig[0], timeSig[1])]));
    this.currentSong = song; // too magic?
    this.load(song);
  } else {
    this.clear();
    this.createSong(givenName, givenTempo);
  }
};

Player.prototype.unpackEncodedSong = function() {
  let decodedSongData = atob(document.getElementById('load-sqnt-textarea').value);
  let loadedSongData = JSON.parse(decodedSongData) || {};
  if (loadedSongData == "{}" || !loadedSongData.name) {
    alert("sequent did not understand the song you are trying to load. sorry.");
  }
  else {
    let loadedSong = new Song(loadedSongData.name, loadedSongData.tempo, loadedSongData.keySignature)
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
              let currentLoadingNote = new Note(currentNoteData.instrument , currentNoteData.note);
              currentLoadingBar.beats[beat][semi].push(currentLoadingNote);
            };
          };
        };
        currentLoadingPhrase.addBar(currentLoadingBar)
      };
      loadedSong.addPhrase(currentLoadingPhrase);
    };
    this.load(loadedSong);
  };
};
