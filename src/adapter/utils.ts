export function adapterViewPostConverter(adapterPost: AdapterPost): ViewPost {
    return {
      msg: adapterPost.getResponse().doc.msg,
      reactions: adapterPost.getResponse().doc.reactions,
      extensions: adapterPost.getResponse().doc.extensions,
      createdUser: adapterPost.getResponse().meta.createdBy,
      postTime: adapterPost.getResponse().meta.createdAt,
      children: new Array<ViewPost>(),
      path: adapterPost.getResponse().path,
      parent: adapterPost.getParentName(),
      postIdx: adapterPost.getPostIndex()
    };
  }