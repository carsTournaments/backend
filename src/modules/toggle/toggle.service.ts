import { CacheService } from '@cache';
import { SiteDto } from '@dtos';
import { MessageI } from '@interfaces';
import { Toggle, ToggleCreateDto, ToggleI, ToggleUpdateDto } from '@toggle';

export class ToggleService {
  private cacheService = new CacheService();

  async getAll(data: SiteDto): Promise<ToggleI[]> {
    try {
      let items: ToggleI[] = [];
      if (data.site === 'app') {
        items = await Toggle.find({}).select('name state').exec();
      } else {
        items = await Toggle.find({}).sort({ name: 1 }).exec();
      }
      this.cacheService.set('toggle.getAll', data.site, JSON.stringify(items));
      return items;
    } catch (error) {
      return error;
    }
  }

  getOne(id: string): Promise<ToggleI> {
    try {
      return Toggle.findById(id).exec();
    } catch (error) {
      return error;
    }
  }

  create(body: ToggleCreateDto): Promise<ToggleI> {
    try {
      this.cacheService.deleteByCategory('toggle');
      return Toggle.create(body);
    } catch (error) {
      return error;
    }
  }

  update(body: ToggleUpdateDto): Promise<ToggleI> {
    try {
      this.cacheService.deleteByCategory('toggle');
      return Toggle.findByIdAndUpdate(body._id, body, { new: true }).exec();
    } catch (error) {
      return error;
    }
  }

  async deleteOne(id: string): Promise<MessageI> {
    try {
      this.cacheService.deleteByCategory('toggle');
      await Toggle.findByIdAndDelete(id).exec();
      return { message: 'Toggle eliminado' };
    } catch (error) {
      return error;
    }
  }

  async deleteAll(): Promise<MessageI> {
    try {
      this.cacheService.deleteByCategory('toggle');
      await Toggle.deleteMany({}).exec();
      return { message: 'Todos los toggles han sido eliminados' };
    } catch (error) {
      return error;
    }
  }
}
