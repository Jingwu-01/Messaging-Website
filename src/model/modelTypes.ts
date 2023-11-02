// Represents a post.
export type ModelPost = {
    Path: string;
    PostContent: ModelPostContent;
    Meta: ModelPostMetadata;
};

// Represents the content of a post.
export type ModelPostContent = {
    Msg: string;
    Parent: string;
    Reactions: any; // TODO: add some sort of validation for reactions
    Extensions: any; // TODO: add some sort of validation for extensions
};

// Represents the metadata for a post.
export type ModelPostMetadata = {
    CreatedBy: string;
    CreatedAd: number;
    LastModifiedBy: string;
    LastModifiedAt: number;
};

// Represents the information (token and expiration time) for a user 
export type UserInfo = {
    token: string;
    expireAt: Date;
};

// An event that is thrown every time we receive a new post.
export type PostsEvent = {
    posts: Array<ModelPost>;
};