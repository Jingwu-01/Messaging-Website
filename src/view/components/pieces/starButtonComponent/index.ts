import { slog } from "../../../../slog";
import { ReactionUpdateEvent } from "../../../datatypes";
import { getView } from "../../../view";

class StarButtonComponent extends HTMLElement {
    private controller: AbortController | null = null;

    private starIcon: HTMLElement;

    private starButton: HTMLButtonElement;

    private parentPath: string | undefined;

    private loggedInUser: string | undefined;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        let template = document.querySelector("#star-button-component-template");

        if (!(template instanceof HTMLTemplateElement)) {
            throw new Error("StarButtonComponent: could not find an element with the id star-button-component-template");
        }

        if (this.shadowRoot === null) {
            throw new Error("StarButtonComponent: no shadow root exists");
        }

        this.shadowRoot.append(template.content.cloneNode(true));

        const starIcon = this.shadowRoot.querySelector("#star-icon");
        if (!(starIcon instanceof HTMLElement)) {
            throw new Error("StarButtonComponent: could not find an element with the #star-icon id");
        }
        
        const starButton = this.shadowRoot.querySelector("#star-button");
        if (!(starButton instanceof HTMLButtonElement)) {
            throw new Error("StarButtonComponent: could not find an element with the #star-button id");
        }

        this.starIcon = starIcon;
        this.starButton = starButton;
    }

    connectedCallback(): void {
        this.controller = new AbortController();
        const options = { signal: this.controller.signal };
        this.starButton.addEventListener(
            "click",
            this.updateStarred.bind(this),
            options
        );
    }

    disconnectedCallback(): void {
        this.controller?.abort();
        this.controller = null;
    }

    updateStarred() {
        let user = this.loggedInUser;
        let postPath = this.parentPath;
        let curReacted: boolean;
        if (postPath === undefined || user === undefined) {
            getView().displayError("tried to star a malformed post");
            slog.error("StarButtonComponent: updateStarred, user or postPath is undefined", ["user", user], ["postPath", postPath]);
            return;
        }
        if (this.starButton.classList.contains("reacted")) {
            curReacted = true;
        } else {
            curReacted = false;
        }
        let starEventContent: ReactionUpdateEvent = {
            userName: user,
            postPath: postPath,
            add: !curReacted,
            reactionName: undefined,

        };
        slog.info("StarButtonComponet: updateStarred", ["starEventContent", starEventContent]);
        const starUpdateEvent = new CustomEvent("reactionUpdateEvent", {
            detail: starEventContent
        });
        document.dispatchEvent(starUpdateEvent);
    }

    static get observedAttributes(): string[] {
        return ["icon", "reacted"];
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === "reacted") {
            // TODO: compare to old values and stuff
            if (newValue === "true") {
                this.starButton.classList.add("reacted");
            } else {
                this.starButton.classList.remove("reacted");
            }
        }
    }

    setParentPath(parentPath: string) {
        this.parentPath = parentPath;
    }

    setLoggedInUser(username: string) {
        this.loggedInUser = username;
    }
}

export default StarButtonComponent;
