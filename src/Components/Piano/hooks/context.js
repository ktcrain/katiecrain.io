import React, { useContext } from "react";
import usePiano from "./usePiano";

const PianoContext = React.createContext();
export default PianoContext;

const PianoContextProvider = (props) => {
  const { synth, fft, waveform } = usePiano();

  // useEffect(() => {
  //   return () => {
  //     // [TODO]> Should these be here?
  //     synth.dispose();
  //     fft.dispose();
  //     waveform.dispose();
  //   };
  // });

  return (
    <PianoContext.Provider
      value={{
        synth,
        fft,
        waveform,
      }}
    >{props.children}</PianoContext.Provider>
  );
}

function usePianoContext() {
  return useContext(PianoContext);
}

export { PianoContextProvider, usePianoContext };
