type StringFunction = () => string;

export class PostEditor extends HTMLElement {

    // TODO: can definitely add abortcontroller for event handlers and
    // 'deregistering' the event handlers here.

    private postOperations: HTMLElement;

    // TODO: can we make this more generic?
    private postInput: HTMLTextAreaElement;

    private postSubmit: HTMLElement;

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

        let postOperations = this.shadowRoot.querySelector("#post-operations");
        let postInput = this.shadowRoot.querySelector("#post-input");
        let postSubmit = this.shadowRoot.querySelector("#post-submit");

        if (!(postOperations instanceof HTMLElement)) {
            throw Error("Could not find an element with the post-operations id");
        }
        if (!(postInput instanceof HTMLTextAreaElement)) {
            throw Error("Could not find a text area element with the post-form id");
        }

        if (!(postSubmit instanceof HTMLElement)) {
            throw Error("Could not find an element with the post-submit id");
        }

        this.postOperations = postOperations;
        this.postInput = postInput;
        this.postSubmit = postSubmit;

    }

    connectedCallback() {
        // post editor operation callbacks
        let postOperationElements = this.postOperations.children;
        for (let childEl of postOperationElements) {
            let id = childEl.id;
            let splitId = id.split("-");
            let operationType = splitId[1];
            let innerTextFunc: StringFunction;
            let prefixFunc: StringFunction;
            let suffixFunc: StringFunction;
            switch (operationType) {
                case "reaction": {
                    innerTextFunc = () => {return splitId[0]};
                    break;
                }
                case "text": {
                    innerTextFunc = () => {
                        let startCharIdx = this.postInput.selectionStart;
                        let endCharIdx = this.postInput.selectionEnd;
                        return this.postInput.value.substring(startCharIdx, endCharIdx);
                    }
                    break;
                }
                default: {
                    throw Error(`post editor connected callback: expected id of post operation to be of the form <operation>-text or <operation>-reaction, but id is: ${id}`);
                }
            }
            switch (splitId[0]) {
                case "bold":
                    prefixFunc = this.boldMarkdown;
                    suffixFunc = this.boldMarkdown;
                    break;
                case "italicize":
                    prefixFunc = this.italicsMarkdown;
                    suffixFunc = this.italicsMarkdown;
                    break;
                case "link":
                    prefixFunc = this.urlPrefixMarkdown;
                    suffixFunc = this.urlSuffixMarkdown;
                    break;
                default:
                    // assume it's a reaction; there's no error handling here.
                    prefixFunc = this.reactionMarkdown;
                    suffixFunc = this.reactionMarkdown;
                    break;
            }
            childEl.addEventListener("click", () => {
                this.applyTextFormatting(prefixFunc, suffixFunc, innerTextFunc);
            });
        }

        // adding a post callback
        this.postSubmit.addEventListener("submit", this.submitPost.bind(this))
    }

    applyTextFormatting(prefixFunc: StringFunction, suffixFunc: StringFunction, selectedValFunc: StringFunction) {
        let startCharIdx = this.postInput.selectionStart;
        let endCharIdx = this.postInput.selectionEnd;
        this.postInput.value = this.postInput.value.substring(0, startCharIdx) + 
        prefixFunc() + selectedValFunc() + suffixFunc() + this.postInput.value.substring(endCharIdx);
    }

    submitPost(event: SubmitEvent) {
        event.preventDefault();
        
    }

    reactionMarkdown() {
        return ":";
    }

    boldMarkdown() {
        return "**";
    }

    italicsMarkdown() {
        return "*";
    }

    urlPrefixMarkdown() {
        return "[";
    }

    urlSuffixMarkdown() {
        return "]()";
    }


}