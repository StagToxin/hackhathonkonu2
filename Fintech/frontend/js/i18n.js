(function () {
  const strings = {
    tr: {
      dashboard: "Dashboard", home: "Ana Sayfa", companies: "Firmalar", notifications: "Bildirimler", premium: "Premium", settings: "Ayarlar", financialReport: "Finansal Rapor", financialStatus: "Finansal Durum", investment: "Yatırım", presentation: "On Sunum", logout: "Çıkış", save: "Kaydet", cancel: "Vazgeç", delete: "Sil", edit: "Düzenle", approve: "Onayla", reject: "Reddet", export: "Dışa Aktar", groups: "Gruplar"
    },
    en: {
      dashboard: "Dashboard", home: "Home", companies: "Companies", notifications: "Notifications", premium: "Premium", settings: "Settings", financialReport: "Financial Report", financialStatus: "Financial Status", investment: "Investment", presentation: "Pre-Presentation", logout: "Logout", save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit", approve: "Approve", reject: "Reject", export: "Export", groups: "Groups"
    }
  };

  const phrases = {
    "Kaydet": "Save",
    "Vazgeç": "Cancel",
    "Sil": "Delete",
    "Düzenle": "Edit",
    "Onayla": "Approve",
    "Reddet": "Reject",
    "Dışa Aktar": "Export",
    "Satır Ekle": "Add Row",
    "Firma Detay": "Company Detail",
    "Firmalar": "Companies",
    "Sözleşmeler": "Contracts",
    "Abonelik": "Subscription",
    "Finansal Süreç": "Financial Process",
    "Bekleyen Tahsilat": "Pending Collections",
    "Yapılan Tahsilat": "Completed Collections",
    "Premium ile aç": "Unlock with Premium",
    "Bildirimler": "Notifications",
    "Loglar": "Logs",
    "Ayarlar": "Settings",
    "Gruplar": "Groups",
    "Yeni Grup Oluştur": "Create New Group",
    "Tekil Görünüm": "Individual View",
    "Konsolide Görünüm": "Consolidated View",
    "Sunum Oluştur (.pptx)": "Generate Presentation (.pptx)",
    "Önizleme": "Preview",
    "Firma Bilgilerim": "My Company Info",
    "Finansal Raporum": "My Financial Report",
    "Talep Gönder": "Send Request",
    "Satır Ekle": "Add Row"
  };

  const I18n = {
    locale: window.localStorage.getItem("locale") || "tr",
    t(key) { return strings[this.locale]?.[key] || strings.tr[key] || key; },
    apply() {
      document.documentElement.lang = this.locale;
      document.querySelectorAll("[data-i18n]").forEach((node) => { node.textContent = this.t(node.dataset.i18n); });
      document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => { node.placeholder = this.t(node.dataset.i18nPlaceholder); });
      document.querySelectorAll("[data-lang-toggle]").forEach((node) => { node.textContent = this.locale === "tr" ? "TR" : "EN"; });
      document.querySelectorAll("button, a, h1, h2, h3, label, span, p, th").forEach((node) => {
        if (node.children.length || node.dataset.i18n) return;
        if (!node.dataset.i18nOriginal) node.dataset.i18nOriginal = node.textContent.trim();
        const original = node.dataset.i18nOriginal;
        node.textContent = this.locale === "tr" ? original : (phrases[original] || original);
      });
    },
    toggle() { this.locale = this.locale === "tr" ? "en" : "tr"; window.localStorage.setItem("locale", this.locale); this.apply(); }
  };

  document.addEventListener("DOMContentLoaded", () => I18n.apply());
  window.I18n = I18n;
})();
