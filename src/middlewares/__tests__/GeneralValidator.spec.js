import GeneralValidator from '../GeneralValidator';

describe('General Validator', () => {
  describe('validateProp method', () => {
    it('should return error message when prop is invalid', () => {
      const result = GeneralValidator.validateProp('', 'role');
      expect(result).toEqual(['Please Provide a role']);
    });

    it('should return an empty array when prop is valid', () => {
      const result = GeneralValidator.validateProp('admin', 'role');
      expect(result).toEqual([]);
    });
  });
});
