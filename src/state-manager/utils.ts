import getStateManager from ".";
import { AdapterPost } from "../adapter/posts/adapterPost";
import { slog } from "../slog";

export function isRespPostStarred(adapterPost: AdapterPost): boolean {
    let usersStarred = adapterPost.getUsersStarred();
    let loggedInUser = getStateManager().getLoggedInUser();
    if (loggedInUser === null) {
      // this should never happen. enforce that user, ws, and channel have null equivalence.
      slog.error("isRespPostStarred: loggedInUser is null but this should be impossible");
      return false;
    }
    return usersStarred.includes(loggedInUser);
  }

export type StarOps = "modify" | "insert" | "delete" | "nop";