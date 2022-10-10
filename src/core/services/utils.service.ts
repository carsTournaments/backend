import { UserTokenI } from '@auth';
import fs from 'fs';
import https from 'https';

export class UtilsService {
  onlyUnique = (value: any, index: number, self: any) => {
    return self.indexOf(value) === index;
  };

  getKmAprox = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const deg2rad = (deg: number) => deg * (Math.PI / 180);

    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(Number(lat2) - Number(lat1)); // deg2rad below
    const dLon = deg2rad(Number(lon2) - Number(lon1));
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return Number(d.toFixed(2));
  };

  bytesToSize(bytes: number, decimals: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  randomNumber(max: number, min = 1, decimal = false): string | undefined {
    if (!decimal) {
      if (min > 1) {
        return (Math.random() * (max - min) + min).toFixed(0);
      }
      return (Math.random() * (max - min)).toFixed(0);
    } else if (decimal) {
      const maxArray = max.toString().split('.');
      const maxOk = [Number(maxArray[0]), Number(maxArray[1])];
      const minArray = min.toString().split('.');
      const minOk = [Number(minArray[0]), Number(minArray[1])];
      const dataOk = Math.random() * (max - min) + min;
      const dataSubOk: any = this.randomNumber(maxOk[1], minOk[1]);
      return dataOk.toFixed(0) + '.' + dataSubOk;
    }
  }

  getBodyCoordinates(coords: number[], maxDistance: number): any {
    return {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: coords,
        },
        $maxDistance: maxDistance * 1000,
        $minDistance: 0,
      },
    };
  }

  getDateTimeForQuery(complete = true): any {
    if (complete) {
      return {
        dateTime: {
          $gte: new Date().toISOString(),
          $lt: new Date('2055-01-01').toISOString(),
        },
      };
    } else if (!complete) {
      return {
        $gte: new Date().toISOString(),
        $lt: new Date('2055-01-01').toISOString(),
      };
    }
  }

  getDateTimePastForQuery(complete = true): any {
    if (complete) {
      return {
        dateTime: {
          $lt: new Date().toISOString(),
          $gte: new Date('2021-01-01').toISOString(),
        },
      };
    } else if (!complete) {
      return {
        $lt: new Date().toISOString(),
        $gte: new Date('2021-01-01').toISOString(),
      };
    }
  }

  getOrderForGetAll(body: any): any {
    let order: any = {};
    if (body.order && body.order.length > 1) {
      order = { [body.order[0]]: body.order[1] };
    }
    return order;
  }

  getOrderForGetAllAggregate(body: any): any {
    let order: any = {};
    if (body.order && body.order.length > 1) {
      order = { [body.order[0]]: body.order[1] === 'desc' ? -1 : 1 };
    }
    return order;
  }

  setKmsForAllItems(items: any[], coordinates: number[]): any[] {
    items.forEach((i: any) => {
      i.kms = this.getKmAprox(
        i.location.coordinates[1],
        i.location.coordinates[0],
        coordinates[0],
        coordinates[1]
      );
    });
    return items;
  }

  checkAdminUserForNoMdw(user: UserTokenI): boolean {
    if (user && user.role === 'ADMIN') {
      return true;
    }
    return false;
  }

  getValuesForPaginator(body: { page: number; pageSize: number }): {
    pageSize: number;
    currentPage: number;
    skip: number;
  } {
    const pageSize = body.pageSize ? body.pageSize : 20;
    const currentPage = body.page ? body.page : 1;
    const skip = (currentPage - 1) * pageSize;
    return { pageSize, currentPage, skip };
  }

  downloadImageFromUrl(url: string, filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        if (res.statusCode === 200) {
          res
            .pipe(fs.createWriteStream(filePath))
            .on('error', reject)
            .once('close', () => resolve(filePath));
        } else {
          res.resume();
          reject(
            new Error(`Request Failed With a Status Code: ${res.statusCode}`)
          );
        }
      });
    });
  }

  firstLetterLowerCase(value: string): string {
    return value.charAt(0).toLowerCase() + value.slice(1);
  }

  fixTournamentStateForDB(state: string) {
    if (state === 'todo') {
      return 'Todo';
    } else if (state === 'inProgress') {
      return 'InProgress';
    } else if (state === 'completed') {
      return 'Completed';
    }
  }
}
