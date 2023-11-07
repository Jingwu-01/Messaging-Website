export type WorkspaceResponse = {
  path: string;
  doc: Map<string, any>;
  meta: DocumentMetadata;
};

export type ChannelResponse = {
  path: string;
  doc: Map<string, any>;
  meta: DocumentMetadata;
};

export type PostResponse = {
  path: string;
  doc: {
    msg: string;
    parent: string;
    reactions: any; // TODO: add some sort of validation for reactions
    extensions: any; // TODO: add some sort of validation for extensions
  };
  meta: DocumentMetadata;
}

export type DocumentMetadata = {
  createdBy: string;
  createdAt: number;
  lastModifiedBy: string;
  lastModifiedAt: number;
};