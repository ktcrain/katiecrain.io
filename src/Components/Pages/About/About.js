import React from "react";
import "./About.scss";
import AboutCanvas from "./AboutCanvas";

function About() {
  return (
    <div className="Page About">
      <AboutCanvas />
      <div
        className="Page-Content About-Content"
        style={{ height: window.innerHeight }}
      >
        <p>
          With over two decades of industry experience, I thrive on matching
          client’s needs to creative solutions. I’m as comfortable behind a
          console as I am pitching new business. I’ve managed up to eighteen
          people directly, and have a knack for leading through empathy.
        </p>
      </div>
    </div>
  );
}

export default About;
