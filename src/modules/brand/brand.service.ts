import { CarService } from '@car';
import { PaginatorI } from '@interfaces';
import {
  Brand,
  BrandCreateDto,
  BrandGetAllBrandsAndCarsDto,
  BrandGetAllDto,
  BrandI,
  BrandUpdateDto,
  getAllBrandsAndCarsAggregate,
} from '@brand';
import { UtilsService, Logger } from '@services';
import { CacheService } from '@cache';

export class BrandService {
  private carService = new CarService();
  private utilsService = new UtilsService();
  private cacheService = new CacheService();
  private populateDefault = [
    { path: 'cars', select: '_id name' },
    { path: 'image', select: 'url' },
  ];
  async getAll(
    body?: BrandGetAllDto
  ): Promise<{ items: BrandI[]; paginator: PaginatorI } | BrandI[]> {
    try {
      if (body) {
        const { pageSize, currentPage, skip } =
          this.utilsService.getValuesForPaginator(body);
        const sort = this.utilsService.getOrderForGetAll(body);
        const items: BrandI[] = await Brand.find({})
          .populate(this.populateDefault)
          .skip(skip)
          .limit(pageSize)
          .sort(sort)
          .select(body.select)
          .exec();
        const total = await Brand.find({}).countDocuments().exec();
        const totalPages = Math.ceil(total / pageSize);
        const paginator: PaginatorI = {
          pageSize,
          currentPage,
          totalPages,
          total,
        };
        return { items, paginator };
      } else {
        return Brand.find(this.populateDefault)
          .populate(this.populateDefault)
          .exec();
      }
    } catch (error) {
      return error;
    }
  }

  async getAllBrandsAndCars(body: BrandGetAllBrandsAndCarsDto) {
    try {
      const { pageSize, currentPage, skip } =
        this.utilsService.getValuesForPaginator(body);
      const sort = this.utilsService.getOrderForGetAllAggregate(body);
      const aggregate = getAllBrandsAndCarsAggregate(
        sort,
        skip,
        pageSize,
        body
      );
      const items = await Brand.aggregate(aggregate).exec();
      const total = await Brand.countDocuments({}).exec();
      const totalPages = Math.ceil(total / pageSize);
      const paginator: PaginatorI = {
        pageSize,
        currentPage,
        totalPages,
      };
      this.cacheService.set(
        'brand.allOfAllBrandsAndCarsBrand',
        `${body.page}_${body.onlyWithPhoto}`,
        JSON.stringify(items)
      );
      return { items, paginator };
    } catch (error) {
      Logger.error(error);
      return error;
    }
  }

  getOne(id: string): Promise<BrandI> {
    try {
      return Brand.findById(id).populate(this.populateDefault).exec();
    } catch (error) {
      return error;
    }
  }

  async create(body: BrandCreateDto): Promise<BrandI> {
    try {
      const item = new Brand(body);
      this.cacheService.deleteByCategory('brand');
      return await item.save();
    } catch (error) {
      return error;
    }
  }

  update(body: BrandUpdateDto) {
    try {
      this.cacheService.deleteByCategory('brand');
      return Brand.findByIdAndUpdate(body._id, body, {
        new: true,
      }).exec();
    } catch (error) {
      return error;
    }
  }

  async deleteOne(id: string) {
    try {
      this.cacheService.deleteByCategory('brand');
      await this.carService.deleteAllOfBrand(id);
      return Brand.findByIdAndDelete(id).exec();
    } catch (error) {
      return error;
    }
  }
}
