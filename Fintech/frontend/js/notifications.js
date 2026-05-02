(function () {
  function init() {
    const count = window.MockData?.premiumRequests?.length || 0;
    document.querySelectorAll("[data-notification-count]").forEach((node) => {
      node.textContent = count;
      node.classList.toggle("hidden", count === 0);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
  window.Notifications = { init };
})();
