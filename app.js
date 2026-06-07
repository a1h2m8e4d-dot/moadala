// ملوك المعادلة - نظام التحكم والعمليات المتقدم (App Logic)
import router from './router.js';

class AppState {
  constructor() {
    this.data = JSON.parse(localStorage.getItem('molok_data')) || defaultData;
    this.currentUser = JSON.parse(localStorage.getItem('molok_user')) || null;
    this.currentCourseId = null;
    this.currentLessonId = null;
    this.quizState = {
      questions: [],
      currentIdx: 0,
      answers: {},
      timeRemaining: 0,
      timerInterval: null
    };
    this.theme = localStorage.getItem('molok_theme') || 'light';
    this.wishlist = JSON.parse(localStorage.getItem('molok_wishlist')) || [];
  }

  save() {
    localStorage.setItem('molok_data', JSON.stringify(this.data));
    localStorage.setItem('molok_user', JSON.stringify(this.currentUser));
    localStorage.setItem('molok_wishlist', JSON.stringify(this.wishlist));
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('molok_theme', this.theme);
    this.applyTheme();
  }

  applyTheme() {
    if (this.theme === 'dark') {
      document.body.classList.add('dark-mode');
      const icon = document.querySelector('.theme-toggle i');
      if (icon) icon.className = 'fas fa-sun';
    } else {
      document.body.classList.remove('dark-mode');
      const icon = document.querySelector('.theme-toggle i');
      if (icon) icon.className = 'fas fa-moon';
    }
  }

  login(email, password) {
    const user = this.data.users?.find(u => u.email === email && u.password === password);
    if (user) {
      if (user.suspended) {
        alert("عذراً، تم تجميد هذا الحساب مؤقتاً. يرجى التواصل مع الدعم.");
        return false;
      }
      this.currentUser = user;
      this.save();
      this.updateNavbar();
      router.navigateTo('student-dashboard');
      return true;
    }
    // حساب تجريبي سريع في حال لم تكن مسجلة مسبقاً
    if (email === 'student@molok.com' && password === '123456') {
      this.currentUser = { name: "طالب تجريبي", email, role: 'student', progress: {}, certificates: [], id: "demo-student" };
      this.save();
      this.updateNavbar();
      router.navigateTo('student-dashboard');
      return true;
    } else if (email === 'admin@molok.com' && password === 'admin123') {
      this.currentUser = { name: "المدير العام", email, role: 'admin', id: "admin-id" };
      this.save();
      this.updateNavbar();
      router.navigateTo('admin-dashboard');
      return true;
    }
    alert("بيانات الدخول غير صحيحة.");
    return false;
  }

  register(name, email, password) {
    if (!this.data.users) this.data.users = [];
    if (this.data.users.find(u => u.email === email)) {
      alert("البريد الإلكتروني مسجل بالفعل.");
      return false;
    }
    const newUser = { id: 'u_' + Date.now(), name, email, password, role: 'student', progress: {}, certificates: [] };
    this.data.users.push(newUser);
    this.currentUser = newUser;
    this.save();
    this.updateNavbar();
    alert("تم إنشاء الحساب بنجاح!");
    router.navigateTo('student-dashboard');
    return true;
  }

  logout() {
    this.currentUser = null;
    this.save();
    this.updateNavbar();
    router.navigateTo('home');
  }

  updateNavbar() {
    const navActions = document.getElementById('nav-actions');
    if (!navActions) return;

    if (this.currentUser) {
      const dashboardLink = this.currentUser.role === 'admin' ? 'admin-dashboard' : 'student-dashboard';
      navActions.innerHTML = `
        <button class="theme-toggle" onclick="app.toggleTheme()" title="تغيير المظهر">
          <i class="fas ${this.theme === 'light' ? 'fa-moon' : 'fa-sun'}"></i>
        </button>
        <span class="user-greeting" style="font-weight: 700; color: var(--text-secondary); margin-left: 10px;">أهلاً، ${this.currentUser.name}</span>
        <button class="btn btn-outline" onclick="router.navigateTo('${dashboardLink}')">لوحة التحكم</button>
        <button class="btn btn-text" onclick="app.logout()"><i class="fas fa-sign-out-alt"></i> خروج</button>
      `;
    } else {
      navActions.innerHTML = `
        <button class="theme-toggle" onclick="app.toggleTheme()" title="تغيير المظهر">
          <i class="fas ${this.theme === 'light' ? 'fa-moon' : 'fa-sun'}"></i>
        </button>
        <button class="btn btn-text" onclick="router.navigateTo('login')">تسجيل الدخول</button>
        <button class="btn btn-primary" onclick="router.navigateTo('register')">ابدأ مجاناً</button>
      `;
    }
  }
}

const app = new AppState();
window.app = app;

// تفعيل وتأصيل المظهر المناسب عند التحميل
document.addEventListener('DOMContentLoaded', () => {
  app.applyTheme();
  app.updateNavbar();
});

// تعريف صفحات المنصة والتفاعلات

