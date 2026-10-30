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

export function hasAdminAccess(role) {
  const normalized = String(role ?? "")
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

export function hasSuperAdminAccess(role) {
  const normalized = String(role ?? "")
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
