import mongoose from 'mongoose';
import {
  lookupBrand,
  lookupDriver,
  lookupInscriptionsCount,
  lookupLikesCount,
  lookupVotesCount,
  lookupCar,
  lookupImages,
} from '@aggregates';
import { UtilsService } from '@services';
import { CarGetAllDto } from '@car';
import { SearchDto } from '@dtos';

const ObjectId = mongoose.Types.ObjectId;

export const carGetAllAggregate = (
  utilsService: UtilsService,
  body: CarGetAllDto,
  skip: any,
  pageSize: any
): any => {
  const sort = utilsService.getOrderForGetAllAggregate(body);
  const matchOnlyWithPhoto: any = {
    $match: {
      $or: [
        {
          images: {
            $exists: true,
            $ne: [],
          },
        },
      ],
    },
  };
  const matchBrand: any = { $match: { brand: new ObjectId(body.brand) } };
  const data: any = [];
  const itemsForAggregate = [
    lookupImages('car'),
    lookupBrand(),
    lookupDriver(),
    { $unwind: '$brand' },
    { $unwind: '$driver' },
    { $sort: sort },
    { $skip: skip },
    { $limit: pageSize },
  ];
  if (body.brand && body.brand !== null) {
    data.push(matchBrand);
  }
  if (data) {
    data.push(...itemsForAggregate);
    if (body.site === 'admin') {
      data.push(lookupInscriptionsCount('car'));
      data.push(lookupLikesCount('car'));
      data.push(lookupVotesCount('car'));
      data.push({
        $unwind: { path: '$likes', preserveNullAndEmptyArrays: true },
      });
      data.push({
        $unwind: { path: '$votes', preserveNullAndEmptyArrays: true },
      });
      data.push({
        $unwind: { path: '$inscriptions', preserveNullAndEmptyArrays: true },
      });
    }
  }
  if (body.onlyWithPhoto) {
    data.push(matchOnlyWithPhoto);
  }
  return data;
};

export const carGetAllDriverCarsAggregate = (id: string): any => [
  { $match: { driver: new ObjectId(id) } },
  lookupInscriptionsCount('car'),
  lookupImages('car'),
  lookupBrand(),
  lookupLikesCount('car'),
  lookupVotesCount('car'),
  {
    $lookup: {
      from: 'winners',
      localField: '_id',
      foreignField: 'gold',
      as: 'gold',
      pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
    },
  },
  {
    $lookup: {
      from: 'winners',
      localField: '_id',
      foreignField: 'silver',
      as: 'silver',
      pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
    },
  },
  {
    $lookup: {
      from: 'winners',
      localField: '_id',
      foreignField: 'bronze',
      as: 'bronze',
      pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
    },
  },
  { $unwind: '$brand' },
  { $unwind: '$driver' },
  { $unwind: { path: '$likes', preserveNullAndEmptyArrays: true } },
  { $unwind: { path: '$votes', preserveNullAndEmptyArrays: true } },
  { $unwind: { path: '$gold', preserveNullAndEmptyArrays: true } },
  { $unwind: { path: '$silver', preserveNullAndEmptyArrays: true } },
  { $unwind: { path: '$bronze', preserveNullAndEmptyArrays: true } },
  { $unwind: { path: '$inscriptions', preserveNullAndEmptyArrays: true } },
  {
    $project: {
      stock: 0,
      driver: 0,
      __v: 0,
    },
  },
  { $sort: { created: -1 } },
];

