(function () {
  function relativeTime(dateValue) {
    const diff = Math.max(0, Date.now() - new Date(dateValue).getTime());
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "az önce";
    if (minutes < 60) return `${minutes} dk önce`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} saat önce`;
    return `${Math.floor(hours / 24)} gün önce`;
  }

  function getItems() {
    const user = window.Auth?.getUser?.() || JSON.parse(window.localStorage.getItem("authUser") || window.localStorage.getItem("user") || "null");
    const allUserNotifications = JSON.parse(window.localStorage.getItem("userNotifications") || "{}");
    const directItems = user?.id ? (allUserNotifications[user.id] || []) : [];
    const userItems = window.MockData?.notifications || [];
    const premiumItems = (window.MockData?.premiumRequests || [])
      .filter((item) => item.status === "Bekliyor")
      .map((item) => ({
        id: `premium-${item.id}`,
        type: "premium",
        title: "Premium talebi bekliyor",
        message: `${item.company} - ${item.packageName}`,
        createdAt: item.requestedAt,
        read: false
      }));
    return [...premiumItems, ...directItems, ...userItems].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function addNotification(userId, notification) {
    if (!userId) return;
    const allNotifications = JSON.parse(window.localStorage.getItem("userNotifications") || "{}");
    if (!allNotifications[userId]) allNotifications[userId] = [];
    allNotifications[userId].unshift({
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
      ...notification
    });
    allNotifications[userId] = allNotifications[userId].slice(0, 50);
    window.localStorage.setItem("userNotifications", JSON.stringify(allNotifications));
    window.dispatchEvent(new CustomEvent("notificationschange"));
  }

  function getUserNotifications() {
    const user = window.Auth?.getUser?.() || JSON.parse(window.localStorage.getItem("authUser") || window.localStorage.getItem("user") || "null");
    if (!user?.id) return [];
    const all = JSON.parse(window.localStorage.getItem("userNotifications") || "{}");
    return all[user.id] || [];
  }

  function markAsRead(notifId) {
    const user = window.Auth?.getUser?.() || JSON.parse(window.localStorage.getItem("authUser") || window.localStorage.getItem("user") || "null");
    if (!user?.id) return;
    const all = JSON.parse(window.localStorage.getItem("userNotifications") || "{}");
    const item = all[user.id]?.find((notification) => notification.id === notifId);
    if (item) {
      item.read = true;
      window.localStorage.setItem("userNotifications", JSON.stringify(all));
      window.dispatchEvent(new CustomEvent("notificationschange"));
    }
  }

  function icon(type) {
    return type === "premium" ? "gem" : type === "contract" ? "file-clock" : type === "system" ? "settings" : "bell";
  }

  function listUrl() {
    const path = window.location.pathname.replaceAll("\\", "/");
    if (path.includes("/admin/")) return "logs.html";
    if (path.includes("/user/")) return "notifications.html";
    return "user/notifications.html";
  }

  function ensureDropdown(button) {
    let dropdown = button.parentElement.querySelector("[data-notification-dropdown]");
    if (dropdown) return dropdown;
    dropdown = document.createElement("div");
    dropdown.className = "notification-dropdown hidden";
    dropdown.dataset.notificationDropdown = "";
    button.parentElement.appendChild(dropdown);
    return dropdown;
  }

  function renderDropdown(button) {
    const dropdown = ensureDropdown(button);
    const items = getItems().slice(0, 10);
    dropdown.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-100 p-3">
        <strong data-i18n="notifications">Bildirimler</strong>
        <button class="text-xs font-black text-primary-dark" data-mark-all-read type="button">Tümünü okundu işaretle</button>
      </div>
      <div class="max-h-[360px] overflow-auto">
        ${items.length ? items.map((item) => `
          <div class="grid grid-cols-[36px_1fr] gap-3 border-b border-slate-100 p-3 ${item.read ? "" : "bg-emerald-50"}">
            <div class="notification-icon h-9 w-9"><i data-lucide="${icon(item.type)}" class="h-4 w-4"></i></div>
            <div>
              <p class="text-sm font-black text-text-dark">${item.title}</p>
              <p class="mt-1 text-xs font-semibold text-text-secondary">${item.message}</p>
              <p class="mt-1 text-xs font-black text-primary-dark">${relativeTime(item.createdAt)}</p>
            </div>
          </div>`).join("") : '<div class="p-4 text-sm font-bold text-text-secondary">Henüz bildirim yok.</div>'}
      </div>
      <a class="block p-3 text-center text-sm font-black text-primary-dark" href="${listUrl()}">Tüm bildirimleri görüntüle</a>`;
    dropdown.querySelector("[data-mark-all-read]")?.addEventListener("click", async () => {
      if (window.Api?.markNotificationsRead) await window.Api.markNotificationsRead();
      init();
    });
    if (window.lucide) window.lucide.createIcons();
  }

  function init() {
    const unread = getItems().filter((item) => !item.read).length;
    document.querySelectorAll("[data-notification-count], [data-user-notification-badge]").forEach((node) => {
      node.textContent = unread;
      node.classList.toggle("hidden", unread === 0);
    });
    document.querySelectorAll("[data-notification-button]").forEach((button) => {
      if (button.dataset.boundNotification === "true") return;
      button.dataset.boundNotification = "true";
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        renderDropdown(button);
        button.parentElement.querySelector("[data-notification-dropdown]")?.classList.toggle("hidden");
      });
    });
  }

  document.addEventListener("click", () => {
    document.querySelectorAll("[data-notification-dropdown]").forEach((node) => node.classList.add("hidden"));
  });
  document.addEventListener("DOMContentLoaded", init);
  window.addEventListener("notificationschange", init);
  window.setInterval(init, 5000);
  window.Notifications = { init, getItems, addNotification, getUserNotifications, markAsRead };
})();
