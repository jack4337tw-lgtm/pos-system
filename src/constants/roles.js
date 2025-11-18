// src/constants/roles.js
const ROLES = {
  ADMIN: "系統管理員",
  BOSS: "BOSS",
  MANAGER: "店長",
  STAFF: "員工"
};

export const ROLE_OPTIONS = [
  { code: 'ADMIN', label: ROLES.ADMIN },
  { code: 'BOSS', label: ROLES.BOSS },
  { code: 'MANAGER', label: ROLES.MANAGER },
  { code: 'STAFF', label: ROLES.STAFF }
];

export default ROLES;