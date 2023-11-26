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

export type DocumentMetadata = {
  createdBy: string;
  createdAt: number;
  lastModifiedBy: string;
  lastModifiedAt: number;
};

export type ReactionData = {
  smile: string[]; 
  frown: string[]; 
  like: string[]; 
  celebrate: string[]; 
}

export type PostDocumentResponse = {
  uri: string;
}