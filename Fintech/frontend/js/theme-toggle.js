(function () {
  function apply(theme) {
    document.body.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("theme", theme);
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
  }

  document.addEventListener("DOMContentLoaded", () => {
    apply(window.localStorage.getItem("theme") || "light");
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        apply(document.body.classList.contains("dark") ? "light" : "dark");
      });
    });
  });

  window.ThemeToggle = { apply };
})();
