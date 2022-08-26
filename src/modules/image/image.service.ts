import { Brand } from '@brand';
import { Config } from '@core/config/app.config';
import { MessageI, PaginatorI } from '@interfaces';
import { UtilsService } from '@services';
import {
  ImageI,
  ImageMongoI,
  Image,
  ImageUploadDto,
  Resize,
  ImageGetAllDto,
  ImageUpdateDto,
  ImageSetFirstImageDto,
} from '@image';
import fs from 'fs';
import brandsJson from './brands.json';

export class ImageService {
  private utilsService = new UtilsService();
  private populateDefault = [
    { path: 'tournament', select: 'name' },
    {
      path: 'car',
      select: 'model',
      populate: { path: 'brand', select: 'name' },
    },
    { path: 'brand', select: 'name' },
    { path: 'user', select: 'name' },
  ];

  async getAll(
    body?: ImageGetAllDto
  ): Promise<{ items: ImageI[]; paginator: PaginatorI } | ImageI[]> {
    try {
      if (body) {
        const { pageSize, currentPage, skip } =
          this.utilsService.getValuesForPaginator(body);
        const sort = this.utilsService.getOrderForGetAll(body);
        const items: ImageI[] = await Image.find({})
          .populate(this.populateDefault)
          .skip(skip)
          .limit(pageSize)
          .sort(sort)
          .exec();
        const total = await Image.find({}).countDocuments().exec();
        const totalPages = Math.ceil(total / pageSize);
        const paginator: PaginatorI = {
          pageSize,
          currentPage,
          totalPages,
          total,
        };
        const itemsWithSize: ImageI[] = [];
        for (const item of items) {
          const imagePath = `${Config.paths.uploads}/${item.url}`;
          let size = 0;
          if (fs.existsSync(imagePath)) {
            size = fs.statSync(imagePath).size;
          }
          const i: ImageI = {
            _id: item._id,
            type: item.type,
            url: item.url,
            size: size ? this.utilsService.bytesToSize(size, 2) : 'N/D',
            tournament: item.tournament,
            car: item.car,
            brand: item.brand,
            firstImage: item.firstImage,
            position: item.position,
            created: item.created,
            updated: item.updated,
          };
          itemsWithSize.push(i);
        }

        return { items: itemsWithSize, paginator };
      } else {
        return await Image.find({}).exec();
      }
    } catch (error) {
      return error;
    }
  }

  getAllImagesCar(id: string): Promise<ImageI[]> {
    try {
      return Image.find({ car: id }).sort({ position: 1 }).exec();
    } catch (error) {
      return error;
    }
  }

  getOne(id: string): Promise<ImageMongoI> {
    try {
      return Image.findById(id).exec();
    } catch (error) {
      return error;
    }
  }

  getOneByBrandId(id: string): Promise<ImageMongoI> {
    try {
      return Image.findOne({ brand: id }).exec();
    } catch (error) {
      return error;
    }
  }

  upload(data: ImageUploadDto, file: any): Promise<ImageI> {
    return new Promise(async (resolve, reject) => {
      try {
        const randomNumber = this.utilsService.randomNumber(0, 10000);
        const dataImage = `${data.type}/${data.id}_${randomNumber}.png`;
        const imagePath = `${Config.paths.uploads}/${dataImage}`;
        const fileUpload = new Resize(imagePath);
        if (!file) {
          reject({ message: 'Falta la imagen' });
        }
        await fileUpload.save(file.buffer);
        const imageCreated: ImageI = await this.create(data, dataImage);
        resolve(imageCreated);
      } catch (error) {
        reject(error);
      }
    });
  }

  async create(data: ImageUploadDto, url: string): Promise<ImageMongoI> {
    try {
      // check image
      let body = {};
      if (data.type === 'car') {
        body = await this.createCarImage(data, url);
      } else {
        body = {
          type: data.type,
          [data.type]: data.id,
          url,
        };
      }
      const imageBody: ImageMongoI = new Image(body);
      const imageCreated = await imageBody.save();
      return imageCreated;
    } catch (error) {
      return error;
    }
  }

  private async createCarImage(
    data: ImageUploadDto,
    url: string
  ): Promise<any> {
    let body;
    const imagesSameTypeId = await Image.find({
      type: data.type,
      car: data.id,
    }).exec();
    if (imagesSameTypeId.length > 0) {
      body = {
        type: data.type,
        car: data.id,
        url,
        firstImage: false,
        position: imagesSameTypeId.length,
      };
    } else {
      body = {
        type: data.type,
        car: data.id,
        url,
        firstImage: true,
        position: 0,
      };
    }
    return body;
  }

  update(data: ImageUpdateDto): Promise<ImageMongoI> {
    try {
      return Image.findByIdAndUpdate(data._id, data).exec();
    } catch (error) {
      return error;
    }
  }

  async setFirstImage(data: ImageSetFirstImageDto) {
    try {
      let imagesCar = await Image.find({ car: data.carId })
        .sort({ position: 1 })
        .exec();
      imagesCar = imagesCar.filter(
        (image) => image._id.toString() !== data.imageId
      );
      imagesCar.forEach(async (image, index) => {
        image.firstImage = false;
        image.position = index + 1;
        await image.save();
      });
      return Image.findByIdAndUpdate(data.imageId, {
        firstImage: true,
        position: 0,
      }).exec();
    } catch (error) {
      return error;
    }
  }

  async deleteOne(id: string): Promise<MessageI> {
    try {
      const item = await this.getOne(id);
      await Image.findByIdAndDelete(id).exec();
      fs.unlinkSync(`${Config.paths.uploads}/${item.url}`);
      return { message: 'Imagen eliminada' };
    } catch (error) {
      return error;
    }
  }

  async deleteAll(): Promise<MessageI> {
    try {
      const items: any = await this.getAll();
      if (items)
        for (const item of items) {
          await this.deleteOne(item);
        }
    } catch (error) {
      return error;
    }
  }

  updateBrandImagesWithJsonFile(): Promise<MessageI> {
    return new Promise(async (resolve, reject) => {
      try {
        const json = brandsJson;
        const brands = await Brand.find({}).exec();
        for (const brand of brands) {
          const brandImages = json.filter((item) => item.name === brand.name);
          if (brandImages.length > 0) {
            await this.downloadAndUploadImageFromUrl(
              brandImages[0].logo,
              brand._id
            );
            const image = await this.getOneByBrandId(brand._id);
            if (image) {
              image.url = `brand/${brand._id}.png`;
              await image.save();
            } else {
              await this.create(
                { type: 'brand', id: brand._id },
                `brand/${brand.id}.png`
              );
            }
          }
        }

        resolve({
          message: `${brands.length} imagenes actualizadas`,
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  downloadAndUploadImageFromUrl(url: string, id: string): Promise<MessageI> {
    return new Promise(async (resolve, reject) => {
      try {
        const filePath = `${Config.paths.uploads}/brand/${id}.png`;
        await this.utilsService.downloadImageFromUrl(url, filePath);
        resolve({ message: 'Imagen descargada' });
      } catch (error) {
        reject(error);
      }
    });
  }
}
