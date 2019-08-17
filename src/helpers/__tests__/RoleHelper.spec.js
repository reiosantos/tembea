import RolesHelper from '../RolesHelper';

describe('RoleHelper', () => {
  it('should return roles and locations object', () => {
    const roles = [{ Homebase: { id: 1, name: 'Kampala' }, Role: { name: 'Admin' } },
      { Homebase: { id: 2, name: 'Kampala' }, Role: { name: 'Super Admin' } }];
    const result = RolesHelper.mapLocationsAndRoles(roles);
    expect(result).toEqual({
      locations:
        [{ id: 1, name: 'Kampala', role: 'Admin' },
          { id: 2, name: 'Kampala', role: 'Super Admin' }],
      RoleBasedAccessControl: { SuperAdmin: [2], Admin: [1] }
    });
  });
});
