import { PostResponse } from "../../types/postResponse";

export class AdapterPost {
    private name: string;

    private response: PostResponse;

    private replies: Map<string, AdapterPost> = new Map<string, AdapterPost>();

    private parentName: string;

    constructor(response: PostResponse) {
        // TODO: add more robust error handling here.
        console.log(`AdapterPost constructor: response.path: ${response.path}`);
        console.log(`AdapterPost constructor: response.path.split("/"): ${response.path.split("/")}`);
        console.log(`AdapterPost constructor: response.path.split("/").pop(): ${response.path.split("/").pop()}`);
        let name = response.path.split("/").pop()
        if (name === undefined) {
            throw Error("ModelPost constructor: internal server error; path is an empty string");
        }
        this.name = name;
        this.response = response;
        if (response.doc.parent === undefined || response.doc.parent === "") {
            this.parentName = "";
        } else {
            let parentPathArr = response.doc.parent.split("/");
            if (parentPathArr.length !== 6) {
            throw new Error("model post constructor: parentPathArr is not of the correct length");
            }
            let parentName = parentPathArr.pop();
            if (parentName === undefined) {
            throw new Error("model post constructor: internal server error (last element of parentPathArr is undefined)");
            }
            this.parentName = parentName;
        }
    }

    getName() {
        return this.name;
    }

    getParentName() {
        return this.parentName;
    }

    addChildPost(postChild: AdapterPost) {
        // binary search
    }
}