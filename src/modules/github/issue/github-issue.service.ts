import {
  GithubIssueOriginalI,
  GithubIssueI,
  GithubIssueM,
  GithubIssuesI,
} from '@github';
import axios from 'axios';

export class GithubIssueService {
  private user = 'carsTournaments';
  private respositories = ['backend', 'admin', 'app'];
  private headers = {
    'User-Agent': 'CT', // Your Github ID or application name
  };

  getAll(): Promise<GithubIssuesI[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const items: GithubIssuesI | any = {
          admin: [],
          app: [],
          backend: [],
        };
        for (const repo of this.respositories) {
          const url = this.getUrl('issues', repo);
          const response = await axios.get(url);
          const data: GithubIssueOriginalI[] = response.data;
          const issues: GithubIssueI[] = [];
          for (const oIssue of data) {
            const issue: GithubIssueI = new GithubIssueM(oIssue);
            issues.push(issue);
          }
          items[repo] = issues;
        }
        resolve(items);
      } catch (error) {
        reject(error);
      }
    });
  }

  private getUrl(type: string, repository: string) {
    const urls: any = {
      base: `https://api.github.com/repos/${this.user}/:repository`,
      issues: `issues`,
    };
    return `${urls.base.replace(':repository', repository)}/${urls[type]}`;
  }
}
