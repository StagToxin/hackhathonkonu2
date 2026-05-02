(function () {
  function getUser() {
    return JSON.parse(window.localStorage.getItem("authUser") || "null");
  }

  function setSession(data, remember) {
    const storage = remember ? window.localStorage : window.sessionStorage;
    storage.setItem("authToken", data.token);
    storage.setItem("authUser", JSON.stringify(data.user));
    if (!remember) {
      window.localStorage.setItem("authToken", data.token);
      window.localStorage.setItem("authUser", JSON.stringify(data.user));
    }
  }

  function clearSession() {
    window.localStorage.removeItem("authToken");
    window.localStorage.removeItem("authUser");
    window.sessionStorage.removeItem("authToken");
    window.sessionStorage.removeItem("authUser");
  }

  function roleHome(role) {
    return role === "admin" ? "admin/dashboard.html" : "user/dashboard.html";
  }

  function relativeToRoot(path) {
    const depth = window.location.pathname.includes("/admin/") || window.location.pathname.includes("/user/") ? "../" : "";
    return `${depth}${path}`;
  }

  function requireAuth(role) {
    const user = getUser();
    if (!user) {
      window.location.href = relativeToRoot("index.html");
      return false;
    }
    if (role && user.role !== role) {
      window.location.href = relativeToRoot("403.html");
      return false;
    }
    return true;
  }

  function redirectIfAuthed() {
    const user = getUser();
    if (user) window.location.href = roleHome(user.role);
  }

  async function handleLogin(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!window.Validation.validateForm(form)) return;
    const button = form.querySelector("button[type='submit']");
    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span> Giriş yapılıyor';
    try {
      const result = await window.Api.login({
        email: form.email.value.trim(),
        password: form.password.value
      });
      setSession(result, form.remember.checked);
      window.Toast.show("Rolünüze göre panele yönlendiriliyorsunuz.", { type: "success" });
      window.setTimeout(() => {
        window.location.href = roleHome(result.user.role);
      }, 450);
    } catch (error) {
      window.Toast.show("E-posta veya şifre hatalı", { type: "error" });
      button.disabled = false;
      button.textContent = "Giriş Yap";
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!window.Validation.validateForm(form)) return;
    const button = form.querySelector("button[type='submit']");
    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span> Kayıt alınıyor';
    try {
      await window.Api.register({
        fullName: form.fullName.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value,
        companyName: form.companyName.value.trim(),
        taxNo: form.taxNo.value.trim(),
        phone: form.phone.value.trim()
      });
      window.Toast.show("Kaydınız alındı. Admin onayından sonra giriş yapabilirsiniz.", { type: "success", duration: 5600 });
      window.setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } catch (error) {
      window.Toast.show("Kayıt gönderilemedi. Lütfen bilgileri kontrol edin.", { type: "error" });
      button.disabled = false;
      button.textContent = "Hesap Oluştur";
    }
  }

  function bindCommon() {
    document.querySelectorAll("[data-logout]").forEach((button) => {
      button.addEventListener("click", () => {
        window.Api.log("auth.logout");
        clearSession();
        window.location.href = relativeToRoot("index.html");
      });
    });
    const user = getUser();
    document.querySelectorAll("[data-current-user]").forEach((node) => {
      node.textContent = user?.name || "Misafir";
    });
  }

  window.Auth = { getUser, requireAuth, redirectIfAuthed, handleLogin, handleRegister, clearSession, bindCommon };
})();
