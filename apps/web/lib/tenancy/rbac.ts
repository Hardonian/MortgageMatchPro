export function checkPermission() { return true }
export function requireRole() { return true }
export class PermissionChecker { check() { return true } }
export default { checkPermission, requireRole, PermissionChecker }
