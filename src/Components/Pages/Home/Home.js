import React, { useState, useEffect } from "react";
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
      <div className="Page-Content Home-Content" style={{height:window.innerHeight}}>
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
