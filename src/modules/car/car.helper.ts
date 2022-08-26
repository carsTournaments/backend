import { UserTokenI } from '@auth';
import {
  Car,
  CarGetGlobalRankingDto,
  CarI,
  CarRankingI,
  CarRankingItemsI,
  CarStatsI,
  CarStatsItemI,
} from '@car';
import { IdSiteDto } from '@dtos';
import { Inscription, InscriptionI } from '@inscription';
import { Like, LikeI } from '@like';
import { Pairing, PairingI } from '@pairing';
import { Vote } from '@vote';
import { Winner, WinnerI } from '@winner';

export class CarHelper {
  // Ranking
  async getDataForMultiplesValuesRanking(
    dataDB: any,
    aggregate: any
  ): Promise<any> {
    dataDB.votes = await Vote.aggregate(aggregate).exec();
    dataDB.pairings = await Pairing.find({}).exec();
    dataDB.winners = await Winner.find({}).exec();
    dataDB.likes = await Like.find({}).exec();
    dataDB.inscriptions = await Inscription.find({}).exec();
    dataDB.cars = dataDB.votes.map((item: any) => item.car);
    return dataDB;
  }

  async getDataForInscriptionsRanking(
    dataDB: any,
    aggregate: any
  ): Promise<any> {
    dataDB.inscriptions = await Inscription.aggregate(aggregate).exec();
    dataDB.pairings = await Pairing.find({}).exec();
    dataDB.winners = await Winner.find({}).exec();
    dataDB.likes = await Like.find({}).exec();
    dataDB.cars = dataDB.inscriptions.map((item: any) => item.car);
    return dataDB;
  }

  async getDataForLikesRanking(dataDB: any, aggregate: any): Promise<any> {
    dataDB.likes = await Like.aggregate(aggregate).exec();
    dataDB.inscriptions = await Inscription.find({}).exec();
    dataDB.pairings = await Pairing.find({}).exec();
    dataDB.winners = await Winner.find({}).exec();
    dataDB.cars = dataDB.likes.map((item: any) => item.car);
    return dataDB;
  }

  setCarsRanking(
    dataDB: CarRankingItemsI,
    body: CarGetGlobalRankingDto
  ): CarRankingI[] {
    const allCars: CarI[] = dataDB.cars.filter(
      (car: CarI, index: number) =>
        dataDB.cars.findIndex(
          (c: CarI) => c._id.toString() === car._id.toString()
        ) === index
    );
    let cars: CarRankingI[] = [];
    for (const car of allCars) {
      const data = this.getDataForGlobalRanking(car, dataDB);
      cars.push({
        _id: car._id,
        name: `${car.brand.name} ${car.model}`,
        driver: car.driver.name,
        images: car.images,
        votes: data.carVotes,
        pairings: data.carPairings,
        pairingsWinners: data.pairingsWinner,
        tournamentsWinners: `${data.gold}/${data.silver}/${data.bronze}`,
        likes: data.likes,
        inscriptions: data.inscriptions,
        state: false,
        icon: 'chevron-down',
      });
    }

    if (body.order !== 'tournamentsWinners') {
      cars = cars
        .filter((car: any) => car[body.order] > 0)
        .sort((a: any, b: any) => {
          return b[body.order] - a[body.order];
        });
    } else {
      cars = cars
        .filter((car: any) => car[body.order] !== '0/0/0')
        .sort((a: any, b: any) => {
          let data1A = a[body.order].split('/');
          let data1B = b[body.order].split('/');
          data1A = data1A.map((item: any) => parseInt(item));
          data1B = data1B.map((item: any) => parseInt(item));
          const data1 = Number(`${data1A[0]}.${data1A[1]}${data1A[2]}`);
          const data2 = Number(`${data1B[0]}.${data1B[1]}${data1B[2]}`);
          return data2 - data1;
        });
    }
    return cars;
  }

