'use strict'

// Let's make a song with one phrase, two bars of 4/4, each with C2s every quarter note.
// First, make the component parts.

const myFirstSong = new Song();
const myFirstPhrase = new Phrase();
const barOne = new Bar();
const barTwo = new Bar();
const trumpetC = new Note("Trumpet", "C", 2);

// Now we'll put the parts together how they belong: adding the bars to the phrase, adding the phrase to the song...

myFirstPhrase.addBar(barOne, barTwo);
myFirstSong.addPhrase(myFirstPhrase);

// ...and adding the trumpet C note on the first semiquaver (sixteenth) of every beat (quarter note).

barOne.beats[1][1].push(trumpetC); // The first [1] is a beat, the second can be [1],[2],[3] or [4]. That's to split each beat in to the semiquavers.
barOne.beats[2][1].push(trumpetC); // In this example the second [number] is always 1.
barOne.beats[3][1].push(trumpetC); // That's because we want the note to be triggered only at the very start.
barOne.beats[4][1].push(trumpetC); // If we used all [3] on the second note, we'd have a syncopated/off-beat rhythm.

// ...and some 2s and 4s on the second bar.

barTwo.beats[2][1].push(trumpetC);
barTwo.beats[4][1].push(trumpetC);

// Let's make a second phrase too, and add it to the song. we'll leave it empty in this example.

const mySecondPhrase = new Phrase();
myFirstSong.addPhrase(mySecondPhrase);

// but now we have two phrases (section A and section B) let's repeat the first phrase.
// this will give us an A - B - A song structure.

myFirstSong.duplicatePhrase('A');

// Now we can see what the whole song object looks like:
// console.log(myFirstSong)

// ...and that's how a song could be made!
// ---------------------------------------

// Now let's 'play' the song.

// We'll first make a player.
const myPlayer = new Player();

// Then load the song into it.

myPlayer.load(myFirstSong);

// Now we can play it!

myPlayer.play();

// It's that easy.
