/**
 * Test suite for SculptureService
 * Created by: Long Hung Nguyen (longhungn)
 */
import { SculptureService } from './sculpture.service';
import { MockEntityManager } from '../../../test-util/MockEntityManger';
import { DtoCreateSculpture } from '../interface/create-sculpture.dto';
import { Sculpture } from '../entity/sculpture.entity';
import { TestingModule, Test } from '@nestjs/testing';
import { EntityManager } from 'typeorm';
import { UniqueConstraintError } from '../error/unique-constraint.error';
import { EntityDoesNotExistError } from '../error/entity-not-exist.error';
import { SculptureImageService } from './image.service';
import * as faker from 'faker';

let getRandomSculptureDto = () => {
  const dto: DtoCreateSculpture = {
    accessionId: '2017.08',
    creditLine: 'Gifted to UOW',
    currentLocation: 'Building 12',
    latitude: 34.115,
    longitude: 134.55,
    locationNotes: 'Behind the door',
    material: 'steel',
    name: 'Test sculpture',
    productionDate: '1998',
    primaryMakerId: 'b1462cd0-a9e8-4fe8-a880-8fdf92e02817',
  };
  return dto;
};

let dtoToSculpture = (dto: DtoCreateSculpture) => {
  let sculpture = Object.assign(new Sculpture(), dto);
  sculpture.images = [];
  return sculpture;
};

describe('SculptureService', () => {
  let service: SculptureService;
  let mockEntityManager: MockEntityManager;
  let mockImageService: SculptureImageService;

  beforeEach(async () => {
    mockEntityManager = new MockEntityManager();

    mockImageService = new SculptureImageService(null, {
      setBucketName: jest.fn(),
    } as any);
    mockImageService.deletePicture = jest.fn();
    mockImageService.insertPicture = jest.fn();

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        SculptureService,
        {
          provide: EntityManager,
          useValue: mockEntityManager,
        },
        {
          provide: SculptureImageService,
          useValue: mockImageService,
        },
      ],
    }).compile();

    service = await app.get(SculptureService);
  });

  describe('createSculpture', () => {
    let dto: DtoCreateSculpture;
    let sculpture: Sculpture;
    beforeEach(() => {
      dto = getRandomSculptureDto();
      sculpture = dtoToSculpture(dto);
    });

    it('creates a sculpture and add it to the database', async () => {
      //no sculpture with specified accessionId exists
      service.getSculptureById = jest.fn().mockResolvedValue(null);
      mockEntityManager.create.mockReturnValue(sculpture);
      mockEntityManager.save.mockImplementation(it => it);

      const res = await service.createSculpture(dto);

      expect(mockEntityManager.save).toBeCalledWith(sculpture);
      expect(res).toEqual(sculpture);
    });

    it('throw error when accessionId already exist', async () => {
      service.getSculptureById = jest.fn().mockResolvedValue(sculpture);

      await expect(service.createSculpture(dto)).rejects.toThrow(
        UniqueConstraintError
      );
    });
  });

  describe('updateSculpture', () => {
    it('updates the sculpture data', async () => {
      let dto = getRandomSculptureDto();
      let sculpture = dtoToSculpture(dto);

      mockEntityManager.preload.mockResolvedValue(sculpture);
      mockEntityManager.save.mockImplementation(it => it);

      const res = await service.updateSculpture(dto);

      expect(mockEntityManager.save).toBeCalledWith(sculpture);
      expect(res).toBe(sculpture);
    });

    it("throw error if sculpture doesn't exist", async () => {
      let dto = getRandomSculptureDto();
      let sculpture = dtoToSculpture(dto);

      mockEntityManager.preload.mockResolvedValue(sculpture);
      mockEntityManager.save.mockImplementation(it => it);

      const res = await service.updateSculpture(dto);

      expect(mockEntityManager.save).toBeCalledWith(sculpture);
      expect(res).toBe(sculpture);
    });
  });

  describe('deleteSculpture', () => {
    it('remove the sculpture if exist', async () => {
      let dto = getRandomSculptureDto();
      let sculpture = dtoToSculpture(dto);

      mockEntityManager.findOne.mockResolvedValue(sculpture);

      await service.deleteSculpture(sculpture.accessionId);

      expect(mockEntityManager.remove).toBeCalledWith(sculpture);
    });

    it('remove the images before deleting sculpture', async () => {
      let dto = getRandomSculptureDto();
      let sculpture = dtoToSculpture(dto);
      sculpture.images = [
        {
          created: new Date(),
          id: faker.random.uuid(),
          url: 'https://test-buck.amazonaws.com/2019.01/pic.png',
          s3bucket: 'test-buck',
          s3key: '2019.01/pic.png',
          sculpture: sculpture,
          sculptureId: sculpture.accessionId,
        },
        {
          created: new Date(),
          id: faker.random.uuid(),
          url: 'https://test-buck.amazonaws.com/2019.01/pic2.png',
          s3bucket: 'test-buck',
          s3key: '2019.01/pic2.png',
          sculpture: sculpture,
          sculptureId: sculpture.accessionId,
        },
      ];

      mockEntityManager.findOne.mockResolvedValue(sculpture);

      await service.deleteSculpture(sculpture.accessionId);

      expect(mockImageService.deletePicture).toBeCalledTimes(2);
      expect(mockImageService.deletePicture).toHaveBeenNthCalledWith(
        1,
        sculpture.images[0].id
      );
      expect(mockImageService.deletePicture).toHaveBeenNthCalledWith(
        2,
        sculpture.images[1].id
      );

      expect(mockEntityManager.remove).toBeCalledWith(sculpture);
    });

    it('throws an error when there is no such sculpture', async () => {
      let dto = getRandomSculptureDto();
      let sculpture = dtoToSculpture(dto);

      mockEntityManager.findOne.mockResolvedValue(null);

      await expect(
        service.deleteSculpture(sculpture.accessionId)
      ).rejects.toThrow(EntityDoesNotExistError);
    });
  });
});
