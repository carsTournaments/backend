import { Request, Response, NextFunction } from 'express';
import { GithubIssueService } from '@github';
import { HttpException } from '@exceptions';

export class GithubIssueController {
  private githubIssueService = new GithubIssueService();

  getAll = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const items = await this.githubIssueService.getAll();
      response.status(200).send(items);
    } catch (error) {
      next(new HttpException(400, error.message, request, response));
    }
  };
}
