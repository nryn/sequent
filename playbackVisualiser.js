'use strict'

function Visualiser(player) {
  this.player = player;
};

Visualiser.prototype.play = function() {
  if (this.player.currentSong && this.player.noteBuffer.length > 0) {
    let noteCounter = 0; // we'll compare this to total number of notes in the song, in order to break out of the loop at the end.
    let semiquaverTiming = songBpmToSemiquaverMilliseconds(this.player.currentSong.tempo); // figure out smallest note timing based on the overall song tempo
    let expectedTiming = Date.now() + semiquaverTiming; // expect a semiquaver to be as long as a semiquaver
    setTimeout(playNote.bind(this), semiquaverTiming); // wait a semiquaver, then play a note
    function playNote() {
      let drift = Date.now() - expectedTiming; // check again, how long did it really take to step in to this function?
      if (drift > semiquaverTiming) { // shouldn't happen.
          throw "Can't reliably play back. The window might be inactive.";
      };
      this.renderNotesInGridCells(this.player.noteBuffer[noteCounter++]); // this key line sends the notes to be rendered in the grid
      expectedTiming += semiquaverTiming; // add another semiquaver's worth, so we try to predict the time of our next loop
      if (noteCounter < this.player.noteBuffer.length) {
        setTimeout(playNote.bind(this), Math.max(0, semiquaverTiming - drift)); // settingTimeout to the same setTimeout callback we're already inside, creating a loop. takes into account drift
      };
    };
  };
};

function songBpmToSemiquaverMilliseconds(bpm) {
  return 60000 / bpm / 4; // There are 60 seconds in a minute, and 1,000 MS in a second. Then we divide by 4 to get semiquavers out of the beat.
};

Visualiser.prototype.renderNotesInGridCells = function(noteList) {
  let tempo = this.player.currentSong.tempo;
  noteList.forEach(function(note) {
    let cell = document.getElementById(note.note + "_" + note.instrument.name);
    let fillerDiv = document.createElement('div');
    fillerDiv.classList.add('filler');
    cell.appendChild(fillerDiv);
    fillerDiv.classList.add('triggered'+note.duration);
    setTimeout(function() {
      cell.removeChild(fillerDiv);
    }, 1500); // remove element after arbitrary second and a half
  });
};

Visualiser.prototype.renderGridArea = function(song){
  let playbackTable = document.getElementById('playback-grid');
  while (playbackTable.hasChildNodes()) {
    playbackTable.removeChild(playbackTable.lastChild); // let's empty the grid before rendering it, just in case
  };

  song.scale.forEach(function(note) {
    let row = document.createElement('tr');
    row.classList.add(note);
    row.classList.add("vis_note_row");
    row.classList.add("collapsed");
    playbackTable.appendChild(row);
    song.instruments.forEach(function(instrument) {
      let noteCell = document.createElement('td');
      noteCell.id = note + "_" + instrument.name;
      noteCell.classList.add(instrument.name);
      noteCell.classList.add("vis_note_cell");
      noteCell.classList.add("collapsed");
      row.appendChild(noteCell);
    });
  });
  this.expandGridArea();
};

Visualiser.prototype.expandGridArea = function() {
  let playbackTable = document.getElementById('playback-grid');
  let noteRows = document.querySelectorAll('.vis_note_row');
  let noteCells = document.querySelectorAll('.vis_note_cell');

  playbackTable.classList.remove("collapsed");

  for ( let i=0; i < noteRows.length; i++ ) {
    let animateRow = expandElementsFunctionFactory(i, noteRows);
    setTimeout(animateRow, i * i * 18);
  };

  for ( let i=0; i < noteCells.length; i++ ) {
    let animateCells = expandElementsFunctionFactory(i, noteCells);
    setTimeout(animateCells, i * 24);
  };

  function expandElementsFunctionFactory(iterator, nodeList) {
    var element = nodeList[iterator];
    return function() {
      element.classList.remove('collapsed');
    };
  };
};
