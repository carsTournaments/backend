import { Config } from '@core/config';
import { GithubIssueOriginalI, GithubIssueI, GithubIssueM } from '@github';
import axios, { AxiosRequestHeaders } from 'axios';

export class GithubIssueService {
  private user = 'carsTournaments';
  private respositories = ['backend', 'admin', 'app'];
  private headers: AxiosRequestHeaders = {
    Authorization: `Bearer ${Config.githubToken}`,
  };

  getAll(): Promise<GithubIssueI[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const items: GithubIssueI[] = [];
        for (const repo of this.respositories) {
          const url = this.getUrl('issues', repo);
          const response = await axios.get(url, { headers: this.headers });
          const data: GithubIssueOriginalI[] = response.data;
          for (const oIssue of data) {
            const issue: GithubIssueI = new GithubIssueM(oIssue, repo);
            items.push(issue);
          }
        }
        resolve(items);
      } catch (error) {
        console.log(error);
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
