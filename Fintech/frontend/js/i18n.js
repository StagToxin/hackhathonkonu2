(function () {
  const strings = {
    tr: {
      dashboard: "Dashboard",
      home: "Ana Sayfa",
      companies: "Firmalar",
      notifications: "Bildirimler",
      premium: "Premium",
      settings: "Ayarlar",
      financialReport: "Finansal Rapor",
      financialStatus: "Finansal Durum",
      investment: "Yatırım",
      presentation: "On Sunum",
      logout: "Çıkış"
    },
    en: {
      dashboard: "Dashboard",
      home: "Home",
      companies: "Companies",
      notifications: "Notifications",
      premium: "Premium",
      settings: "Settings",
      financialReport: "Financial Report",
      financialStatus: "Financial Status",
      investment: "Investment",
      presentation: "Pre-Presentation",
      logout: "Logout"
    }
  };

  const I18n = {
    locale: window.localStorage.getItem("locale") || "tr",
    t(key) {
      return strings[this.locale]?.[key] || strings.tr[key] || key;
    },
    apply() {
      document.documentElement.lang = this.locale;
      document.querySelectorAll("[data-i18n]").forEach((node) => {
        node.textContent = this.t(node.dataset.i18n);
      });
      document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
        node.placeholder = this.t(node.dataset.i18nPlaceholder);
      });
      document.querySelectorAll("[data-lang-toggle]").forEach((node) => {
        node.textContent = this.locale === "tr" ? "TR" : "EN";
      });
    },
    toggle() {
      this.locale = this.locale === "tr" ? "en" : "tr";
      window.localStorage.setItem("locale", this.locale);
      this.apply();
    }
  };

  document.addEventListener("DOMContentLoaded", () => I18n.apply());
  window.I18n = I18n;
})();
