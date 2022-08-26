import { GetAllDto } from '@dtos';
import { MessageI, PaginatorI } from '@interfaces';
import { UtilsService, Logger } from '@services';
import { LiteralI, Literal } from '@literal';
import { CacheService } from '../cache/cache.service';

export class LiteralService {
  private utilsService = new UtilsService();
  private cacheService = new CacheService();
  async getAll(
    body: GetAllDto
  ): Promise<{ items: LiteralI[]; paginator: PaginatorI }> {
    try {
      const { pageSize, currentPage, skip } =
        this.utilsService.getValuesForPaginator(body);
      const sort = this.utilsService.getOrderForGetAllAggregate(body);
      const items = await Literal.find({})
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .exec();
      const total = await Literal.countDocuments({}).exec();
      const totalPages = Math.ceil(total / pageSize);
      const paginator: PaginatorI = {
        pageSize,
        currentPage,
        totalPages,
        total,
      };
      return { items, paginator };
    } catch (error) {
      Logger.error(error);
      return error;
    }
  }

  async getAllForLanguage(language: 'es' | 'en') {
    const literals: any = await Literal.find({})
      .select({ _id: 0, name: 1, [language]: 1, category: 1 })
      .sort({ category: 1 })
      .exec();
    const items: any = {};
    literals.forEach((item: LiteralI) => {
      const category = item.category;
      const name = item.name;
      const value = item[language];
      if (!items[category]) {
        items[category] = {};
      }
      items[category][name] = value;
    });
    this.cacheService.set(
      'literal.getAllForLanguage',
      language,
      JSON.stringify(items)
    );
    return items;
  }

  async getOne(id: string) {
    try {
      const literalDB = await Literal.findById(id).exec();
      return literalDB;
    } catch (error) {
      Logger.error(error);
      return error;
    }
  }

  async create(literal: LiteralI) {
    try {
      const literalDB = await Literal.create(literal);
      await this.cacheService.deleteByCategory('literal');
      return literalDB;
    } catch (error) {
      Logger.error(error);
      return error;
    }
  }

  async update(literal: LiteralI) {
    return new Promise(async (resolve, reject) => {
      try {
        const literalDB = await Literal.findByIdAndUpdate(
          literal._id,
          literal,
          {
            new: true,
          }
        ).exec();
        if (literalDB) {
          await this.cacheService.deleteByCategory('literal');
          resolve(literalDB);
        } else {
          reject({ message: 'El literal no existe' });
        }
      } catch (error) {
        Logger.error(error);
        return error;
      }
    });
  }

  async deleteOne(id: string): Promise<MessageI> {
    try {
      const literalDB = await Literal.findByIdAndDelete(id).exec();
      if (literalDB) {
        await this.cacheService.deleteByCategory('literal');
        return { message: 'Literal eliminado' };
      } else {
        return { message: 'El literal no existe' };
      }
    } catch (error) {
      Logger.error(error);
      return error;
    }
  }
}
