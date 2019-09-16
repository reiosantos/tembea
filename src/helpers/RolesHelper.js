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
    roles.map((roleObject) => {
      const locationObject = {};
      locationObject.id = roleObject.homebase.id;
      locationObject.name = roleObject.homebase.name;
      locationObject.role = roleObject.role.name;
      locations.push(locationObject);
      if (roleObject.role.name === 'Admin') {
        return RoleBasedAccessControl.Admin.push(roleObject.homebase.id);
      }
      return RoleBasedAccessControl.SuperAdmin.push(roleObject.homebase.id);
    });
    return { locations, RoleBasedAccessControl };
  }
}
