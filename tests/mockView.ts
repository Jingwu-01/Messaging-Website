import { EventWithId, StateName, ViewChannel, ViewChannelUpdate, ViewPostUpdate, ViewUser, ViewWorkspace, ViewWorkspaceUpdate } from "../src/view/datatypes";

export class MockView {
    displayPosts(posts: ViewPostUpdate) {
        return;
    };
    displayUser(user: ViewUser | null) {
        return;
    };
    displayWorkspaces(update: ViewWorkspaceUpdate) {
        return;
    }
    displayOpenWorkspace(workspace: ViewWorkspace | null) {
        return;
    }
    displayChannels(update: ViewChannelUpdate) {
        return;
    }
    displayOpenChannel(channel: ViewChannel | null) {
        return;
    }
    displayPostDisplay() {
        return;
    }
    removePostDisplay() {
        return;
    }
    completeEvent(evt: EventWithId) {
        return;
    }
    failEvent(evt: EventWithId, error_message: string) {
        return;
    }
    setStateLoadingUntil(state: StateName | Array<StateName>, event: EventWithId) {
        return;
    }
    displayError(error: string) {
        return;
    }
}
