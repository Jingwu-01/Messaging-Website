import HomePage from ".";

export default function homePageInit() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <template id="home-page-template">
    <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
    <script src="src/view/components/pages/homePage/index.ts"></script>
    <style>

    dialog {
      border: none;
      box-shadow: #00000029 2px 2px 5px 2px;
      border-radius: 10px;
      padding: 0px;
      height: 500px; 
      width: 1000px;
      
    }
    
      * {
        background-color: #add8e6;
        text-align: center;
      }
  
      #flex-container1 {
        display: flex;
        flex-direction: column;      
      }
  
      h1 {
        font-size: 50px;
        margin-block-end: 0;
      }
  
      #subtitle {
        background-color: #add8e6;
        margin-block-end: 3em;
      }
  
      #flex-container2 {
        background-color: #ffffff;
        width: 50%;
        margin: 0 auto;
        border-radius: 15px;
        padding: 0px 0px 30px 0px;
      }
  
      p {
        font-size: 20px;
        background-color: #ffffff;
      }
  
      form {
        background-color: #ffffff;
      }
  
      input {
        background-color: #d9d9d9;
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
    </style>
    <dialog id="dialog">
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
    </dialog>
  </template>
  
`
  );

  customElements.define("home-page", HomePage);
}
