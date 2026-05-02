(function () {
  function icon(type) {
    const icons = {
      success: "check-circle",
      error: "circle-alert",
      warning: "triangle-alert",
      info: "info"
    };
    return icons[type] || icons.info;
  }

  function ensureContainer() {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }
    return container;
  }

  function show(message, options = {}) {
    const type = options.type || "info";
    const title = options.title || {
      success: "Başarılı",
      error: "İşlem tamamlanamadı",
      warning: "Dikkat",
      info: "Bilgi"
    }[type];

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i data-lucide="${icon(type)}" class="w-5 h-5"></i>
      <div><strong>${title}</strong><p>${message}</p></div>
      <button class="toast-close" type="button" aria-label="Kapat"><i data-lucide="x" class="w-4 h-4"></i></button>
    `;
    toast.querySelector(".toast-close").addEventListener("click", () => toast.remove());
    ensureContainer().appendChild(toast);
    if (window.lucide) window.lucide.createIcons();
    window.setTimeout(() => toast.remove(), options.duration || 4200);
  }

  window.Toast = { show };
})();
