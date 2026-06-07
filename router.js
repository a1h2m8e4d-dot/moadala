// ملوك المعادلة - محرك التنقل وإدارة الواجهات (Router)

class AppRouter {
  constructor() {
    this.routes = {};
    window.addEventListener('hashchange', () => this.handleRouting());
  }

  addRoute(path, renderFunction) {
    this.routes[path] = renderFunction;
  }

  navigateTo(path) {
    window.location.hash = path;
  }

  getPathAndParams() {
    const hash = window.location.hash.slice(1) || 'home';
    const parts = hash.split('?');
    const path = parts[0];
    const params = {};
    
    if (parts[1]) {
      const searchParams = new URLSearchParams(parts[1]);
      for (const [key, value] of searchParams.entries()) {
        params[key] = value;
      }
    }
    return { path, params };
  }

  handleRouting() {
    const { path, params } = this.getPathAndParams();
    const render = this.routes[path];
    
    // إخفاء القوائم المفتوحة والتمرير لأعلى الصفحة
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // تحديث الرابط النشط في القائمة الرئيسية
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('onclick');
      if (href && href.includes(path)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    if (render) {
      render(params);
    } else {
      // التوجيه التلقائي للصفحة الرئيسية في حال عدم وجود الصفحة
      this.navigateTo('home');
    }
  }
}

const router = new AppRouter();
window.router = router;
export default router;