// 1. الصفحة الرئيسية
router.addRoute('home', () => {
  const root = document.getElementById('app');
  let faqHTML = app.data.faq.map((item, idx) => `
    <div class="feature-card" style="padding: 24px; cursor: pointer; margin-bottom: 15px;" onclick="document.getElementById('faq-ans-${idx}').style.display = document.getElementById('faq-ans-${idx}').style.display === 'none' ? 'block' : 'none'">
      <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 700;">
        <span>${item.q}</span>
        <i class="fas fa-chevron-down" style="color: var(--accent);"></i>
      </div>
      <p id="faq-ans-${idx}" style="display: none; margin-top: 15px; font-size: 14px; color: var(--text-secondary); line-height: 1.8;">${item.a}</p>
    </div>
  `).join('');

  root.innerHTML = `
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-content">
          <span class="hero-tag"><i class="fas fa-graduation-cap"></i> رفيقك الأول للتجارة</span>
          <h1 class="hero-title">طريقك للنجاح في المعادلة <span>يبدأ من هنا</span></h1>
          <p class="hero-subtitle">أقوى منصة تعليمية متخصصة في إعداد طلاب معادلة كلية التجارة في مصر، مع نخبة من الأساتذة ومناهج شاملة واختبارات تفاعلية متكاملة.</p>
          <div class="hero-buttons">
            <button class="btn btn-primary btn-accent" onclick="router.navigateTo('register')">ابدأ الآن مجاناً</button>
            <button class="btn btn-outline" onclick="router.navigateTo('courses')">شاهد الكورسات</button>
          </div>
        </div>
        <div class="hero-illustration">
          <div class="hero-circle-bg"></div>
          <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600" class="hero-img" alt="طلاب المعادلة">
        </div>
      </div>
    </section>

    <section class="container" style="margin-bottom: 80px;">
      <div class="stats-bar">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number" id="stat-students">${app.data.statistics.students}+</div>
            <div class="stat-label">طالب نشط</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">${app.data.statistics.courses}</div>
            <div class="stat-label">كورسات متخصصة</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">${app.data.statistics.lessons}+</div>
            <div class="stat-label">درس مرئي</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">${app.data.statistics.exams}+</div>
            <div class="stat-label">اختبار إلكتروني</div>
          </div>
          <div class="stat-item">
            <div class="stat-number" style="color: var(--success);">${app.data.statistics.successRate}%</div>
            <div class="stat-label">نسبة النجاح</div>
          </div>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="container">
        <div class="section-header">
          <span class="section-subtitle">لماذا ملوك المعادلة؟</span>
          <h2 class="section-title">مميزات المنصة التعليمية المتكاملة</h2>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon-wrapper"><i class="fas fa-book-open"></i></div>
            <h3 class="feature-card-title">شرح مبسط ومنظم</h3>
            <p class="feature-card-desc">فيديوهات مصممة بأسلوب ممتع يربط بين الفهم وحل الأسئلة بسرعة واحترافية.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-wrapper"><i class="fas fa-file-signature"></i></div>
            <h3 class="feature-card-title">اختبارات إلكترونية</h3>
            <p class="feature-card-desc">اختبارات دورية تحاكي النظام الحقيقي بابل شيت مع تصحيح فوري وشرح مفصل للمسائل.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-wrapper"><i class="fas fa-chart-line"></i></div>
            <h3 class="feature-card-title">متابعة مستوى الطالب</h3>
            <p class="feature-card-desc">لوحة تحكم خاصة ترصد تقدمك الدراسي والدروس المتبقية وتقييم مستواك الفعلي أولاً بأول.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon-wrapper"><i class="fas fa-graduation-cap"></i></div>
            <h3 class="feature-card-title">شهادات إتمام الكورس</h3>
            <p class="feature-card-desc">احصل على شهادة تفاعلية موثقة برقم تعريفي فور إتمامك كافة الدروس والاختبارات.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="container" style="padding: 80px 0;">
      <div class="section-header">
        <span class="section-subtitle">آراء الملوك</span>
        <h2 class="section-title">قصص نجاح طلابنا في كلية التجارة</h2>
      </div>
      <div class="features-grid">
        <div class="feature-card" style="border-radius: var(--radius-md);">
          <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 15px;">
            <i class="fas fa-star" style="color: var(--accent);"></i>
            <i class="fas fa-star" style="color: var(--accent);"></i>
            <i class="fas fa-star" style="color: var(--accent);"></i>
            <i class="fas fa-star" style="color: var(--accent);"></i>
            <i class="fas fa-star" style="color: var(--accent);"></i>
          </div>
          <p style="font-size: 14px; line-height: 1.8; color: var(--text-secondary); margin-bottom: 20px;">"المنصة ممتازة جداً، بفضل الله وبفضل شرح الأساتذة تم قبولى بكلية التجارة جامعة القاهرة بعد نجاحي بالمعادلة."</p>
          <h4 style="font-weight: 700;">كريم ممدوح - دفعة 2025</h4>
        </div>
        <div class="feature-card" style="border-radius: var(--radius-md);">
          <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 15px;">
            <i class="fas fa-star" style="color: var(--accent);"></i>
            <i class="fas fa-star" style="color: var(--accent);"></i>
            <i class="fas fa-star" style="color: var(--accent);"></i>
            <i class="fas fa-star" style="color: var(--accent);"></i>
            <i class="fas fa-star" style="color: var(--accent);"></i>
          </div>
          <p style="font-size: 14px; line-height: 1.8; color: var(--text-secondary); margin-bottom: 20px;">"بنك الأسئلة الإلكتروني والاختبارات الأسبوعية كانت أفضل وسيلة للتدرب على نظام البابل شيت."</p>
          <h4 style="font-weight: 700;">سارة جمال - جامعة عين شمس</h4>
        </div>
      </div>
    </section>

    <section class="container" style="margin-bottom: 80px;">
      <div class="section-header">
        <span class="section-subtitle">الأسئلة الشائعة</span>
        <h2 class="section-title">كل ما تريد معرفته عن المعادلة</h2>
      </div>
      <div style="max-width: 800px; margin: 0 auto;">
        ${faqHTML}
      </div>
    </section>
  `;
});

// 2. الكورسات والمناهج
router.addRoute('courses', (params) => {
  const root = document.getElementById('app');
  const activeCat = params.category || 'all';

  const categories = [
    { id: 'all', name: 'الكل' },
    { id: 'math', name: 'الرياضيات' },
    { id: 'geography', name: 'الجغرافيا' },
    { id: 'english', name: 'الانجليزي' },
    { id: 'french', name: 'الفرنساوي' }
  ];

  const filteredCourses = activeCat === 'all' 
    ? app.data.courses 
    : app.data.courses.filter(c => c.category === activeCat);

  const catButtons = categories.map(cat => `
    <button class="cat-btn ${activeCat === cat.id ? 'active' : ''}" 
      onclick="router.navigateTo('courses?category=${cat.id}')">${cat.name}</button>
  `).join('');

  const courseCards = filteredCourses.map(course => {
    const isWish = app.wishlist.includes(course.id) ? 'fas' : 'far';
    return `
      <div class="course-card">
        <div class="course-banner">
          <img src="${course.thumbnail}" alt="${course.title}">
          <span class="course-badge">${course.categoryName}</span>
          <button style="position: absolute; left: 15px; top: 15px; border: none; background: white; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);" onclick="app.toggleWishlist('${course.id}', event)">
            <i class="${isWish} fa-heart" style="color: #ef4444;"></i>
          </button>
        </div>
        <div class="course-body">
          <h3 class="course-title">${course.title}</h3>
          <div class="course-instructor">
            <i class="fas fa-chalkboard-teacher" style="color: var(--accent);"></i>
            <span>${course.instructor.name}</span>
          </div>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${course.description}</p>
          <div class="course-meta">
            <div class="course-meta-item"><i class="far fa-clock"></i> <span>${course.stats.duration}</span></div>
            <div class="course-meta-item"><i class="far fa-play-circle"></i> <span>${course.stats.lessonsCount} درس</span></div>
            <div class="course-meta-item"><i class="fas fa-star"></i> <span>${course.stats.rating}</span></div>
          </div>
          <button class="btn btn-primary" style="margin-top: 15px; width: 100%;" onclick="router.navigateTo('course-details?id=${course.id}')">تفاصيل الكورس</button>
        </div>
      </div>
    `;
  }).join('');

  root.innerHTML = `
    <div class="container" style="padding: 60px 0;">
      <div class="section-header">
        <span class="section-subtitle">المناهج المعتمدة</span>
        <h2 class="section-title">كورسات ملوك المعادلة</h2>
      </div>

      <div class="category-filter">
        ${catButtons}
      </div>

      <div class="courses-grid">
        ${courseCards.length ? courseCards : '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">لا توجد كورسات في هذا القسم حالياً.</p>'}
      </div>
    </div>
  `;
});