  getDataForGlobalRanking(car: CarI, dataDB: CarRankingItemsI) {
    const carVotes: number = dataDB.votes.filter(
      (vote: any) => vote.car._id.toString() === car._id.toString()
    ).length;
    const carPairings: PairingI[] = dataDB.pairings.filter(
      (pairing: any) =>
        pairing.car1._id.toString() === car._id.toString() ||
        pairing.car2._id.toString() === car._id.toString()
    );
    const pairingsWinner: number = carPairings.filter(
      (pairing: PairingI) =>
        pairing.winner && pairing.winner.toString() === car._id.toString()
    ).length;
    const gold: number = dataDB.winners.filter(
      (winner: WinnerI) => winner.gold.toString() === car._id.toString()
    ).length;
    const silver: number = dataDB.winners.filter(
      (winner: WinnerI) => winner.silver.toString() === car._id.toString()
    ).length;
    const bronze: number = dataDB.winners.filter(
      (winner: WinnerI) => winner.bronze.toString() === car._id.toString()
    ).length;
    const carLikes = dataDB.likes.filter(
      (like: LikeI) => like.car._id.toString() === car._id.toString()
    ).length;
    const carInscriptions = dataDB.inscriptions.filter(
      (inscription: InscriptionI) =>
        inscription.car._id.toString() === car._id.toString()
    ).length;
    return {
      carVotes,
      carPairings: carPairings.length,
      pairingsWinner,
      gold,
      silver,
      bronze,
      likes: carLikes,
      inscriptions: carInscriptions,
    };
  }

  // getCarStats
  async generateItemsForCarStats(cars: CarI[]): Promise<CarStatsI[]> {
    const categoriesForSet = [
      {
        name: 'fuel',
        label: 'Combustible',
        items: ['gasoline', 'diesel', 'electric', 'hybrid'],
      },
      {
        name: 'traction',
        label: 'Tracción',
        items: ['FWD', 'RWD', 'AWD', '4WD', '4X4'],
      },
      {
        name: 'stock',
        label: 'De serie',
        items: ['Si', 'No'],
      },
      {
        name: 'year',
        label: 'Año',
        items: [
          '2022-2010',
          '2009-2000',
          '1999-1990',
          '1989-1980',
          '1979-1970',
          '1969-1960',
        ],
      },
      {
        name: 'cc',
        label: 'CC',
        items: [
          '0-999',
          '1000-1999',
          '2000-2999',
          '3000-3999',
          '4000-4999',
          '5000-9999',
        ],
      },
      {
        name: 'cv',
        label: 'CV',
        items: [
          '0-99',
          '100-199',
          '200-299',
          '300-399',
          '400-499',
          '500-599',
          '600-999',
        ],
      },
      {
        name: 'brand',
        label: 'Marcas',
        items: this.generateBrands(cars),
      },
      {
        name: 'country',
        label: 'Paises',
        items: this.generateCountries(cars),
      },
      {
        name: 'continent',
        label: 'Continente',
        items: ['Europa', 'America', 'Asia'],
      },
    ];
    const finalItems: CarStatsI[] = [];
    for (const category of categoriesForSet) {
      const items = [];
      for (const item of category.items) {
        items.push({
          name: item,
          value: 0,
        });
      }
      finalItems.push({
        name: category.name,
        label: category.label,
        items,
      });
    }
    return finalItems;
  }

  private generateBrands(cars: CarI[]): string[] {
    const brands = cars.map((car: CarI) => car.brand.name);
    const uniqueBrands = [...new Set(brands)];
    return uniqueBrands;
  }

  private generateCountries(cars: CarI[]): string[] {
    const countries = cars.map((car: CarI) => car.brand.country);
    const uniqueCounties = [...new Set(countries)];
    return uniqueCounties;
  }

