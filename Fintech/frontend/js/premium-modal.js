(function () {
  const fallbackPackages = [
    { id: "basic-ai", name: "Temel Analiz", price: "₺499/ay", features: ["AI finansal analiz", "Markdown rapor", "Aylık yenileme"] },
    { id: "expert", name: "Uzman Görüşü", price: "₺999/ay", features: ["Uzman yorumlu rapor", "Risk önerileri", "Öncelikli inceleme"] },
    { id: "bundle", name: "Premium Bundle", price: "₺1.499/ay", features: ["AI Analiz", "Uzman Görüşü", "On Sunum", "Premium destek"], popular: true }
  ];

  function packages() {
    return window.MockData?.premiumPackages || fallbackPackages;
  }

  function ensureModal() {
    let modal = document.querySelector("#premiumModal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.id = "premiumModal";
    modal.className = "modal-backdrop";
    modal.innerHTML = `
      <section class="modal-panel max-w-5xl">
        <div class="premium-modal-header p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/18"><i data-lucide="gem" class="h-7 w-7"></i></div>
              <h2 class="mt-4 text-2xl font-black">Premium Özelliklere Erişin</h2>
              <p class="mt-2 max-w-2xl text-white/82">AI Analiz, Uzman Görüşü ve On Sunum çıktılarıyla finansal kararları daha hızlı alın.</p>
              <div class="mt-4 flex flex-wrap gap-2 text-sm font-black">
                <span class="rounded-full bg-white/16 px-3 py-1">142 firma kullanıyor</span>
                <span class="rounded-full bg-white/16 px-3 py-1">Bu ay %20 indirim</span>
              </div>
            </div>
            <button class="btn btn-ghost icon-btn text-white" data-premium-close aria-label="Kapat"><i data-lucide="x"></i></button>
          </div>
        </div>
        <div class="grid gap-5 p-5">
          <div id="premiumPackageGrid" class="grid gap-4 md:grid-cols-3"></div>
          <div class="table-wrap">
            <table class="comparison-table">
              <thead><tr><th>Özellik</th><th>Temel Analiz</th><th>Uzman Görüşü</th><th>Bundle</th></tr></thead>
              <tbody>
                <tr><td>AI Analiz</td><td>✓</td><td>✗</td><td>✓</td></tr>
                <tr><td>Uzman yorumlu rapor</td><td>✗</td><td>✓</td><td>✓</td></tr>
                <tr><td>On Sunum</td><td>✗</td><td>✗</td><td>✓</td></tr>
                <tr><td>Öncelikli destek</td><td>✗</td><td>✓</td><td>✓</td></tr>
              </tbody>
            </table>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-bg-main p-4">
            <p class="text-sm font-bold text-text-secondary">Sorularınız mı var? İletişime geçin: premium@prosicht.com</p>
            <button class="btn btn-primary" id="premiumRequestBtn"><i data-lucide="send" class="h-5 w-5"></i> Talep Gönder</button>
          </div>
        </div>
      </section>`;
    document.body.appendChild(modal);
    modal.querySelector("[data-premium-close]").addEventListener("click", close);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) close();
    });
    return modal;
  }

  function renderPackages(selectedId) {
    const grid = document.querySelector("#premiumPackageGrid");
    if (!grid) return;
    grid.innerHTML = packages().map((item) => `
      <button class="package-card user-card p-4 text-left ${item.popular ? "is-popular" : ""} ${item.id === selectedId ? "ring-2 ring-primary" : ""}" data-premium-package="${item.id}" type="button">
        ${item.popular ? '<span class="popular-ribbon">EN POPÜLER</span>' : ""}
        <h3 class="text-xl font-black text-text-dark">${item.name}</h3>
        <p class="mt-3 text-3xl font-black text-primary-dark">${item.price}</p>
        <ul class="mt-4 grid gap-2 text-sm font-bold text-text-secondary">${item.features.map((feature) => `<li>✓ ${feature}</li>`).join("")}</ul>
      </button>`).join("");
    grid.querySelectorAll("[data-premium-package]").forEach((button) => {
      button.addEventListener("click", () => renderPackages(button.dataset.premiumPackage));
    });
  }

  async function submitRequest(packageId) {
    const selected = packageId || document.querySelector("[data-premium-package].ring-2")?.dataset.premiumPackage || packages()[0].id;
    const button = document.querySelector("#premiumRequestBtn");
    if (button) {
      button.disabled = true;
      button.innerHTML = '<span class="spinner"></span> Talep gönderiliyor';
    }
    try {
      await window.Api.requestPremium({ packageId: selected, source: "modal" });
      window.Toast.show("Talebiniz alındı! Admin onayından sonra erişiminiz açılacak.", { type: "success", duration: 5200 });
      close();
    } catch (error) {
      window.Toast.show("Talep gönderilemedi. Lütfen tekrar deneyin.", { type: "error" });
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = '<i data-lucide="send" class="h-5 w-5"></i> Talep Gönder';
        if (window.lucide) window.lucide.createIcons();
      }
    }
  }

  function open(selector) {
    if (selector && selector.startsWith?.("#")) {
      document.querySelector(selector)?.classList.add("is-open");
      return;
    }
    const modal = ensureModal();
    const selectedPackage = typeof selector === "object" ? selector.packageId : selector;
    renderPackages(selectedPackage || "bundle");
    modal.querySelector("#premiumRequestBtn").onclick = () => submitRequest();
    modal.classList.add("is-open");
    if (window.lucide) window.lucide.createIcons();
  }

  function close(selector) {
    if (selector) document.querySelector(selector)?.classList.remove("is-open");
    else document.querySelector("#premiumModal")?.classList.remove("is-open");
  }

  window.PremiumModal = { open, close, submitRequest };
})();
