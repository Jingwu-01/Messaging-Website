import { slog } from "../../../../../slog";
import { ViewPostUpdate } from "../../../../datatypes";
import { getView } from "../../../../view";
import PostComponent from "../postComponent";

export class StarredPosts extends HTMLElement {

    private postsContainer: HTMLElement;
    private postsDialog: HTMLDialogElement;
    private closeButton: HTMLElement; 
    private controller: AbortController | null = null;

    constructor() {
        super();

        this.attachShadow({mode: "open"});

        let template = document.querySelector("#starredposts-template");
        if (!(template instanceof HTMLTemplateElement)) {
            throw Error("starred posts template was not found");
        }

        if (this.shadowRoot === null) {
            throw Error(
              "could not find shadow DOM root for starredposts element in constructor",
            );
        }

        this.shadowRoot.append(template.content.cloneNode(true));

        let postsContainer = this.shadowRoot.querySelector("#posts-container");
        // TODO: think about if you even want/need starredPostsWrapper?
        let starredPostsWrapper = this.shadowRoot.querySelector(
          "#starredposts-wrapper",
        );
        let postsDialog = this.shadowRoot.querySelector("#starred-posts-dialog")
        let closeButton = this.shadowRoot.querySelector("#close-starred-posts")
        
        if (!(postsContainer instanceof HTMLElement)) {
            throw new Error("Could not find an element with the posts-container id");
        }

        if (!(starredPostsWrapper instanceof HTMLElement)) {
            throw new Error("Could not find an element with the id starredposts-wrapper");
        }

        if (!(postsDialog instanceof HTMLDialogElement)){
            throw new Error("Could not find an element with the id starred-posts-dialog")
        }
        if (!(closeButton instanceof HTMLElement)){
            throw new Error("Could not find an element with the id close-starred-posts")
        }
        this.postsContainer = postsContainer;
        this.postsDialog = postsDialog; 
        this.closeButton = closeButton
        this.displayPosts.bind(this);
    }

    displayPosts(update: ViewPostUpdate): void {
        slog.info("starredPosts displayPosts: was called");
        if (update.starOp === "modify" || update.starOp === "insert" || update.starOp === "delete") {
            let opString = update.starOp;
            let postToUpsert = update.affectedPosts[0];
            let postComp: PostComponent;
            let postChildren: NodeListOf<Element> | undefined;
            slog.info(
                "StarredPosts displayPosts: insert or modify",
                ["postToUpsert.parent", postToUpsert.parent],
                ["postToUpsert", postToUpsert],
            );
            if (postToUpsert.starredIndex === undefined) {
                slog.error("StarredPosts displayPosts", [
                  "postToUpsert.starredIndex is undefined but should not be",
                  `${postToUpsert.starredIndex}`,
                ]);
                throw new Error("postToUpsert.starredIndex is undefined but should not be");
            }
            slog.info("StarredPosts displayPosts", ["postToUpsert.starredIndex", postToUpsert.starredIndex]);
            postChildren = this.postsContainer.querySelectorAll(
                ":scope > post-component",
            );
            if (opString === "modify" || opString === "delete") {
                let potentialPostComp = postChildren[postToUpsert.starredIndex];
                if (!(potentialPostComp instanceof PostComponent)) {
                  throw new Error("potentialPostComp is not a post component");
                }
                postComp = potentialPostComp;
            } else {
                // opstring 
                postComp = new PostComponent();
                postComp.addPostContent(postToUpsert);
            }
            postComp.setAttribute("starred", "true");
            slog.info(
                "displayPosts",
                ["postChildren", postChildren],
                ["postToUpsert.starredIndex", postToUpsert.starredIndex],
                ["postChildren.length", postChildren.length],
                ["postComp", postComp],
            );
            if (opString === "modify") {
                postComp.modifyPostContent(postToUpsert);
            } else if (opString === "insert") {
                if (postChildren.length === 0 || postToUpsert.starredIndex === postChildren.length) {
                    slog.info(
                        "StarredPosts: displayPosts: no children OR postToUpsert.starredIndex is at the end",
                        ["postToUpsert.starredIndex", postToUpsert.starredIndex],
                        ["postChildren.length", postChildren.length],
                    );
                    this.postsContainer.append(postComp);
                    slog.info("StarredPosts: displayPosts, after appending to parentEl", [
                        "this.postsContainer",
                        this.postsContainer,
                    ]);
                } else {
                    let childNode = postChildren[postToUpsert.starredIndex];
                    childNode.parentNode?.insertBefore(postComp, childNode);
                }
            } else {
                // must be delete
                postComp.parentNode?.removeChild(postComp);
            }
        }
    }

    // is connected callback atomic?
    connectedCallback() {
        slog.info("PostDisplay: connectedCallback was called");
        getView().addPostListener(this);

        this.controller = new AbortController();
        const options = { signal: this.controller.signal };
        this.closeButton.addEventListener(
         "click",this.closeDialog.bind(this),options,
    );

    }

    disconnectedCallback() {
        slog.info("PostDisplay: disconnectedCallback was called");
        getView().removePostListener(this);
    }

    moveReplyPostEditorTo(postEl: PostComponent) {
        // should never be called in theory
        return;
    }

    closeDialog(){
        this.postsDialog.close()
    }
    
    displayDialog(){
        this.postsDialog.showModal(); 
    }
    
}

export default StarredPosts;