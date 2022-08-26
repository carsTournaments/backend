import { lookupCar } from './../../common/aggregates/generic.aggregate';
import { lookupDriver, lookupBrand, lookupImages } from '@aggregates';
import { SearchDto } from '@dtos';
import mongoose from 'mongoose';

import { LikeGetAllOfCarDto } from './like.dto';

const ObjectId = mongoose.Types.ObjectId;

export const likeGetAllCarLikesAggregate = (data: LikeGetAllOfCarDto) => [
  { $match: { car: new ObjectId(data.id) } },
  {
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'user',
      pipeline: [{ $project: { _id: 0, name: 1 } }],
    },
  },
  { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
  { $project: { _id: 1, user: 1, created: 1 } },
  { $sort: { created: -1 } },
  { $limit: Number(data.limit) },
];

export const likeGetAllUserSubmittedLikesAggregate = (id: string) => [
  { $match: { user: new ObjectId(id) } },
  {
    $lookup: {
      from: 'cars',
      localField: 'car',
      foreignField: '_id',
      as: 'car',
      pipeline: [
        lookupBrand(),
        lookupDriver(),
        lookupImages('car'),
        { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
      ],
    },
  },
  { $unwind: { path: '$car' } },
  { $project: { _id: 1, car: 1, created: 1 } },
  { $sort: { created: -1 } },
];

export const likeSearchAggregate = (data: SearchDto): any => [
  lookupDriver('user'),
  lookupCar(),
  { $unwind: '$car' },
  { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
  {
    $match: {
      $or: [
        { 'car.model': { $regex: data.value, $options: 'g' } },
        { 'car.brand.name': { $regex: data.value, $options: 'g' } },
        { 'car.driver.name': { $regex: data.value, $options: 'g' } },
        { 'user.name': { $regex: data.value, $options: 'g' } },
      ],
    },
  },
  { $sort: { created: -1 } },
  { $limit: data.limit },
];
