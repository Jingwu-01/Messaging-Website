import { AuthAdapter } from "../src/adapter/auth/authAdapter";
import { MockModel } from "./mockModel";
import { MockStateManager } from "./mockStateManager";
import { MockView } from "./mockView";

function getAuthAdapter() {
    const authAdapter = new AuthAdapter(new MockView(), new MockModel(), new MockStateManager());
    return authAdapter;
}

test("authAdapter getView()", () => {
    const authAdapter = getAuthAdapter();
    expect(authAdapter.getView()).not.toBe(undefined);
});

test("authAdapter getModel()", () => {
    const authAdapter = getAuthAdapter();
    expect(authAdapter.getModel()).not.toBe(undefined);
});

test("authAdapter getStateManager()", () => {
    const authAdapter = getAuthAdapter();
    expect(authAdapter.getStateManager()).not.toBe(undefined);
});

test("authAdapter login()", async () => {
    const authAdapter = getAuthAdapter();
    const loadingSpy = jest.spyOn(authAdapter.getView(), "setStateLoadingUntil");
    const modelSpy = jest.spyOn(authAdapter.getModel(), "login");
    const setLoggedInUserSpy = jest.spyOn(authAdapter.getStateManager(), "setLoggedInUser");
    const displayUserSpy = jest.spyOn(authAdapter.getView(), "displayUser");
    const refreshWorkspacesSpy = jest.spyOn(authAdapter, "refreshWorkspaces");
    const completeEventSpy = jest.spyOn(authAdapter.getView(), "completeEvent");
    const failEventSpy = jest.spyOn(authAdapter.getView(), "failEvent");

    await authAdapter.login(new CustomEvent("loginEvent", {
        detail: {id: "1", username: "test_user"}
    }));

    expect(loadingSpy).toHaveBeenCalledTimes(1);
    expect(modelSpy).toHaveBeenCalledTimes(1);
    expect(setLoggedInUserSpy).toHaveBeenCalledTimes(1);
    expect(displayUserSpy).toHaveBeenCalledTimes(1);
    expect(refreshWorkspacesSpy).toHaveBeenCalledTimes(1);
    expect(completeEventSpy).toHaveBeenCalledTimes(1);
    expect(failEventSpy).toHaveBeenCalledTimes(0);
});

test("authAdapterLogout", () => {
    
})