import * as Tone from "tone";

/**
 * usePiano
 *
 * Interface for Piano Synth => PianoContextProvider
 *
 * @return {*} */

function usePiano() {
  // const fft = new Tone.Analyser("fft", 1024);
  const waveform = new Tone.Analyser("waveform", 1024);
  const synth = new Tone.Synth();
  // synth.chain(fft, waveform, Tone.Destination);
  synth.chain(waveform, Tone.Destination);
  // synth.toDestination();

  return { synth, waveform };
}

export default usePiano;
