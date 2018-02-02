'use strict'

function Sequencer(player) {
  this.player = player;
};

Sequencer.prototype.play = function() {

};

Sequencer.prototype.renderGridArea = function(song) {
  let sequencerTable = document.getElementById('sequencer-grid');
  while (sequencerTable.hasChildNodes()) {
    sequencerTable.removeChild(sequencerTable.lastChild); // let's empty the grid before rendering it, just in case
  };

  song.scale.forEach(function(note) {
    let row = document.createElement('tr');
    row.classList.add(note);
    row.classList.add("note_row");
    row.classList.add("collapsed");
    sequencerTable.appendChild(row);
    let barCounter = 0;
    song.phrases[song.structure[0]].bars.forEach(function(bar) {
      barCounter++;
      for (var i = 1; i <= bar.timeSig.beatCount; i++) {
        let noteCell = document.createElement('td');
        noteCell.id = note + "_bar" + barCounter + "_beat" + i;
        noteCell.classList.add("bar" + barCounter);
        noteCell.classList.add("beat" + i);
        noteCell.classList.add("note_cell");
        noteCell.classList.add("collapsed");
        row.appendChild(noteCell); // bar.i[1]
        row.appendChild(noteCell); // bar.i[2]
        row.appendChild(noteCell); // bar.i[3]
        row.appendChild(noteCell); // bar.i[4]
      };
    });
  });
  // this.expandGridArea();
  // this.drawSequencerNotes(song);
};

Sequencer.prototype.createSong = function () {

};
