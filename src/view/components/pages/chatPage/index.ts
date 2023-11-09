export class ChatPageComponent extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    let template = document.querySelector<HTMLTemplateElement>(
      "#chat-page-template"
    );
    if (!template) {
      throw Error("Could not find template #chat-page-template");
    }
    this.shadowRoot?.append(template.content.cloneNode(true));
  }
}

export default ChatPageComponent;
