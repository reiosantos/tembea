export default class RolesHelper {
  /**
   * @description maps and returns locations and RoleBasedAccessControl
   * @param  {array} roles array of user roles
   * @param  {number} id The id of the country
   * @return {object} object the contains locations a user has roles
   * and Role based access control for the locations
   *
   */
  static mapLocationsAndRoles(roles) {
    const locations = [];
    const RoleBasedAccessControl = {
      SuperAdmin: [],
      Admin: []
    };
    roles.map((role) => {
      const locationObject = {};
      locationObject.id = role.Homebase.id;
      locationObject.name = role.Homebase.name;
      locationObject.role = role.Role.name;
      locations.push(locationObject);
      if (role.Role.name === 'Admin') {
        return RoleBasedAccessControl.Admin.push(role.Homebase.id);
      }
      return RoleBasedAccessControl.SuperAdmin.push(role.Homebase.id);
    });
    return { locations, RoleBasedAccessControl };
  }
}
