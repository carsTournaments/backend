import mongoose from 'mongoose';
import {
  lookupImage,
  lookupBrand,
  lookupDriver,
  lookupImages,
} from '@aggregates';
import { InscriptionGetAllOfCarDto } from '@inscription';

const ObjectId = mongoose.Types.ObjectId;

export const inscriptionGetAllAggregate = (
  sort: any,
  skip: any,
  pageSize: any
) => {
  return [
    {
      $lookup: {
        from: 'tournaments',
        localField: 'tournament',
        foreignField: '_id',
        as: 'tournament',
        pipeline: [
          lookupImage('tournament'),
          { $unwind: { path: '$image', preserveNullAndEmptyArrays: true } },
          { $project: { name: 1, image: 1, _id: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: 'cars',
        localField: 'car',
        foreignField: '_id',
        as: 'car',
        pipeline: [
          lookupBrand(),
          lookupImages('car'),
          {
            $lookup: {
              from: 'votes',
              localField: '_id',
              foreignField: 'car',
              as: 'votes',
              pipeline: [{ $project: { _id: 0, car: 1, tournament: 1 } }],
            },
          },
          { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
          { $project: { model: 1, brand: 1, images: 1, votes: 1, _id: 1 } },
        ],
      },
    },
    lookupDriver(),
    { $sort: sort },
    { $skip: skip },
    { $limit: pageSize },
    { $unwind: { path: '$tournament', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$car', preserveNullAndEmptyArrays: true } },
    { $project: { tournament: 1, driver: 1, car: 1, _id: 1, created: 1 } },
  ];
};

export const inscriptionGetAllTournamentInscriptionsAggregate = (
  tournamentId: string
) => {
  return [
    {
      $match: { tournament: new ObjectId(tournamentId) },
    },
    {
      $lookup: {
        from: 'cars',
        localField: 'car',
        foreignField: '_id',
        as: 'car',
        pipeline: [
          lookupBrand(),
          lookupImages('car'),
          lookupDriver(),
          {
            $lookup: {
              from: 'votes',
              localField: '_id',
              foreignField: 'car',
              as: 'votes',
              pipeline: [{ $project: { _id: 0, car: 1, tournament: 1 } }],
            },
          },
          { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
          { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              model: 1,
              brand: 1,
              driver: 1,
              images: 1,
              votes: 1,
              _id: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'tournaments',
        localField: 'tournament',
        foreignField: '_id',
        as: 'tournament',
      },
    },
    lookupDriver(),
    { $unwind: '$tournament' },
    { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$car', preserveNullAndEmptyArrays: true } },
    { $sort: { created: -1 } },
  ];
};

export const inscriptionGetAllForDriverAggregate = (driverId: string) => {
  return [
    {
      $match: { driver: new ObjectId(driverId) },
    },
    {
      $lookup: {
        from: 'tournaments',
        localField: 'tournament',
        foreignField: '_id',
        as: 'tournament',
        pipeline: [
          {
            $lookup: {
              from: 'images',
              localField: '_id',
              foreignField: 'tournament',
              as: 'image',
              pipeline: [{ $project: { url: '$url', _id: 0 } }],
            },
          },
          { $unwind: '$image' },
          { $project: { name: 1, image: 1, _id: 1, status: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: 'cars',
        localField: 'car',
        foreignField: '_id',
        as: 'car',
        pipeline: [
          lookupBrand(),
          lookupImages('car'),
          { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
          { $project: { model: 1, brand: 1, images: 1, _id: 1 } },
        ],
      },
    },
    { $unwind: '$tournament' },
    { $unwind: { path: '$car', preserveNullAndEmptyArrays: true } },
    { $match: { 'tournament.status': { $ne: 'Cancelled' } } },
    { $sort: { 'tournament.status': -1 } },
  ];
};

export const inscriptionGetAllOfCarAggregate = (
  data: InscriptionGetAllOfCarDto
) => [
  { $match: { car: new ObjectId(data.id) } },
  {
    $lookup: {
      from: 'tournaments',
      localField: 'tournament',
      foreignField: '_id',
      as: 'tournament',
      pipeline: [
        lookupImage('tournament'),
        { $unwind: { path: '$image', preserveNullAndEmptyArrays: true } },
        { $project: { _id: 1, name: 1, image: 1, status: 1 } },
      ],
    },
  },
  { $unwind: { path: '$tournament', preserveNullAndEmptyArrays: true } },
  { $project: { _id: 1, tournament: 1, created: 1 } },
  { $sort: { created: -1 } },
  { $limit: Number(data.limit) },
];
