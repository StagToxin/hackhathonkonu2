(function () {
  const Utils = {
    qs(selector, root = document) {
      return root.querySelector(selector);
    },
    qsa(selector, root = document) {
      return Array.from(root.querySelectorAll(selector));
    },
    formatCurrency(value) {
      return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
        maximumFractionDigits: 0
      }).format(Number(value || 0));
    },
    formatNumber(value) {
      return new Intl.NumberFormat("tr-TR").format(Number(value || 0));
    },
    formatDate(value) {
      if (!value) return "-";
      return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(value));
    },
    debounce(fn, delay = 250) {
      let timer;
      return (...args) => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => fn(...args), delay);
      };
    },
    getQueryParam(name) {
      return new URLSearchParams(window.location.search).get(name);
    },
    slugify(value) {
      return String(value || "")
        .toLocaleLowerCase("tr-TR")
        .replaceAll("ı", "i")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    },
    byId(id) {
      return document.getElementById(id);
    },
    healthScore(company) {
      const revenue = Number(company.actualTurnover || company.estimatedTurnover || 1);
      const contract = Number(company.contractValue || 0);
      const score = Math.round(Math.max(22, Math.min(96, (company.score || 55) + (revenue > 90000000 ? 6 : 0) - (contract / Math.max(revenue, 1)) * 120)));
      return score;
    },
    healthClass(score) {
      return score >= 70 ? "good" : score >= 40 ? "mid" : "low";
    }
  };

  window.Utils = Utils;
})();
