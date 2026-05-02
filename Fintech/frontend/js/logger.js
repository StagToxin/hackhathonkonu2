(function () {
  function currentUser() {
    return window.Auth?.getUser?.() || JSON.parse(window.localStorage.getItem("authUser") || window.localStorage.getItem("user") || "null") || {};
  }

  function logAction(entry) {
    const logs = JSON.parse(window.localStorage.getItem("systemLogs") || "[]");
    const user = currentUser();
    const row = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      user: user.email || "anonymous",
      userId: user.id || "anonymous",
      role: user.role || "guest",
      action: entry.action || entry.type || "event",
      type: entry.type || "PAGE_ACCESS",
      status: entry.status || "success",
      detail: entry
    };
    logs.unshift(row);
    if (logs.length > 1000) logs.splice(1000);
    window.localStorage.setItem("systemLogs", JSON.stringify(logs));
  }

  function logPageAccess() {
    logAction({
      type: "PAGE_ACCESS",
      action: "page.access",
      page: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent.slice(0, 100)
    });
  }

  if (!window.__prosichtLoggerBound) {
    window.__prosichtLoggerBound = true;
    window.addEventListener("error", (event) => {
      logAction({
        type: "JS_ERROR",
        status: "error",
        action: "error.javascript",
        message: event.message,
        file: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack?.slice(0, 500)
      });
    });
    window.addEventListener("unhandledrejection", (event) => {
      logAction({
        type: "PROMISE_ERROR",
        status: "error",
        action: "error.promise",
        reason: String(event.reason).slice(0, 500)
      });
    });
  }

  window.Logger = { logAction, logPageAccess };
})();
