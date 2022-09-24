import { GithubActionI, GithubActionOriginalWorkflowI } from '@github';

export class GithubActionM implements GithubActionI {
  name: string;
  state: string;
  created: string;
  updated: string;
  url: string;

  constructor(data: GithubActionOriginalWorkflowI) {
    this.name = data.name ?? '';
    this.state = data.state ?? '';
    this.created = data.created_at ?? '';
    this.updated = data.updated_at ?? '';
    this.url = data.url ?? '';
  }
}
