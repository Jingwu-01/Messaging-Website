export class PostEditor extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: "open" });

        let template = document.querySelector("#post-editor-template");

        if (!(template instanceof HTMLTemplateElement)) {
            throw Error("post editor template was not found");
        }

        if (this.shadowRoot === null) {
            throw Error(
              "could not find shadow DOM root for post-editor element in constructor"
            );
        }

        this.shadowRoot.append(template.content.cloneNode(true));

    }


}