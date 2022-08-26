import { lookupImages, lookupBrand, lookupImage } from '@aggregates';
import mongoose from 'mongoose';

export const WinnerGetAllCarWinnersAggregate = (carId: string) => {
  const ObjectId = mongoose.Types.ObjectId;
  return [
    {
      $match: {
        $or: [
          {
            gold: new ObjectId(carId),
          },
          {
            silver: new ObjectId(carId),
          },
          {
            bronze: new ObjectId(carId),
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
        pipeline: [
          lookupImage('tournament'),
          { $unwind: '$image' },
          { $project: { _id: 1, name: 1, endDate: 1, image: 1 } },
        ],
      },
    },
    {
      $lookup: {
        from: 'cars',
        localField: 'gold',
        foreignField: '_id',
        as: 'gold',
        pipeline: [
          {
            $lookup: {
              from: 'votes',
              localField: '_id',
              foreignField: 'car',
              as: 'votes',
              // count
              pipeline: [
                { $count: 'count' },
                { $project: { count: 1, _id: 0 } },
              ],
            },
          },
          lookupImages('car'),
          lookupBrand(),
          { $unwind: '$brand' },
          //   { $unwind: '$votes' },
          {
            $project: {
              _id: 1,
              model: 1,
              brand: 1,
              images: 1,
              driver: 1,
              votes: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'cars',
        localField: 'silver',
        foreignField: '_id',
        as: 'silver',
        pipeline: [
          lookupImages('car'),
          lookupBrand(),
          {
            $lookup: {
              from: 'votes',
              localField: '_id',
              foreignField: 'car',
              as: 'votes',
              pipeline: [
                { $count: 'count' },
                { $project: { count: 1, _id: 0 } },
              ],
            },
          },
          { $unwind: '$brand' },
          //   { $unwind: '$votes', preserveNullAndEmptyArrays: true },
          {
            $project: {
              _id: 1,
              model: 1,
              brand: 1,
              images: 1,
              driver: 1,
              votes: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'cars',
        localField: 'bronze',
        foreignField: '_id',
        as: 'bronze',
        pipeline: [
          lookupImages('car'),
          lookupBrand(),
          // match id === carId
          {
            $lookup: {
              from: 'votes',
              localField: '_id',
              foreignField: 'car',
              as: 'votes',
              pipeline: [
                { $count: 'count' },
                { $project: { count: 1, _id: 0 } },
              ],
            },
          },
          { $unwind: '$brand' },
          //   { $unwind: '$votes', preserveNullAndEmptyArrays: true },
          {
            $project: {
              _id: 1,
              model: 1,
              brand: 1,
              images: 1,
              driver: 1,
              votes: 1,
            },
          },
          //   { $match: { _id: new ObjectId(carId) } },
        ],
      },
    },
    // get the same carId between gold silver or bronze

    { $unwind: '$tournament' },
    { $unwind: '$gold' },
    { $unwind: '$silver' },
    { $unwind: '$bronze' },
  ];
};
