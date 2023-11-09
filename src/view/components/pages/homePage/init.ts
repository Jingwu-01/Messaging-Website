import HomePage from ".";

export default function homePageInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <template id="home-page-template">
    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
    <script src="src/view/components/pages/homePage/index.ts"></script>
    <style>
      * {
        background-color: #add8e6;
        text-align: center;
      }
  
      #flex-container1 {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100vw;
        margin: 0;
        height: 100vh;
      }
  
      h1 {
        margin-top: 60px;
        font-size: 50px;
      }
  
      #subtitle {
        background-color: #add8e6;
      }
  
      #flex-container2 {
        background-color: #ffffff;
        width: 50%;
        margin: 0 auto;
      }
  
      p {
        background-color: #ffffff;
      }
  
      form {
        background-color: #ffffff;
      }
  
      input {
        background-color: #d9d9d9;
        border: 1px solid #333;
      }
    </style>
  
    <div id="flex-container1">
      <h1>Messaging</h1>
      <p id="subtitle">A Messaging App for All Your Groups</p>
      <div id="flex-container2">
        <p>Enter your username to login:</p>
        <form id="username-form">
          <input
            type="text"
            id="username-input"
            name="text_field"
            placeholder="Your username..."
          />
          <button type="submit">
            <iconify-icon
              icon="ic:baseline-login"
              id="username-submit"
            ></iconify-icon>
          </button>
        </form>
      </div>
    </div>
  </template>
  
`
  );

  customElements.define("home-page", HomePage);
}
