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

  const premiumRequests = saved.premiumRequests || [
    { id: "pr-1", user: "Selin Arman", company: "Nova Tekstil A.Ş.", packageName: "Premium Bundle", requestedAt: "2026-05-02T12:00:00", status: "Bekliyor" },
    { id: "pr-2", user: "Baran Kaya", company: "Mavi Lojistik Ltd.", packageName: "Uzman Görüşü", requestedAt: "2026-05-01T18:35:00", status: "Bekliyor" },
    { id: "pr-3", user: "Derya Güven", company: "Atlas Enerji Sanayi A.Ş.", packageName: "AI Analiz", requestedAt: "2026-04-30T14:10:00", status: "Onaylandı" }
  ];

  const financial = {
    banks: [
      { name: "Garanti BBVA", accountNo: "TR12 0006 2000 0000 1234", balance: 4200000, creditLimit: 8500000, usage: 5100000, spark: [32, 35, 34, 39, 44, 42] },
      { name: "İş Bankası", accountNo: "TR44 0006 4000 0000 5678", balance: 2800000, creditLimit: 6200000, usage: 2400000, spark: [25, 27, 31, 28, 34, 36] },
      { name: "Akbank", accountNo: "TR98 0004 6000 0000 9012", balance: 1750000, creditLimit: 5000000, usage: 3100000, spark: [18, 21, 19, 23, 22, 27] }
    ],
    pendingCollections: [
      { date: "2026-05-12", customer: "Kuzey Perakende", invoiceNo: "FTR-2401", amount: 980000, due: "2026-05-28", status: "Bekliyor" },
      { date: "2026-04-30", customer: "Delta Gıda", invoiceNo: "FTR-2388", amount: 640000, due: "2026-05-09", status: "Riskli" },
      { date: "2026-04-18", customer: "Terra Medikal", invoiceNo: "FTR-2361", amount: 410000, due: "2026-05-16", status: "Bekliyor" }
    ],
    paidCollections: [
      { date: "2026-05-02", customer: "Atlas Solar", amount: 730000, due: "2026-05-02", status: "Ödendi" },
      { date: "2026-04-26", customer: "Mavi Lojistik", amount: 520000, due: "2026-04-28", status: "Ödendi" },
      { date: "2026-04-21", customer: "Nova Dış Ticaret", amount: 390000, due: "2026-04-22", status: "Ödendi" }
    ],
    cashflow: {
      labels: ["Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara", "Oca", "Şub", "Mar", "Nis", "May"],
      inflow: [5.2, 5.7, 5.1, 6.4, 6.8, 7.1, 7.4, 7.9, 7.6, 8.2, 8.5, 9.1],
      outflow: [4.6, 4.9, 5.0, 5.5, 5.9, 6.2, 6.8, 6.7, 6.9, 7.1, 7.4, 7.6]
    },
    maturity: [
      { label: "0-30 gün", debt: 1800000, receivable: 2450000 },
      { label: "31-60 gün", debt: 2200000, receivable: 1750000 },
      { label: "61-90 gün", debt: 1250000, receivable: 980000 },
      { label: "90+ gün", debt: 760000, receivable: 540000 }
    ],
    projects: [
      { name: "ERP dönüşüm danışmanlığı", status: "Devam", amount: 1850000, start: "2026-02-01", end: "2026-08-31" },
      { name: "İhracat finansmanı analizi", status: "Devam", amount: 920000, start: "2026-03-10", end: "2026-06-15" },
      { name: "Kredi limit optimizasyonu", status: "Bitti", amount: 640000, start: "2025-11-01", end: "2026-01-30" },
      { name: "Nakit akış modeli", status: "Bitti", amount: 480000, start: "2025-09-15", end: "2025-12-20" }
    ],
    summary: {
      assets: 148000000,
      liabilities: 148000000,
      revenue: 93500000,
      grossProfit: 24800000,
      netProfit: 11800000,
      equity: 64200000,
      debt: 83800000,
      totalDebt: 6010000,
      totalReceivable: 5720000
    }
  };

  const investments = {
    active: [
      { name: "Yeşil enerji fonu", amount: 4200000, marketValue: 4860000, returnRate: 15.7, spark: [41, 43, 44, 48, 47, 52] },
      { name: "Kısa vadeli bono sepeti", amount: 3100000, marketValue: 3270000, returnRate: 5.5, spark: [20, 21, 23, 24, 24, 25] },
      { name: "Lojistik depo ortaklığı", amount: 5600000, marketValue: 6120000, returnRate: 9.3, spark: [31, 33, 32, 36, 39, 41] },
      { name: "Döviz korumalı mevduat", amount: 2400000, marketValue: 2525000, returnRate: 5.2, spark: [22, 23, 22, 24, 25, 26] }
    ],
    sector: { labels: ["Enerji", "Finansal araçlar", "Gayrimenkul", "Teknoloji"], values: [34, 28, 24, 14] },
    geography: { labels: ["Marmara", "Ege", "İç Anadolu", "Yurt dışı"], values: [46, 22, 18, 14] },
    planned: [
      { name: "Güneş paneli kapasite artışı", expectedReturn: 18, budget: 7200000, quarter: "2026 Q3" },
      { name: "Fintech alacak yönetimi pilotu", expectedReturn: 24, budget: 2600000, quarter: "2026 Q4" },
      { name: "Depo otomasyon yatırımı", expectedReturn: 13, budget: 3900000, quarter: "2027 Q1" }
    ],
    riskScore: 62,
    healthScore: 84
  };

  const contracts = companies.map((company, index) => ({
    id: `ctr-${index + 1}`,
    company: company.name,
    type: company.contractType,
    start: company.contractStart,
    end: company.contractEnd,
    renewal: company.contractEnd,
    value: company.contractValue,
    status: "Aktif"
  }));

  const subscriptions = [
    { company: "Nova Tekstil A.Ş.", packageName: "Premium Bundle", monthlyFee: 125000, billingStatus: "Ödendi", nextInvoice: "2026-06-01" },
    { company: "Mavi Lojistik Ltd.", packageName: "Temel Rapor", monthlyFee: 68000, billingStatus: "Bekliyor", nextInvoice: "2026-05-15" },
    { company: "Atlas Enerji Sanayi A.Ş.", packageName: "Sistem + AI", monthlyFee: 210000, billingStatus: "Gecikti", nextInvoice: "2026-05-05" }
  ];

  const processPayments = [
    { company: "Nova Tekstil A.Ş.", payer: "Selin Arman", item: "Nisan danışmanlık bedeli", paidAt: "2026-05-02", amount: 125000, status: "Ödendi", delayDays: 0 },
    { company: "Mavi Lojistik Ltd.", payer: "Baran Kaya", item: "Finansal rapor paketi", paidAt: "2026-05-10", amount: 68000, status: "Bekliyor", delayDays: 3 },
    { company: "Atlas Enerji Sanayi A.Ş.", payer: "Derya Güven", item: "Sistem aboneliği", paidAt: "2026-04-29", amount: 210000, status: "Gecikti", delayDays: 9 }
  ];

  const groups = saved.groups || [
    { id: "grp-1", name: "Nova Holding", description: "Tekstil ve dış ticaret firmaları", companies: ["Nova Tekstil A.Ş."], turnover: 128000000, debt: 38400000, riskScore: 58 },
    { id: "grp-2", name: "Atlas Grup", description: "Enerji üretimi ve bakım şirketleri", companies: ["Atlas Enerji Sanayi A.Ş."], turnover: 238000000, debt: 67400000, riskScore: 49 },
    { id: "grp-3", name: "Pro Sicht Demo Holding", description: "Demo konsolide görünüm için üç firma", companies: companies.map((company) => company.name), turnover: 333000000, debt: 108000000, riskScore: 54 }
  ];

  const premiumPackages = [
    { id: "basic-ai", name: "Temel Analiz", price: "₺499/ay", content: "AI destekli otomatik finansal analiz raporu", features: ["AI finansal analiz", "Markdown rapor", "PDF çıktısı"], popular: false },
    { id: "expert", name: "Uzman Görüşü", price: "₺999/ay", content: "Uzman tarafından yazılan yorumlu rapor", features: ["Uzman raporu", "Risk yorumu", "Öncelikli inceleme"], popular: false },
    { id: "bundle", name: "Premium Bundle", price: "₺1.499/ay", content: "AI Analiz + Uzman Görüşü + On Sunum", features: ["AI Analiz", "Uzman Görüşü", "On Sunum", "Premium destek"], popular: true }
  ];

  const notifications = saved.notifications || [
    { id: "ntf-1", type: "premium", title: "Premium talebiniz alındı", message: "Premium Bundle talebiniz admin onayına gönderildi.", createdAt: "2026-05-02T12:10:00", read: false },
    { id: "ntf-2", type: "contract", title: "Sözleşme bitişi yaklaşıyor", message: "Nova Tekstil sözleşmesi 2026-12-31 tarihinde bitecek.", createdAt: "2026-05-01T10:30:00", read: false },
    { id: "ntf-3", type: "system", title: "Demo verisi hazır", message: "Finansal rapor ve banka verileri örnek veriyle dolduruldu.", createdAt: "2026-04-30T09:00:00", read: true }
  ];

  const seededLogs = [
    { id: "log-seed-1", createdAt: "2026-05-02T12:20:00", user: "admin@prosicht.com", action: "auth.login", type: "Auth", status: "success", detail: { ip: "127.0.0.1", role: "admin" } },
    { id: "log-seed-2", createdAt: "2026-05-02T11:40:00", user: "selin@novatekstil.com", action: "ai.financial_analysis", type: "AI", status: "success", detail: { responseTimeMs: 4300, model: "mock-llm", prompt: "Finansal oran analizi üret" } },
    { id: "log-seed-3", createdAt: "2026-05-02T10:05:00", user: "system", action: "ocr.parse", type: "OCR", status: "success", detail: { file: "vergi-levhasi.pdf", responseTimeMs: 1180 } },
    { id: "log-seed-4", createdAt: "2026-05-01T15:10:00", user: "admin@prosicht.com", action: "company.update", type: "CRUD", status: "success", detail: { company: "Mavi Lojistik Ltd.", fields: ["contractEnd"] } }
  ];

  const generatedLogs = Array.from({ length: 50 }, (_, index) => {
    const types = ["Auth", "CRUD", "AI", "OCR", "Premium", "Hata"];
    const type = types[index % types.length];
    return {
      id: `log-demo-${index + 1}`,
      createdAt: new Date(Date.UTC(2026, 4, 2, 9, 0 - index * 13)).toISOString(),
      user: index % 3 === 0 ? "admin@prosicht.com" : index % 3 === 1 ? "user@firma.com" : "system",
      action: `${type.toLocaleLowerCase("tr-TR")}.demo_event_${index + 1}`,
      type,
      status: type === "Hata" && index % 2 === 0 ? "error" : "success",
      detail: { demo: true, responseTimeMs: 800 + index * 37, companyId: companies[index % companies.length].id }
    };
  });

  const logs = saved.logs || [...seededLogs, ...generatedLogs];

  const users = saved.users || [
    { id: "usr-admin", email: "admin@prosicht.com", password: "admin123", name: "Pro Sicht Admin", role: "admin", approvalStatus: "approved", unlockedFeatures: ["all_premium"] },
    { id: "usr-demo", email: "user@firma.com", password: "user123", name: "Firma Yetkilisi", role: "user", companyId: "cmp-1", approvalStatus: "approved", unlockedFeatures: [] },
    { id: "usr-pending", email: "pending@firma.com", password: "user123", name: "Onay Bekleyen Yetkili", role: "user", companyId: "pending-demo", approvalStatus: "pending", unlockedFeatures: [] }
  ];

  function save() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      companies,
      pendingCompanies,
      premiumRequests,
      groups,
      notifications,
      logs,
      users
    }));
  }

  window.MockData = {
    companies,
    pendingCompanies,
    revenueTrend,
    contractDistribution,
    recentActivities,
    premiumRequests,
    premiumPackages,
    notifications,
    financial,
    investments,
    contracts,
    subscriptions,
    processPayments,
    groups,
    logs,
    users,
    save
  };
})();
