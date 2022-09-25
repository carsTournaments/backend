export interface GithubIssueI {
  title: string;
  user: string;
  labels: string[];
  state: string;
  assignee: string;
  comments: number;
  url: string;
  repo: string;
  created: string;
  updated: string;
}

export interface GithubIssueOriginalI {
  url: string;
  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  id: number;
  node_id: string;
  number: number;
  title: string;
  user: GithubIssueOriginalUserI;
  labels: GithubIssueOriginalLabelI[];
  state: string;
  locked: boolean;
  assignee: GithubIssueOriginalUserI;
  assignees: GithubIssueOriginalUserI[];
  milestone?: any;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at?: any;
  author_association: string;
  active_lock_reason?: any;
  body: string;
  reactions: GithubIssueOriginalReactionsI;
  timeline_url: string;
  performed_via_github_app?: any;
  state_reason?: any;
}

interface GithubIssueOriginalReactionsI {
  url: string;
  total_count: number;
  '+1': number;
  '-1': number;
  laugh: number;
  hooray: number;
  confused: number;
  heart: number;
  rocket: number;
  eyes: number;
}

interface GithubIssueOriginalLabelI {
  id: number;
  node_id: string;
  url: string;
  name: string;
  color: string;
  default: boolean;
  description: string;
}

interface GithubIssueOriginalUserI {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}
