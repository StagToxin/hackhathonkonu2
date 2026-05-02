(function () {
  function renderMarkdown(target, markdown) {
    const node = typeof target === "string" ? document.querySelector(target) : target;
    if (!node) return;
    node.innerHTML = window.marked ? window.marked.parse(markdown) : markdown;
    node.querySelectorAll("h2").forEach((heading) => {
      const text = heading.textContent.toLocaleLowerCase("tr-TR");
      const wrapper = document.createElement("section");
      wrapper.className = "user-card p-4";
      if (text.includes("güçlü")) wrapper.classList.add("border-emerald-200");
      if (text.includes("zayıf")) wrapper.classList.add("border-amber-200");
      if (text.includes("risk")) wrapper.classList.add("border-red-200");
      heading.parentNode.insertBefore(wrapper, heading);
      let cursor = heading;
      while (cursor && !(cursor !== heading && cursor.tagName === "H2")) {
        const next = cursor.nextSibling;
        wrapper.appendChild(cursor);
        cursor = next;
      }
    });
  }

  function loading(target, message = "AI raporu hazırlanıyor...") {
    const node = typeof target === "string" ? document.querySelector(target) : target;
    if (!node) return;
    node.innerHTML = `<div class="skeleton h-7"></div><div class="skeleton mt-3 h-24"></div><p class="mt-4 flex items-center gap-3 font-black text-primary-dark"><span class="spinner"></span>${message}</p>`;
  }

  window.AiAnalysis = { renderMarkdown, loading };
})();
