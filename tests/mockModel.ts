import { WorkspaceInterface } from "../src/interfaces";
import { ModelReactionUpdate } from "../src/model/modelTypes";
import { LoginResponse } from "../types/loginResponse";
import { PatchDocumentResponse } from "../types/patchDocumentResponse";

export class MockModel {
    login(username: string) {
        return Promise.resolve({
            token: "somerandomtoken"
        });
    }
    logout() {
        return Promise.resolve();
    }
    updateReaction(update: ModelReactionUpdate) {
        return Promise.resolve({
            uri: "/v1/databasename/workspacename/channels/channelname/posts/post1",
            patchFailed: false,
            message: "patches applied"
        });
    }
    addWorkspace(workspace_name: string) {
        return Promise.resolve();
    };
    removeWorkspace(workspace_name: string) {
        return Promise.resolve();
    }
    getAllWorkspaces() {
        return Promise.resolve(new Map<string, WorkspaceInterface>(
            ["workspacename", ]
        ))
    }
    getWorkspace(id: string): Promise<WorkspaceInterface>;
}

export class MockWorkspace {

}