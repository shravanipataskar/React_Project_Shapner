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
  const userType =
    typeof userOrType === "object" && userOrType !== null
      ? userOrType.user_type
      : userOrType;
  const normalized = String(userType ?? "").trim();

  return normalized === "00" || normalized === "11";
}

export function hasSuperAdminAccess(user) {
  const userType =
    typeof user === "object" && user !== null ? user.user_type : user;

  return String(userType ?? "").trim() === "00";
}

export function hasViewOnlyAccess(user) {
  const userType =
    typeof user === "object" && user !== null ? user.user_type : user;

  return String(userType ?? "").trim() === "11";
}