  setForCarStats(
    type:
      | 'fuel'
      | 'traction'
      | 'year'
      | 'stock'
      | 'cc'
      | 'cv'
      | 'brand'
      | 'country'
      | 'continent',
    car: any,
    categories: CarStatsI[]
  ) {
    const carType = car[type];
    for (const category of categories) {
      for (let item of category.items) {
        if (type === 'stock') {
          item = this.setStockForCarStats(car, item);
        } else if (type === 'year') {
          item = this.setYearsForCarStats(car, item);
        } else if (type === 'cc') {
          item = this.setCCForCarStats(car, item);
        } else if (type === 'cv') {
          item = this.setCVForCarStats(car, item);
        } else if (type === 'brand') {
          item = this.setBrandForCarStats(car, item);
        } else if (type === 'country') {
          item = this.setCountryForCarStats(car, item);
        } else if (type === 'continent') {
          item = this.setContinentForCarStats(car, item);
        } else {
          if (item.name === carType) {
            item.value++;
          }
        }
        category.items = category.items.sort(
          (a: any, b: any) => b.value - a.value
        );
      }
    }
    return categories;
  }

  private setStockForCarStats(car: CarI, item: CarStatsItemI) {
    if (item.name === 'Si' && car.stock) {
      item.value++;
    } else if (item.name === 'No' && !car.stock) {
      item.value++;
    }
    return item;
  }

  private setYearsForCarStats(car: CarI, item: CarStatsItemI) {
    const year = item.name.split('-');
    if (car.year <= Number(year[0]) && car.year >= Number(year[1])) {
      item.value++;
    }
    return item;
  }

  private setCCForCarStats(car: CarI, item: CarStatsItemI) {
    const cc = item.name.split('-');
    if (cc.length > 0) {
      if (car.cc >= Number(cc[0]) && car.cc <= Number(cc[1])) {
        item.value++;
      }
    }
    return item;
  }

  private setCVForCarStats(car: CarI, item: CarStatsItemI) {
    const cv = item.name.split('-');
    if (cv.length > 0) {
      if (car.cv >= Number(cv[0]) && car.cv <= Number(cv[1])) {
        item.value++;
      }
    }
    return item;
  }

  private setBrandForCarStats(car: CarI, item: CarStatsItemI) {
    if (item.name === car.brand.name) {
      item.value++;
    }
    return item;
  }

  private setCountryForCarStats(car: CarI, item: CarStatsItemI) {
    if (item.name === car.brand.country) {
      item.value++;
    }
    return item;
  }

  private setContinentForCarStats(car: CarI, item: CarStatsItemI) {
    if (car.brand.continent === item.name) {
      item.value++;
    }
    return item;
  }

  //getOne
  async getOneForUser(
    item: CarI,
    aggregate: any,
    user: UserTokenI,
    reject: (reason?: any) => void
  ) {
    item = await this.getOneAggregate(aggregate, reject);
    if (item) {
      const likes = await Like.find({ car: item._id }).exec();
      const isLiked = likes.find(
        (i) => i.user && i.user.toString() === user._id.toString()
      );
      item.liked = false;
      if (isLiked) {
        item.liked = true;
      }
      item.pairings = {
        count: item.pairingsC1?.count ?? 0 + item.pairingsC2?.count ?? 0,
      };
      delete item.pairingsC1;
      delete item.pairingsC2;
    } else {
      reject({ message: 'No se encontró el coche' });
    }
    return item;
  }

  async getOneAggregate(
    aggregate: any,
    reject: (reason?: any) => void
  ): Promise<CarI> {
    const items = await Car.aggregate(aggregate).exec();
    if (items.length === 0) {
      reject({ message: 'No se encontró el coche' });
    }
    return items[0];
  }

  async getOneForAdmin(
    data: IdSiteDto,
    populateDefault: any,
    reject: (reason?: any) => void
  ) {
    const item = await Car.findById(data.id).populate(populateDefault).exec();
    if (!item) {
      reject({ message: 'No se encontró el coche' });
    }
    return item;
  }
}
