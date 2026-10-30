const userTypeLabels = {
  "00": "Super Admin",
  "11": "Admin",
};

const userTypeValues = Object.fromEntries(
  Object.entries(userTypeLabels).map(([value, label]) => [
    label.toLowerCase(),
    value,
  ]),
);

export function getUserTypeLabel(value) {
  const normalized = String(value ?? "");
  return userTypeLabels[normalized] || normalized;
}

export function getUserTypeValue(value) {
  const normalized = String(value ?? "").trim();
  return userTypeValues[normalized.toLowerCase()] || normalized;
}

export function hasAdminAccess(userOrType) {
  const typeToCheck =
    typeof userOrType === "object" && userOrType !== null
      ? userOrType.user_type ??
        userOrType.role?.user_type ??
        userOrType.role?.name ??
        userOrType.role
      : userOrType;

  if (typeToCheck === null || typeToCheck === undefined) return false;

  const normalized = String(typeToCheck)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  return [
    "00",
    "11",
    "admin",
    "administrator",
    "super_admin",
    "superadmin",
    "super_administrator",
  ].includes(normalized);
}

export function hasSuperAdminAccess(user) {
  if (user === null || user === undefined) return false;

  const typeToCheck =
    typeof user === "object"
      ? user.user_type ??
        user.role?.user_type ??
        user.role?.name ??
        user.role
      : user;
  const normalized = String(typeToCheck ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  return [
    "00",
    "super_admin",
    "superadmin",
    "super_administrator",
  ].includes(normalized);
}

export function hasViewOnlyAccess(user) {
  if (user === null || user === undefined) return false;

  const typeToCheck =
    typeof user === "object"
      ? user.user_type ??
        user.role?.user_type ??
        user.role?.name ??
        user.role
      : user;
  const normalized = String(typeToCheck ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  return ["11", "admin", "administrator"].includes(normalized);
}
