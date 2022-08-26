import mongoose from 'mongoose';
import {
  lookupImage,
  lookupBrand,
  lookupDriver,
  lookupImages,
} from '@aggregates';
import { VoteGetAllOfGenericDto } from '@vote';

const ObjectId = mongoose.Types.ObjectId;

export const voteGetAllAggregate = (
  sort: any,
  skip: number,
  pageSize: number
) => {
  return [
    {
      $lookup: {
        from: 'cars',
        localField: 'car',
        foreignField: '_id',
        as: 'car',
        pipeline: [
          lookupBrand(),
          lookupImages('car'),
          { $unwind: '$brand' },
          { $project: { name: 1, images: 1, model: 1, brand: 1, _id: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: 'tournaments',
        localField: 'tournament',
        foreignField: '_id',
        as: 'tournament',
        pipeline: [
          lookupImage('tournament'),
          { $unwind: '$image' },
          { $project: { name: 1, image: 1, _id: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: 'rounds',
        localField: 'round',
        foreignField: '_id',
        as: 'round',
        pipeline: [{ $project: { name: 1, _id: 0 } }],
      },
    },
    lookupDriver('user'),
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    { $unwind: '$tournament' },
    { $unwind: '$car' },
    { $unwind: '$round' },
    {
      $project: {
        _id: 1,
        tournament: 1,
        car: 1,
        user: 1,
        uuid: 1,
        round: 1,
        created: 1,
      },
    },
    { $sort: sort },
    { $skip: skip },
    { $limit: pageSize },
  ];
};

export const voteGetAllCarVotesAggregate = (data: VoteGetAllOfGenericDto) => {
  return [
    { $match: { car: new ObjectId(data.id) } },
    {
      $lookup: {
        from: 'tournaments',
        localField: 'tournament',
        foreignField: '_id',
        as: 'tournament',
        pipeline: [
          lookupImage('tournament'),
          { $unwind: '$image' },
          { $project: { name: 1, image: 1, _id: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: 'rounds',
        localField: 'round',
        foreignField: '_id',
        as: 'round',
        pipeline: [{ $project: { name: 1, _id: 0 } }],
      },
    },
    { $unwind: '$tournament' },
    { $unwind: '$round' },
    lookupDriver('user'),
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    { $project: { tournament: 1, _id: 1, round: 1, uuid: 1, created: 1 } },
    { $sort: { created: -1 } },
  ];
};

export const voteGetAllTournamentVotesAggregate = (
  data: VoteGetAllOfGenericDto
) => {
  return [
    { $match: { tournament: new ObjectId(data.id) } },
    {
      $lookup: {
        from: 'cars',
        localField: 'car',
        foreignField: '_id',
        as: 'car',
        pipeline: [
          lookupBrand(),
          lookupImages('car'),
          { $unwind: '$brand' },
          { $project: { name: 1, image: 1, model: 1, brand: 1, _id: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: 'rounds',
        localField: 'round',
        foreignField: '_id',
        as: 'round',
      },
    },
    { $unwind: '$car' },
    { $unwind: '$round' },
    lookupDriver('user'),
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    { $project: { round: 1, car: 1, user: 1, _id: 1, uuid: 1, created: 1 } },
    { $sort: { created: -1 } },
  ];
};

export const voteCreateFakeVotesAggregate = () => {
  return [
    {
      $lookup: {
        from: 'rounds',
        localField: 'round',
        foreignField: '_id',
        as: 'round',
        pipeline: [{ $project: { _id: 1, status: 1 } }],
      },
    },
    {
      $match: {
        'round.status': 'InProgress',
      },
    },
    { $project: { _id: 1, round: 1, tournament: 1, car1: 1, car2: 1 } },
  ];
};
