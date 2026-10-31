let requiredAlertShown = false;

function requiredFieldMessage(field) {
  const fieldName = getFieldName(field);

  if (field.type === "file") {
    return `Please select a file for ${fieldName}.`;
  }

  if (field instanceof HTMLSelectElement) {
    return `Please select ${fieldName}.`;
  }

  if (
    field instanceof HTMLInputElement &&
    ["radio", "checkbox"].includes(field.type)
  ) {
    return `Please select ${fieldName}.`;
  }

  return `Please fill in the ${fieldName} field.`;
}

function getFieldName(field) {
  if (field instanceof HTMLInputElement && field.type === "radio") {
    const groupLabel =
      field.closest("fieldset")?.querySelector("legend")?.textContent ||
      field.closest("section")?.querySelector("h1, h2, h3")?.textContent;
    if (groupLabel?.trim()) {
      return cleanLabel(groupLabel);
    }
  }

  const label =
    field.labels?.[0]?.textContent ||
    field.getAttribute("aria-label") ||
    field
      .getAttribute("aria-labelledby")
      ?.split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent || "")
      .join(" ");

  if (label?.trim()) {
    return cleanLabel(label);
  }

  const fallbackName = field.name || field.id || "this field";
  return cleanLabel(fallbackName.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " "));
}

function cleanLabel(value) {
  return value
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[:.]+$/, "");
}

function getFieldIdentifier(field) {
  return [
    field.name,
    field.id,
    field.getAttribute("aria-label"),
    field.labels?.[0]?.textContent,
    field.placeholder,
  ]
    .filter(Boolean)
    .join(" ");
}

function isPhoneField(field) {
  return (
    field instanceof HTMLInputElement &&
    (field.type === "tel" ||
      /phone|mobile|whatsapp|telephone|emergency.?contact|contact.?number/i.test(
        getFieldIdentifier(field),
      ))
  );
}

function isEmailField(field) {
  return (
    field instanceof HTMLInputElement &&
    (field.type === "email" ||
      /\be-?mail\b/i.test(getFieldIdentifier(field)))
  );
}

function invalidFormatMessage(field) {
  const fieldName = getFieldName(field);

  if (isPhoneField(field)) {
    return `Please enter up to 10 digits for ${fieldName}.`;
  }

  return `Please enter a valid email address for ${fieldName}.`;
}

function hasInvalidFormat(field) {
  if (isPhoneField(field)) {
    return field.value !== "" && !/^\d{1,10}$/.test(field.value);
  }

  if (isEmailField(field)) {
    return (
      field.value.trim() !== "" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())
    );
  }

  return false;
}

function isRequiredValueMissing(field) {
  if (!field.required) {
    return false;
  }

  if (
    field instanceof HTMLInputElement &&
    ["text", "search", "url", "tel", "email", "password"].includes(field.type)
  ) {
    return field.value.trim() === "";
  }

  return field.validity.valueMissing;
}

function clearValidationMessage(field) {
  if (field.dataset.requiredValidationMessage === "true") {
    field.setCustomValidity("");
    delete field.dataset.requiredValidationMessage;
  }
}

function clearFormValidationMessages(form) {
  for (const field of form.elements) {
    clearValidationMessage(field);
  }
}

function handleInvalid(event) {
  const field = event.target;
  const isMissing = field.validity?.valueMissing || isRequiredValueMissing(field);
  const hasInvalidValueFormat = hasInvalidFormat(field);

  if (isMissing || hasInvalidValueFormat) {
    const message = isMissing
      ? requiredFieldMessage(field)
      : invalidFormatMessage(field);
    field.setCustomValidity(message);
    field.dataset.requiredValidationMessage = "true";

    event.preventDefault();

    if (!requiredAlertShown) {
      requiredAlertShown = true;
      window.alert(message);
      field.focus();
      window.setTimeout(() => {
        requiredAlertShown = false;
      }, 0);
    }
  }
}

