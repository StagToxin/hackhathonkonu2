(function () {
  function init() {
    const requiredRole = document.body.dataset.requiresRole;
    if (requiredRole && !window.Auth.requireAuth(requiredRole)) return;
    if (requiredRole === "user" && !window.Auth.checkApprovalGate()) return;
    document.querySelectorAll("[data-nav]").forEach((link) => {
      const href = link.getAttribute("href");
      const current = window.location.pathname.replaceAll("\\", "/");
      if (href && current.endsWith(href.replace("../", ""))) link.classList.add("is-active");
    });
    window.Auth.bindCommon();
    const depth = window.location.pathname.includes("/admin/") || window.location.pathname.includes("/user/") ? "../" : "";
    if (!window.Logger) {
      const script = document.createElement("script");
      script.src = `${depth}js/logger.js`;
      script.onload = () => window.Logger?.logPageAccess();
      document.body.appendChild(script);
    } else {
      window.Logger.logPageAccess();
    }
    if (window.lucide) window.lucide.createIcons();
  }

  document.addEventListener("DOMContentLoaded", init);
  window.Router = { init };
})();
