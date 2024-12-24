const hasRequiredRole = (userRoles: any, requiredRole: any) => {
  return userRoles.includes(requiredRole);
};

export default hasRequiredRole;
