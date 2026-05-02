(function () {
  const lightPalette = ["#2DBE8E", "#1E3A46", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];
  const darkPalette = ["#2DBE8E", "#8BE7C7", "#93C5FD", "#FCD38B", "#FDA4A4", "#C4B5FD"];

  function destroyExisting(canvas) {
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
  }

  function isDark() {
    return document.body.classList.contains("dark");
  }

  function theme() {
    return {
      text: isDark() ? "rgba(242, 251, 248, 0.76)" : "#52686f",
      grid: isDark() ? "rgba(185, 200, 204, 0.12)" : "#eef3f4",
      fill: isDark() ? "rgba(45, 190, 142, 0.16)" : "rgba(45, 190, 142, 0.12)",
      palette: isDark() ? darkPalette : lightPalette
    };
  }

  function moneyTicks(value) {
    return new Intl.NumberFormat("tr-TR", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  }

  function line(canvas, labels, values, label = "Gelir") {
    if (!canvas || !window.Chart) return null;
    destroyExisting(canvas);
    const colors = theme();
    return new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label,
          data: values,
          borderColor: "#2DBE8E",
          backgroundColor: colors.fill,
          fill: true,
          tension: 0.38,
          pointRadius: 4,
          pointBackgroundColor: "#2DBE8E"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { ticks: { callback: moneyTicks, color: colors.text }, grid: { color: colors.grid } },
          x: { ticks: { color: colors.text }, grid: { display: false } }
        }
      }
    });
  }

  function doughnut(canvas, labels, values) {
    if (!canvas || !window.Chart) return null;
    destroyExisting(canvas);
    const colors = theme();
    return new Chart(canvas, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: colors.palette, borderWidth: 0 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: { legend: { position: "bottom", labels: { color: colors.text, usePointStyle: true, boxWidth: 8 } } }
      }
    });
  }

  function bar(canvas, labels, values, label = "Değer") {
    if (!canvas || !window.Chart) return null;
    destroyExisting(canvas);
    const colors = theme();
    return new Chart(canvas, {
      type: "bar",
      data: { labels, datasets: [{ label, data: values, backgroundColor: "#2DBE8E", borderRadius: 8 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { ticks: { color: colors.text }, grid: { color: colors.grid } },
          x: { ticks: { color: colors.text }, grid: { display: false } }
        }
      }
    });
  }

  function refreshAll() {
    if (!window.Chart?.instances) return;
    const colors = theme();
    Object.values(window.Chart.instances).forEach((chart) => {
      if (chart.options.scales) {
        Object.values(chart.options.scales).forEach((scale) => {
          if (scale.ticks) scale.ticks.color = colors.text;
          if (scale.grid && scale.grid.display !== false) scale.grid.color = colors.grid;
        });
      }
      const legendLabels = chart.options.plugins?.legend?.labels;
      if (legendLabels) legendLabels.color = colors.text;
      if (chart.config.type === "doughnut") {
        chart.data.datasets.forEach((dataset) => {
          dataset.backgroundColor = colors.palette;
        });
      }
      if (chart.config.type === "line") {
        chart.data.datasets.forEach((dataset) => {
          dataset.backgroundColor = colors.fill;
        });
      }
      chart.update();
    });
  }

  window.addEventListener("themechange", refreshAll);
  window.Charts = { line, doughnut, bar, refreshAll };
})();
