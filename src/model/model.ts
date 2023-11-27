import {
  typedFetch,
  emptyFetch,
  getAuthPath,
  getDatabasePath,
  validateLoginResponse,
  validateWorkspaceResponse,
  validateGetWorkspacesResponse,
} from "./utils";
import { ModelWorkspace } from "./workspace";
import { WorkspaceResponse } from "../../types/workspaceResponse";
import { slog } from "../slog";
import { LoginResponse } from "../../types/loginResponse";
import { GetWorkspacesResponse } from "../../types/getWorkspacesResponse";

// Class representing our model interfacing with OwlDB.
export class OwlDBModel {
  private username: string;
  private token: string;
  private workspaces: Map<string, ModelWorkspace> = new Map<
    string,
    ModelWorkspace
  >();
  private subscribedToWorkspaces: boolean = false;

  constructor() {
    // Initialize the posts as an empty array.
    this.username = "";
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
        slog.error("login", [
          "invalid response from login",
          `${validateLoginResponse.errors}`,
        ]);
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
      const response = await this.typedModelFetch<WorkspaceResponse>(`/${id}`, {
        headers: {
          accept: "application/json",
        },
      });
      const valid = validateWorkspaceResponse(response);
      if (!valid) {
        slog.error("getWorkspace", [
          "invalid response from retrieving a workspace",
          `${validateWorkspaceResponse.errors}`,
        ]);
        // TODO: make a custom login error class so we can gracefully handle this situation by notifying the user.
        throw new Error("invalid workspace response received from owldb");
      }
      let freshWorkspace = new ModelWorkspace(response);
      this.workspaces.set(id, freshWorkspace);
      return freshWorkspace;
    }
  }

  async getAllWorkspaces(): Promise<Map<string, ModelWorkspace>> {
    // Update workspaces, if we aren't subscribed
    if (!this.subscribedToWorkspaces) {
      this.workspaces = new Map<string, ModelWorkspace>();
      let db_workspaces =
        await this.typedModelFetch<GetWorkspacesResponse>(`/`);
      const valid = validateGetWorkspacesResponse(db_workspaces);
      if (!valid) {
        slog.error("getWorkspace", [
          "invalid response from getting all workspaces",
          `${validateGetWorkspacesResponse.errors}`,
        ]);
        // TODO: make a custom login error class so we can gracefully handle this situation by notifying the user.
        throw new Error(
          "invalid getting all workspaces response received from owldb"
        );
      }
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

  // Adds the workspace with name workspaceName to OwlDB.
  // Will not overwrite an existing workspace.
  async addWorkspace(workspace_name: string): Promise<void> {
    // Add this workspace to the API
    await this.typedModelFetch<any>(`/${workspace_name}`, {
      method: "PUT",
    });
    // TODO: Figure out how to make the workspace not overwrite.
    // Now, either:
    // 1. we are subscribed to workspaces, so OWLDB will send back a message which updates the state
    // or:
    // 2. we aren't subscribed, in which case the adapter will manually refresh, if it wants to.
    // Either way, we don't have to do anything else.
  }

  async removeWorkspace(workspace_name: string): Promise<void> {
    await this.typedModelFetch<any>(`/${workspace_name}`, {
      method: "DELETE",
    });
  }

  async updateReaction(reactionName: string): Promise<void> {
    const options = {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + this.token,
        Accept: "application/json",
      },
    };
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