function handleSubmit(event) {
  const form = event.target;
  clearFormValidationMessages(form);

  const firstInvalidField = Array.from(form.elements).find(
    (field) =>
      field.willValidate &&
      (isRequiredValueMissing(field) ||
        hasInvalidFormat(field) ||
        !field.validity.valid),
  );

  if (!firstInvalidField) {
    return;
  }

  event.preventDefault();
  event.stopImmediatePropagation();

  if (isRequiredValueMissing(firstInvalidField)) {
    firstInvalidField.setCustomValidity(requiredFieldMessage(firstInvalidField));
    firstInvalidField.dataset.requiredValidationMessage = "true";
  } else if (hasInvalidFormat(firstInvalidField)) {
    firstInvalidField.setCustomValidity(
      invalidFormatMessage(firstInvalidField),
    );
    firstInvalidField.dataset.requiredValidationMessage = "true";
  }

  firstInvalidField.focus();
  window.alert(firstInvalidField.validationMessage);
}

function configurePhoneField(field) {
  if (!isPhoneField(field)) {
    return;
  }

  field.maxLength = 10;
  field.inputMode = "numeric";
  field.pattern = "\\d{0,10}";
}

function normalizePhoneValue(field) {
  if (!isPhoneField(field)) {
    return;
  }

  const selectionStart = field.selectionStart;
  const normalizedValue = field.value.replace(/\D/g, "").slice(0, 10);
  if (field.value === normalizedValue) {
    return;
  }

  const normalizedBeforeCursor = field.value
    .slice(0, selectionStart ?? field.value.length)
    .replace(/\D/g, "")
    .slice(0, 10);

  field.value = normalizedValue;
  if (selectionStart !== null) {
    field.setSelectionRange(
      normalizedBeforeCursor.length,
      normalizedBeforeCursor.length,
    );
  }
}

function handleBeforeInput(event) {
  const field = event.target;
  if (!isPhoneField(field) || event.inputType.startsWith("delete")) {
    return;
  }

  configurePhoneField(field);

  const insertedText =
    event.data ?? event.dataTransfer?.getData("text/plain") ?? null;
  if (insertedText === null) {
    return;
  }

  const selectionStart = field.selectionStart ?? field.value.length;
  const selectionEnd = field.selectionEnd ?? field.value.length;
  const nextValue =
    field.value.slice(0, selectionStart) +
    insertedText +
    field.value.slice(selectionEnd);

  if (!/^\d{0,10}$/.test(nextValue)) {
    event.preventDefault();
  }
}

function handleFocus(event) {
  configurePhoneField(event.target);
}

function handleInput(event) {
  const field = event.target;
  normalizePhoneValue(field);
  clearValidationMessage(field);
  configurePhoneField(field);

  if (field instanceof HTMLInputElement && field.type === "radio" && field.name) {
    for (const radio of field.form?.elements ?? []) {
      if (radio.type === "radio" && radio.name === field.name) {
        clearValidationMessage(radio);
      }
    }
  }
}

function handleReset(event) {
  clearFormValidationMessages(event.target);
}

export function installRequiredFormValidation() {
  document.addEventListener("invalid", handleInvalid, true);
  document.addEventListener("submit", handleSubmit, true);
  document.addEventListener("beforeinput", handleBeforeInput, true);
  document.addEventListener("focusin", handleFocus, true);
  document.addEventListener("input", handleInput, true);
  document.addEventListener("change", handleInput, true);
  document.addEventListener("reset", handleReset, true);

  return () => {
    document.removeEventListener("invalid", handleInvalid, true);
    document.removeEventListener("submit", handleSubmit, true);
    document.removeEventListener("beforeinput", handleBeforeInput, true);
    document.removeEventListener("focusin", handleFocus, true);
    document.removeEventListener("input", handleInput, true);
    document.removeEventListener("change", handleInput, true);
    document.removeEventListener("reset", handleReset, true);
  };
}
