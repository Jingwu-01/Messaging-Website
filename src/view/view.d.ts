export interface View {
  // Makes the view display displayedChannels and only displayedChannels on screen.
  setDisplayedChannels: (displayedChannels: Channel[]) => void
  // Makes the view display displayedWorkspaces and only displayedWorkspaces on screen.
  setDisplayedWorkspaces: (displayedWorkspaces: Workspace[]) => void
  // Makes the view display displayedPosts and only displayedPosts on screen.
  setDisplayedPosts: (displayedPosts: Post[]) => void

  login: () => void
  logout: () => void
}

// Event Types

export type LoginEvent = {
    username: string
}

export type LogoutEvent = {
}

export type CreateWorkspaceEvent = {
    name: string
}

export type SelectWorkspaceEvent = {
    name: string
}

export type DeleteWorkspaceEvent = {
    name: string
}

export type CreateChannelEvent = {
    name: string
}

export type SelectChannelEvent = {
    name: string
}

export type DeleteChannelEvent = {
    name: string
}