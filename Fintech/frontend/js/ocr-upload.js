(function () {
  function markAi(input) {
    const field = input.closest("[data-field]");
    if (!field || field.querySelector(".ai-mark")) return;
    const label = field.querySelector(".field-label");
    if (label) {
      const mark = document.createElement("span");
      mark.className = "ai-mark ml-2";
      mark.title = "AI ile dolduruldu, kontrol edin";
      mark.textContent = "AI";
      label.appendChild(mark);
    }
  }

  function fillForm(form, fields) {
    let count = 0;
    Object.entries(fields || {}).forEach(([key, value]) => {
      const input = form.elements[key];
      if (!input) return;
      input.value = value;
      markAi(input);
      count += 1;
    });
    return count;
  }

  function setup(options) {
    const zone = document.querySelector(options.zone);
    const input = document.querySelector(options.input);
    const form = document.querySelector(options.form);
    const status = document.querySelector(options.status);
    if (!zone || !input || !form) return;

    async function process(file) {
      if (!file) return;
      status?.classList.remove("hidden");
      try {
        const result = await window.Api.parseOcr(file);
        const count = fillForm(form, result.fields);
        window.Toast.show(`${count} alan AI ile dolduruldu. Lütfen kontrol edin.`, { type: "success" });
      } catch (error) {
        window.Toast.show("Belge analiz edilemedi. Manuel giriş yapabilirsiniz.", { type: "error" });
      } finally {
        status?.classList.add("hidden");
      }
    }

    zone.addEventListener("click", () => input.click());
    zone.addEventListener("dragover", (event) => {
      event.preventDefault();
      zone.classList.add("is-dragover");
    });
    zone.addEventListener("dragleave", () => zone.classList.remove("is-dragover"));
    zone.addEventListener("drop", (event) => {
      event.preventDefault();
      zone.classList.remove("is-dragover");
      process(event.dataTransfer.files[0]);
    });
    input.addEventListener("change", () => process(input.files[0]));
  }

  window.OcrUpload = { setup };
})();
