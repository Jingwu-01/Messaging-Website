class ReplyButtonComponent extends HTMLElement {
    private controller: AbortController | null = null;
    
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
  
      if (this.shadowRoot) {
        let template = document.querySelector("#reply-button-component-template");
        if (!(template instanceof HTMLTemplateElement)) {
          throw new Error("reply button template is not HTML template element");
        } else {
          this.shadowRoot.append(template.content.cloneNode(true));
        }
      }
    }
  
    connectedCallback(): void {
      this.controller = new AbortController();
      const options = { signal: this.controller.signal };
  
      const replyButton = this.shadowRoot?.querySelector("#reply-button");
      if (!(replyButton instanceof HTMLButtonElement)) {
        throw new Error("replyButton not HTML button element");
      }
      replyButton.addEventListener("click", this.openChatBox.bind(this), options); 
    }
  
    disconnectedCallback(): void {
      this.controller?.abort();
      this.controller = null;
    } 
  
    openChatBox() {

    }

  }
  export default ReplyButtonComponent; 
  