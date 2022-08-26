import { Logger } from '@services';
import { OtaCreateDto, OtaGetOtaAvailable, OtaI, Ota } from '@ota';
import { MessageI } from '@interfaces';

export class OtaService {
  getAll() {
    try {
      return Ota.find({}).exec();
    } catch (error) {
      return error;
    }
  }

  getOtaAvailable(
    data: OtaGetOtaAvailable
  ): Promise<{ version: string; url: string }> {
    return new Promise(async (resolve, reject) => {
      try {
        // si cap_version_name es builtin es que no se ha actualizado
        const ota = await Ota.findOne({
          platform: data.cap_platform,
          version: data.cap_version_name,
        }).exec();
        if (!ota) {
          resolve({ version: '', url: '' });
        } else {
          if (data.cap_version_name === 'builtin') {
            resolve(ota);
          } else {
            resolve({ version: '', url: '' });
          }
        }
      } catch (error) {
        Logger.error(error);
        reject(error);
      }
    });
  }

  create(data: OtaCreateDto): Promise<OtaI> {
    const ota = new Ota(data);
    return ota.save();
  }

  async deleteOne(id: string): Promise<MessageI> {
    const ota = await Ota.findByIdAndDelete(id).exec();
    if (!ota) {
      return { message: 'Ota no encontrada' };
    }
    return { message: 'Ota eliminada' };
  }

  async deleteAll(): Promise<MessageI> {
    await Ota.deleteMany({}).exec();
    return { message: 'Todas las otas eliminadas' };
  }
}
