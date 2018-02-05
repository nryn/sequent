'use strict'

function Sequencer(player) {
  this.player = player;
};

Sequencer.prototype.playPhrase = function() {
  if (this.currentOnscreenPhrase && this.currentOnscreenInstrument) {
    this.phraseNoteBuffer = this.getPhraseNotesForInstrument(this.currentOnscreenPhrase, this.currentOnscreenInstrument);
    let noteCounter = 0; // we'll compare this to total number of notes in the phrase, in order to know when it ends.
    let semiquaverTiming = songBpmToSemiquaverMilliseconds(this.player.currentSong.tempo); // figure out smallest note timing based on the overall song tempo
    let expectedTiming = Date.now() + semiquaverTiming; // expect a semiquaver to be as long as a semiquaver
    setTimeout(playThroughNotes.bind(this), semiquaverTiming); // wait a semiquaver, then play a note
    function playThroughNotes() {
      let drift = Date.now() - expectedTiming; // check again, how long did it really take to step in to this function?
      if (drift > semiquaverTiming) { // shouldn't happen.
          throw "Can't reliably play back. The window might be inactive.";
      };
      this.renderPlaybackEffect(noteCounter, this.phraseNoteBuffer[noteCounter++]); // this key line sends the notes to be rendered in the grid
      expectedTiming += semiquaverTiming; // add another semiquaver's worth, so we try to predict the time of our next loop
      if (noteCounter < this.phraseNoteBuffer.length) {
        setTimeout(playThroughNotes.bind(this), Math.max(0, semiquaverTiming - drift)); // settingTimeout to the same setTimeout callback we're already inside, creating a loop. takes into account drift
      };
    };
  };
};

Sequencer.prototype.renderGridArea = function(song, currentOnscreenPhrase, currentOnscreenInstrument) {
  this.currentOnscreenPhrase = currentOnscreenPhrase;
  this.currentOnscreenInstrument = currentOnscreenInstrument;

  let sequencerTable = document.getElementById('sequencer-grid');
  while (sequencerTable.hasChildNodes()) {
    while (sequencerTable.lastChild.hasChildNodes()) {
      sequencerTable.lastChild.removeChild(sequencerTable.lastChild.lastChild)
    }
    sequencerTable.removeChild(sequencerTable.lastChild); // let's empty the grid before rendering it, just in case
  };

  song.scale.forEach(function(note) {
    let row = document.createElement('tr');
    row.classList.add(note);
    row.classList.add("seq_note_row");
    row.classList.add("collapsed");
    sequencerTable.appendChild(row);
    let barCounter = 0;
    song.phrases[currentOnscreenPhrase].bars.forEach(function(bar) {
      barCounter++;
      for (var i = 1; i <= bar.timeSig.beatCount; i++) {
        let noteCell = document.createElement('td');
        noteCell.classList.add("bar" + barCounter);
        noteCell.classList.add("beat" + i);
        noteCell.classList.add("seq_note_cell");
        noteCell.classList.add("collapsed");
        if (barCounter % 2 == 0) {
          noteCell.classList.add("strike");
        }

        let noteCellTwo = noteCell.cloneNode(true);
        let noteCellThree = noteCell.cloneNode(true);
        let noteCellFour = noteCell.cloneNode(true);

        noteCell.id = note + "_bar" + barCounter + "_beat" + i + "_semi1";
        noteCell.classList.add("semi1");
        noteCell.style.backgroundColor = "#1ebbbb";
        noteCellTwo.id = note + "_bar" + barCounter + "_beat" + i + "_semi2";
        noteCellTwo.classList.add("semi2");
        noteCellTwo.style.backgroundColor = "#7bdad9";
        noteCellThree.id = note + "_bar" + barCounter + "_beat" + i + "_semi3";
        noteCellThree.classList.add("semi3");
        noteCellThree.style.backgroundColor = "#b5edee";
        noteCellFour.id = note + "_bar" + barCounter + "_beat" + i + "_semi4";
        noteCellFour.classList.add("semi4");
        noteCellFour.style.backgroundColor = "#cff6f6";

        row.appendChild(noteCell); // bar.i[1]
        row.appendChild(noteCellTwo); // bar.i[2]
        row.appendChild(noteCellThree); // bar.i[3]
        row.appendChild(noteCellFour); // bar.i[4]
      };
    });
  });
  this.drawLoadedNotes(currentOnscreenPhrase, currentOnscreenInstrument);
  this.expandGridArea();
};

Sequencer.prototype.drawLoadedNotes = function(currentOnscreenPhrase, currentOnscreenInstrument) {
  let sections = this.player.currentSong.structure;
  let phrase = this.player.currentSong.phrases[currentOnscreenPhrase];
  let instrument = currentOnscreenInstrument;

  for (var bar in phrase.bars) {
    for (var beat = 1; beat <= phrase.bars[bar].timeSig.beatCount; beat++) {
      for (var semiquaver in phrase.bars[bar].beats[beat]) {
        let noteList = phrase.bars[bar].beats[beat][semiquaver];
        noteList.forEach(function(note) {
          if (note.instrument == instrument) {
            let cell = document.getElementById(note.note + "_bar" + (parseInt(bar) + 1) + "_beat" + beat + "_semi" + semiquaver);
            let fillerDiv = document.createElement('div');
            fillerDiv.classList.add('seq-filler');
            cell.appendChild(fillerDiv);
          };
        });
      };
    };
  };
};

