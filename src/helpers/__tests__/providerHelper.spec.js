import ProviderHelper from '../providerHelper';
import { returnedObj, enteredProvider } from '../__mocks__/providersMock';

describe('Providers Helper', () => {
  it('return paginated provider data', () => {
    const result = ProviderHelper.paginateData(1, 1, 3, 100, enteredProvider, 'providers');
    expect(result).toEqual(returnedObj);
  });
});
