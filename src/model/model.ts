import { fetchEventSource } from "@microsoft/fetch-event-source";
import {ModelPost, UserInfo, PostsEvent} from "./modelTypes"

/**
 * Wrapper around fetch to return a Promise that resolves to the desired
 * type. This function does not validate whether the response actually
 * conforms to that type.
 *
 * @param url      url to fetch from
 * @param options  fetch options
 * @returns        a Promise that resolves to the unmarshaled JSON response
 * @throws         an error if the fetch fails, there is no response body,
 *                 or the response is not valid JSON
 */
function typedFetch<T>(url: string, options?: RequestInit): Promise<T> {
    return fetch(url, options).then((response: Response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
  
      // Return decoded JSON if there is a response body or null otherwise
      const contentLength = response.headers.get("Content-Length");
      if (contentLength && contentLength !== "0") {
        // Type of unmarshaled response needs to be validated
        return response.json() as Promise<T>;
      } else {
        // No content
        throw new Error(`unexpected empty response`);
      }
    });
}

// TODO: can you declare a global in both the model AND the view?
declare global {
  interface DocumentEventMap {
    postsEvent: CustomEvent<PostsEvent>;
  }
}

// Class representing our model interfacing with OwlDB.
export class OwlDBModel {

    private posts: Array<ModelPost>;

    private token: string;

    constructor() {
      this.posts = [];
      this.token = "";
      this.addPost.bind(this);
    }

    // Method to return the path to the database used.
    getDatabasePath(): string {
        if (process.env.DATABASE_HOST === undefined) {
            throw new Error("Database host is undefined");
        }
        if (process.env.DATABASE_PATH === undefined) {
            throw new Error("Database path is undefined")
        }
        return process.env.DATABASE_HOST + process.env.DATABASE_PATH;
    }

    getAuthPath(): string {
      if (process.env.DATABASE_HOST === undefined) {
        throw new Error("Database host is undefined");
      }
      return process.env.DATABASE_HOST + "/auth";
    }

    login(username: string): Promise<UserInfo> {
      const options = {
          method: "POST",
          // Should use the actual username here 
          body: `{"username": ${username}}`,
        };
        return typedFetch(this.getAuthPath(), options); 
      }

    logout(token: string): Promise<void> {
        const options = {
          method: "DELETE",
        };
        return typedFetch(this.getAuthPath(), options);
    }

    addPost(postContent: string): void {
      // TODO: obviously do some sort of validation here.
      // most likely do this on the receiving end. call a valid. func
      const jsonContents = JSON.parse(postContent) as ModelPost;
      this.posts.push(jsonContents);
    }

    subscribeToPosts(workspaceName: string, collectionName: string): void {
      const thisModel = this;
      // TODO: change this to use the actual token (hardcoding it here for testing)
      const options = {
        Authorization: "Bearer " + "a1b2c3d4e5f6g7h8i9j0",
        accept: "application/json"
      }
      let fetchUrl = this.getDatabasePath() + `/${workspaceName}/channels/${collectionName}/posts/?mode=subscribe`
      fetchEventSource(fetchUrl, {
        headers: options,
        // TODO: I am SURE that you can theoretically have some extra
        // error handling here too, for impossible events.
        onmessage(event) {
          switch (event.event) {
            case "update":
              thisModel.addPost(event.data);
              const postsEvent = new CustomEvent("postsEvent", {
                detail: {posts: thisModel.posts},
              });
              document.dispatchEvent(postsEvent);
              // TODO: does TS use these 'break' statements
              // like are conventionally used?
              break;
            case "delete":
              // placeholder
              throw new Error("Posts cannot be deleted");
          }
        }
      })
    }
  } 