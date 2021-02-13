import React from "react";
import "./Contact.scss";
import ContactCanvas from "./ContactCanvas";
import ContactForm from "./ContactForm";

function Contact() {
  return (
    <div className="Page Contact" id="Contact">
      <ContactCanvas />
      <div className="Page-Content Contact-Content">
        <ContactForm />
      </div>
    </div>
  );
}

export default Contact;
