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

Sequencer.prototype.toggleNote = function(noteElement) {
  let notePositionInfo = noteElement.id.split('_');
  let note = notePositionInfo[0];
  let barNo = notePositionInfo[1].substring(notePositionInfo[1].length -1);
  let beatNo = notePositionInfo[2].substring(notePositionInfo[2].length -1);
  let semiNo = notePositionInfo[3].substring(notePositionInfo[3].length -1);
  let toggledNoteList = this.player.currentSong.phrases[this.currentOnscreenPhrase].bars[barNo - 1].beats[beatNo][semiNo]
  let currentInstrument = this.currentOnscreenInstrument;
  if (noteElement.lastChild) { // if the note was already toggled do this to remove the note:
    noteElement.removeChild(noteElement.lastChild)
    let noteListOnceRemoved = toggledNoteList.filter(function(note) {
      return note.instrument !== currentInstrument;
    });
    this.player.currentSong.phrases[this.currentOnscreenPhrase].bars[barNo - 1].beats[beatNo][semiNo] = noteListOnceRemoved;
  } else { // or else do this to add the note:
    let fillerDiv = document.createElement('div');
    fillerDiv.classList.add('seq-filler');
    noteElement.appendChild(fillerDiv);
    toggledNoteList.push(new Note(this.currentOnscreenInstrument, note));
  }
  this.player.refreshNoteBuffer();
};

