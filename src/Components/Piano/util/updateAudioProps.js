import sumFrequencyData from "./sumFrequencyData";

const updateAudioProps = (waveform) => {
  const waveformTotal = sumFrequencyData(waveform.getValue());
  return waveformTotal / 100;
};

export default updateAudioProps;
