(function () {
  const STORAGE_KEY = "prosichtMockState";
  const defaults = {};

  defaults.companies = [
    {
      id: "cmp-1",
      name: "Nova Tekstil A.Ş.",
      taxNo: "1234567890",
      tradeRegistryNo: "IST-448210",
      foundedAt: "2014-03-12",
      sector: "Tekstil ve ihracat",
      contactName: "Selin Arman",
      phone: "+90 212 555 10 20",
      email: "selin@novatekstil.com",
      address: "Maslak, Büyükdere Cd. No: 42, İstanbul",
      branches: ["Bursa üretim tesisi", "İzmir lojistik deposu"],
      estimatedTurnover: 98000000,
      actualTurnover: 93500000,
      contractValue: 1250000,
      contractStart: "2026-01-01",
      contractEnd: "2026-12-31",
      contractType: "Analiz",
      subsidiaries: ["Nova Dış Ticaret Ltd."],
      group: "Nova Holding",
      score: 82,
      status: "Aktif",
      lat: 41.109,
      lng: 29.019
    },
    {
      id: "cmp-2",
      name: "Mavi Lojistik Ltd.",
      taxNo: "2345678901",
      tradeRegistryNo: "ANK-829155",
      foundedAt: "2018-07-02",
      sector: "Lojistik",
      contactName: "Baran Kaya",
      phone: "+90 312 555 22 18",
      email: "baran@mavilojistik.com",
      address: "Söğütözü Mah. 2180. Cad. No: 7, Ankara",
      branches: ["Konya aktarma merkezi"],
      estimatedTurnover: 54000000,
      actualTurnover: 49800000,
      contractValue: 720000,
      contractStart: "2025-11-15",
      contractEnd: "2026-11-15",
      contractType: "Rapor",
      subsidiaries: [],
      group: "",
      score: 71,
      status: "Aktif",
      lat: 39.913,
      lng: 32.787
    },
    {
      id: "cmp-3",
      name: "Atlas Enerji Sanayi A.Ş.",
      taxNo: "3456789012",
      tradeRegistryNo: "IZM-102774",
      foundedAt: "2011-10-20",
      sector: "Enerji",
      contactName: "Derya Güven",
      phone: "+90 232 555 74 91",
      email: "derya@atlasenerji.com",
      address: "Alsancak, Şehitler Cd. No: 18, İzmir",
      branches: ["Manisa saha ofisi", "Aydın güneş santrali"],
      estimatedTurnover: 172000000,
      actualTurnover: 181400000,
      contractValue: 2100000,
      contractStart: "2026-02-01",
      contractEnd: "2027-02-01",
      contractType: "Sistem",
      subsidiaries: ["Atlas Solar A.Ş.", "Atlas Bakım Ltd."],
      group: "Atlas Grup",
      score: 89,
      status: "Aktif",
      lat: 38.438,
      lng: 27.143
    }
  ];

  defaults.pendingCompanies = [
    { id: "pen-1", name: "Delta Gıda A.Ş.", contactName: "Ece Nalbant", email: "ece@deltagida.com", taxNo: "4567890123", createdAt: "2026-05-01T09:20:00", status: "Bekliyor" },
    { id: "pen-2", name: "Kuzey Yazılım Ltd.", contactName: "Mert Uslu", email: "mert@kuzey.dev", taxNo: "5678901234", createdAt: "2026-05-01T15:45:00", status: "Bekliyor" },
    { id: "pen-3", name: "Terra Medikal A.Ş.", contactName: "Ayşe Çelik", email: "ayse@terramedikal.com", taxNo: "6789012345", createdAt: "2026-05-02T08:10:00", status: "Bekliyor" }
  ];

  const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null") || {};
  const companies = saved.companies || defaults.companies;
  const pendingCompanies = saved.pendingCompanies || defaults.pendingCompanies;

  const revenueTrend = {
    labels: ["Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara", "Oca", "Şub", "Mar", "Nis", "May"],
    values: [420000, 470000, 455000, 520000, 610000, 585000, 680000, 725000, 710000, 790000, 835000, 910000]
  };

  const contractDistribution = {
    labels: ["Rapor", "Analiz", "Sistem", "Diğer"],
    values: [32, 28, 21, 9]
  };

  const recentActivities = [
    { user: "Admin", action: "Nova Tekstil sözleşmesini güncelledi", time: "2026-05-02T12:20:00" },
    { user: "Selin Arman", action: "Finansal rapor belgesi yükledi", time: "2026-05-02T11:40:00" },
    { user: "Sistem", action: "Atlas Enerji OCR işlemi tamamlandı", time: "2026-05-02T10:05:00" },
    { user: "Admin", action: "Mavi Lojistik kaydını onayladı", time: "2026-05-01T16:12:00" }
  ];

  const premiumRequests = [
    { id: "pr-1", company: "Nova Tekstil A.Ş.", packageName: "Premium Bundle", requestedAt: "2026-05-02T12:00:00", status: "Bekliyor" },
    { id: "pr-2", company: "Mavi Lojistik Ltd.", packageName: "Uzman Görüşü", requestedAt: "2026-05-01T18:35:00", status: "Bekliyor" }
  ];

  const logs = saved.logs || [];

  const users = [
    { email: "admin@prosicht.com", password: "admin123", name: "Pro Sicht Admin", role: "admin" },
    { email: "user@firma.com", password: "user123", name: "Firma Yetkilisi", role: "user", companyId: "cmp-1" }
  ];

  function save() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      companies,
      pendingCompanies,
      logs
    }));
  }

  window.MockData = {
    companies,
    pendingCompanies,
    revenueTrend,
    contractDistribution,
    recentActivities,
    premiumRequests,
    logs,
    users,
    save
  };
})();
