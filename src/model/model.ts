import { typedFetch, emptyFetch, getAuthPath, getDatabasePath, validateLoginResponse } from "./utils";
import { ModelWorkspace } from "./workspace";
import { WorkspaceResponse } from "./responseTypes";
import { slog } from "../slog";
import { LoginResponse } from "../types/loginResponse";

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

  async login(username: string): Promise<LoginResponse> {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ username: username }),
    };
    try {
      const response = await typedFetch<LoginResponse>(getAuthPath(), options);
      const valid = validateLoginResponse(response);
      if (!valid) {
        slog.error("login", ["invalid response from login", `${validateLoginResponse.errors}`]);
        // TODO: make a custom login error class so we can gracefully handle this situation by notifying the user.
        throw new Error("invalid login response received from owldb");
      }
      if (response.token) {
        this.token = response.token;
      }
      // return response;
    } catch (error) {
      // maybe don't catch an error if you're just going to rethrow it
      throw error;
    }
    // TODO: fix: why are you making another login call????
    return typedFetch<LoginResponse>(getAuthPath(), options);
  }

  async logout(): Promise<void> {
    const options = {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + this.token,
        Accept: "application/json",
      },
    };
    // TODO: how are you handling the case where emptyFetch has invalid data because it does indeed
    // have a response body?
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

  getToken(): string {
    return this.token;
  }
}

// Model singleton
let modelSingleton = new OwlDBModel();
export function getModel() {
  return modelSingleton;
}
