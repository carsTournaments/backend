import { GithubIssueI } from '@github';
import { GithubIssueOriginalI } from './github-issue.interface';

export class GithubIssueM implements GithubIssueI {
  title: string;
  user: string;
  labels: string[] = [];
  state: string;
  assignee: string;
  comments: number;
  body: string;
  url: string;

  constructor(data: GithubIssueOriginalI) {
    this.title = data.title ?? '';
    this.user = data.user.login ?? '';
    data.labels.forEach((item) => this.labels.push(item.name));
    this.state = data.state ?? '';
    this.assignee = data.assignee.login;
    this.comments = data.comments ?? 0;
    this.body = data.body ?? '';
    this.url = data.url ?? '';
  }
}
