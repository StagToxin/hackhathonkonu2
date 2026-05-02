(function () {
  function toCsv(rows) {
    if (!rows.length) return "";
    const headers = Object.keys(rows[0]);
    const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    return [headers.join(","), ...rows.map((row) => headers.map((key) => escape(row[key])).join(","))].join("\n");
  }

  function download(filename, content, type = "text/csv;charset=utf-8") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function csv(filename, rows) {
    download(filename, toCsv(rows));
  }

  function excel(filename, rows) {
    if (!window.XLSX) {
      csv(filename.replace(/\.xlsx$/i, ".csv"), rows);
      return;
    }
    const sheet = XLSX.utils.json_to_sheet(rows);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Veri");
    XLSX.writeFile(book, filename);
  }

  function tableToRows(table) {
    const headers = Array.from(table.querySelectorAll("thead th")).map((th) => th.textContent.trim());
    return Array.from(table.querySelectorAll("tbody tr")).map((tr) => {
      const values = Array.from(tr.children).map((td) => td.textContent.trim());
      return Object.fromEntries(headers.map((header, index) => [header || `Kolon ${index + 1}`, values[index] || ""]));
    });
  }

  function addExportControl(table, index) {
    if (table.dataset.exportReady === "true") return;
    table.dataset.exportReady = "true";
    const wrapper = table.closest(".surface") || table.parentElement;
    if (!wrapper) return;
    const control = document.createElement("div");
    control.className = "export-control";
    control.innerHTML = `
      <button class="btn btn-secondary" type="button"><i data-lucide="download" class="h-4 w-4"></i> Dışa Aktar</button>
      <div class="export-menu hidden">
        <button type="button" data-export-type="csv">CSV</button>
        <button type="button" data-export-type="excel">Excel</button>
      </div>`;
    wrapper.style.position = wrapper.style.position || "relative";
    wrapper.prepend(control);
    control.querySelector(".btn").addEventListener("click", () => control.querySelector(".export-menu").classList.toggle("hidden"));
    control.querySelectorAll("[data-export-type]").forEach((button) => {
      button.addEventListener("click", () => {
        const rows = tableToRows(table);
        const name = `pro-sicht-tablo-${index + 1}`;
        if (button.dataset.exportType === "csv") csv(`${name}.csv`, rows);
        else excel(`${name}.xlsx`, rows);
        control.querySelector(".export-menu").classList.add("hidden");
      });
    });
    if (window.lucide) window.lucide.createIcons();
  }

  function enhanceTables() {
    document.querySelectorAll("table.data-table").forEach(addExportControl);
  }

  const observer = new MutationObserver(() => enhanceTables());
  document.addEventListener("DOMContentLoaded", () => {
    enhanceTables();
    observer.observe(document.body, { childList: true, subtree: true });
  });

  window.Export = { csv, excel, tableToRows, enhanceTables };
})();
