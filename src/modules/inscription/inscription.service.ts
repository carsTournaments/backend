import { Car, CarI } from '@car';
import { GetAllDto, IdSiteDto } from '@dtos';
import { MessageI, PaginatorI } from '@interfaces';
import { UtilsService } from '@services';
import { Tournament, TournamentI, TournamentRequisiteI } from '@tournament';
import { Logger } from '../../core/services/logger.service';
import {
  Inscription,
  inscriptionGetAllAggregate,
  inscriptionGetAllForDriverAggregate,
  inscriptionGetAllTournamentInscriptionsAggregate,
  inscriptionGetAllOfCarAggregate,
  InscriptionGetAllOfCarDto,
  InscriptionGetMyCarsForInscriptionDto,
  InscriptionGetMyCarsUserForInscriptionResponse,
  InscriptionI,
  InscriptionGetAllForDriverI,
} from '@inscription';

export class InscriptionService {
  private utilsService = new UtilsService();
  private populateDefault = [
    {
      path: 'car',
      select: 'name model',
      populate: {
        path: 'images brand',
        select: 'url name',
      },
    },
    {
      path: 'driver',
      select: 'name',
    },
    {
      path: 'tournament',
      select: 'name status maxParticipants startDate',
      populate: {
        path: 'image',
        select: 'url',
      },
    },
  ];

  async getAll(
    body?: GetAllDto
  ): Promise<
    { items: InscriptionI[]; paginator: PaginatorI } | InscriptionI[]
  > {
    try {
      if (body) {
        const { pageSize, currentPage, skip } =
          this.utilsService.getValuesForPaginator(body);
        const sort = this.utilsService.getOrderForGetAllAggregate(body);
        const aggregate = inscriptionGetAllAggregate(sort, skip, pageSize);
        const items = await Inscription.aggregate(aggregate).exec();
        const total = await Inscription.countDocuments().exec();
        const totalPages = Math.ceil(total / pageSize);
        const paginator: PaginatorI = {
          pageSize,
          currentPage,
          totalPages,
          total,
        };
        return { items, paginator };
      } else {
        return await Inscription.find({}).populate(this.populateDefault).exec();
      }
    } catch (error) {
      return error;
    }
  }

  getAllTournamentInscriptions(data: IdSiteDto): Promise<InscriptionI[]> {
    try {
      const aggreagte: any = inscriptionGetAllTournamentInscriptionsAggregate(
        data.id
      );
      return Inscription.aggregate(aggreagte).exec();
    } catch (error) {
      return error;
    }
  }

  getAllCarInscriptions(
    data: InscriptionGetAllOfCarDto
  ): Promise<InscriptionI[]> {
    try {
      const aggregate: any = inscriptionGetAllOfCarAggregate(data);
      return Inscription.aggregate(aggregate).exec();
    } catch (error) {
      return error;
    }
  }

  async getAllDriverInscriptions(
    driverId: string
  ): Promise<InscriptionGetAllForDriverI> {
    try {
      const data: InscriptionGetAllForDriverI = {
        todo: [],
        inProgress: [],
        completed: [],
      };
      const aggregate: any = inscriptionGetAllForDriverAggregate(driverId);
      const inscriptions = await Inscription.aggregate(aggregate).exec();
      for (const inscription of inscriptions) {
        this.setDataForGetAllForDriver(
          inscription.tournament.status,
          data,
          inscription
        );
      }
      return data;
    } catch (error) {
      return error;
    }
  }