// 3. تفاصيل الكورس
router.addRoute('course-details', (params) => {
  const root = document.getElementById('app');
  const course = app.data.courses.find(c => c.id === params.id);
  if (!course) {
    root.innerHTML = '<div class="container"><p>الكورس غير موجود.</p></div>';
    return;
  }

  // التحقق من اشتراك الطالب
  const isEnrolled = app.currentUser && app.currentUser.progress && app.currentUser.progress[course.id];

  const lessonRows = course.lessons.map((lesson, idx) => `
    <div class="lesson-row">
      <div class="lesson-info">
        <div class="lesson-icon"><i class="fas fa-play"></i></div>
        <div>
          <h4 style="font-weight: 700; font-size: 15px;">${lesson.title}</h4>
          <span style="font-size: 12px; color: var(--text-tertiary);"><i class="far fa-clock"></i> ${lesson.duration}</span>
        </div>
      </div>
      ${isEnrolled 
        ? `<button class="btn btn-outline" onclick="router.navigateTo('lesson-player?courseId=${course.id}&lessonId=${lesson.id}')">مشاهدة الآن</button>`
        : `<span style="font-size: 12px; color: var(--text-tertiary);"><i class="fas fa-lock"></i> مقفل</span>`
      }
    </div>
  `).join('');

  const enrollBtn = isEnrolled
    ? `<button class="btn btn-success" style="width: 100%; margin-bottom: 15px; background-color: var(--success); color: white;" onclick="router.navigateTo('lesson-player?courseId=${course.id}&lessonId=${course.lessons[0].id}')"><i class="fas fa-play-circle"></i> متابعة الدراسة</button>`
    : `<button class="btn btn-primary" style="width: 100%; margin-bottom: 15px;" onclick="app.enrollInCourse('${course.id}')"><i class="fas fa-plus"></i> الاشتراك في الكورس مجاناً</button>`;

  root.innerHTML = `
    <div class="course-details-hero">
      <div class="container course-details-grid">
        <div>
          <span class="hero-tag" style="margin-bottom: 15px;">${course.categoryName}</span>
          <h1 style="font-size: 32px; font-weight: 800; margin-bottom: 15px;">${course.title}</h1>
          <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: 25px;">${course.description}</p>
          
          <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 30px;">
            <img src="${course.instructor.avatar}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;" alt="">
            <div>
              <h4 style="font-weight: 700;">بإشراف: ${course.instructor.name}</h4>
              <span style="font-size: 13px; color: var(--text-tertiary);">${course.instructor.title}</span>
            </div>
          </div>
        </div>
        <div>
          <div style="background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 25px; box-shadow: var(--card-shadow);">
            <img src="${course.thumbnail}" style="width: 100%; border-radius: var(--radius-sm); margin-bottom: 20px;" alt="">
            ${enrollBtn}
            <div style="display: flex; flex-direction: column; gap: 12px; font-size: 14px; color: var(--text-secondary); border-top: 1px solid var(--border-color); padding-top: 15px;">
              <div><i class="fas fa-video" style="color: var(--accent); margin-left: 8px;"></i> ${course.lessons.length} درس مرئي عالي الدقة</div>
              <div><i class="far fa-file-pdf" style="color: var(--accent); margin-left: 8px;"></i> ملخصات وكتب إلكترونية PDF</div>
              <div><i class="fas fa-question-circle" style="color: var(--accent); margin-left: 8px;"></i> اختبارات وتقييمات بابل شيت</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container" style="padding: 50px 0;">
      <div class="course-details-grid">
        <div>
          <h2 style="font-size: 24px; font-weight: 800; margin-bottom: 20px;">محتوى الكورس</h2>
          <div class="curriculum-accordion">
            ${lessonRows}
          </div>
        </div>
        <div>
          <h2 style="font-size: 24px; font-weight: 800; margin-bottom: 20px;">عن المحاضر</h2>
          <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 25px;">
            <p style="font-size: 14px; line-height: 1.8; color: var(--text-secondary);">${course.instructor.bio}</p>
          </div>
        </div>
      </div>
    </div>
  `;
});

