import { UserInfo } from "./modelTypes";
import { typedFetch, emptyFetch, getAuthPath, getDatabasePath } from "./utils";
import { ModelWorkspace } from "./workspace";
import { WorkspaceResponse } from "./responseTypes";

// Class representing our model interfacing with OwlDB.
export class OwlDBModel {
  private token: string;
  private workspaces: Map<string, ModelWorkspace> = new Map<
    string,
    ModelWorkspace
  >();
  private subscribedToWorkspaces: boolean = false;

  constructor() {
    // Initialize the posts as an empty array.
    this.token = "";
  }

  // Wrapper around utils.typedFetch that
  // adds the Authorization header based on the logged-in user
  // and the database path before the url
  async typedModelFetch<T>(url: string, options?: RequestInit): Promise<T> {
    // console.log(`typedModelFetch: this.token: ${this.token}`)
    if (!options) {
      options = {};
    }
    options.headers = {
      ...options.headers,
      Authorization: "Bearer " + this.token,
    };
    console.log(`typedModelFetch: options: ${JSON.stringify(options)}`);
    console.log(`typedModelFetch: fetch path: ${getDatabasePath()}${url}`);
    return typedFetch<T>(`${getDatabasePath()}${url}`, options);
  }

  /* async function that logs in with the input username. It sends a Post request with the username in the body and stores the token of the response if it exists. It returns a promise of UserInfo. */
  async login(username: string): Promise<UserInfo> {
    // Send a POST request to OwlDB with the username in the body to log in.
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ username: username }),
    };
    try {
      const response = await typedFetch<UserInfo>(getAuthPath(), options);
      // If the response contains a token, store it in this.token.
      if (response.token) {
        this.token = response.token;
      }
    } catch (error) {
      // Rethrow any caught error.
      throw error;
    }

    // Return a promise of UserInfo
    return typedFetch<UserInfo>(getAuthPath(), options);
  }

  /* async function that logs out the current user. It sends a DELETE request to log out and returns a void promise. */
  async logout(): Promise<void> {
    // Send a DELETE request to OwlDB to log out.
    const options = {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + this.token,
        Accept: "application/json",
      },
    };
    // Return a void promise.
    return emptyFetch(getAuthPath(), options);
  }

  async getWorkspace(id: string): Promise<ModelWorkspace> {
    // Get logged in user
    let existingWorkspace = this.workspaces.get(id);
    if (existingWorkspace) {
      return existingWorkspace;
    } else {
      let freshWorkspace = new ModelWorkspace(
        await this.typedModelFetch<WorkspaceResponse>(`/${id}`, {
          headers: {
            accept: "application/json",
          },
        })
      );
      this.workspaces.set(id, freshWorkspace);
      return freshWorkspace;
    }
  }

  async getAllWorkspaces(): Promise<Map<string, ModelWorkspace>> {
    // Update workspaces, if we aren't subscribed
    if (!this.subscribedToWorkspaces) {
      this.workspaces = new Map<string, ModelWorkspace>();
      let db_workspaces = await this.typedModelFetch<WorkspaceResponse[]>(`/`);
      db_workspaces.forEach((workspace_response) => {
        let split_path = workspace_response.path.split("/");
        let workspace_name = split_path[split_path.length - 1];
        this.workspaces.set(
          workspace_name,
          new ModelWorkspace(workspace_response)
        );
      });
    }
    return this.workspaces;
  }

  /* Getter function that returns the token. */
  getToken(): string {
    return this.token;
  }
}

// Model singleton
let modelSingleton = new OwlDBModel();
export function getModel() {
  return modelSingleton;
}
