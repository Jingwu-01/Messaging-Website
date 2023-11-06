class PostDisplay extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({mode: "open"});

        let template = document.querySelector("postdisplay-template");
        if (!(template instanceof HTMLTemplateElement)) {
            throw Error("post display template was not found");
        }
        if (this.shadowRoot === null) {
            throw Error("could not find shadow DOM root for postdisplay element in constructor");
        }

        
    }
}