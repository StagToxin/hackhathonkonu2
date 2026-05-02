(function () {
  const links = [
    ["dashboard.html", "home", "Ana Sayfa", "home"],
    ["company-info.html", "building-2", "Firma Bilgilerim", "companies"],
    ["financial-report.html", "chart-line", "Finansal Raporum", "financialReport"],
    ["premium.html", "gem", "Premium", "premium"],
    ["notifications.html", "bell", "Bildirimler", "notifications"]
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

  function updateNotificationBadges() {
    const unread = (window.MockData?.notifications || []).filter((item) => !item.read).length;
    document.querySelectorAll("[data-user-notification-badge], [data-notification-count]").forEach((node) => {
      node.textContent = unread;
      node.classList.toggle("hidden", unread === 0);
    });
  }

  function render(config) {
    const root = document.querySelector(config.root || "#userPage");
    if (!root) return;
    root.innerHTML = `
      <div class="user-shell">
        <aside class="user-sidebar">
          <a class="user-logo" href="dashboard.html"><img src="../assets/logo-full.png" alt="Pro Sicht" class="h-12"></a>
          <nav class="user-nav" aria-label="Kullanıcı menü">
            ${links.map(([href, icon, label, key]) => `<a data-nav href="${href}" class="${href === config.active ? "is-active" : ""}"><i data-lucide="${icon}"></i><span data-i18n="${key}">${label}</span>${href === "notifications.html" ? '<span class="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-black text-white" data-user-notification-badge>0</span>' : ""}</a>`).join("")}
          </nav>
          <div class="mx-4 mt-4 border-t border-slate-100 pt-4">
            <p class="truncate text-sm font-black text-text-dark" data-current-user>Kullanıcı</p>
            <button class="btn btn-secondary mt-3 w-full" data-logout><i data-lucide="log-out" class="h-4 w-4"></i> <span data-i18n="logout">Çıkış</span></button>
          </div>
        </aside>
        <main class="user-main">
          <header class="user-header">
            <div>
              <div class="mb-2"><span class="demo-banner">Demo verisi</span></div>
              <h1 class="text-2xl font-black text-text-dark">${config.title}</h1>
              <p class="text-sm font-medium text-text-secondary">${config.subtitle || ""}</p>
            </div>
            <div class="flex items-center gap-2">
              ${config.actions || ""}
              <div class="relative"><button class="btn btn-secondary icon-btn relative" data-notification-button title="Bildirimler"><i data-lucide="bell"></i><span class="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs font-black text-white" data-notification-count>0</span></button></div>
              <button class="btn btn-secondary" data-lang-button type="button"><span data-lang-toggle>TR</span></button>
              <button class="btn btn-secondary icon-btn" data-theme-toggle title="Tema"><i data-lucide="moon"></i></button>
            </div>
          </header>
          <section class="user-content">${config.content || ""}</section>
        </main>
      </div>`;

    updateNotificationBadges();
    document.querySelector("[data-lang-button]")?.addEventListener("click", () => window.I18n?.toggle());
    window.Auth?.bindCommon();
    loadBonusScript("Notifications", () => window.Notifications?.init());
    loadBonusScript("I18n", () => window.I18n?.apply());
    loadBonusScript("Export", () => window.Export?.enhanceTables());
    if (window.lucide) window.lucide.createIcons();
  }

  window.addEventListener("notificationschange", updateNotificationBadges);
  window.UserLayout = { render, updateNotificationBadges };
})();
