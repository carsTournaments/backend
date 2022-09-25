import { GithubActionI, GithubActionOriginalWorkflowI } from '@github';

export class GithubActionM implements GithubActionI {
  name: string;
  state: string;
  url: string;
  repo: string;
  created: string;
  updated: string;

  constructor(data: GithubActionOriginalWorkflowI, repo: string) {
    this.name = data.name ?? '';
    this.state = data.state ?? '';
    this.url = data.html_url ?? '';
    this.repo = repo;
    this.created = data.created_at ?? '';
    this.updated = data.updated_at ?? '';
  }
}
