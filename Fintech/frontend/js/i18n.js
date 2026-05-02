(function () {
  const strings = {
    tr: { dashboard: "Dashboard", companies: "Firmalar" },
    en: { dashboard: "Dashboard", companies: "Companies" }
  };
  window.I18n = {
    locale: window.localStorage.getItem("locale") || "tr",
    t(key) {
      return strings[this.locale]?.[key] || key;
    }
  };
})();
