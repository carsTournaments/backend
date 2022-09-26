import { Config } from '@core/config';
import {
  GithubActionI,
  GithubActionM,
  GithubActionOriginalI,
  GithubUtilsService,
} from '@github';
import axios, { AxiosRequestHeaders } from 'axios';

export class GithubActionService {
  private githubUtilsService = new GithubUtilsService();
  private respositories = ['backend', 'admin', 'app'];
  private headers: AxiosRequestHeaders = {
    Authorization: `Bearer ${Config.githubToken}`,
  };

  getAll(): Promise<GithubActionI[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const items: GithubActionI[] = [];
        for (const repo of this.respositories) {
          const urlApi = this.githubUtilsService.getUrl('actions', repo);
          const url = this.githubUtilsService.getUrl('actions', repo, false);
          const response = await axios.get(urlApi, { headers: this.headers });
          const data: GithubActionOriginalI = response.data;
          const workflows = data.workflows;
          for (const action of workflows) {
            console.log(action);
            const issue: GithubActionI = new GithubActionM(action, repo, url);
            items.push(issue);
          }
        }
        resolve(items);
      } catch (error) {
        reject(error);
      }
    });
  }
}
