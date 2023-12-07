import HomePage from ".";

/**
 * Initialize the HomePage by inserting its html to the document and defining
 * the home-page custom element.
 */
export default function homePageInit() {
  // Insert the html of HomePage to the document.
  document.body.insertAdjacentHTML(
    "beforeend",
    `
<template id="home-page-template">
  <style>
    dialog {
      background-color: #add8e6;
      text-align: center;
      border: none;
      box-shadow: #00000029 2px 2px 5px 2px;
      border-radius: 10px;
      padding: 0px;
      height: 500px;
      width: 1000px;
    }

    dialog header {
      display: flex;
      flex-direction: column;
    }

    dialog h1 {
      font-size: 50px;
      margin-block-end: 0;
    }

    dialog h2 {
      background-color: #add8e6;
      margin-block-end: 3em;
    }

    dialog main {
      background-color: #ffffff;
      width: 50%;
      margin: 0 auto;
      border-radius: 15px;
      padding: 0px 0px 30px 0px;
    }

    dialog p {
      font-size: 20px;
      background-color: #ffffff;
    }

    dialog form {
      background-color: #ffffff;
    }

    dialog input {
      background-color: #d9d9d9;
      text-align: center;
      border: 1px solid #333;
      border-radius: 15px;
      height: 3em;
      width: 25vw;
      font-size: 15px;
    }

    button {
      border-radius: 15px;
      height: 2em;
      width: 2em;
    }

    button:hover {
      background-color: #818589;
    }

    button:active {
      background-color: #5a5a5a;
    }

    button:focus-visible {
      box-shadow: #FF0000 0 0 0 3px;
      outline: none;
    }

    button:focus:not(:focus-visible) {
      box-shadow: none;
      outline: none;
    }

    dialog::backdrop {
      backdrop-filter: blur(2px);
    }

    #username-input:focus-visible {
      box-shadow: #FF0000 0 0 0 3px;
      outline: none;
    }

    #username-input:focus:not(:focus-visible) {
      box-shadow: none;
      outline: none;
    }
    
  </style>
  <dialog id="login-dialog">
    <header>
      <h1>Messaging</h1>
      <h2>A Messaging App for All Your Groups</h2>
      <main>
        <p>Enter your username to login:</p>
        <form id="username-form">
          <input
            type="text"
            id="username-input"
            name="text_field"
            placeholder="Your username..."
            arial-label="Your username"
          />
          <button type="submit" aria-label="Submit" id="submit-button" >
            <iconify-icon
              icon="ic:baseline-login"
              id="username-submit"
            ></iconify-icon>
          </button>
        </form>
      </main>
    </header>
  </dialog>
</template>
`,
  );

  // Define the custom element of home-page.
  customElements.define("home-page", HomePage);
}
