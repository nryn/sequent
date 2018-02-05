'use strict'

function Player() {
  this.currentSong = {};
  this.noteBuffer = [];
  this.visualiser = new Visualiser(this);
  this.sequencer = new Sequencer(this);
};

Player.prototype.loadSongDialogue = function() {
  let dialogueBox = document.getElementById('load-song-dialogue-box');
  if (dialogueBox.classList.contains('loadDialogueCollapsed')) {
    expandSongDialogueArea(dialogueBox);
  }
  else {
    collapseSongDialogueArea(dialogueBox);
  }
};

function expandSongDialogueArea(dialogueBox) {
  dialogueBox.style.marginTop = "0px";
  dialogueBox.classList.remove('loadDialogueCollapsed');
  setTimeout(function() {
    dialogueBox.style.transform = "scaleY(1)"
  }, 250)
};

function collapseSongDialogueArea(dialogueBox) {
  dialogueBox.style.transform = "scaleY(0)"
  dialogueBox.classList.add('loadDialogueCollapsed');
  setTimeout(function() {
    dialogueBox.style.marginTop = "-" + dialogueBox.clientHeight + "px";
  }, 400)
};

Player.prototype.load = function(song) {
  let dialogueBox = document.getElementById('load-song-dialogue-box')
  collapseSongDialogueArea(dialogueBox);
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
