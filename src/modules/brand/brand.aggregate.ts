import { lookupImage } from '../../common/aggregates/generic.aggregate';
import { BrandGetAllBrandsAndCarsDto } from './brand.dto';

export const getAllBrandsAndCarsAggregate = (
  sort: any,
  skip: number,
  pageSize: number,
  body: BrandGetAllBrandsAndCarsDto
) => {
  const lookupCarsOnlyImages: any = {
    $lookup: {
      from: 'cars',
      localField: '_id',
      foreignField: 'brand',
      as: 'cars',
      pipeline: [
        {
          $lookup: {
            from: 'images',
            localField: '_id',
            foreignField: 'car',
            as: 'image',
            pipeline: [{ $project: { url: '$url', _id: 0 } }],
          },
        },
        { $unwind: '$image' },
        { $count: 'count' },
        { $project: { count: 1, _id: 0 } },
      ],
    },
  };
  const lookupCars: any = {
    $lookup: {
      from: 'cars',
      localField: '_id',
      foreignField: 'brand',
      as: 'cars',
      pipeline: [{ $count: 'count' }, { $project: { count: 1, _id: 0 } }],
    },
  };
  const aggregate = [
    lookupImage('brand'),
    { $unwind: '$image' },
    { $unwind: { path: '$cars', preserveNullAndEmptyArrays: true } },
    { $match: { cars: { $exists: true } } },
    { $sort: sort },
    { $skip: skip },
    { $limit: pageSize },
    { $project: { name: 1, image: 1, cars: 1, _id: 1 } },
  ];
  if (body.onlyWithPhoto && body.onlyWithPhoto === true) {
    aggregate.unshift({ $match: { cars: { $exists: true } } });
    aggregate.unshift(lookupCarsOnlyImages);
  } else {
    aggregate.unshift(lookupCars);
  }
  return aggregate;
};
