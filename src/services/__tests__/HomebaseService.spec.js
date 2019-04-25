import HomebaseService from '../HomebaseService';
import models from '../../database/models';
import { mockCreatedHomebase, mockNewHomebase } from '../__mocks__';

const { Homebase } = models;

describe('test HomebaseService', () => {
  let createHomebaseSpy;
  beforeEach(() => {
    createHomebaseSpy = jest.spyOn(Homebase, 'findOrCreate');
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('creates a homebase successfully', async () => {
    createHomebaseSpy.mockResolvedValue([mockNewHomebase]);
    const result = await HomebaseService.createHomebase('Nairobi', 1);
    expect(createHomebaseSpy).toHaveBeenCalled();
    expect(result).toEqual(mockCreatedHomebase);
  });
});
