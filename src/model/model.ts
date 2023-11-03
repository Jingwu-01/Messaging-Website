import {UserInfo, PostsEvent} from "./modelTypes"
import { typedFetch, getAuthPath, getDatabasePath } from "./utils"
import { ModelWorkspace } from "./workspace";
import { WorkspaceResponse } from "./responseTypes";

// TODO: can you declare a global in both the model AND the view?
declare global {
  interface DocumentEventMap {
    postsEvent: CustomEvent<PostsEvent>;
  }
}

// Class representing our model interfacing with OwlDB.
export class OwlDBModel {

    private token: string;

    private workspaces: Map<string, ModelWorkspace> = new Map<string, ModelWorkspace>();
    private subscribedToWorkspaces: boolean = false;
  

    constructor() {
      // Initialize the posts as an empty array.
      this.token = "";
    }

    // Wrapper around utils.typedFetch that
    // adds the Authorization header based on the logged-in user
    // and the database path before the url
    async typedModelFetch<T>(url: string, options?: RequestInit): Promise<T> {
      if (!options) {
        options = {};
      }
      options.headers = { ...options.headers, Authorization: this.token };
      return typedFetch<T>(`${getDatabasePath()}${url}`, options);
    }

    async login(username: string): Promise<void> {
      const options = {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username: username }),
        };
        try {const response = await typedFetch<UserInfo>(getAuthPath(), options)
        if (response.token) {
          this.token = response.token 
        }} 
        catch (error) {
          throw error 
        }
      }

    async logout(): Promise<void> {
      const options = {
        method: "DELETE",
        headers: {
          'Authorization': "Bearer " + this.token,
          'Accept': "application/json"
        }
      };      
        return typedFetch(getAuthPath(), options);
    }

    async getWorkspace(id: string): Promise<ModelWorkspace> {
      // Get logged in user
      let existingWorkspace = this.workspaces.get(id);
      if (existingWorkspace) {
        return existingWorkspace;
      } else {
        let freshWorkspace = new ModelWorkspace(
          await this.typedModelFetch<WorkspaceResponse>(`/${id}`)
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
      return this.token 
    }
  } 

// Model singleton
let modelSingleton = new OwlDBModel();
export function getModel() {
  return modelSingleton;
}