Sequencer.prototype.expandGridArea = function() {
  let sequencerTable = document.getElementById('sequencer-grid');
  let noteRows = document.querySelectorAll('.seq_note_row');
  let noteCells = document.querySelectorAll('.seq_note_cell');

  sequencerTable.classList.remove("collapsed");

  for ( let i=0; i < noteRows.length; i++ ) {
    let animateRow = expandElementsFunctionFactory(i, noteRows);
    setTimeout(animateRow, i * i * 2);
  };

  for ( let i=0; i < noteCells.length; i++ ) {
    let animateCells = expandElementsFunctionFactory(i, noteCells);
    setTimeout(animateCells, i * 3);
  };

  function expandElementsFunctionFactory(iterator, nodeList) {
    var element = nodeList[iterator];
    return function() {
      element.classList.remove('collapsed');
    };
  };
};

Sequencer.prototype.showSongInfo = function(song) {
  const songControlsArea = document.getElementById('sequencer-song-controls');
  songControlsArea.style.transform = "scaleY(0)"; // initially collapse song info area
  const titleArea = document.getElementById("sequencer-title");
  removeAllChildren(titleArea);
  let heading = document.createElement('h1');
  heading.innerHTML = "'" + song.name + "'";
  titleArea.appendChild(heading);

  const sectionDropdown = document.getElementById('sequencer-transport-bar-section-selector');
  removeAllChildren(sectionDropdown);
  sectionDropdown.setAttribute("onchange", "sequentPlayer.sequencer.showSection(this.value)")
  song.structure.forEach(function(sectionLetter) {
    let sectionOption = document.createElement('option');
    sectionOption.innerHTML = sectionLetter;
    sectionOption.setAttribute("value", sectionLetter)
    sectionDropdown.appendChild(sectionOption);
  });

  const instrumentDropdown = document.getElementById('sequencer-transport-bar-instrument-selector');
  removeAllChildren(instrumentDropdown);
  instrumentDropdown.setAttribute("onchange", "sequentPlayer.sequencer.showInstrument(this.value)")
  song.getInstrumentList().forEach(function(instrument) {
    let instrumentOption = document.createElement('option');
    instrumentOption.innerHTML = instrument;
    instrumentOption.setAttribute("value", instrument)
    instrumentDropdown.appendChild(instrumentOption);
  });
  songControlsArea.style.transform = "scaleY(1)"; //expand song info area
};

Sequencer.prototype.showSection = function(sectionLetter) {
  this.renderGridArea(this.player.currentSong, sectionLetter, this.currentOnscreenInstrument);
};

Sequencer.prototype.showInstrument = function(instrument) {
  this.renderGridArea(this.player.currentSong, this.currentOnscreenPhrase, instrument);
};

Sequencer.prototype.getPhraseNotesForInstrument = function(phraseLetter, instrument) {
  let phraseNoteList = [];
  this.player.currentSong.phrases[phraseLetter].bars.forEach(function(bar){
    for (var i = 1; i <= bar.timeSig.beatCount; i++) {
      phraseNoteList.push(bar.beats[i][1]);
      phraseNoteList.push(bar.beats[i][2]);
      phraseNoteList.push(bar.beats[i][3]);
      phraseNoteList.push(bar.beats[i][4]);
    };
  });
  return filterForCurrentInstrument(phraseNoteList, instrument);
};

const filterForCurrentInstrument = function (phraseNoteList, instrument) {
  return phraseNoteList.map(function(semiquaverNoteData){
    return semiquaverNoteData.filter(function(noteData){
      return noteData.instrument == instrument;
    });
  });
};

Sequencer.prototype.renderPlaybackEffect = function(frameNumber, noteList) {
  let tempo = this.player.currentSong.tempo;
  let noteInScale = this.player.currentSong.scale;
  noteInScale.forEach(function(scaleNote) {
    let cell = document.getElementsByClassName(scaleNote + " seq_note_row")[0].cells[frameNumber];
    let fillerDiv = document.createElement('div');
    fillerDiv.classList.add('white-filler');
    cell.appendChild(fillerDiv);
    fillerDiv.classList.add('triggered');
    setTimeout(function() {
      cell.removeChild(fillerDiv);
    }, 400); // remove element after arbitrary timeout
  });
};

Sequencer.prototype.createSong = function() {

};

Sequencer.prototype.saveSong = function() {
  let d = new Date();
  let filename = "Sequent_Song_" + this.player.currentSong.name + "_" + d.getHours() + "_" + d.getMinutes() + "_" + d.toDateString().split(' ').join('_');
  let encodedSong = this.encodeCurrentSong();
  var dlElement = document.createElement('a');
  dlElement.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodedSong);
  dlElement.setAttribute('download', filename + ".sqnt");

  dlElement.style.display = 'none';
  document.body.appendChild(dlElement);

  dlElement.click();

  document.body.removeChild(dlElement);
};

Sequencer.prototype.encodeCurrentSong = function() {
  return btoa(JSON.stringify(this.player.currentSong));
};

Sequencer.prototype.addBarToSong = function() {
  let currentPhrase = this.player.currentSong.phrases[this.currentOnscreenPhrase];
  let currentSection = this.currentOnscreenPhrase;
  let currentInstrument = this.currentOnscreenInstrument;
  let newBar = new Bar();
  currentPhrase.addBar(newBar);
  this.player.load(this.player.currentSong);
  const sectionDropdown = document.getElementById('sequencer-transport-bar-section-selector');
  const instrumentDropdown = document.getElementById('sequencer-transport-bar-instrument-selector');
  sectionDropdown.value = currentSection;
  instrumentDropdown.value = currentInstrument;
  this.showSection(currentSection);
  this.showInstrument(currentInstrument);
};


function removeAllChildren(parentNode) {
  while (parentNode.hasChildNodes()) {
    parentNode.removeChild(parentNode.lastChild);
  };
};
