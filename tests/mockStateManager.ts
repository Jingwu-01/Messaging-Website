import { ChannelInterface, WorkspaceInterface } from "../src/interfaces";
import { PostResponse } from "../types/postResponse";
import { MockChannel, MockWorkspace } from "./mockModel";

export class MockStateManager {
    setOpenChannel(name: string | null): Promise<ChannelInterface | null> {
        return Promise.resolve(new MockChannel("/workspacename/channels/channelname"));
    }
    getOpenWorkspace(): WorkspaceInterface | null {
        return new MockWorkspace();
    }
    getOpenChannel(): ChannelInterface | null {
        return new MockChannel("/workspacename/channels/channelname");
    }
    setLoggedInUser(username: string | null): void {
        return;
    }
    getLoggedInUser(): string | null {
        return "test_user";
    }
    serializePostResponse(response: PostResponse): [boolean, string] {
        return [true, ""];
    }
    setOpenWorkspace(workspaceName: string | null): Promise<WorkspaceInterface | null> {
        return Promise.resolve(new MockWorkspace());
    }
    getOpenWorkspaceName(): string | undefined {
        return "workspacename";
    }
    getOpenChannelName(): string | undefined {
        return "channelname";
    }
}