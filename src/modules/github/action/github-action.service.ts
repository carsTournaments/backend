import { Config } from '@core/config';
import { GithubActionI, GithubActionM, GithubActionOriginalI } from '@github';
import axios, { AxiosRequestHeaders } from 'axios';

export class GithubActionService {
  private user = 'carsTournaments';
  private respositories = ['backend', 'admin', 'app'];
  private headers: AxiosRequestHeaders = {
    Authorization: `Bearer ${Config.githubToken}`,
  };

  getAll(): Promise<GithubActionI[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const items: GithubActionI[] = [];
        for (const repo of this.respositories) {
          const url = this.getUrl('actions', repo);
          const response = await axios.get(url, { headers: this.headers });
          const data: GithubActionOriginalI = response.data;
          const workflows = data.workflows;
          for (const oIssue of workflows) {
            const issue: GithubActionI = new GithubActionM(oIssue, repo);
            items.push(issue);
          }
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
