import React, { useState } from "react";
import Piano from "@components/Piano";
import "./Home.scss";
import HomeCanvas from "./HomeCanvas";

function Home() {
  const doSomething = () => {
    window.dispatchEvent(new CustomEvent("DO_SOMETHING"));
    setPianoActive(true);
  };

  const [pianoActive, setPianoActive] = useState(false);

  return (
    <div className="Page Home">
      <HomeCanvas />
      <div className="Page-Content Home-Content">
        {!pianoActive && (
          <button className="btn-circle" onClick={doSomething}>
            Touch me
          </button>
        )}
        <Piano />
      </div>
    </div>
  );
}

export default Home;
