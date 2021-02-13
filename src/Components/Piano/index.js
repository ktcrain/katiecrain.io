import Piano from "./Piano";
import usePiano from "./hooks/usePiano";
import { usePianoContext, PianoContextProvider } from "./hooks/context";
import updateAudioProps from "./util/updateAudioProps";

export default Piano;
export { usePiano, PianoContextProvider, usePianoContext, updateAudioProps };
