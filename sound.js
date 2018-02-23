class Sound {

  constructor(context, instrument) {
    this.context = context;
    this.durationMap = {
      1: 2,
      2: 1.2,
      4: 1,
      8: 0.6,
      16: 0.4
    } // this is about right for 120 bpm
    this.instrument = instrument;
    this.sounds = [];
  };

  init() {
    this.instrument.sounds.forEach(function(sound, index) {
      let soundConfig = {
        id : index + 1
      };

      if (sound.type == "noise") {
        soundConfig.type = "noise";
        soundConfig.noise = this.context.createBufferSource();
        soundConfig.noise.buffer = this.noiseBuffer(sound.noiseDuration || 1);
        soundConfig.noiseFilter = this.context.createBiquadFilter();
        soundConfig.noiseFilter.type = sound.filterType || "highpass";
        soundConfig.noiseFilter.frequency.value = sound.filterFrequency || 1000;
        soundConfig.noise.connect(soundConfig.noiseFilter);
        soundConfig.noiseEnvelope = this.context.createGain();
        soundConfig.noiseFilter.connect(soundConfig.noiseEnvelope);
        soundConfig.noiseEnvelope.connect(this.context.destination);
      } else if (sound.type == "note") {
        soundConfig.type = "note";
        soundConfig.osc = this.context.createOscillator();
        soundConfig.gainNode = this.context.createGain();
        if (sound.waveform == "custom") {
          let c = sound.customInstrumentWaveTable.real.length;
          let real = new Float32Array(c);
          let imag = new Float32Array(c);
          for (let i = 0; i < c; i++) {
            real[i] = sound.customInstrumentWaveTable.real[i];
            imag[i] = sound.customInstrumentWaveTable.imag[i];
          }

          let customTable = this.context.createPeriodicWave(real, imag);
          soundConfig.osc.setPeriodicWave(customTable);
        } else {
          soundConfig.osc.type = sound.waveform;
        }
        soundConfig.osc.connect(soundConfig.gainNode);
        soundConfig.gainNode.connect(this.context.destination)
      }
      this.sounds.push(soundConfig);
    }.bind(this));
  };

  play(value, time, duration) {
    this.init();

    this.sounds.forEach(function(soundConfig) {
      if (soundConfig.type == "noise") {
        soundConfig.noiseEnvelope.gain.setValueAtTime(1, time);
      	soundConfig.noise.start(time)
      } else if (soundConfig.type == "note") {
        soundConfig.osc.frequency.value = value;
        soundConfig.gainNode.gain.setValueAtTime(1, time);
        soundConfig.osc.start(time);
      }
    }.bind(this));

    this.stop(time, duration);
  };

  stop(time, duration) {
    let mappedDuration = this.durationMap[duration]

    this.sounds.forEach(function(soundConfig, index) {
      if (soundConfig.type == "noise") {
        soundConfig.noiseEnvelope.gain.exponentialRampToValueAtTime(0.001, time + mappedDuration);
        soundConfig.noise.stop(time + mappedDuration);
      } else if (soundConfig.type == "note") {
        soundConfig.gainNode.gain.exponentialRampToValueAtTime(0.001, time + mappedDuration);
        soundConfig.osc.stop(time + mappedDuration);
      }
    }.bind(this));
  };

  noiseBuffer(seconds = 1) {
  	var bufferSize = this.context.sampleRate * seconds;
  	var buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
  	var output = buffer.getChannelData(0);

  	for (var i = 0; i < bufferSize; i++) {
  		output[i] = Math.random() * 2 - 1;
  	}

  	return buffer;
  };

};
