interface User {
  name: string 
}

interface Channel {
  name: string
}

interface Workspace {
  name: string
}

// interface Post {
//   text: string
//   createdAt: number
// }

// This ViewPost type will effectively allow us to represent a tree of posts
// that the view can display.
export type ViewPost = {
  Msg: string;
  Reactions: any; // TODO: should be an array of strings? or custom reactions objects based on what we want?
  Extensions: any; // TODO: see above for 'reactions'
  CreatedUser: string;
  PostTime: number;
  Children: Array<ViewPost>;
}
