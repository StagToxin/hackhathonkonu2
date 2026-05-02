(function () {
  function init() {
    const requiredRole = document.body.dataset.requiresRole;
    if (requiredRole && !window.Auth.requireAuth(requiredRole)) return;
    document.querySelectorAll("[data-nav]").forEach((link) => {
      const href = link.getAttribute("href");
      const current = window.location.pathname.replaceAll("\\", "/");
      if (href && current.endsWith(href.replace("../", ""))) link.classList.add("is-active");
    });
    window.Auth.bindCommon();
    if (window.lucide) window.lucide.createIcons();
  }

  document.addEventListener("DOMContentLoaded", init);
  window.Router = { init };
})();
