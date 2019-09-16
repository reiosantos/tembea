import RolesHelper from '../RolesHelper';

describe('RoleHelper', () => {
  it('should return roles and locations object', () => {
    const roles = [{ homebase: { id: 1, name: 'Kampala' }, role: { name: 'Admin' } },
      { homebase: { id: 2, name: 'Kampala' }, role: { name: 'Super Admin' } }];
    const result = RolesHelper.mapLocationsAndRoles(roles);
    expect(result).toEqual({
      locations:
        [{ id: 1, name: 'Kampala', role: 'Admin' },
          { id: 2, name: 'Kampala', role: 'Super Admin' }],
      RoleBasedAccessControl: { SuperAdmin: [2], Admin: [1] }
    });
  });
});
