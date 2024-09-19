const hasRequiredRole = (userRoles: any, requiredRole: any) => {
  console.log('userRoles', userRoles);
  console.log('requiredRole', requiredRole);
  return userRoles.includes(requiredRole);
};

export default hasRequiredRole;
