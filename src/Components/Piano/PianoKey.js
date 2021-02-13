import React, { useEffect, useRef } from "react";
import * as Mousetrap from "mousetrap";

function PianoKey({ shortcut, note, letter, handler }) {
  // const [isActive, setIsActive] = useState(false);

  const buttonRef = useRef();

  const handleShortcut = () => {
    handler({ note });

    console.log(buttonRef.current);
    buttonRef.current.classList.add("active");

    setTimeout(() => {
      buttonRef.current.classList.remove("active");
    }, 250);
  };

  const handleClick = () => {
    handler({ note });
  };

  useEffect(() => {
    Mousetrap.bind(shortcut, handleShortcut);
    return () => {
      Mousetrap.unbind(shortcut);
    };
  });

  return (
    <button
      ref={buttonRef}
      className={letter}
      note={note}
      onClick={handleClick}
    >
      <p>{letter}</p>
    </button>
  );
}
export default PianoKey;
