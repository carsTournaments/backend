import {
  GithubActionI,
  GithubActionM,
  GithubActionOriginalI,
  GithubActionsI,
} from '@github';
import axios from 'axios';

export class GithubActionService {
  private user = 'carsTournaments';
  private respositories = ['backend', 'admin', 'app'];
  private headers = {
    'User-Agent': 'CT', // Your Github ID or application name
  };

  getAll(): Promise<GithubActionsI[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const items: GithubActionsI | any = {
          admin: [],
          app: [],
          backend: [],
        };
        for (const repo of this.respositories) {
          const url = this.getUrl('actions', repo);
          const response = await axios.get(url);
          const data: GithubActionOriginalI = response.data;
          const workflows = data.workflows;
          const actions: GithubActionI[] = [];
          for (const oIssue of workflows) {
            const issue: GithubActionI = new GithubActionM(oIssue);
            actions.push(issue);
          }
          items[repo] = actions;
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
      issues: 'issues',
      actions: 'actions/workflows',
    };
    return `${urls.base.replace(':repository', repository)}/${urls[type]}`;
  }
}
