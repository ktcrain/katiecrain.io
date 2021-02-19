import React, { useEffect } from "react";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import * as Tone from "tone";
import { PianoContextProvider } from "@components/Piano";

// Components
import BurgerMenu from "@components/BurgerMenu";
import Home from "../Pages/Home";
import About from "../Pages/About";
import Projects from "../Pages/Projects";
import Contact from "../Pages/Contact";
import Magic from "../Pages/Magic";
import Visual2 from "../Pages/Visual2";
import Waves from "../Pages/Waves";
import logoSvg from "@assets/images/kt-logo-white.svg";
import "./App.scss";

function App() {
  const startAudioContext = async () => {
    console.log("startAudioContext");
    return await Tone.start();
  };

  useEffect(() => {
    document.querySelector("body").addEventListener("click", startAudioContext);
  }, []);

  return (
    <Router>
      <PianoContextProvider>
        <BurgerMenu className="BurgerMenu" />
        <div className="App">
          <Link to="/">
            <img className="Logo" src={logoSvg} alt="Logo" />
          </Link>
          <main className="App-Main">
            <Switch>
              <Route path="/about">
                <About />
              </Route>
              <Route path="/art">
                <Projects />
              </Route>
              <Route path="/contact">
                <Contact />
              </Route>
              <Route path="/magic">
                <Magic />
              </Route>
              <Route path="/nyan">
                <Visual2 />
              </Route>
              <Route path="/waves">
                <Waves />
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </main>
        </div>
      </PianoContextProvider>
    </Router>
  );
}

export default App;
