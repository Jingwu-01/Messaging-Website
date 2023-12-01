import { PostResponse } from "../../../types/postResponse";
import { PostReactions, ReactionData, ViewPost } from "../../view/datatypes";
import { AdapterPost } from "./adapterPost";

function convertReactions(postResponse: PostResponse): ReactionData {
  if (postResponse.doc.reactions === undefined) {
    return {
      smile: [],
      frown: [],
      like: [],
      celebrate: [],
    };
  } else {
    return {
      smile: [],
      frown: [],
      like: [],
      celebrate: [],
      ...postResponse.doc.reactions,
    };
  }
}

export function adapterViewPostConverter(adapterPost: AdapterPost): ViewPost {
  return {
    msg: adapterPost.getResponse().doc.msg,
    reactions: convertReactions(adapterPost.getResponse()),
    extensions: adapterPost.getResponse().doc.extensions,
    createdUser: adapterPost.getResponse().meta.createdBy,
    postTime: adapterPost.getResponse().meta.createdAt,
    children: new Array<ViewPost>(),
    path: adapterPost.getResponse().path,
    parent: adapterPost.getParentName(),
    name: adapterPost.getName(),
    postIdx: adapterPost.getPostIndex(),
  };
}
