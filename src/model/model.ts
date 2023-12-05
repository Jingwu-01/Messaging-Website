/**
 * A class represeting the model for our application, holding necessary state for our application.
 */

import {
  typedFetch,
  emptyFetch,
  getAuthPath,
  getDatabasePath,
  validateLoginResponse,
  validateWorkspaceResponse,
  validateGetWorkspacesResponse,
  validatePatchDocumentResponse,
  getPatchBody,
} from "./utils";
import { ModelWorkspace } from "./workspace";
import { WorkspaceResponse } from "../../types/workspaceResponse";
import { PatchDocumentResponse } from "../../types/patchDocumentResponse";
import { slog } from "../slog";
import { LoginResponse } from "../../types/loginResponse";
import { GetWorkspacesResponse } from "../../types/getWorkspacesResponse";
import { ModelReactionUpdate, PatchBody } from "./modelTypes";

/**
 * A class representing the model we use for interfacing with OwlDB.
 */
export class OwlDBModel {
  private username: string;
  private token: string | null;
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

  /**
   * Wrapper around utils.typedFetch that
   * adds the Authorization header based on the logged-in user
   * and the database path before the url
   * @param url a string representing the URL to make the fetch call to
   * @param options an object containing configuration options for the fetch call
   * @returns a Promise resolving to requested datatype T
   */
  async typedModelFetch<T>(url: string, options?: RequestInit): Promise<T> {
    // console.log(`typedModelFetch: this.token: ${this.token}`)
    if (!options) {
      options = {};
    }

    options.headers = {
      // Default to bearer authorization with our user's token.
      Authorization: "Bearer " + this.token,
      // If the caller specified different headers, then the above
      // headers will be overwritten.
      ...options.headers,
    };
    slog.info("typedModelFetch", [
      "${getDatabasePath()}${url}",
      `${getDatabasePath()}${url}`,
    ]);
    return typedFetch<T>(`${getDatabasePath()}${url}`, options);
  }

  /**
   * Wrapper around utils.emptyFetch
   * adds the Authorization header based on the logged-in user
   * and the database path before the url
   * @param url a string representing the URL to be make a request for
   * @param options an object containing configuration options for fetch
   * @returns an empty Promise
   */
  async emptyModelFetch(url: string, options?: RequestInit): Promise<void> {
    // console.log(`typedModelFetch: this.token: ${this.token}`)
    if (!options) {
      options = {};
    }

    options.headers = {
      // Default to bearer authorization with our user's token.
      Authorization: "Bearer " + this.token,
      // If the caller specified different headers, then the above
      // headers will be overwritten.
      ...options.headers,
    };
    return emptyFetch(`${getDatabasePath()}${url}`, options);
  }

  /**
   * A function that makes a call to log the user in to the database.
   * @param username
   * @returns a Promise containing a LoginResponse, representing the received JSON.
   */
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
      return response;
    } catch (error) {
      // maybe don't catch an error if you're just going to rethrow it
      throw error;
    }
  }

  /**
   * A function that logs the current user out with the current authorization token.
   * @returns an empty Promise, resolving to indicate that the logout request was successful.
   */
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
    return emptyFetch(getAuthPath(), options)
    .then((value) => {
      this.token = null;
    });
  }

  /**
   * Retrieves a workspace from the model.
   * @param id a string representing the identifier for the workspace
   * @returns a Promise resolving to a ModelWorkspace, used by our application
   */
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

  /**
   * A function to retrieve all workspaces in the given database.
   * @returns A promise mapping the names of workspaces to the corresponding ModelWorkspace objects.
   */
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
          "invalid getting all workspaces response received from owldb",
        );
      }
      db_workspaces.forEach((workspace_response) => {
        let split_path = workspace_response.path.split("/");
        let workspace_name = split_path[split_path.length - 1];
        this.workspaces.set(
          workspace_name,
          new ModelWorkspace(workspace_response),
        );
      });
    }
    return this.workspaces;
  }

  /**
   * A function that adds a workspace with a given name to the database.
   * @param workspace_name a string representing the identifier for the workspace.
   */
  async addWorkspace(workspace_name: string): Promise<void> {
    // Add this workspace to the API
    await this.typedModelFetch<any>(`/${workspace_name}?timestamp=0`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    // Give it a "channels" collection
    await this.typedModelFetch<any>(`/${workspace_name}/channels/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    // Now, either:
    // 1. we are subscribed to workspaces, so OWLDB will send back a message which updates the state
    // or:
    // 2. we aren't subscribed, in which case the adapter will manually refresh, if it wants to.
    // Either way, we don't have to do anything else.
  }

  /**
   * A function that deletes a workspace with the given name from the database.
   * @param workspace_name a string representing the identifier for the workspace.
   */
  async removeWorkspace(workspace_name: string): Promise<void> {
    await this.emptyModelFetch(`/${workspace_name}`, {
      method: "DELETE",
    });
  }

  /**
   * A function that updates a specific post by adding a reaction.
   * @param reactionUpdate an object representing the reaction update data to send to the model.
   * @returns a Promise that resolves to the patch response received from the database.
   */
  async updateReaction(
    reactionUpdate: ModelReactionUpdate,
  ): Promise<PatchDocumentResponse> {
    let patches = getPatchBody(reactionUpdate);
    const options = {
      method: "PATCH",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patches),
    };
    // TODO: add a catch handler
    slog.info("updateReactions", ["options", options]);
    return getModel()
      .typedModelFetch<PatchDocumentResponse>(
        `${reactionUpdate.postPath}`,
        options,
      )
      .then((response) => {
        slog.info("updateReaction", ["response", response]);
        const valid = validatePatchDocumentResponse(response);
        if (!valid) {
          slog.error("validating patch doc response", [
            "invalid patch doc response:",
            `${validateGetWorkspacesResponse.errors}`,
          ]);
          throw new Error("invalid patch document response");
        }
        return response;
      });
  }

  /**
   * A function that returns the token that identifies the currently logged in user.
   * @returns a string representing the token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Returns the string representing the username for the user.
   * @returns
   */
  getUsername() {
    return this.username;
  }
}

/**
 * A model singleton used by the application.
 */
let modelSingleton = new OwlDBModel();
export function getModel() {
  return modelSingleton;
}