  private setDataForGetAllForDriver(
    type: string,
    data: InscriptionGetAllForDriverI | any,
    inscription: InscriptionI
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const typeOk = this.utilsService.firstLetterLowerCase(type);
        if (data[typeOk]) {
          const index = data[typeOk].findIndex(
            (i: InscriptionI) =>
              i.tournament._id.toString() ===
              inscription.tournament._id.toString()
          );
          if (index === -1) {
            data[typeOk].push({
              tournament: inscription.tournament,
              cars: [inscription.car],
            });
          } else {
            const indexCar = data[typeOk][index].cars.findIndex(
              (i: InscriptionI) =>
                i._id.toString() === inscription.car._id.toString()
            );
            if (indexCar === -1) {
              data[typeOk][index].cars.push(inscription.car);
            } else {
              data[typeOk][index].cars[indexCar] = inscription.car;
            }
          }
          resolve();
        } else {
          reject({ message: 'Type not found' });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  async getMyCarsForInscription(
    data: InscriptionGetMyCarsForInscriptionDto
  ): Promise<InscriptionGetMyCarsUserForInscriptionResponse> {
    return new Promise(async (resolve, reject) => {
      const results: InscriptionGetMyCarsUserForInscriptionResponse = {
        inscribed: [],
        availables: [],
        unavailable: [],
      };
      const populateCar = [
        { path: 'images', populate: { path: 'url' } },
        {
          path: 'brand',
          select: 'name image continent',
          populate: { path: 'image', select: 'url' },
        },
      ];
      try {
        const cars = await Car.find({ driver: data.userId })
          .populate(populateCar)
          .exec();
        const tournament = await Tournament.findById(data.tournamentId).exec();
        if (tournament) {
          for (const car of cars) {
            // check requisites of tournament
            const check = this.checkValidationsRequisites(tournament, car);
            if (check.status) {
              const inscription = await Inscription.findOne({
                car: car._id.toString(),
                tournament: data.tournamentId.toString(),
              }).exec();
              if (inscription) {
                results.inscribed.push(car);
              } else {
                results.availables.push(car);
              }
            } else {
              results.unavailable.push(car);
            }
          }
          resolve(results);
        } else {
          reject({ message: 'El torneo no existe' });
        }
      } catch (error) {
        Logger.error(error);
        reject(error);
      }
    });
  }

  getOne(id: string): Promise<InscriptionI> {
    return new Promise(async (resolve, reject) => {
      try {
        const item = await Inscription.findById(id).exec();
        if (item) {
          resolve(item);
        } else {
          reject({ message: 'La inscripcion no existe' });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  checkCarInscribedInTournament(
    id: string,
    idTournament: string
  ): Promise<InscriptionI> {
    try {
      return Inscription.findOne({
        car: id,
        tournament: idTournament,
      }).exec();
    } catch (error) {
      return error;
    }
  }

  async create(inscription: InscriptionI): Promise<InscriptionI> {
    return new Promise(async (resolve, reject) => {
      try {
        const tournament: TournamentI = await Tournament.findById(
          inscription.tournament
        ).exec();
        const car: CarI = await Car.findById(inscription.car)
          .populate([
            { path: 'images', populate: { path: 'url' } },
            { path: 'brand', select: 'name continent' },
          ])
          .exec();
        const validation = await this.checkValidationsInscriptions(
          tournament,
          inscription,
          car
        );
        const validationRequisites = this.checkValidationsRequisites(
          tournament,
          car
        );
        if (validation.status) {
          if (validationRequisites.status) {
            const item = new Inscription(inscription);
            const itemCreated = await item.save();
            resolve(itemCreated);
          } else {
            reject({ message: validationRequisites.message });
          }
        } else {
          reject({ message: validation.message });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  async checkValidationsInscriptions(
    tournament: TournamentI,
    inscription: InscriptionI,
    car: CarI
  ): Promise<{ status: boolean; message: string }> {
    try {
      const result = { status: true, message: '' };
      const inscriptions = await this.getAllTournamentInscriptions({
        id: tournament._id,
        site: 'admin',
      });
      if (inscriptions.length >= tournament.maxParticipants) {
        return {
          status: false,
          message: 'El torneo ya tiene todos los participantes',
        };
      }
      if (
        inscriptions.filter(
          (i) => i.car._id.toString() === inscription.car.toString()
        ).length > 0
      ) {
        return {
          status: false,
          message: 'El coche ya esta inscrito en el torneo',
        };
      }
      if (!car.images.length) {
        return { status: false, message: 'El coche no tiene imagen' };
      }
      return result;
    } catch (error) {
      return error;
    }
  }

  checkValidationsRequisites(
    tournament: TournamentI,
    car: any
  ): { message: string; status: boolean } {
    const result = { message: '', status: true };
    if (car.images.length === 0) {
      result.message = 'El coche no tiene imagen';
      result.status = false;
      return result;
    }
    for (const requisite of tournament.requisites) {
      if (
        requisite.operator === '>' &&
        car[requisite.field] <= requisite.value
      ) {
        return this.checkValidationsRequisitesFailed(result, requisite);
      } else if (
        requisite.operator === '<' &&
        car[requisite.field] >= requisite.value
      ) {
        return this.checkValidationsRequisitesFailed(result, requisite);
      } else if (requisite.operator === '=') {
        return this.checkValidationsRequisitesFailedSame(
          result,
          car,
          requisite
        );
      }
    }
    return result;
  }

  private checkValidationsRequisitesFailed(
    result: {
      message: string;
      status: boolean;
    },
    requisite: TournamentRequisiteI
  ) {
    const defaultMessage = `No cumple con los requisitos del torneo -- ${requisite.field} = ${requisite.value}`;
    result.message = defaultMessage;
    result.status = false;
    return result;
  }

  private checkValidationsRequisitesFailedSame(
    result: {
      message: string;
      status: boolean;
    },
    car: any,
    requisite: TournamentRequisiteI
  ) {
    if (requisite.field === 'continent') {
      if (car.brand.continent !== requisite.value) {
        return this.checkValidationsRequisitesFailed(result, requisite);
      } else {
        return result;
      }
    } else if (car[requisite.field] !== requisite.value) {
      return this.checkValidationsRequisitesFailed(result, requisite);
    } else {
      return result;
    }
  }

  async forceInscriptions(tournamentId: string): Promise<MessageI> {
    return new Promise(async (resolve, reject) => {
      try {
        const tournament = await Tournament.findById(tournamentId).exec();
        const inscriptions = await this.getAllTournamentInscriptions({
          id: tournamentId,
          site: 'admin',
        });
        let carsNotInscribed = await this.removeAlreadyEnteredCarsFromCarArray(
          inscriptions
        );
        if (inscriptions.length >= tournament.maxParticipants) {
          reject({
            message: 'El torneo no admite mas participantes',
          });
        }
        carsNotInscribed = await this.deleteCarsThatExceedMaximumAllowed(
          tournament,
          inscriptions,
          carsNotInscribed
        );
        const total = await this.createAllInscriptionsForced(
          carsNotInscribed,
          tournament
        );
        resolve({ message: `${total} inscripciones creadas` });
      } catch (error) {
        reject(error);
      }
    });
  }

  private async removeAlreadyEnteredCarsFromCarArray(
    inscriptions: InscriptionI[]
  ): Promise<CarI[]> {
    let cars = await Car.find({})
      .populate([
        { path: 'brand', select: 'continent country' },
        { path: 'images', select: 'url' },
      ])
      .exec();
    cars = cars.filter(
      (car) => car.images && car.images.length > 0 && car.images[0].url !== ''
    );
    for (const inscription of inscriptions) {
      cars = cars.filter(
        (car) => car._id.toString() !== inscription.car._id.toString()
      );
    }
    return cars;
  }

  private async deleteCarsThatExceedMaximumAllowed(
    tournament: TournamentI,
    inscriptions: InscriptionI[],
    carsNotInscribed: CarI[]
  ): Promise<CarI[]> {
    const carsToInscribe = tournament.maxParticipants - inscriptions.length;
    const itemsToDelete = carsNotInscribed.length - carsToInscribe;
    if (itemsToDelete > 0) {
      carsNotInscribed.splice(0, itemsToDelete);
    }
    return carsNotInscribed;
  }

  private async createAllInscriptionsForced(
    carsNotInscribed: CarI[],
    tournament: TournamentI
  ): Promise<number> {
    try {
      let total = 0;
      for (const car of carsNotInscribed) {
        const checkRequisites = this.checkValidationsRequisites(
          tournament,
          car
        );
        if (checkRequisites.status) {
          const inscription = new Inscription({
            tournament: tournament._id,
            car: car._id,
            driver: car.driver && car.driver._id ? car.driver._id : car.driver,
          });
          await inscription.save();
          total++;
        }
      }
      return total;
    } catch (error) {
      return error;
    }
  }

  update(inscription: InscriptionI): Promise<InscriptionI> {
    try {
      return Inscription.findByIdAndUpdate(inscription._id, inscription, {
        new: true,
      }).exec();
    } catch (error) {
      return error;
    }
  }

  async deleteAllOfCar(id: string): Promise<InscriptionI[]> {
    try {
      const inscriptions = await this.getAllCarInscriptions({
        id,
        limit: '10000',
      });
      for (const inscription of inscriptions) {
        await this.deleteOne(inscription._id);
      }
      return;
    } catch (error) {
      return error;
    }
  }

  async deleteAllOfTournament(id: string): Promise<void> {
    try {
      const inscriptions = await this.getAllTournamentInscriptions({
        id,
        site: 'admin',
      });
      for (const inscription of inscriptions) {
        await this.deleteOne(inscription._id);
      }
      return;
    } catch (error) {
      return error;
    }
  }

  deleteOne(id: string): Promise<InscriptionI> {
    try {
      return Inscription.findByIdAndDelete(id).exec();
    } catch (error) {
      return error;
    }
  }

  deleteByCarAndTournament(
    carId: string,
    tournamentId: string
  ): Promise<InscriptionI> {
    try {
      return Inscription.findOneAndDelete({
        car: carId.toString(),
        tournament: tournamentId.toString(),
      }).exec();
    } catch (error) {
      return error;
    }
  }
}
