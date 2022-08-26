import { lookupBrand, lookupImage } from '@aggregates';
import mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const roundGetAllAggregate = (sort: any, skip: any, pageSize: any) => {
  return [
    {
      $lookup: {
        from: 'tournaments',
        localField: 'tournament',
        foreignField: '_id',
        as: 'tournament',
        pipeline: [
          lookupImage('tournament'),
          { $unwind: '$image' },
          { $project: { name: 1, _id: 1, image: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: 'votes',
        localField: '_id',
        foreignField: 'round',
        as: 'votes',
        pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
      },
    },

    { $unwind: { path: '$tournament', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$votes', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$inscriptions', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        name: 1,
        tournament: 1,
        inscriptions: 1,
        votes: 1,
        _id: 1,
        participants: 1,
        startDate: 1,
        endDate: 1,
        status: 1,
        created: 1,
      },
    },
    { $sort: sort },
    { $skip: skip },
    { $limit: pageSize },
  ];
};

export const roundGetAllOfTournamentAggregate = (id: string) => {
  return [
    { $match: { tournament: new ObjectId(id) } },
    {
      $lookup: {
        from: 'tournaments',
        localField: 'tournament',
        foreignField: '_id',
        as: 'tournament',
        pipeline: [
          lookupImage('tournament'),
          { $unwind: '$image' },
          { $project: { name: 1, _id: 1, image: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: 'pairings',
        localField: '_id',
        foreignField: 'round',
        as: 'pairings',
        pipeline: [
          {
            $lookup: {
              from: 'cars',
              localField: 'car1',
              foreignField: '_id',
              as: 'car1',
              pipeline: [
                lookupBrand(),
                { $unwind: '$brand' },
                { $project: { model: 1, _id: 1, brand: 1 } },
              ],
            },
          },
          {
            $lookup: {
              from: 'cars',
              localField: 'car2',
              foreignField: '_id',
              as: 'car2',
              pipeline: [
                lookupBrand(),
                { $unwind: '$brand' },
                { $project: { model: 1, _id: 1, brand: 1 } },
              ],
            },
          },
          {
            $lookup: {
              from: 'votes',
              localField: '_id',
              foreignField: 'pairing',
              as: 'votes',
              pipeline: [
                { $project: { _id: 0, car: 1 } },
                {
                  $unwind: { path: '$votes', preserveNullAndEmptyArrays: true },
                },
              ],
            },
          },
          { $unwind: '$car1' },
          { $unwind: '$car2' },
          { $project: { _id: 1, car1: 1, car2: 1, votes: 1 } },
        ],
      },
    },

    { $unwind: { path: '$tournament', preserveNullAndEmptyArrays: true } },
  ];
};
