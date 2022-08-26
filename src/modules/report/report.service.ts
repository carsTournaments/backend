import { UserTokenI } from '@auth';
import { GetAllDto, IdSiteDto } from '@dtos';
import { PaginatorI } from '@interfaces';
import { UtilsService } from '@services';
import {
  Report,
  ReportCreateDto,
  ReportGetAllForUserDto,
  ReportI,
} from '@report';

export class ReportService {
  private utilsService = new UtilsService();
  private populateDefault = [
    {
      path: 'userReporter',
      select: 'name country',
    },
    {
      path: 'userReported',
      select: 'name country',
    },
    {
      path: 'carReported',
      select: 'brand model',
      populate: { path: 'brand images', select: 'url name' },
    },
  ];

  async getAll(
    body?: GetAllDto
  ): Promise<{ items: ReportI[]; paginator: PaginatorI } | ReportI[]> {
    try {
      if (body) {
        const { pageSize, currentPage, skip } =
          this.utilsService.getValuesForPaginator(body);
        const sort = this.utilsService.getOrderForGetAll(body);
        const items: ReportI[] = await Report.find({})
          .populate(this.populateDefault)
          .skip(skip)
          .limit(pageSize)
          .sort(sort)
          .exec();
        const total = await Report.find({}).countDocuments().exec();
        const totalPages = Math.ceil(total / pageSize);
        const paginator: PaginatorI = {
          pageSize,
          currentPage,
          totalPages,
          total,
        };
        return { items, paginator };
      } else {
        return Report.find({}).populate(this.populateDefault).exec();
      }
    } catch (error) {
      return error;
    }
  }

  async getAllForUser(data: ReportGetAllForUserDto): Promise<ReportI[]> {
    try {
      return await Report.find({ [data.type]: data.userId })
        .populate(this.populateDefault)
        .sort({ created: -1 })
        .exec();
    } catch (error) {
      return error;
    }
  }

  async getAllOfCar(carId: string): Promise<ReportI[]> {
    try {
      return await Report.find({ carReported: carId })
        .populate(this.populateDefault)
        .sort({ created: -1 })
        .exec();
    } catch (error) {
      return error;
    }
  }

  getOne(data: IdSiteDto, user: UserTokenI): Promise<ReportI> {
    try {
      const populateAdmin: any = null;
      const populate =
        user && user.role === 'ADMIN' && data.site === 'admin'
          ? populateAdmin
          : this.populateDefault;
      return Report.findById(data.id).populate(populate).exec();
    } catch (error) {
      return error;
    }
  }

  create(body: ReportCreateDto): Promise<ReportI> {
    try {
      const item = new Report(body);
      return item.save();
    } catch (error) {
      return error;
    }
  }

  async update(body: ReportI): Promise<ReportI> {
    try {
      return Report.findByIdAndUpdate(body._id, body, {
        new: true,
      }).exec();
    } catch (error) {
      return error;
    }
  }

  async deleteOne(id: string): Promise<ReportI> {
    try {
      return Report.findByIdAndDelete(id).exec();
    } catch (error) {
      return error;
    }
  }

  async deleteAllOfUser(userId: string, type: string) {
    try {
      await Report.deleteMany({
        [type]: userId,
      }).exec();
      return {
        message: `Todos los reportes del tipo ${type} han sido eliminados`,
      };
    } catch (error) {
      return error;
    }
  }

  async deleteAllOfCar(carId: string) {
    try {
      await Report.deleteMany({
        carReported: carId,
      }).exec();
      return {
        message: `Todos los reportes del coche con id ${carId} han sido eliminados`,
      };
    } catch (error) {
      return error;
    }
  }

  async deleteAll() {
    try {
      await Report.deleteMany({}).exec();
      return { message: `Todos los reportes han sido eliminados` };
    } catch (error) {
      return error;
    }
  }
}
