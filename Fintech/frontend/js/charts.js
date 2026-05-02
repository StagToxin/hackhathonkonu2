(function () {
  const palette = ["#2DBE8E", "#1E3A46", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

  function destroyExisting(canvas) {
    const existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
  }

  function moneyTicks(value) {
    return new Intl.NumberFormat("tr-TR", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  }

  function line(canvas, labels, values, label = "Gelir") {
    if (!canvas || !window.Chart) return null;
    destroyExisting(canvas);
    return new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label,
          data: values,
          borderColor: "#2DBE8E",
          backgroundColor: "rgba(45, 190, 142, 0.12)",
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
          y: { ticks: { callback: moneyTicks }, grid: { color: "#eef3f4" } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  function doughnut(canvas, labels, values) {
    if (!canvas || !window.Chart) return null;
    destroyExisting(canvas);
    return new Chart(canvas, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: palette, borderWidth: 0 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } } }
      }
    });
  }

  function bar(canvas, labels, values, label = "Değer") {
    if (!canvas || !window.Chart) return null;
    destroyExisting(canvas);
    return new Chart(canvas, {
      type: "bar",
      data: { labels, datasets: [{ label, data: values, backgroundColor: "#2DBE8E", borderRadius: 8 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { grid: { color: "#eef3f4" } }, x: { grid: { display: false } } }
      }
    });
  }

  window.Charts = { line, doughnut, bar };
})();
