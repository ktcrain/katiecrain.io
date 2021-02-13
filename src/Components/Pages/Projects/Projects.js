import React, { useEffect, useRef } from "react";
import Flickity from "flickity";
import "./Projects.scss";
import data from "./data";
import ProjectsCanvas from "./ProjectsCanvas";

function Projects() {
  const flickityMount = useRef();

  useEffect(() => {
    const flickity = new Flickity(flickityMount.current, {
      wrapAround: true,
      friction: 0.75,
      on: {
        ready: function () {
          console.log("Flickity is ready");
        },
        change: function (index) {
          console.log("Slide changed to" + index);
        },
      },
    });
    console.log(flickity);

    setTimeout(() => {
      window.resizeTo(window.innerWidth - 1, window.innerHeight);
    }, 1000);
  }, []);

  return (
    <div className="Projects" id="Projects">
      <ProjectsCanvas />
      <div className="Projects-Inner">
        <div className="Projects-Slider" ref={flickityMount}>
          {data.map((obj, index) => (
            <div
              className="Projects-Slider-Slide flickity-slide"
              key={`Projects-Slider-Slide-${index}`}
            >
              <div className="Projects-Slider-Slide-Container">
                <div className="image">
                  <img className="cell__img" src={obj.img} alt={obj.title} />
                </div>
                <div className="content">
                  <h3 className="title">
                    <span className="cell__title">{obj.title}</span>
                  </h3>
                  <div className="description">
                    <p>{obj.description}</p>
                  </div>
                  <h4 className="number">
                    <span className="cell__number" data-img-src={obj.img}>
                      {obj.number}
                    </span>
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default Projects;
