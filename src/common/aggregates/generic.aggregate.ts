export const lookupBrand = (image = true) => {
  const imageLookup: any = [
    {
      $lookup: {
        from: 'images',
        localField: '_id',
        foreignField: 'brand',
        as: 'image',
        pipeline: [{ $project: { url: '$url', _id: 0 } }],
      },
    },
    { $unwind: '$image' },
    { $project: { name: 1, image: 1, _id: 1 } },
  ];
  const item: any = {
    $lookup: {
      from: 'brands',
      localField: 'brand',
      foreignField: '_id',
      as: 'brand',
      pipeline: image ? imageLookup : [],
    },
  };
  return item;
};

export const lookupCar = () => {
  return {
    $lookup: {
      from: 'cars',
      localField: 'car',
      foreignField: '_id',
      as: 'car',
      pipeline: [
        lookupBrand(),
        lookupImages('car'),
        lookupDriver(),
        { $unwind: '$driver' },
        { $unwind: '$brand' },
        { $project: { driver: 1, images: 1, model: 1, brand: 1, _id: 1 } },
      ],
    },
  };
};

export const lookupDriver = (field = 'driver') => {
  return {
    $lookup: {
      from: 'users',
      localField: field,
      foreignField: '_id',
      as: field,
      pipeline: [{ $project: { name: 1, country: 1 } }],
    },
  };
};

export const lookupImage = (
  type: 'car' | 'car1' | 'car2' | 'tournament' | 'brand'
) => {
  return {
    $lookup: {
      from: 'images',
      localField: '_id',
      foreignField: type,
      as: 'image',
      pipeline: [{ $project: { url: 1, firstImage: 1, position: 1, _id: 0 } }],
    },
  };
};

export const lookupImages = (
  type: 'car' | 'car1' | 'car2' | 'tournament' | 'brand' | 'winner'
) => {
  return {
    $lookup: {
      from: 'images',
      localField: '_id',
      foreignField: type,
      as: 'images',
      pipeline: [{ $project: { url: 1, firstImage: 1, position: 1, _id: 0 } }],
    },
  };
};

export const lookupCarsCount = () => {
  return {
    $lookup: {
      from: 'cars',
      localField: '_id',
      foreignField: 'driver',
      as: 'cars',
      pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
    },
  };
};

export const lookupInscriptionsCount = (type: 'car' | 'tournament' | 'driver') => {
  return {
    $lookup: {
      from: 'inscriptions',
      localField: '_id',
      foreignField: type,
      as: 'inscriptions',
      pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
    },
  };
};

export const lookupLikesCount = (type: 'car' | 'user') => {
  return {
    $lookup: {
      from: 'likes',
      localField: '_id',
      foreignField: type,
      as: 'likes',
      pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
    },
  };
};

export const lookupVotesCount = (type: 'car' | 'tournament' | 'user') => {
  return {
    $lookup: {
      from: 'votes',
      localField: '_id',
      foreignField: type,
      as: 'votes',
      pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
    },
  };
};