Sequencer.prototype.renderGridArea = function(song, currentOnscreenPhrase = this.currentOnscreenPhrase, currentOnscreenInstrument = this.currentOnscreenInstrument) {
  this.currentOnscreenPhrase = currentOnscreenPhrase;
  this.currentOnscreenInstrument = currentOnscreenInstrument;

  let sequencerTable = document.getElementById('sequencer-grid');
  while (sequencerTable.hasChildNodes()) {
    removeAllChildren(sequencerTable.lastChild);
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
        noteCell.setAttribute("onClick", "sequentPlayer.sequencer.toggleNote(this);")
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
  let heading = document.createElement('h2');
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
  song.instruments.forEach(function(instrument) {
    let instrumentOption = document.createElement('option');
    instrumentOption.innerHTML = instrument.name;
    instrumentOption.setAttribute("value", instrument.name)
    instrumentDropdown.appendChild(instrumentOption);
  });
  songControlsArea.style.transform = "scaleY(1)"; //expand song info area
};

Sequencer.prototype.showSection = function(sectionLetter) {
  this.renderGridArea(this.player.currentSong, sectionLetter, this.currentOnscreenInstrument);
};

Sequencer.prototype.showInstrument = function(instrumentName) {
  let instrument = this.player.currentSong.getInstrumentByName(instrumentName);
  this.currentOnscreenInstrument = instrument;
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

const fullNoteRange = ["C0","C#0","D0","Eb0","E0","F0","F#0","G0","Ab0","A0","Bb0","B0","C1","C#1","D1","Eb1","E1","F1","F#1","G1","Ab1","A1","Bb1","B1","C2","C#2","D2","Eb2","E2","F2","F#2","G2","Ab2","A2","Bb2","B2","C3","C#3","D3","Eb3","E3","F3","F#3","G3","Ab3","A3","Bb3","B3","C4","C#4","D4","Eb4","E4","F4","F#4","G4","Ab4","A4","Bb4","B4","C5","C#5","D5","Eb5","E5","F5","F#5","G5","Ab5","A5","Bb5","B5","C6","C#6","D6","Eb6","E6","F6","F#6","G6","Ab6","A6","Bb6","B6"];

const getWavelengthFromNote = function(note) {
  let middleA = fullNoteRange.indexOf("A4");
  let halfStepsFromMiddleA = fullNoteRange.indexOf(note.note + note.octave) - middleA;
  return 440 * ((2**(1/12))**halfStepsFromMiddleA);
};

Sequencer.prototype.renderPlaybackEffect = function(frameNumber, noteList) {
  noteList.forEach(function(note) {
    let sound = new Sound(this.player.context, note.instrument);
    sound.play(getWavelengthFromNote(note), this.player.context.currentTime, note.duration)
  }.bind(this));
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

Sequencer.prototype.createSongFromForm = function() {
  let songName = document.getElementById('song-name').value;
  let tempo = document.getElementById('tempo-input').value;
  let newSong = this.player.createSong(songName, tempo);
  let defaultInstrument = newSong.addInstrument("Piano");
  this.showSongInfo(newSong);
  this.currentOnscreenInstrument = defaultInstrument;
  this.player.visualiser.renderGridArea(this.player.currentSong); // need to run this to make sure we dont start with empty vis grid!
};

Sequencer.prototype.saveSong = function() {
  let d = new Date();
  let filename = "SequentProject_" + this.player.currentSong.name.split(" ").join("_") + "_" + d.getHours() + "_" + d.getMinutes() + "_" + d.toDateString().split(' ').join('_');
  let encodedSong = this.encodeCurrentSong();
  var dlElement = document.createElement('a');
  dlElement.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodedSong);
  dlElement.setAttribute('download', filename + ".sqnt.txt");

  dlElement.style.display = 'none';
  document.body.appendChild(dlElement);

  dlElement.click();

  document.body.removeChild(dlElement);
};

Sequencer.prototype.encodeCurrentSong = function() {
  return btoa(JSON.stringify(this.player.currentSong));
};

Sequencer.prototype.addBarToSong = function() {
  let currentSection = this.currentOnscreenPhrase;
  let currentPhrase = this.player.currentSong.phrases[currentSection];
  let newBar = new Bar();
  currentPhrase.addBar(newBar);
  this.reload();
};

function removeAllChildren(parentNode) {
  while (parentNode.hasChildNodes()) {
    parentNode.removeChild(parentNode.lastChild);
  };
};

Sequencer.prototype.addPhrase = function() {
  let phraseToAdd = new Phrase();
  let firstBarForPhrase = new Bar();
  phraseToAdd.addBar(firstBarForPhrase);
  this.player.currentSong.addPhrase(phraseToAdd);
  this.reload();
  let sectionSelector = document.getElementById('sequencer-transport-bar-section-selector')
  sectionSelector.value = sectionSelector.options[sectionSelector.options.length - 1].value;
  this.showSection(sectionSelector.value); //we have to overwrite the showSection done by the reload because adding a phrase means the new phrase should be automatically selected
  this.player.visualiser.renderGridArea(this.player.currentSong);
};

Sequencer.prototype.removePhrase = function() {
  let selectedPhrase = document.getElementById('sequencer-transport-bar-section-selector').selectedIndex;
  let phraseToCheckForAbsoluteDeletion = this.player.currentSong.structure.splice(selectedPhrase, 1);
  if (!this.player.currentSong.structure.includes(phraseToCheckForAbsoluteDeletion)) {
    delete this.player.currentSong.phrases[phraseToCheckForAbsoluteDeletion];
  }
  this.reload("reset phrase");
  this.player.visualiser.renderGridArea(this.player.currentSong);
};

Sequencer.prototype.expandAddInstrumentDialogue = function() {
  document.getElementById('instrument-select-controls').style.display = "none";
  document.getElementById('instrument-add-controls').style.display = "block";
};

Sequencer.prototype.collapseAddInstrumentDialogue = function() {
  document.getElementById('instrument-add-controls').style.display = "none";
  document.getElementById('instrument-select-controls').style.display = "block";
};

Sequencer.prototype.reload = function(flag) {
  let instrumentToRestore = this.currentOnscreenInstrument;
  let sectionToRestore = this.currentOnscreenPhrase;

  this.player.load(this.player.currentSong);

  let instrumentSelector = document.getElementById('sequencer-transport-bar-instrument-selector');
  instrumentSelector.value = instrumentToRestore.name;
  this.currentOnscreenInstrument = instrumentToRestore;
  this.showInstrument(instrumentToRestore.name)

  if (flag != "reset phrase") {
    let sectionSelector = document.getElementById('sequencer-transport-bar-section-selector');
    sectionSelector.value = sectionToRestore;
    this.currentOnscreenPhrase = sectionToRestore;
    this.showSection(sectionToRestore)
  }
};

Sequencer.prototype.addInstrument = function() {
  let newInstrumentElement = document.getElementById('add-instrument-text');
  let newInstrumentName = newInstrumentElement.value;
  let newInstrument = this.player.currentSong.addInstrument(newInstrumentName);
  newInstrumentElement.value = "";
  let instrumentSelector = document.getElementById('sequencer-transport-bar-instrument-selector');
  let newOption = document.createElement("option")
  newOption.setAttribute("value", newInstrumentName);
  newOption.innerHTML = newInstrumentName;
  instrumentSelector.appendChild(newOption);
  instrumentSelector.value = newInstrumentName;
  this.collapseAddInstrumentDialogue();
  this.showInstrument(newInstrument.name);
  this.player.visualiser.renderGridArea(this.player.currentSong); // we need to make sure we re-render the visualiser area
};

Sequencer.prototype.removeInstrument = function() {
  let instrumentSelector = document.getElementById('sequencer-transport-bar-instrument-selector');
  this.player.currentSong.removeInstrument(instrumentSelector.value);
  this.player.refreshNoteBuffer();
  instrumentSelector.childNodes.forEach(function(optionElement) {
    if (optionElement.value == instrumentSelector.value) {
      instrumentSelector.removeChild(optionElement);
    };
  });
  instrumentSelector.value = instrumentSelector.firstChild.value;
  this.showInstrument(instrumentSelector.value);
  this.player.visualiser.renderGridArea(this.player.currentSong); // we need to make sure we re-render the visualiser area
};
