(function () {
  function renderMarkdown(target, markdown) {
    const node = typeof target === "string" ? document.querySelector(target) : target;
    if (!node) return;
    node.innerHTML = window.marked ? window.marked.parse(markdown) : markdown;
  }

  window.AiAnalysis = { renderMarkdown };
})();
