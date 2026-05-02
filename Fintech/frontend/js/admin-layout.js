(function () {
  const links = [
    ["dashboard.html", "layout-dashboard", "Dashboard", "", "dashboard"],
    ["companies.html", "building-2", "Tümü", "Firmalar", "companies"],
    ["pending-companies.html", "user-check", "Onay Bekleyenler", "", ""],
    ["groups.html", "network", "Gruplar", "", ""],
    ["financial-report.html", "chart-no-axes-combined", "Finansal Rapor", "Finansal Yönetim", "financialReport"],
    ["financial-status.html", "activity", "Finansal Durum", "", "financialStatus"],
    ["investment.html", "landmark", "Yatırım", "", "investment"],
    ["presentation.html", "presentation", "On Sunum", "", "presentation"],
    ["our-companies.html", "briefcase-business", "Firmalarımız", "Mali Yapımız", ""],
    ["contracts.html", "file-signature", "Sözleşmeler", "", ""],
    ["subscriptions.html", "receipt", "Abonelik", "", ""],
    ["financial-process.html", "workflow", "Finansal Süreç", "", ""],
    ["premium-requests.html", "gem", "Premium Talepler", "", "premium"],
    ["logs.html", "scroll-text", "Loglar", "", ""],
    ["settings.html", "settings", "Ayarlar", "", "settings"]
  ];

  function loadBonusScript(name, callback) {
    if (window[name]) {
      callback?.();
      return;
    }
    const script = document.createElement("script");
    script.src = `../js/${name === "Notifications" ? "notifications" : name === "I18n" ? "i18n" : "export"}.js`;
    script.onload = () => callback?.();
    document.body.appendChild(script);
  }

  function sidebar(active) {
    return `
      <aside class="admin-sidebar">
        <a class="admin-logo" href="dashboard.html"><img src="../assets/logo-full.png" alt="Pro Sicht"></a>
        <nav class="admin-nav" aria-label="Admin menü">
          ${links.map(([href, icon, label, group, key]) => `${group ? `<p class="nav-group-title">${group}</p>` : ""}<a data-nav href="${href}" class="${href === active ? "is-active" : ""}"><i data-lucide="${icon}"></i><span ${key ? `data-i18n="${key}"` : ""}>${label}</span>${href === "premium-requests.html" ? '<span class="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-black text-white" data-premium-badge>0</span>' : ""}</a>`).join("")}
        </nav>
        <div class="admin-footer flex items-center justify-between gap-3">
          <div class="user-meta min-w-0"><p class="truncate text-sm font-black" data-current-user>Admin</p><p class="text-xs text-white/55">Yönetici</p></div>
          <button class="btn btn-ghost icon-btn text-white" data-logout title="Çıkış"><i data-lucide="log-out"></i></button>
        </div>
      </aside>`;
  }

  function headerTools(config) {
    return `
      ${config.actions || ""}
      <div class="relative">
        <button class="btn btn-secondary icon-btn relative" data-notification-button title="Bildirimler">
          <i data-lucide="bell"></i>
          <span class="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs font-black text-white" data-notification-count>0</span>
        </button>
      </div>
      <button class="btn btn-secondary" data-lang-button type="button"><span data-lang-toggle>TR</span></button>
      <button class="btn btn-secondary icon-btn" data-theme-toggle title="Tema"><i data-lucide="moon"></i></button>`;
  }

  function render(config) {
    const root = document.querySelector(config.root || "#adminPage");
    if (!root) return;
    root.innerHTML = `
      <div class="admin-shell">
        ${sidebar(config.active)}
        <div class="admin-main">
          <header class="admin-header">
            <div>
              <h1 class="text-2xl font-black text-text-dark">${config.title}</h1>
              <p class="text-sm font-medium text-text-secondary">${config.subtitle || ""}</p>
            </div>
            <div class="flex flex-wrap items-center justify-end gap-2">${headerTools(config)}</div>
          </header>
          <main class="admin-content">${config.content || ""}</main>
        </div>
      </div>`;
    const pendingPremium = (window.MockData?.premiumRequests || []).filter((item) => item.status === "Bekliyor").length;
    document.querySelectorAll("[data-premium-badge]").forEach((node) => {
      node.textContent = pendingPremium;
      node.classList.toggle("hidden", pendingPremium === 0);
    });
    document.querySelector("[data-lang-button]")?.addEventListener("click", () => window.I18n?.toggle());
    window.Auth?.bindCommon();
    loadBonusScript("Notifications", () => window.Notifications?.init());
    loadBonusScript("I18n", () => window.I18n?.apply());
    loadBonusScript("Export", () => window.Export?.enhanceTables());
    if (window.lucide) window.lucide.createIcons();
  }

  window.AdminLayout = { render };
})();
