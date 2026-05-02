(function () {
  function open(selector) {
    document.querySelector(selector)?.classList.add("is-open");
  }

  function close(selector) {
    document.querySelector(selector)?.classList.remove("is-open");
  }

  window.PremiumModal = { open, close };
})();
