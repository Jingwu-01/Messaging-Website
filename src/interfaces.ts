import { CreateResponse } from "../types/createResponse";
import { LoginResponse } from "../types/loginResponse";
import { PatchDocumentResponse } from "../types/patchDocumentResponse";
import { PostResponse } from "../types/postResponse";
import { ModelReactionUpdate } from "./model/modelTypes";
import { EventWithId, StateName, ViewChannel, ViewChannelUpdate, ViewPostUpdate, ViewUser, ViewWorkspace, ViewWorkspaceUpdate } from "./view/datatypes";

export interface ViewInterface {
    displayPosts(posts: ViewPostUpdate): void;
    displayUser(user: ViewUser | null): void;
    displayWorkspaces(update: ViewWorkspaceUpdate): void;
    displayOpenWorkspace(workspace: ViewWorkspace | null): void;
    displayChannels(update: ViewChannelUpdate): void;
    displayOpenChannel(channel: ViewChannel | null): void;
    displayPostDisplay(): void;
    removePostDisplay(): void;
    completeEvent(evt: EventWithId): void;
    failEvent(evt: EventWithId, error_message: string): void;
    setStateLoadingUntil(state: StateName | Array<StateName>, event: EventWithId): void;
    displayError(error: string): void;
}

export interface ModelInterface {
    login(username: string): Promise<LoginResponse>;
    logout(): Promise<void>;
    updateReaction(update: ModelReactionUpdate): Promise<PatchDocumentResponse>;
    addWorkspace(workspace_name: string): Promise<void>;
    removeWorkspace(workspace_name: string): Promise<void>;
    getAllWorkspaces(): Promise<Map<string, WorkspaceInterface>>;
    getWorkspace(id: string): Promise<WorkspaceInterface>;
}

export interface StateManagerInterface {
    setOpenChannel(name: string | null): Promise<ChannelInterface | null>;
    getOpenWorkspace(): WorkspaceInterface | null;
    getOpenChannel(): ChannelInterface | null;
    setLoggedInUser(username: string | null): void;
    getLoggedInUser(): string | null;
    serializePostResponse(response: PostResponse): [boolean, string];
    setOpenWorkspace(workspaceName: string | null): Promise<WorkspaceInterface | null>;
    getOpenWorkspaceName(): string | undefined;
    getOpenChannelName(): string | undefined;
}

export interface WorkspaceInterface {
    addChannel(channel_name: string): Promise<void>;
    removeChannel(channel_name: string): Promise<void>;
    getAllChannels(): Promise<Map<string, ChannelInterface>>;
    getName(): string;
    getChannel(id: string): Promise<ChannelInterface>
}

export interface ChannelInterface {
    getName(): string;
    subscribeToPosts(): void;
    unsubscribe(): void;
    createPost(postContent: string, postParent: string, channelPath: string): Promise<CreateResponse>;
    path: string;
}

