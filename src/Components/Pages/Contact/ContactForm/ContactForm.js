import React from "react";
import "./ContactForm.scss";

function ContactForm() {
  const handleSubmit = () => {
    console.log("submit");
  };

  return (
    <form className="Contact-Form" onSubmit={handleSubmit}>
      <div className="Form-Element">
        <label htmlFor="Input-Name">
          <span>Name</span>
          <input type="text" name="name" id="Input-Name" />
        </label>
      </div>
      <div className="Form-Element">
        <label htmlFor="Input-Email">
          <span>Email</span>
          <input type="email" name="email" id="Input-Email" />
        </label>
      </div>
      <div className="Form-Element">
        <label htmlFor="Input-Message">
          <span>Message</span>
          <textarea name="message" id="Input-Message"></textarea>
        </label>
      </div>
      <div className="Form-Element">
        <button type="submit">Submit</button>
      </div>
    </form>
  );
}
export default ContactForm;
