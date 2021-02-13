import React from "react";
import "./Piano.scss";
import PianoKey from "./PianoKey";
import { usePianoContext } from "./hooks";

function Piano() {
  const { synth } = usePianoContext();

  const handleTone = ({ note, action }) => {
    // console.log("handleTone", note, action);
    synth.triggerAttackRelease(note, "32n");
  };

  return (
    <div className="Piano-Container">
      <div className="Piano">
        <div className="Piano-Wrapper">
          <div className="Piano-Keys">
            <div className="Piano-Keys-Octave">
              <div className="Piano-Keys--Naturals">
                <PianoKey
                  handler={handleTone}
                  letter="C"
                  note="C2"
                  shortcut="a"
                />
                <PianoKey
                  handler={handleTone}
                  letter="D"
                  note="D2"
                  shortcut="s"
                />
                <PianoKey
                  handler={handleTone}
                  letter="E"
                  note="E2"
                  shortcut="d"
                />
                <PianoKey
                  handler={handleTone}
                  letter="F"
                  note="F2"
                  shortcut="f"
                />
                <PianoKey
                  handler={handleTone}
                  letter="G"
                  note="G2"
                  shortcut="g"
                />
                <PianoKey
                  handler={handleTone}
                  letter="A"
                  note="A2"
                  shortcut="h"
                />
                <PianoKey
                  handler={handleTone}
                  letter="B"
                  note="B2"
                  shortcut="j"
                />
              </div>
              <div className="Piano-Keys--Accidentals">
                <PianoKey
                  handler={handleTone}
                  letter="C"
                  note="C#2"
                  shortcut="w"
                />
                <PianoKey
                  handler={handleTone}
                  letter="D"
                  note="D#2"
                  shortcut="e"
                />
                <PianoKey
                  handler={handleTone}
                  letter="F"
                  note="F#2"
                  shortcut="r"
                />
                <PianoKey
                  handler={handleTone}
                  letter="G"
                  note="G#2"
                  shortcut="t"
                />
                <PianoKey
                  handler={handleTone}
                  letter="A"
                  note="A#2"
                  shortcut="y"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Piano;
