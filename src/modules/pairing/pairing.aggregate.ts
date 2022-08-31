import { lookupImages } from './../../common/aggregates/generic.aggregate';
import mongoose from 'mongoose';
import {
  lookupImage,
  lookupDriver,
} from '../../common/aggregates/generic.aggregate';
export const pairingGetAllAggregate = (
  sort: any,
  skip: number,
  pageSize: number
) => {
  return [
    {
      $lookup: {
        from: 'cars',
        localField: 'car1',
        foreignField: '_id',
        as: 'car1',
        pipeline: [
          getLookupBrand(),
          lookupImages('car'),
          { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
          { $project: { model: 1, brand: 1, images: 1, _id: 1 } },
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
          getLookupBrand(),
          lookupImages('car'),
          { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
          { $project: { model: 1, brand: 1, images: 1, _id: 1 } },
        ],
      },
    },
    getLookupTournament(),
    {
      $lookup: {
        from: 'rounds',
        localField: 'round',
        foreignField: '_id',
        as: 'round',
        pipeline: [{ $project: { name: 1, _id: 1 } }],
      },
    },
    getLookupVotes(),
    {
      $lookup: {
        from: 'cars',
        localField: 'winner',
        foreignField: '_id',
        as: 'winner',
        pipeline: [
          getLookupBrand(),
          lookupImages('car'),
          { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
          { $project: { model: 1, brand: 1, images: 1, _id: 1 } },
        ],
      },
    },
    { $unwind: { path: '$car1', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$car2', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$tournament', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$round', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$winner', preserveNullAndEmptyArrays: true } },
    { $sort: sort },
    { $skip: skip },
    { $limit: pageSize },
  ];
};

export const pairingGetOneAggregate = (id: string) => {
  return [
    {
      $lookup: {
        from: 'cars',
        localField: 'car1',
        foreignField: '_id',
        as: 'car1',
        pipeline: [
          {
            $lookup: {
              from: 'brands',
              localField: 'brand',
              foreignField: '_id',
              as: 'brand',
              pipeline: [
                lookupImage('brand'),
                getUnwindImage(),
                { $project: { name: 1, image: 1, country: 1, _id: 1 } },
              ],
            },
          },
          lookupDriver(),
          lookupImages('car'),
          { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
          { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
          getProject(),
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
          {
            $lookup: {
              from: 'brands',
              localField: 'brand',
              foreignField: '_id',
              as: 'brand',
              pipeline: [
                {
                  $lookup: {
                    from: 'images',
                    localField: '_id',
                    foreignField: 'brand',
                    as: 'image',
                    pipeline: [{ $project: { url: 1, _id: 0 } }],
                  },
                },
                getUnwindImage(),
                { $project: { name: 1, image: 1, country: 1, _id: 1 } },
              ],
            },
          },
          lookupDriver(),
          lookupImages('car'),
          { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
          { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
          getProject(),
        ],
      },
    },
    {
      $lookup: {
        from: 'rounds',
        localField: 'round',
        foreignField: '_id',
        as: 'round',
        pipeline: [
          {
            $project: { name: 1, status: 1, startDate: 1, endDate: 1, _id: 1 },
          },
        ],
      },
    },
    getLookupTournament(),
    getLookupVotes(),
    {
      $lookup: {
        from: 'cars',
        localField: 'winner',
        foreignField: '_id',
        as: 'winner',
        pipeline: [
          getLookupBrand(),
          lookupImages('car'),
          { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
          { $project: { model: 1, brand: 1, image: 1, _id: 1 } },
        ],
      },
    },
    { $unwind: { path: '$car1', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$car2', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$tournament', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$round', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$winner', preserveNullAndEmptyArrays: true } },
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
  ];
};

const getUnwindImage = () => {
  return {
    $unwind: { path: '$image', preserveNullAndEmptyArrays: true },
  };
};

const getProject = () => {
  return {
    $project: {
      model: 1,
      brand: 1,
      driver: 1,
      images: 1,
      _id: 1,
      cc: 1,
      cv: 1,
      fuel: 1,
      stock: 1,
      traction: 1,
      year: 1,
    },
  };
};

const getLookupVotes = (): any => {
  return {
    $lookup: {
      from: 'votes',
      localField: '_id',
      foreignField: 'pairing',
      as: 'votes',
      pipeline: [{ $project: { car: 1, _id: 1 } }],
    },
  };
};

const getLookupTournament = () => {
  return {
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
  };
};

const getLookupBrand = () => {
  return {
    $lookup: {
      from: 'brands',
      localField: 'brand',
      foreignField: '_id',
      as: 'brand',
      pipeline: [{ $project: { name: 1, _id: 0 } }],
    },
  };
};
