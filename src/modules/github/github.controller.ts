import { ControllerI } from '@interfaces';
import { Router } from 'express';
import { GithubIssueController, GithubActionController } from '@github';

export class GithubController implements ControllerI {
  path = '/github';
  router = Router();
  private githubActionController = new GithubActionController();
  private githubIssueController = new GithubIssueController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/issues/all/:tag?`,
      this.githubIssueController.getAll
    );

    this.router.get(
      `${this.path}/actions/all`,
      this.githubActionController.getAll
    );
  }
}
