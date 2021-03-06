import React, { useState } from "react";
import { bubble as Menu } from "react-burger-menu";
import { Link } from "react-router-dom";
import "./BurgerMenu.scss";

function BurgerMenu() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleStateChange = (state) => {
    setMenuOpen(state.isOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // const toggleMenu = () => {
  //   setMenuOpen(!menuOpen);
  // };

  return (
    <Menu
      right
      isOpen={menuOpen}
      onStateChange={(state) => handleStateChange(state)}
    >
      <Link
        className="menu-item"
        onClick={() => closeMenu()}
        id="Nav-Home"
        to="/"
      >
        Home
      </Link>
      <Link
        className="menu-item"
        onClick={() => closeMenu()}
        id="Nav-About"
        to="/about"
      >
        About
      </Link>
      <Link
        className="menu-item"
        onClick={() => closeMenu()}
        id="Nav-Art"
        to="/art"
      >
        Art
      </Link>
      <Link
        className="menu-item"
        onClick={() => closeMenu()}
        id="Nav-Nyan"
        to="/nyan"
      >
        NYAN
      </Link>
      <Link
        className="menu-item"
        onClick={() => closeMenu()}
        id="Nav-Magic"
        to="/magic"
      >
        Magic
      </Link>
      <Link
        className="menu-item"
        onClick={() => closeMenu()}
        id="Nav-Waves"
        to="/waves"
      >
        Express
      </Link>
    </Menu>
  );
}

export default BurgerMenu;