// 4. مشغل المناهج المتقدم
router.addRoute('lesson-player', (params) => {
  const root = document.getElementById('app');
  if (!app.currentUser) {
    alert("يرجى تسجيل الدخول أولاً.");
    router.navigateTo('login');
    return;
  }

  const course = app.data.courses.find(c => c.id === params.courseId);
  if (!course) {
    root.innerHTML = '<div class="container"><p>الكورس غير موجود.</p></div>';
    return;
  }

  // التحقق من اشتراك الطالب
  if (!app.currentUser.progress[course.id]) {
    alert("أنت غير مشترك في هذا الكورس بعد.");
    router.navigateTo(`course-details?id=${course.id}`);
    return;
  }

  const lesson = course.lessons.find(l => l.id === params.lessonId) || course.lessons[0];
  app.currentCourseId = course.id;
  app.currentLessonId = lesson.id;

  // قائمة التشغيل الجانبية
  const playlistItems = course.lessons.map(l => {
    const isCompleted = app.currentUser.progress[course.id]?.completedLessons?.includes(l.id);
    const isActive = l.id === lesson.id;
    return `
      <div class="playlist-item ${isActive ? 'active' : ''}" 
        onclick="router.navigateTo('lesson-player?courseId=${course.id}&lessonId=${l.id}')">
        <i class="${isCompleted ? 'fas fa-check-circle' : 'far fa-play-circle'}" style="color: ${isCompleted ? 'var(--success)' : 'inherit'};"></i>
        <div style="flex-grow: 1;">
          <h5 style="font-weight: 700; font-size: 14px;">${l.title}</h5>
          <span style="font-size: 11px; opacity: 0.8;">${l.duration}</span>
        </div>
      </div>
    `;
  }).join('');

  // استرجاع زمن المشاهدة السابق للدرس
  const lastTime = app.currentUser.progress[course.id]?.lastPositions?.[lesson.id] || 0;

  // جلب أسئلة المنتدى المتعلقة بهذا الكورس
  const qas = app.data.community.filter(q => q.courseId === course.id);
  const qaHTML = qas.map(q => {
    const bestReply = q.replies.find(r => r.isBest);
    return `
      <div class="qa-card" onclick="app.showQAThread('${q.id}')" style="cursor: pointer;">
        <h4 style="font-weight: 700; font-size: 16px; margin-bottom: 8px;">${q.title}</h4>
        <div class="qa-author">
          <span><i class="far fa-user"></i> ${q.author}</span>
          <span><i class="far fa-calendar"></i> ${q.date}</span>
          <span><i class="far fa-comments"></i> ${q.replies.length} ردود</span>
        </div>
        ${bestReply ? `
          <div style="background-color: var(--primary-light); padding: 12px; border-radius: var(--radius-sm); margin-top: 10px; font-size: 13px;">
            <strong>إجابة الأستاذ:</strong> ${bestReply.content}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  root.innerHTML = `
    <div class="container player-layout">
      <div>
        <div class="video-container">
          <video id="custom-video-player" class="custom-video" controls autoplay src="${lesson.videoUrl}"></video>
          <div class="video-overlay-protection">${app.currentUser.name} | ملوك المعادلة</div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
          <h2 style="font-size: 22px; font-weight: 800;">${lesson.title}</h2>
          <button class="btn btn-success" id="btn-complete-lesson" onclick="app.markLessonComplete('${course.id}', '${lesson.id}')">
            <i class="fas fa-check"></i> تحديد كـ مكتمل
          </button>
        </div>

        <div class="lesson-resources-tabs">
          <div class="tab-nav">
            <button class="tab-btn active" onclick="app.switchTab('resources')">المرفقات والكتب</button>
            <button class="tab-btn" onclick="app.switchTab('notes')">ملاحظات المحاضرة</button>
            <button class="tab-btn" onclick="app.switchTab('qa')">مناقشات الطلاب (${qas.length})</button>
          </div>
          
          <div id="tab-content-resources" class="tab-panel">
            <div style="display: flex; flex-direction: column; gap: 15px;">
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
                <div>
                  <h4 style="font-weight: 700;"><i class="far fa-file-pdf" style="color: var(--danger); margin-left: 8px;"></i> كتاب المنهج الرسمي - PDF</h4>
                  <p style="font-size: 12px; color: var(--text-secondary);">ملخص شامل لجميع فصول الدرس</p>
                </div>
                <a href="${lesson.pdfUrl}" target="_blank" class="btn btn-outline btn-text"><i class="fas fa-download"></i> تحميل ملخص PDF</a>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
                <div>
                  <h4 style="font-weight: 700;"><i class="fas fa-tasks" style="color: var(--accent); margin-left: 8px;"></i> الواجب والتمارين المنزلية</h4>
                  <p style="font-size: 12px; color: var(--text-secondary);">${lesson.homework}</p>
                </div>
              </div>
            </div>
          </div>

          <div id="tab-content-notes" class="tab-panel" style="display: none; background: var(--bg-secondary); padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <p style="line-height: 1.8; font-size: 14px;">${lesson.notes}</p>
          </div>

          <div id="tab-content-qa" class="tab-panel" style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h3 style="font-size: 18px; font-weight: 700;">اسأل واستفسر</h3>
              <button class="btn btn-primary" onclick="app.openNewQAQuestion('${course.id}')"><i class="fas fa-plus"></i> طرح سؤال جديد</button>
            </div>
            ${qaHTML}
          </div>
        </div>
      </div>

      <div>
        <div class="playlist-card">
          <div class="playlist-header">فهرس الكورس</div>
          <div style="max-height: 350px; overflow-y: auto;">
            ${playlistItems}
          </div>
          <button class="btn btn-accent" style="width: 100%; margin-top: 20px;" onclick="router.navigateTo('exam?courseId=${course.id}')">
            <i class="fas fa-file-alt"></i> الانتقال للامتحان التقييمي
          </button>
        </div>
      </div>
    </div>
  `;

  // إعداد وتفعيل استرجاع زمن الفيديو
  setTimeout(() => {
    const video = document.getElementById('custom-video-player');
    if (video) {
      if (lastTime > 0) {
        video.currentTime = lastTime;
      }
      video.addEventListener('timeupdate', () => {
        app.saveVideoPosition(course.id, lesson.id, video.currentTime);
      });
      video.addEventListener('ended', () => {
        app.handleVideoEnded(course.id, lesson.id);
      });
    }
  }, 100);
});

// 5. نظام الاختبارات والتقييم الذاتي
router.addRoute('exam', (params) => {
  const root = document.getElementById('app');
  if (!app.currentUser) {
    alert("يرجى تسجيل الدخول أولاً.");
    router.navigateTo('login');
    return;
  }

  const questions = app.data.questionBank.filter(q => q.courseId === params.courseId);
  if (!questions.length) {
    root.innerHTML = '<div class="container"><p>لا توجد أسئلة متوفرة لهذا الكورس حالياً.</p></div>';
    return;
  }

  // تهيئة حالة الاختبار
  app.quizState = {
    courseId: params.courseId,
    questions: questions,
    currentIdx: 0,
    answers: {},
    timeRemaining: questions.length * 90, // 90 ثانية لكل سؤال
    timerInterval: null
  };

  app.startExamTimer();
  app.renderQuizQuestion();
});

// 6. لوحة تحكم الطالب
router.addRoute('student-dashboard', () => {
  const root = document.getElementById('app');
  if (!app.currentUser) {
    router.navigateTo('login');
    return;
  }

  // حساب معدلات النجاح والتقدم
  const enrolledCourses = Object.keys(app.currentUser.progress || {});
  const courseCards = enrolledCourses.map(cId => {
    const course = app.data.courses.find(c => c.id === cId);
    if (!course) return '';
    const progress = app.currentUser.progress[cId];
    const compCount = progress.completedLessons?.length || 0;
    const totalCount = course.lessons.length;
    const pct = totalCount > 0 ? Math.round((compCount / totalCount) * 100) : 0;
    
    return `
      <div class="feature-card" style="padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <h4 style="font-weight: 700; margin-bottom: 10px;">${course.title}</h4>
          <span style="font-size: 12px; color: var(--text-tertiary);">معدل التقدم: ${pct}%</span>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${pct}%;"></div>
          </div>
        </div>
        <div style="margin-top: 20px; display: flex; gap: 10px;">
          <button class="btn btn-primary btn-sm" onclick="router.navigateTo('lesson-player?courseId=${course.id}')" style="font-size: 13px; padding: 6px 12px;">متابعة</button>
          ${pct >= 100 ? `<button class="btn btn-accent btn-sm" onclick="app.generateCertificate('${course.id}')" style="font-size: 13px; padding: 6px 12px;">الشهادة</button>` : ''}
        </div>
      </div>
    `;
  }).join('');

  root.innerHTML = `
    <div class="container dashboard-layout">
      <div class="dashboard-sidebar">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background-color: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 15px auto;">
            <i class="fas fa-user-graduate"></i>
          </div>
          <h3 style="font-weight: 800;">${app.currentUser.name}</h3>
          <span style="font-size: 12px; color: var(--text-tertiary);">طالب مسجل</span>
        </div>
        <ul class="dashboard-sidebar-menu">
          <li class="dashboard-sidebar-item active" onclick="router.navigateTo('student-dashboard')"><i class="fas fa-columns"></i> لوحة التحكم</li>
          <li class="dashboard-sidebar-item" onclick="router.navigateTo('courses')"><i class="fas fa-graduation-cap"></i> استعراض الكورسات</li>
        </ul>
      </div>

      <div>
        <h2 style="font-size: 28px; font-weight: 800; margin-bottom: 25px;">مرحباً بك مجدداً في ملوك المعادلة</h2>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px;">
          <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); padding: 20px; border-radius: var(--radius-md); text-align: center;">
            <span style="font-size: 13px; color: var(--text-secondary);">الكورسات المشترك بها</span>
            <h3 style="font-size: 32px; font-weight: 800; margin-top: 5px; color: var(--primary);">${enrolledCourses.length}</h3>
          </div>
          <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); padding: 20px; border-radius: var(--radius-md); text-align: center;">
            <span style="font-size: 13px; color: var(--text-secondary);">شهادات الإتمام</span>
            <h3 style="font-size: 32px; font-weight: 800; margin-top: 5px; color: var(--success);">${app.currentUser.certificates?.length || 0}</h3>
          </div>
          <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); padding: 20px; border-radius: var(--radius-md); text-align: center;">
            <span style="font-size: 13px; color: var(--text-secondary);">المفضلة</span>
            <h3 style="font-size: 32px; font-weight: 800; margin-top: 5px; color: var(--accent);">${app.wishlist.length}</h3>
          </div>
        </div>

        <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 20px;">مناهجك الدراسية الحالية</h3>
        <div class="features-grid">
          ${courseCards.length ? courseCards : '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">أنت غير مشترك في أي كورس حالياً. استعرض الكورسات وابدأ الآن.</p>'}
        </div>
      </div>
    </div>
  `;
});

// 7. لوحة تحكم الإدارة (Admin Dashboard)
router.addRoute('admin-dashboard', () => {
  const root = document.getElementById('app');
  if (!app.currentUser || app.currentUser.role !== 'admin') {
    router.navigateTo('login');
    return;
  }

  const activeStudents = app.data.users?.filter(u => u.role === 'student') || [];
  
  // بناء جدول الطلاب والتحكم بهم
  const studentRows = activeStudents.map(student => `
    <tr>
      <td>${student.name}</td>
      <td>${student.email}</td>
      <td>${Object.keys(student.progress || {}).length} كورسات</td>
      <td>
        <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px; border-color: ${student.suspended ? 'var(--success)' : 'var(--danger)'}; color: ${student.suspended ? 'var(--success)' : 'var(--danger)'};" onclick="app.toggleUserSuspension('${student.id}')">
          ${student.suspended ? 'تنشيط الحساب' : 'تجميد الحساب'}
        </button>
      </td>
    </tr>
  `).join('');

  root.innerHTML = `
    <div class="container" style="padding: 40px 0;">
      <h2 style="font-size: 28px; font-weight: 800; margin-bottom: 25px;">لوحة تحكم الإدارة والتحليلات العامة</h2>

      <div class="admin-metrics-grid">
        <div class="metric-card">
          <div class="metric-info">
            <h4>إجمالي الطلاب</h4>
            <span>${activeStudents.length + 120}</span>
          </div>
          <div class="metric-icon"><i class="fas fa-users"></i></div>
        </div>
        <div class="metric-card">
          <div class="metric-info">
            <h4>الكورسات المنشورة</h4>
            <span>${app.data.courses.length}</span>
          </div>
          <div class="metric-icon" style="background-color: var(--primary-light); color: var(--primary);"><i class="fas fa-book"></i></div>
        </div>
        <div class="metric-card">
          <div class="metric-info">
            <h4>أسئلة بنك الأسئلة</h4>
            <span>${app.data.questionBank.length}</span>
          </div>
          <div class="metric-icon"><i class="fas fa-database"></i></div>
        </div>
        <div class="metric-card">
          <div class="metric-info">
            <h4>معدل إتمام الدراسة</h4>
            <span>87%</span>
          </div>
          <div class="metric-icon" style="background-color: rgba(16, 185, 129, 0.15); color: var(--success);"><i class="fas fa-check-double"></i></div>
        </div>
      </div>

      <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 25px; margin-bottom: 40px;">
        <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 20px;">نظرة على إحصائيات التفاعل الأسبوعية</h3>
        <div style="height: 150px; background-color: var(--bg-tertiary); border-radius: var(--radius-sm); display: flex; align-items: flex-end; justify-content: space-around; padding: 20px;">
          <div style="width: 40px; height: 40%; background-color: var(--primary); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px;">السبت</div>
          <div style="width: 40px; height: 60%; background-color: var(--primary); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px;">الأحد</div>
          <div style="width: 40px; height: 85%; background-color: var(--primary); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px;">الإثنين</div>
          <div style="width: 40px; height: 95%; background-color: var(--accent); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px;">اليوم</div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="font-size: 20px; font-weight: 800;">إدارة الحسابات والطلاب</h3>
        <button class="btn btn-primary" onclick="app.adminCreateCourse()"><i class="fas fa-plus"></i> إضافة كورس جديد</button>
      </div>

      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>اسم الطالب</th>
              <th>البريد الإلكتروني</th>
              <th>الاشتراكات</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${studentRows.length ? studentRows : '<tr><td colspan="4" style="text-align: center;">لا يوجد طلاب مسجلين حالياً.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
});

// 8. تسجيل الدخول
router.addRoute('login', () => {
  const root = document.getElementById('app');
  root.innerHTML = `
    <div class="auth-container">
      <div class="auth-header">
        <h2 style="font-size: 24px; font-weight: 800;">تسجيل الدخول</h2>
        <p style="font-size: 13px; color: var(--text-secondary); margin-top: 8px;">مرحباً بك مجدداً في ملوك المعادلة</p>
      </div>
      <form onsubmit="event.preventDefault(); app.login(this.email.value, this.password.value);">
        <div class="form-group">
          <label class="form-label">البريد الإلكتروني</label>
          <input type="email" name="email" class="form-input" placeholder="name@example.com" required>
        </div>
        <div class="form-group">
          <label class="form-label">كلمة المرور</label>
          <input type="password" name="password" class="form-input" placeholder="••••••••" required>
        </div>
        <div class="form-group" style="display: flex; justify-content: space-between; align-items: center;">
          <label class="form-checkbox">
            <input type="checkbox"> تذكرني
          </label>
          <a onclick="router.navigateTo('forgot-password')" style="font-size: 13px; color: var(--primary); cursor: pointer;">نسيت كلمة المرور؟</a>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">دخول</button>
      </form>
      <p style="text-align: center; font-size: 13px; color: var(--text-secondary); margin-top: 25px;">
        ليس لديك حساب؟ <a onclick="router.navigateTo('register')" style="color: var(--primary); font-weight: 700; cursor: pointer;">إنشاء حساب جديد</a>
      </p>
      <div style="margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 15px; text-align: center;">
        <p style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 10px;">أو سجل دخول سريعاً بـ:</p>
        <button class="btn btn-outline" style="width: 100%; font-size: 13px; margin-bottom: 8px;" onclick="document.querySelector('input[name=email]').value='student@molok.com'; document.querySelector('input[name=password]').value='123456';">طالب تجريبي</button>
        <button class="btn btn-outline" style="width: 100%; font-size: 13px;" onclick="document.querySelector('input[name=email]').value='admin@molok.com'; document.querySelector('input[name=password]').value='admin123';">مسؤول الإدارة</button>
      </div>
    </div>
  `;
});

// 9. إنشاء حساب جديد
router.addRoute('register', () => {
  const root = document.getElementById('app');
  root.innerHTML = `
    <div class="auth-container">
      <div class="auth-header">
        <h2 style="font-size: 24px; font-weight: 800;">إنشاء حساب جديد</h2>
        <p style="font-size: 13px; color: var(--text-secondary); margin-top: 8px;">ابدأ رحلة التفوق واجتياز المعادلة معنا</p>
      </div>
      <form onsubmit="event.preventDefault(); if(this.password.value !== this.confirm.value) { alert('كلمتا المرور غير متطابقتين.'); return; } app.register(this.name.value, this.email.value, this.password.value);">
        <div class="form-group">
          <label class="form-label">الاسم الكامل</label>
          <input type="text" name="name" class="form-input" placeholder="اكتب اسمك ثلاثياً" required>
        </div>
        <div class="form-group">
          <label class="form-label">البريد الإلكتروني</label>
          <input type="email" name="email" class="form-input" placeholder="name@example.com" required>
        </div>
        <div class="form-group">
          <label class="form-label">كلمة المرور</label>
          <input type="password" name="password" class="form-input" placeholder="••••••••" required>
        </div>
        <div class="form-group">
          <label class="form-label">تأكيد كلمة المرور</label>
          <input type="password" name="confirm" class="form-input" placeholder="••••••••" required>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">إنشاء حساب</button>
      </form>
      <p style="text-align: center; font-size: 13px; color: var(--text-secondary); margin-top: 25px;">
        لديك حساب بالفعل؟ <a onclick="router.navigateTo('login')" style="color: var(--primary); font-weight: 700; cursor: pointer;">سجل الدخول</a>
      </p>
    </div>
  `;
});

// 10. استعادة كلمة المرور
router.addRoute('forgot-password', () => {
  const root = document.getElementById('app');
  root.innerHTML = `
    <div class="auth-container">
      <div class="auth-header">
        <h2 style="font-size: 24px; font-weight: 800;">استعادة كلمة المرور</h2>
        <p style="font-size: 13px; color: var(--text-secondary); margin-top: 8px;">أدخل بريدك الإلكتروني وسنرسل لك رابط التعيين</p>
      </div>
      <form onsubmit="event.preventDefault(); alert('تم إرسال رابط تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح!'); router.navigateTo('login');">
        <div class="form-group">
          <label class="form-label">البريد الإلكتروني</label>
          <input type="email" name="email" class="form-input" placeholder="name@example.com" required>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">إرسال رابط التعيين</button>
      </form>
      <p style="text-align: center; font-size: 13px; color: var(--text-secondary); margin-top: 25px;">
        <a onclick="router.navigateTo('login')" style="color: var(--primary); font-weight: 700; cursor: pointer;">العودة لتسجيل الدخول</a>
      </p>
    </div>
  `;
});

// 11. صفحات سياسة الخصوصية والشروط والأحكام و اتصل بنا
router.addRoute('privacy', () => {
  const root = document.getElementById('app');
  root.innerHTML = `
    <div class="container" style="padding: 60px 0; max-width: 800px;">
      <h1 style="font-size: 32px; font-weight: 800; margin-bottom: 25px;">سياسة الخصوصية</h1>
      <p style="line-height: 1.8; color: var(--text-secondary);">نحن في ملوك المعادلة نلتزم بحفظ خصوصيتك التامة وسلامة بياناتك الشخصية والدراسية، ولا نقوم بمشاركتها مع أي جهة خارجية أو أطراف ثالثة دون إذنك المسبق.</p>
    </div>
  `;
});

router.addRoute('terms', () => {
  const root = document.getElementById('app');
  root.innerHTML = `
    <div class="container" style="padding: 60px 0; max-width: 800px;">
      <h1 style="font-size: 32px; font-weight: 800; margin-bottom: 25px;">الشروط والأحكام</h1>
      <p style="line-height: 1.8; color: var(--text-secondary);">جميع الحقوق والمواد المعروضة على منصة ملوك المعادلة هي ملكية فكرية محمية، ولا يسمح بإعادة تسجيلها أو بثها خارج إطار المنصة دون موافقة الإدارة العامة.</p>
    </div>
  `;
});

router.addRoute('contact', () => {
  const root = document.getElementById('app');
  root.innerHTML = `
    <div class="container" style="padding: 60px 0; max-width: 600px;">
      <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 40px;">
        <h2 style="font-size: 28px; font-weight: 800; margin-bottom: 20px; text-align: center;">اتصل بنا</h2>
        <form onsubmit="event.preventDefault(); alert('تم إرسال رسالتك بنجاح! وسنتواصل معك قريباً.'); this.reset();">
          <div class="form-group">
            <label class="form-label">الاسم الكامل</label>
            <input type="text" class="form-input" required>
          </div>
          <div class="form-group">
            <label class="form-label">البريد الإلكتروني</label>
            <input type="email" class="form-input" required>
          </div>
          <div class="form-group">
            <label class="form-label">الرسالة</label>
            <textarea class="form-input" rows="5" style="resize: none;" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">إرسال الرسالة</button>
        </form>
        
        <div style="margin-top: 25px; text-align: center; border-top: 1px solid var(--border-color); padding-top: 20px;">
          <p style="font-size: 14px; margin-bottom: 15px; color: var(--text-secondary);">أو تواصل معنا مباشرة عبر الواتساب:</p>
          <a href="https://wa.me/201062022546" target="_blank" class="btn btn-success" style="background-color: #25d366; color: white !important; display: inline-flex; align-items: center; gap: 8px;">
            <i class="fab fa-whatsapp" style="font-size: 20px;"></i>
            <span>تواصل عبر الواتساب: 01062022546</span>
          </a>
        </div>
      </div>
    </div>
  `;
});

// دوال التحكم بالدروس والفيديو والتفاعل الدراسي
app.enrollInCourse = function(courseId) {
  if (!app.currentUser) {
    alert("يرجى تسجيل الدخول أولاً لتتمكن من الاشتراك في الكورس.");
    router.navigateTo('login');
    return;
  }
  if (!app.currentUser.progress) app.currentUser.progress = {};
  if (!app.currentUser.progress[courseId]) {
    app.currentUser.progress[courseId] = {
      completedLessons: [],
      lastPositions: {},
      examScore: null
    };
    app.save();
    alert("تم الاشتراك في الكورس بنجاح! تمتع بدراسة منهجك الآن.");
    router.navigateTo(`lesson-player?courseId=${courseId}`);
  }
};

app.saveVideoPosition = function(courseId, lessonId, position) {
  if (app.currentUser && app.currentUser.progress[courseId]) {
    if (!app.currentUser.progress[courseId].lastPositions) {
      app.currentUser.progress[courseId].lastPositions = {};
    }
    app.currentUser.progress[courseId].lastPositions[lessonId] = position;
    app.save();
  }
};

app.markLessonComplete = function(courseId, lessonId) {
  if (app.currentUser && app.currentUser.progress[courseId]) {
    const completed = app.currentUser.progress[courseId].completedLessons;
    if (!completed.includes(lessonId)) {
      completed.push(lessonId);
      app.save();
      
      // تحديث مظهر قائمة التشغيل مباشرة وتحديد الزر
      alert("تم إكمال الدرس!");
      
      const course = app.data.courses.find(c => c.id === courseId);
      const nextIdx = course.lessons.findIndex(l => l.id === lessonId) + 1;
      if (nextIdx < course.lessons.length) {
        router.navigateTo(`lesson-player?courseId=${courseId}&lessonId=${course.lessons[nextIdx].id}`);
      } else {
        alert("تهانينا! لقد أتممت جميع الدروس بنجاح. يمكنك الآن تقديم الاختبار النهائي.");
        router.navigateTo(`exam?courseId=${courseId}`);
      }
    }
  }
};

app.handleVideoEnded = function(courseId, lessonId) {
  app.markLessonComplete(courseId, lessonId);
};

app.switchTab = function(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.style.display = 'none';
  });
  event.target.classList.add('active');
  document.getElementById(`tab-content-${tabName}`).style.display = 'block';
};

app.toggleWishlist = function(courseId, event) {
  event.stopPropagation();
  if (app.wishlist.includes(courseId)) {
    app.wishlist = app.wishlist.filter(id => id !== courseId);
    event.target.className = "far fa-heart";
  } else {
    app.wishlist.push(courseId);
    event.target.className = "fas fa-heart";
  }
  app.save();
};

// دوال نظام الاختبار والتقييم
app.startExamTimer = function() {
  if (app.quizState.timerInterval) clearInterval(app.quizState.timerInterval);
  app.quizState.timerInterval = setInterval(() => {
    app.quizState.timeRemaining--;
    const timerText = document.getElementById('quiz-timer-text');
    if (timerText) {
      const minutes = Math.floor(app.quizState.timeRemaining / 60);
      const seconds = app.quizState.timeRemaining % 60;
      timerText.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    if (app.quizState.timeRemaining <= 0) {
      clearInterval(app.quizState.timerInterval);
      alert("انتهى وقت الاختبار!");
      app.submitExam();
    }
  }, 1000);
};

app.renderQuizQuestion = function() {
  const root = document.getElementById('app');
  const q = app.quizState.questions[app.quizState.currentIdx];
  const total = app.quizState.questions.length;
  
  const optionsHTML = q.options.map(option => {
    const isSelected = app.quizState.answers[q.id] === option;
    return `
      <div class="option-item ${isSelected ? 'selected' : ''}" onclick="app.selectQuizOption('${q.id}', '${option}')">
        <span>${option}</span>
      </div>
    `;
  }).join('');

  root.innerHTML = `
    <div class="container" style="padding: 40px 0;">
      <div class="quiz-card">
        <div class="quiz-header">
          <div>
            <span style="font-size: 14px; color: var(--text-secondary);">سؤال ${app.quizState.currentIdx + 1} من ${total}</span>
          </div>
          <div class="quiz-timer">
            <i class="far fa-clock"></i>
            <span id="quiz-timer-text">--:--</span>
          </div>
        </div>

        <div class="question-text">${q.question}</div>
        <div class="options-list">
          ${optionsHTML}
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 40px; border-top: 1px solid var(--border-color); padding-top: 25px;">
          <button class="btn btn-outline" onclick="app.prevQuizQuestion()" ${app.quizState.currentIdx === 0 ? 'disabled' : ''}>السابق</button>
          ${app.quizState.currentIdx === total - 1 
            ? `<button class="btn btn-primary" onclick="app.submitExam()">إنهاء الاختبار</button>`
            : `<button class="btn btn-primary" onclick="app.nextQuizQuestion()">التالي</button>`
          }
        </div>
      </div>
    </div>
  `;
};

app.selectQuizOption = function(qId, option) {
  app.quizState.answers[qId] = option;
  app.renderQuizQuestion();
};

app.nextQuizQuestion = function() {
  if (app.quizState.currentIdx < app.quizState.questions.length - 1) {
    app.quizState.currentIdx++;
    app.renderQuizQuestion();
  }
};

app.prevQuizQuestion = function() {
  if (app.quizState.currentIdx > 0) {
    app.quizState.currentIdx--;
    app.renderQuizQuestion();
  }
};

app.submitExam = function() {
  clearInterval(app.quizState.timerInterval);
  const total = app.quizState.questions.length;
  let correctCount = 0;

  app.quizState.questions.forEach(q => {
    if (app.quizState.answers[q.id] === q.answer) {
      correctCount++;
    }
  });

  const scorePct = Math.round((correctCount / total) * 100);

  // حفظ العلامة في ملف تقدم الطالب
  if (app.currentUser && app.currentUser.progress[app.quizState.courseId]) {
    app.currentUser.progress[app.quizState.courseId].examScore = scorePct;
    app.save();
  }

  // عرض صفحة التقرير والنتائج بالتفصيل مع إمكانية مراجعة الإجابات وشرح الحل
  const root = document.getElementById('app');
  const detailsHTML = app.quizState.questions.map((q, idx) => {
    const studentAns = app.quizState.answers[q.id] || "لم تتم الإجابة";
    const isCorrect = studentAns === q.answer;
    return `
      <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 20px; margin-bottom: 20px;">
        <h4 style="font-weight: 700; margin-bottom: 12px;">س ${idx + 1}: ${q.question}</h4>
        <div style="display: flex; gap: 20px; font-size: 14px; margin-bottom: 10px;">
          <div>إجابتك: <span style="color: ${isCorrect ? 'var(--success)' : 'var(--danger)'}; font-weight: 700;">${studentAns}</span></div>
          <div>الإجابة الصحيحة: <span style="color: var(--success); font-weight: 700;">${q.answer}</span></div>
        </div>
        <div class="explanation-box">
          <strong>طريقة الحل والتفسير:</strong> ${q.explanation}
        </div>
      </div>
    `;
  }).join('');

  root.innerHTML = `
    <div class="container" style="padding: 40px 0; max-width: 800px;">
      <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 40px; text-align: center; margin-bottom: 40px; box-shadow: var(--card-shadow);">
        <div style="width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 44px; margin: 0 auto 20px auto; background-color: ${scorePct >= 70 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color: ${scorePct >= 70 ? 'var(--success)' : 'var(--danger)'};">
          <i class="fas ${scorePct >= 70 ? 'fa-award' : 'fa-times'}"></i>
        </div>
        <h2 style="font-size: 28px; font-weight: 800; margin-bottom: 10px;">نتيجتك في الاختبار: ${scorePct}%</h2>
        <p style="color: var(--text-secondary); margin-bottom: 25px;">لقد أجبت بشكل صحيح على ${correctCount} من أصل ${total} أسئلة.</p>
        
        <div style="display: flex; justify-content: center; gap: 15px;">
          <button class="btn btn-primary" onclick="router.navigateTo('student-dashboard')">لوحة التحكم</button>
          ${scorePct >= 70 
            ? `<button class="btn btn-accent" onclick="app.generateCertificate('${app.quizState.courseId}')">استلام شهادتك</button>` 
            : `<button class="btn btn-outline" onclick="router.navigateTo('exam?courseId=${app.quizState.courseId}')">إعادة المحاولة</button>`
          }
        </div>
      </div>

      <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 20px;">مراجعة وشرح الأسئلة بالتفصيل</h3>
      ${detailsHTML}
    </div>
  `;
};

// توليد واستخراج الشهادات الرقمية
app.generateCertificate = function(courseId) {
  if (!app.currentUser) return;
  const course = app.data.courses.find(c => c.id === courseId);
  const certId = `CERT-${courseId.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

  // إضافة الشهادة لحساب الطالب لحفظها لاحقاً
  if (!app.currentUser.certificates) app.currentUser.certificates = [];
  if (!app.currentUser.certificates.find(c => c.courseId === courseId)) {
    app.currentUser.certificates.push({ courseId, certId, date: new Date().toLocaleDateString('ar-EG') });
    app.save();
  }

  const certData = app.currentUser.certificates.find(c => c.courseId === courseId);

  const root = document.getElementById('app');
  root.innerHTML = `
    <div class="container certificate-preview-container">
      <h2 style="font-size: 28px; font-weight: 800; margin-bottom: 30px;">تهانينا! شهادة إتمام المنهج</h2>
      
      <div class="certificate-canvas" id="printable-certificate">
        <div class="certificate-inner">
          <div class="cert-header">
            <div style="text-align: right;">
              <span style="font-size: 11px; color: var(--text-tertiary);">جمهورية مصر العربية</span><br>
              <strong>منصة ملوك المعادلة</strong>
            </div>
            <i class="fas fa-crown logo-crown" style="font-size: 36px; color: var(--accent);"></i>
          </div>

          <div style="margin: 20px 0;">
            <span class="cert-subtitle">تمنح إدارة المنصة هذه الشهادة لـ</span>
            <div class="cert-recipient">${app.currentUser.name}</div>
            <p style="font-size: 15px; color: var(--text-secondary); line-height: 1.8; max-width: 580px; margin: 15px auto;">
              وذلك لاجتيازه بنجاح وتفوق كامل مقرر مادة <strong>"${course.title}"</strong> بتقدير ممتاز متمنين له دوام التوفيق والنجاح الدائم في الكلية.
            </p>
          </div>

          <div style="display: flex; justify-content: space-between; width: 100%; align-items: flex-end; border-top: 1px solid var(--border-color); padding-top: 15px;">
            <div style="text-align: right; font-size: 12px;">
              <span>تاريخ الإصدار: ${certData.date}</span>
            </div>
            <div style="text-align: center;">
              <i class="fas fa-stamp" style="font-size: 32px; color: var(--primary); opacity: 0.8;"></i><br>
              <span style="font-size: 11px; font-weight: 700;">ختم الاعتماد الرقمي</span>
            </div>
            <div style="text-align: left; font-size: 11px; color: var(--text-tertiary);">
              <span>رقم التحقق: ${certData.certId}</span>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 30px; display: flex; gap: 15px;">
        <button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print"></i> طباعة / حفظ كـ PDF</button>
        <button class="btn btn-outline" onclick="router.navigateTo('student-dashboard')">العودة للوحة التحكم</button>
      </div>
    </div>
  `;
};

// إدارة مجتمع الطلاب
app.showQAThread = function(threadId) {
  const root = document.getElementById('app');
  const thread = app.data.community.find(t => t.id === threadId);
  if (!thread) return;

  const repliesHTML = thread.replies.map(reply => `
    <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 20px; margin-bottom: 15px; position: relative;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="font-weight: 700; font-size: 14px;">
          ${reply.author} 
          ${reply.role === 'teacher' ? '<span class="badge-best-answer" style="background-color: var(--primary); margin-right: 8px;">مدرس الكورس</span>' : ''}
        </span>
        ${reply.isBest ? '<span class="badge-best-answer">أفضل إجابة</span>' : ''}
      </div>
      <p style="font-size: 14px; line-height: 1.7; color: var(--text-secondary);">${reply.content}</p>
    </div>
  `).join('');

  root.innerHTML = `
    <div class="container" style="padding: 40px 0; max-width: 800px;">
      <button class="btn btn-text" onclick="router.navigateTo('lesson-player?courseId=${thread.courseId}')" style="margin-bottom: 20px;"><i class="fas fa-arrow-right"></i> العودة للدرس</button>
      
      <div class="qa-card" style="margin-bottom: 30px;">
        <h2 style="font-size: 22px; font-weight: 800; margin-bottom: 12px;">${thread.title}</h2>
        <p style="font-size: 15px; line-height: 1.8; color: var(--text-secondary);">${thread.content}</p>
        <div class="qa-author" style="margin-top: 15px; border-top: 1px solid var(--border-color); padding-top: 15px;">
          <span>كُتب بواسطة: ${thread.author}</span>
          <span>التاريخ: ${thread.date}</span>
        </div>
      </div>

      <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 20px;">الردود والمناقشات</h3>
      ${repliesHTML}

      <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 25px; margin-top: 30px;">
        <h4 style="font-weight: 700; margin-bottom: 15px;">إضافة رد أو تعليق</h4>
        <form onsubmit="event.preventDefault(); app.addReplyToQA('${thread.id}', this.replyText.value);">
          <div class="form-group">
            <textarea name="replyText" class="form-input" rows="4" style="resize: none;" placeholder="اكتب ردك هنا..." required></textarea>
          </div>
          <button type="submit" class="btn btn-primary">إرسال الرد</button>
        </form>
      </div>
    </div>
  `;
};

app.openNewQAQuestion = function(courseId) {
  const root = document.getElementById('app');
  root.innerHTML = `
    <div class="container" style="padding: 40px 0; max-width: 600px;">
      <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 35px;">
        <h3 style="font-size: 22px; font-weight: 800; margin-bottom: 20px; text-align: center;">طرح سؤال جديد</h3>
        <form onsubmit="event.preventDefault(); app.createNewQAQuestion('${courseId}', this.qTitle.value, this.qContent.value);">
          <div class="form-group">
            <label class="form-label">عنوان السؤال</label>
            <input type="text" name="qTitle" class="form-input" required placeholder="مثال: استفسار عن قانون المصفوفة المربعة">
          </div>
          <div class="form-group">
            <label class="form-label">تفاصيل سؤالك</label>
            <textarea name="qContent" class="form-input" rows="5" style="resize: none;" required placeholder="اكتب سؤالك بالتفصيل لتتم إجابتك بشكل أدق..."></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">نشر السؤال</button>
        </form>
      </div>
    </div>
  `;
};

app.createNewQAQuestion = function(courseId, title, content) {
  const newQ = {
    id: 'q_' + Date.now(),
    courseId,
    title,
    content,
    author: app.currentUser.name,
    date: new Date().toLocaleDateString('ar-EG'),
    replies: []
  };
  app.data.community.push(newQ);
  app.save();
  alert("تم نشر سؤالك بنجاح في مجتمع الطلاب!");
  router.navigateTo(`lesson-player?courseId=${courseId}`);
};

app.addReplyToQA = function(threadId, content) {
  const thread = app.data.community.find(t => t.id === threadId);
  if (thread) {
    thread.replies.push({
      id: 'r_' + Date.now(),
      author: app.currentUser.name,
      role: app.currentUser.role,
      content: content,
      likes: 0,
      isBest: false
    });
    app.save();
    app.showQAThread(threadId);
  }
};

// تحليلات وتعديلات لوحة تحكم المسؤول (Admin Panel Actions)
app.toggleUserSuspension = function(userId) {
  const user = app.data.users?.find(u => u.id === userId);
  if (user) {
    user.suspended = !user.suspended;
    app.save();
    alert(user.suspended ? "تم تجميد حساب الطالب بنجاح." : "تم إعادة تفعيل الحساب بنجاح.");
    router.navigateTo('admin-dashboard');
  }
};

app.adminCreateCourse = function() {
  const title = prompt("أدخل عنوان الكورس الجديد:");
  if (title) {
    const category = prompt("أدخل فئة الكورس (math, geography, english, french):");
    const newCourse = {
      id: 'course_' + Date.now(),
      title,
      category,
      categoryName: category === 'math' ? 'الرياضيات' : (category === 'geography' ? 'الجغرافيا' : (category === 'english' ? 'الانجليزي' : 'الفرنساوي')),
      thumbnail: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=600",
      description: "كورس جديد تم إنشاؤه للتأهيل المباشر لاختبارات المعادلة القادمة.",
      instructor: {
        name: "د. أستاذ جديد",
        title: "محاضر ومعد المادة",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150",
        bio: "خبرة في إعداد المناهج الجامعية والمعادلة."
      },
      stats: { duration: "10 ساعات", lessonsCount: 0, studentsCount: 0, rating: 5.0 },
      lessons: [],
      reviews: []
    };
    app.data.courses.push(newCourse);
    app.save();
    alert("تم إنشاء الكورس بنجاح!");
    router.navigateTo('admin-dashboard');
  }
};

// بدء التوجيه الأولي عند التحميل
window.addEventListener('load', () => router.handleRouting());
