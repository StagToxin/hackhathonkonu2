(function () {
  const messages = {
    required: "Bu alan zorunludur.",
    email: "Geçerli bir e-posta adresi girin.",
    password: "Şifre en az 6 karakter olmalıdır.",
    taxNo: "Vergi numarası 10 hane olmalıdır.",
    phone: "Geçerli bir telefon numarası girin.",
    match: "Alanlar birbiriyle eşleşmiyor.",
    registry: "Ticaret sicil no yalnızca rakam ve tire içerebilir.",
    money: "Negatif olmayan sayısal bir tutar girin.",
    dateAfter: "Bitiş tarihi başlangıç tarihinden sonra olmalıdır."
  };

  const validators = {
    required(value) {
      return String(value || "").trim().length > 0;
    },
    email(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
    },
    password(value) {
      return String(value || "").length >= 6;
    },
    taxNo(value) {
      return /^\d{10}$/.test(String(value || "").trim());
    },
    phone(value) {
      return /^[+()\d\s-]{10,18}$/.test(String(value || "").trim());
    },
    registry(value) {
      return !value || /^[\d-]+$/.test(String(value || "").trim());
    },
    money(value) {
      return value === "" || (!Number.isNaN(Number(value)) && Number(value) >= 0);
    }
  };

  function setError(input, message) {
    const wrap = input.closest("[data-field]") || input.parentElement;
    let error = wrap.querySelector(".field-error");
    if (!error) {
      error = document.createElement("p");
      error.className = "field-error";
      wrap.appendChild(error);
    }
    input.setAttribute("aria-invalid", message ? "true" : "false");
    error.textContent = message || "";
  }

  function validateInput(input) {
    const rules = (input.dataset.validate || "").split("|").filter(Boolean);
    const value = input.value;
    for (const rule of rules) {
      if (rule.startsWith("match:")) {
        const target = document.querySelector(rule.split(":")[1]);
        if (target && target.value !== value) {
          setError(input, messages.match);
          return false;
        }
        continue;
      }
      if (rule.startsWith("dateAfter:")) {
        const target = document.querySelector(rule.split(":")[1]);
        if (target && target.value && value && new Date(value) <= new Date(target.value)) {
          setError(input, messages.dateAfter);
          return false;
        }
        continue;
      }
      if (validators[rule] && !validators[rule](value)) {
        setError(input, messages[rule]);
        return false;
      }
    }
    setError(input, "");
    return true;
  }

  function validateForm(form) {
    const node = typeof form === "string" ? document.querySelector(form) : form;
    if (!node) return true;
    const inputs = Array.from(node.querySelectorAll("[data-validate]"));
    const valid = inputs.map(validateInput).every(Boolean) && validateContractDates(node);
    if (!valid) {
      const first = node.querySelector('[aria-invalid="true"]');
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      first?.focus();
    }
    return valid;
  }

  function validateContractDates(form) {
    const start = form.querySelector('[name="contractStart"]')?.value;
    const endInput = form.querySelector('[name="contractEnd"]');
    const end = endInput?.value;
    if (!start || !end || !endInput) return true;
    if (new Date(end) <= new Date(start)) {
      setError(endInput, messages.dateAfter);
      return false;
    }
    setError(endInput, "");
    return true;
  }

  function bind(form) {
    const node = typeof form === "string" ? document.querySelector(form) : form;
    if (!node) return;
    node.querySelectorAll("[data-validate]").forEach((input) => {
      input.addEventListener("blur", () => validateInput(input));
      input.addEventListener("input", () => {
        if (input.getAttribute("aria-invalid") === "true") validateInput(input);
      });
    });
  }

  window.Validation = { bind, validateForm, validateInput, validateContractDates, validators };
})();