export const carGetAllOfBrandAggregate = (id: string): any => [
  { $match: { brand: new ObjectId(id) } },
  lookupInscriptionsCount('car'),
  lookupImages('car'),
  lookupDriver(),
  lookupBrand(),
  lookupLikesCount('car'),
  lookupVotesCount('car'),
  {
    $lookup: {
      from: 'winners',
      localField: '_id',
      foreignField: 'gold',
      as: 'gold',
      pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
    },
  },
  {
    $lookup: {
      from: 'winners',
      localField: '_id',
      foreignField: 'silver',
      as: 'silver',
      pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
    },
  },
  {
    $lookup: {
      from: 'winners',
      localField: '_id',
      foreignField: 'bronze',
      as: 'bronze',
      pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
    },
  },
  { $unwind: '$brand' },
  { $unwind: '$driver' },
  { $unwind: { path: '$likes', preserveNullAndEmptyArrays: true } },
  { $unwind: { path: '$votes', preserveNullAndEmptyArrays: true } },
  { $unwind: { path: '$gold', preserveNullAndEmptyArrays: true } },
  { $unwind: { path: '$silver', preserveNullAndEmptyArrays: true } },
  { $unwind: { path: '$bronze', preserveNullAndEmptyArrays: true } },
  { $unwind: { path: '$inscriptions', preserveNullAndEmptyArrays: true } },
  { $project: { stock: 0, __v: 0 } },
  { $sort: { created: -1 } },
];

export const carGetGlobalRanking = (): any => [
  lookupCar(),
  { $unwind: '$car' },
  { $project: { _id: 1, car: 1 } },
];

export const carSearchAggregate = (data: SearchDto): any => [
  lookupInscriptionsCount('car'),
  lookupLikesCount('car'),
  lookupVotesCount('car'),
  {
    $unwind: { path: '$likes', preserveNullAndEmptyArrays: true },
  },
  {
    $unwind: { path: '$votes', preserveNullAndEmptyArrays: true },
  },
  {
    $unwind: { path: '$inscriptions', preserveNullAndEmptyArrays: true },
  },
  lookupBrand(),
  lookupDriver(),
  lookupImages('car'),
  { $unwind: '$brand' },
  { $unwind: '$driver' },
  {
    $match: {
      $or: [
        { model: { $regex: data.value, $options: 'g' } },
        { traction: { $regex: data.value, $options: 'g' } },
        { fuel: { $regex: data.value, $options: 'g' } },
        { year: Number(data.value) },
        { cc: Number(data.value) },
        { cv: Number(data.value) },
        { 'brand.name': { $regex: data.value, $options: 'g' } },
        { 'driver.name': { $regex: data.value, $options: 'g' } },
      ],
    },
  },
  { $sort: { update: -1 } },
  { $limit: data.limit },
];

export const carGetOneAggregate = (id: string): any => {
  return [
    { $match: { _id: new ObjectId(id) } },
    lookupInscriptionsCount('car'),
    lookupDriver(),
    lookupBrand(),
    lookupImages('car'),
    lookupLikesCount('car'),
    lookupVotesCount('car'),
    // pairings
    {
      $lookup: {
        from: 'pairings',
        localField: '_id',
        foreignField: 'car1',
        as: 'pairingsC1',
        pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
      },
    },
    {
      $lookup: {
        from: 'pairings',
        localField: '_id',
        foreignField: 'car2',
        as: 'pairingsC2',
        pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
      },
    },
    {
      $lookup: {
        from: 'pairings',
        localField: '_id',
        foreignField: 'winner',
        as: 'pairingsWinners',
        pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
      },
    },
    {
      $lookup: {
        from: 'winners',
        localField: '_id',
        foreignField: 'gold',
        as: 'gold',
        pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
      },
    },
    {
      $lookup: {
        from: 'winners',
        localField: '_id',
        foreignField: 'silver',
        as: 'silver',
        pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
      },
    },
    {
      $lookup: {
        from: 'winners',
        localField: '_id',
        foreignField: 'bronze',
        as: 'bronze',
        pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
      },
    },
    { $unwind: '$brand' },
    { $unwind: '$driver' },
    { $unwind: { path: '$image', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$likes', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$votes', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$gold', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$silver', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$bronze', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$inscriptions', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$pairingsC1', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$pairingsC2', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$pairingsWinners', preserveNullAndEmptyArrays: true } },
    { $limit: 1 },
  ];
};
