export const notificationGetAllAggregate = (
  sort: any,
  skip: any,
  pageSize: any
): any => {
  return [
    { $match: {} },
    { $sort: sort },
    { $skip: skip },
    { $limit: pageSize },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
        pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
      },
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
  ];
};
