import { GetAllDto, SearchDto } from '@dtos';
import { UtilsService } from '@services';

export const userGetAllAggregate = (
  utilsService: UtilsService,
  body: GetAllDto,
  skip: number,
  pageSize: number
): any => {
  const sort = utilsService.getOrderForGetAllAggregate(body);
  return [
    {
      $lookup: {
        from: 'cars',
        localField: '_id',
        foreignField: 'driver',
        as: 'cars',
        pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
      },
    },
    {
      $lookup: {
        from: 'likes',
        localField: '_id',
        foreignField: 'user',
        as: 'likes',
        pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
      },
    },
    {
      $lookup: {
        from: 'votes',
        localField: '_id',
        foreignField: 'user',
        as: 'votes',
        pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
      },
    },
    {
      $lookup: {
        from: 'inscriptions',
        localField: '_id',
        foreignField: 'driver',
        as: 'inscriptions',
        pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
      },
    },
    { $unwind: { path: '$cars', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$likes', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$votes', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$inscriptions', preserveNullAndEmptyArrays: true } },
    { $sort: sort },
    { $skip: skip },
    { $limit: pageSize },
    {
      $project: {
        cars: 1,
        likes: 1,
        inscriptions: 1,
        votes: 1,
        _id: 1,
        name: 1,
        country: 1,
        email: 1,
        role: 1,
        fcm: 1,
        googleId: 1,
        created: 1,
        updated: 1,
      },
    },
  ];
};

export const userSearchAggregate = (data: SearchDto): any => [
  {
    $lookup: {
      from: 'cars',
      localField: '_id',
      foreignField: 'driver',
      as: 'cars',
      pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
    },
  },
  {
    $lookup: {
      from: 'likes',
      localField: '_id',
      foreignField: 'user',
      as: 'likes',
      pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
    },
  },
  {
    $lookup: {
      from: 'votes',
      localField: '_id',
      foreignField: 'user',
      as: 'votes',
      pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
    },
  },
  {
    $lookup: {
      from: 'inscriptions',
      localField: '_id',
      foreignField: 'driver',
      as: 'inscriptions',
      pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
    },
  },
  { $unwind: { path: '$cars', preserveNullAndEmptyArrays: true } },
  { $unwind: { path: '$likes', preserveNullAndEmptyArrays: true } },
  { $unwind: { path: '$votes', preserveNullAndEmptyArrays: true } },
  { $unwind: { path: '$inscriptions', preserveNullAndEmptyArrays: true } },
  {
    $match: {
      $or: [
        { name: { $regex: `^${data.value}$`, $options: 'i' } },
        { email: { $regex: `^${data.value}$`, $options: 'i' } },
        { country: { $regex: `^${data.value}$`, $options: 'i' } },
        { role: { $regex: `^${data.value}$`, $options: 'i' } },
      ],
    },
  },
];
