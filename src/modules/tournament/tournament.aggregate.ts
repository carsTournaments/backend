import {
  lookupInscriptionsCount,
  lookupImage,
  lookupVotesCount,
  lookupBrand,
} from '@aggregates';

export const tournamentGetAllAggregate = (
  query: any,
  sort: any,
  skip: any,
  pageSize: any
) => {
  return [
    lookupImage('tournament'),
    lookupInscriptionsCount('tournament'),
    lookupVotesCount('tournament'),
    {
      $lookup: {
        from: 'rounds',
        localField: '_id',
        foreignField: 'tournament',
        as: 'rounds',
        pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
      },
    },
    {
      $lookup: {
        from: 'pairings',
        localField: '_id',
        foreignField: 'tournament',
        as: 'pairings',
        pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
      },
    },
    { $match: query },
    { $sort: sort },
    { $skip: skip },
    { $limit: pageSize },
    { $unwind: { path: '$image', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$inscriptions', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$votes', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$rounds', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$pairings', preserveNullAndEmptyArrays: true } },
  ];
};

export const tournamentGetPairingsForDate = () => {
  return [
    { $match: { status: 'InProgress' } },
    {
      $lookup: {
        from: 'tournaments',
        localField: 'tournament',
        foreignField: '_id',
        as: 'tournament',
        pipeline: [
          lookupImage('tournament'),
          { $unwind: { path: '$image', preserveNullAndEmptyArrays: true } },
          { $project: { _id: 1, name: 1, image: 1 } },
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
                {
                  $lookup: {
                    from: 'images',
                    localField: '_id',
                    foreignField: 'car',
                    as: 'image',
                    pipeline: [{ $project: { _id: 0, url: 1 } }],
                  },
                },
                lookupBrand(),
                {
                  $unwind: { path: '$image', preserveNullAndEmptyArrays: true },
                },
                {
                  $unwind: { path: '$brand', preserveNullAndEmptyArrays: true },
                },
                { $project: { _id: 1, name: 1, image: 1, brand: 1, model: 1 } },
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
                    from: 'images',
                    localField: '_id',
                    foreignField: 'car',
                    as: 'image',
                    pipeline: [{ $project: { _id: 0, url: 1 } }],
                  },
                },
                lookupBrand(),
                {
                  $unwind: { path: '$image', preserveNullAndEmptyArrays: true },
                },
                {
                  $unwind: { path: '$brand', preserveNullAndEmptyArrays: true },
                },
                { $project: { _id: 1, name: 1, image: 1, brand: 1, model: 1 } },
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
          { $unwind: { path: '$car1', preserveNullAndEmptyArrays: true } },
          { $unwind: { path: '$car2', preserveNullAndEmptyArrays: true } },
          { $project: { _id: 1, car1: 1, car2: 1, votes: 1 } },
        ],
      },
    },

    { $unwind: { path: '$pairings', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$tournament', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$tournament._id',
        tournament: { $first: '$tournament' },
        pairings: { $push: '$pairings' },
        startDate: { $first: '$startDate' },
        endDate: { $first: '$endDate' },
        name: { $first: '$name' },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        pairings: 1,
        tournament: 1,
        startDate: 1,
        endDate: 1,
        votes: 1,
      },
    },
    { $sort: { 'tournament.name': 1 } },
  ];
};
