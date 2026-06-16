// ملوك المعادلة - نظام التحكم والعمليات المتقدم (App Logic)

class AppState {
  constructor() {
    let storedData = null;
    try {
      storedData = JSON.parse(localStorage.getItem('molok_data'));
    } catch (e) {
      console.error('Error parsing stored molok_data:', e);
    }
    
    this.data = storedData || {};
    if (!this.data.subjects) this.data.subjects = [...defaultData.subjects];
    if (!this.data.lessons) this.data.lessons = [...defaultData.lessons];
    if (!this.data.faq) this.data.faq = [...defaultData.faq];
    if (!this.data.gdrive_settings) this.data.gdrive_settings = { ...defaultData.gdrive_settings };

    // تحديث وتزامن المواد تلقائياً مع التحديثات الجديدة في الكود
    if (this.data && this.data.subjects) {
      defaultData.subjects.forEach(defaultSub => {
        const existingSub = this.data.subjects.find(s => s.id === defaultSub.id);
        if (existingSub) {
          existingSub.name = defaultSub.name;
        } else {
          this.data.subjects.push(defaultSub);
        }
      });
      this.data.subjects = this.data.subjects.filter(s => defaultData.subjects.some(ds => ds.id === s.id));
      this.save();
    }
    
    // تنظيف تلقائي للسؤال الشائع القديم في حالة وجوده مخزناً مسبقاً
    if (this.data.faq) {
      this.data.faq = this.data.faq.filter(item => !item.q.includes('كيف يتم عرض الدروس'));
    }
    this.currentUser = JSON.parse(localStorage.getItem('molok_user')) || null; // الأدمن فقط
    this.selectedAdminCourseId = null; // للتوافق
    this.activeAdminTab = 'mahad'; // 'mahad', 'diploma', 'settings'
    this.theme = localStorage.getItem('molok_theme') || 'light';
    this.currentSubjectId = null;
    this.currentLessonId = null;

    // تهيئة gapi و GIS عند تحميل الصفحة
    this.tokenClient = null;
    this.gapiInited = false;
    this.gisInited = false;
  }

  save() {
    localStorage.setItem('molok_data', JSON.stringify(this.data));
    localStorage.setItem('molok_user', JSON.stringify(this.currentUser));
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

  toggleMobileMenu() {
    const menu = document.querySelector('.nav-menu');
    const overlay = document.querySelector('.nav-overlay');
    const btn = document.querySelector('.mobile-menu-btn i');
    if (!menu || !overlay) return;

    const isOpen = menu.classList.contains('open');
    if (isOpen) {
      menu.classList.remove('open');
      overlay.classList.remove('open');
      if (btn) btn.className = 'fas fa-bars';
    } else {
      menu.classList.add('open');
      overlay.classList.add('open');
      if (btn) btn.className = 'fas fa-times';
    }
  }

  closeMobileMenu() {
    const menu = document.querySelector('.nav-menu');
    const overlay = document.querySelector('.nav-overlay');
    const btn = document.querySelector('.mobile-menu-btn i');
    if (menu) menu.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    if (btn) btn.className = 'fas fa-bars';
  }

  login(email, password) {
    if (email === 'admin@molok.com' && password === 'admin123') {
      this.currentUser = { name: "مدير المنصة", email, role: 'admin' };
      this.save();
      this.updateNavbar();
      alert("تم تسجيل الدخول بنجاح بلوحة التحكم.");
      router.navigateTo('admin-dashboard');
      return true;
    }
    alert("بيانات الدخول غير صحيحة. حساب الأدمن فقط هو المتاح.");
    return false;
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

    if (this.currentUser && this.currentUser.role === 'admin') {
      navActions.innerHTML = `
        <button class="theme-toggle" onclick="app.toggleTheme()" title="تغيير المظهر">
          <i class="fas ${this.theme === 'light' ? 'fa-moon' : 'fa-sun'}"></i>
        </button>
        <span class="user-greeting" style="font-weight: 700; color: var(--text-secondary); margin-left: 10px;">أهلاً، الأدمن</span>
        <button class="btn btn-outline" onclick="router.navigateTo('admin-dashboard')">لوحة التحكم</button>
        <button class="btn btn-text" onclick="app.logout()"><i class="fas fa-sign-out-alt"></i> خروج</button>
      `;
    } else {
      navActions.innerHTML = `
        <button class="theme-toggle" onclick="app.toggleTheme()" title="تغيير المظهر">
          <i class="fas ${this.theme === 'light' ? 'fa-moon' : 'fa-sun'}"></i>
        </button>
      `;
    }
  }

  // تهيئة مكتبات Google
  initGoogleClient() {
    const settings = this.data.gdrive_settings;
    if (!settings || !settings.clientId) return;

    try {
      // 1. تهيئة GAPI client
      if (typeof gapi !== 'undefined' && !this.gapiInited) {
        gapi.load('client', async () => {
          try {
            await gapi.client.init({
              apiKey: settings.apiKey,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            });
            this.gapiInited = true;
            console.log('GAPI client loaded successfully');
          } catch (err) {
            console.error('Error initializing GAPI client:', err);
          }
        });
      }

      // 2. تهيئة GIS Token Client
      if (typeof google !== 'undefined' && !this.gisInited) {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: settings.clientId,
          scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive',
          callback: (response) => {
            if (response.error !== undefined) {
              alert('حدث خطأ أثناء الاتصال بـ Google: ' + response.error);
              return;
            }
            this.data.gdrive_settings.token = response.access_token;
            this.save();
            alert('تم الحصول على تصريح الوصول بنجاح! يمكنك الآن رفع الملفات مباشرة إلى Google Drive.');
            router.handleRouting();
          },
        });
        this.gisInited = true;
      }
    } catch (e) {
      console.error('Google client script initialization failed: ', e);
    }
  }

  requestGoogleToken() {
    if (this.tokenClient) {
      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      alert('يرجى التأكد من كتابة Client ID بشكل صحيح وحفظ الإعدادات أولاً.');
    }
  }
}

const app = new AppState();
window.app = app;

document.addEventListener('DOMContentLoaded', () => {
  app.applyTheme();
  app.updateNavbar();
  setTimeout(() => app.initGoogleClient(), 1000);
});

// ==========================================
// 1. الصفحة الرئيسية (Home Page)
// ==========================================
router.addRoute('home', () => {
  const root = document.getElementById('main-content');
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
          <span class="hero-tag" style="background-color: rgba(16, 185, 129, 0.1); color: var(--success); border-color: rgba(16, 185, 129, 0.2);">
            <i class="fas fa-heart" style="color: var(--danger);"></i> المنصة مجانية بالكامل لوجه الله لخدمة طلاب المعادلة
          </span>
          <h1 class="hero-title">منصة <span>ملوك المعادلة</span> التعليمية</h1>
          <p class="hero-subtitle">المنصة الرائدة والأولى لطلاب معادلة المعاهد الفنية ودبلومات المدارس التجارية. نمهد لك الطريق للالتحاق بكلية التجارة بنخبة من أفضل الدروس والملخصات المباشرة مجاناً بدون تسجيل حساب.</p>
          <div class="hero-buttons">
            <button class="btn btn-primary btn-accent" onclick="router.navigateTo('category?type=mahad')">معادلة المعاهد</button>
            <button class="btn btn-outline" onclick="router.navigateTo('category?type=diploma')">معادلة الدبلومات</button>
          </div>
        </div>
        <div class="hero-illustration">
          <div class="hero-circle-bg"></div>
          <img src="hero.jpg" class="hero-img" alt="طلاب المعادلة">
        </div>
      </div>
    </section>

    <!-- أقسام الدراسة الرئيسية -->
    <section class="container" style="padding: 40px 0 80px 0;">
      <div class="section-header">
        <span class="section-subtitle">اختر مسارك التعليمي</span>
        <h2 class="section-title">أقسام ومواد المعادلة</h2>
      </div>
      <div class="features-grid">
        <div class="feature-card" style="cursor: pointer; text-align: center; padding: 40px 20px;" onclick="router.navigateTo('category?type=mahad')">
          <div class="feature-icon-wrapper" style="margin: 0 auto 20px auto; background-color: var(--primary-light); color: var(--primary);">
            <i class="fas fa-university" style="font-size: 24px;"></i>
          </div>
          <h3 class="feature-card-title" style="font-size: 22px; font-weight: 800; margin-bottom: 15px;">معادلة المعاهد الفنية</h3>
          <p class="feature-card-desc">تحتوي على المواد المخصصة لطلبة المعاهد: المحاسبة، إدارة الأعمال، الرياضيات، وتخصصات دراسية باللغة الانجليزية.</p>
          <button class="btn btn-outline" style="margin-top: 20px;">عرض المواد <i class="fas fa-arrow-left" style="margin-right: 8px;"></i></button>
        </div>

        <div class="feature-card" style="cursor: pointer; text-align: center; padding: 40px 20px;" onclick="router.navigateTo('category?type=diploma')">
          <div class="feature-icon-wrapper" style="margin: 0 auto 20px auto; background-color: rgba(245, 158, 11, 0.15); color: var(--accent);">
            <i class="fas fa-graduation-cap" style="font-size: 24px;"></i>
          </div>
          <h3 class="feature-card-title" style="font-size: 22px; font-weight: 800; margin-bottom: 15px;">معادلة الدبلومات التجارية</h3>
          <p class="feature-card-desc">تحتوي على المواد المقررة لطلبة الدبلومات: اللغة الإنجليزية، اللغة الفرنسية، الرياضيات، والجغرافيا.</p>
          <button class="btn btn-outline" style="margin-top: 20px;">عرض المواد <i class="fas fa-arrow-left" style="margin-right: 8px;"></i></button>
        </div>
      </div>
    </section>

    <!-- الأسئلة الشائعة -->
    <section class="container" style="margin-bottom: 80px;">
      <div class="section-header">
        <span class="section-subtitle">الأسئلة الشائعة</span>
        <h2 class="section-title">كل ما تريد معرفته عن المعادلة والمنصة</h2>
      </div>
      <div style="max-width: 800px; margin: 0 auto;">
        ${faqHTML}
      </div>
    </section>
  `;
});

// ==========================================
// 2. صفحة الفئة (معادلة المعاهد أو الدبلومات)
// ==========================================
router.addRoute('category', (params) => {
  const root = document.getElementById('main-content');
  const type = params.type || 'mahad';

  const title = type === 'mahad' ? 'معادلة المعاهد الفنية' : 'معادلة الدبلومات التجارية';
  const subtitle = type === 'mahad'
    ? 'المناهج المعتمدة والدروس لطلاب معاهد السنتين الفنية التجارية للالتحاق بكلية التجارة.'
    : 'منهج الأربع مواد المقررة على طلاب دبلومات المدارس الفنية التجارية للالتحاق بكلية التجارة.';

  const filteredSubjects = app.data.subjects.filter(s => s.category === type);

  // أيقونات وصور افتراضية للمواد
  const getSubjectIcon = (subjectId) => {
    if (subjectId.includes('math')) return 'fa-calculator';
    if (subjectId.includes('accounting')) return 'fa-file-invoice-dollar';
    if (subjectId.includes('business')) return 'fa-briefcase';
    if (subjectId.includes('economics')) return 'fa-chart-line';
    if (subjectId.includes('english')) return 'fa-language';
    if (subjectId.includes('french')) return 'fa-globe-europe';
    if (subjectId.includes('geography')) return 'fa-map-marked-alt';
    return 'fa-book';
  };

  const cards = filteredSubjects.map(sub => {
    const lessonsCount = app.data.lessons.filter(l => l.subject_id === sub.id).length;
    return `
      <div class="feature-card subject-card" onclick="router.navigateTo('lessons?subject=${sub.id}')" style="cursor: pointer; display: flex; align-items: center; gap: 20px; padding: 25px;">
        <div class="feature-icon-wrapper" style="margin: 0; min-width: 60px; height: 60px; font-size: 24px;">
          <i class="fas ${getSubjectIcon(sub.id)}"></i>
        </div>
        <div style="text-align: right; flex-grow: 1;">
          <h3 style="font-weight: 800; font-size: 18px; margin-bottom: 5px;">${sub.name}</h3>
          <span style="font-size: 13px; color: var(--text-secondary);"><i class="far fa-play-circle" style="margin-left: 5px;"></i> ${lessonsCount} درس مرئي وملخص PDF</span>
        </div>
        <i class="fas fa-chevron-left" style="color: var(--text-tertiary);"></i>
      </div>
    `;
  }).join('');

  root.innerHTML = `
    <div class="container" style="padding: 60px 0;">
      <button class="btn btn-text" onclick="router.navigateTo('home')" style="margin-bottom: 30px;"><i class="fas fa-arrow-right"></i> العودة للرئيسية</button>
      
      <div class="section-header" style="text-align: right; margin-bottom: 40px;">
        <span class="section-subtitle">${title}</span>
        <h2 class="section-title" style="font-size: 32px; font-weight: 800;">المواد الدراسية المقررة</h2>
        <p style="color: var(--text-secondary); max-width: 700px; margin-top: 10px; line-height: 1.8;">${subtitle}</p>
      </div>

      <div class="courses-grid" style="gap: 20px; margin-top: 20px;">
        ${cards}
      </div>
    </div>
  `;
});

// ==========================================
// 3. صفحة عرض الدروس (Lessons Page)
// ==========================================
router.addRoute('lessons', (params) => {
  const root = document.getElementById('main-content');
  const subjectId = params.subject;
  const subject = app.data.subjects.find(s => s.id === subjectId);

  if (!subject) {
    root.innerHTML = `<div class="container" style="padding: 80px 0; text-align: center;"><p>المادة غير موجودة.</p></div>`;
    return;
  }

  // تصفية الدروس وترتيبها تصاعدياً
  const subjectLessons = app.data.lessons
    .filter(l => l.subject_id === subjectId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  app.currentSubjectId = subjectId;

  // جلب الدرس المختار أو عرض الأول تلقائياً
  const activeLessonId = params.lesson || (subjectLessons.length > 0 ? subjectLessons[0].id : null);
  const activeLesson = subjectLessons.find(l => l.id === activeLessonId);

  // إعداد قائمة الدروس
  const lessonsMenu = subjectLessons.map((l, index) => {
    const isActive = l.id === activeLessonId;
    return `
      <div class="playlist-item ${isActive ? 'active' : ''}" onclick="router.navigateTo('lessons?subject=${subjectId}&lesson=${l.id}')" style="cursor: pointer; padding: 15px; border-radius: 8px; margin-bottom: 8px; display: flex; align-items: center; gap: 12px; transition: all 0.2s;">
        <div class="lesson-num" style="background: ${isActive ? 'var(--primary)' : 'var(--bg-tertiary)'}; color: ${isActive ? 'white' : 'var(--text-primary)'}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700;">
          ${index + 1}
        </div>
        <div style="flex-grow: 1; text-align: right;">
          <h4 style="font-weight: 700; font-size: 14px; margin-bottom: 2px;">${l.title}</h4>
        </div>
        <i class="far fa-play-circle" style="opacity: 0.7;"></i>
      </div>
    `;
  }).join('');

  // استخراج معرّف فيديو يوتيوب
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else {
      videoId = url; // كحالة احتياطية إذا أدخل الأدمن المعرّف مباشرة
    }
    return `https://www.youtube.com/embed/${videoId}?rel=0`;
  };

  // استخراج رابط تضمين الـ PDF من جوجل درايف أو الملفات المحلية
  const getPdfEmbedUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('blob:') || !url.includes('drive.google.com')) {
      return url;
    }
    const regExp = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regExp);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
  };

  const playerHTML = activeLesson ? `
    <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; box-shadow: var(--card-shadow);">
      <!-- مشغل اليوتيوب المدمج -->
      ${activeLesson.youtube_url ? `
      <div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; background: #000; box-shadow: 0 4px 15px rgba(0,0,0,0.15); margin-bottom: 20px;">
        <iframe 
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
          src="${getYoutubeEmbedUrl(activeLesson.youtube_url)}" 
          title="YouTube video player" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen>
        </iframe>
      </div>
      ` : `
      <div style="text-align: center; padding: 30px; background: var(--bg-tertiary); border-radius: 8px; margin-bottom: 20px; border: 1px dashed var(--border-color); display: flex; flex-direction: column; align-items: center; gap: 10px;">
        <i class="far fa-file-pdf" style="font-size: 40px; color: var(--danger);"></i>
        <span style="font-weight: 700; color: var(--text-secondary);">ملخص دراسي PDF (لا يوجد شرح فيديو)</span>
      </div>
      `}

      <div style="text-align: right; margin-bottom: 20px;">
        <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px;">${activeLesson.title}</h2>
        ${activeLesson.description ? `<p style="color: var(--text-secondary); font-size: 14px; line-height: 1.8;">${activeLesson.description}</p>` : ''}
      </div>

      <div style="display: flex; gap: 15px; border-top: 1px solid var(--border-color); padding-top: 20px; margin-top: 20px; justify-content: flex-start;">
        ${activeLesson.pdf_drive_url
      ? `<a href="${activeLesson.pdf_drive_url.startsWith('local_file_') ? '#' : activeLesson.pdf_drive_url}" id="pdf-external-link" target="_blank" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px;">
               <i class="fas fa-external-link-alt"></i>
               <span>فتح في نافذة خارجية</span>
             </a>`
      : `<button class="btn btn-outline" disabled style="opacity: 0.5; display: inline-flex; align-items: center; gap: 8px;">
               <i class="far fa-file-pdf"></i>
               <span>لا يوجد ملف PDF مرفق</span>
             </button>`
    }
      </div>

      <!-- مستعرض الـ PDF المدمج كتحسين ملكي ممتاز للمذاكرة دون مغادرة الموقع -->
      ${activeLesson.pdf_drive_url ? `
        <div style="margin-top: 25px; border-top: 1px solid var(--border-color); padding-top: 25px; text-align: right;">
          <h3 style="font-size: 17px; font-weight: 800; color: var(--text-primary); margin-bottom: 15px;">
            <i class="far fa-file-pdf" style="color: var(--danger); margin-left: 6px;"></i> قراءة ملخص الدرس مباشرة
          </h3>
          <div style="width: 100%; height: 550px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color); box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <iframe id="pdf-iframe" src="${activeLesson.pdf_drive_url.startsWith('local_file_') ? '' : getPdfEmbedUrl(activeLesson.pdf_drive_url)}" width="100%" height="100%" allow="autoplay" style="border: 0;"></iframe>
          </div>
        </div>
      ` : ''}
    </div>
  ` : `
    <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 50px 20px; text-align: center; color: var(--text-secondary);">
      <i class="fas fa-book-reader" style="font-size: 48px; margin-bottom: 15px; color: var(--text-tertiary);"></i>
      <p style="font-size: 16px;">الرجاء اختيار درس من القائمة الجانبية لبدء الدراسة.</p>
    </div>
  `;

  root.innerHTML = `
    <div class="container" style="padding: 50px 0;">
      <button class="btn btn-text" onclick="router.navigateTo('category?type=${subject.category}')" style="margin-bottom: 25px;"><i class="fas fa-arrow-right"></i> العودة إلى المواد</button>

      <div class="section-header" style="text-align: right; margin-bottom: 30px;">
        <span class="section-subtitle">${subject.category === 'mahad' ? 'معادلة المعاهد' : 'معادلة الدبلومات'}</span>
        <h1 class="section-title" style="font-size: 32px; font-weight: 800; display: inline-flex; align-items: center; gap: 10px;">
          <span>مادة ${subject.name}</span>
        </h1>
      </div>

      <div class="player-layout">
        <!-- المحتوى الرئيسي (الفيديو) -->
        <div>
          ${playerHTML}
        </div>

        <!-- قائمة الدروس الجانبية -->
        <div>
          <div class="playlist-card" style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; box-shadow: var(--card-shadow);">
            <div class="playlist-header" style="padding: 18px; font-weight: 800; font-size: 16px; border-bottom: 1px solid var(--border-color); background: var(--bg-tertiary); text-align: right;">
              <i class="fas fa-list-ol" style="margin-left: 8px; color: var(--primary);"></i> فهرس الدروس
            </div>
            <div style="max-height: 480px; overflow-y: auto; padding: 15px;">
              ${lessonsMenu.length ? lessonsMenu : '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">لا توجد دروس حالية للمادة.</p>'}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // توليد الرابط المؤقت ديناميكياً لملفات IndexedDB المحلية
  if (activeLesson && activeLesson.pdf_drive_url && activeLesson.pdf_drive_url.startsWith('local_file_')) {
    window.mediaStore.getMediaUrl(activeLesson.pdf_drive_url).then(url => {
      const externalLink = document.getElementById('pdf-external-link');
      if (externalLink) externalLink.href = url;
      const iframe = document.getElementById('pdf-iframe');
      if (iframe) iframe.src = url;
    }).catch(err => console.error("Error loading local PDF file: ", err));
  }
});

// ==========================================
// 4. صفحة تسجيل دخول الأدمن
// ==========================================
router.addRoute('login', () => {
  const root = document.getElementById('main-content');
  root.innerHTML = `
    <div class="auth-container" style="max-width: 450px; margin: 80px auto; padding: 40px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); box-shadow: var(--card-shadow);">
      <div class="auth-header" style="text-align: center; margin-bottom: 30px;">
        <i class="fas fa-crown logo-crown" style="font-size: 40px; color: var(--accent); margin-bottom: 15px;"></i>
        <h2 style="font-size: 24px; font-weight: 800;">تسجيل دخول الإدارة</h2>
        <p style="font-size: 13px; color: var(--text-secondary); margin-top: 8px;">مخصص لإضافة وتعديل الدروس والملخصات</p>
      </div>
      <form onsubmit="event.preventDefault(); app.login(this.email.value, this.password.value);">
        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label">البريد الإلكتروني للأدمن</label>
          <input type="email" name="email" class="form-input" placeholder="admin@molok.com" required style="width: 100%;">
        </div>
        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label">كلمة المرور</label>
          <input type="password" name="password" class="form-input" placeholder="••••••••" required style="width: 100%;">
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px; padding: 12px;">دخول</button>
      </form>
    </div>
  `;
});

// ==========================================
// 5. لوحة تحكم الأدمن (Admin Dashboard)
// ==========================================
router.addRoute('admin-dashboard', () => {
  const root = document.getElementById('main-content');
  if (!app.currentUser || app.currentUser.role !== 'admin') {
    router.navigateTo('login');
    return;
  }

  // تصفية المواد بالقسم النشط
  const activeCategory = app.activeAdminTab === 'settings' ? 'mahad' : app.activeAdminTab;
  const adminSubjects = app.data.subjects.filter(s => s.category === activeCategory);

  if (!app.selectedAdminSubjectId && adminSubjects.length > 0) {
    app.selectedAdminSubjectId = adminSubjects[0].id;
  }

  // إذا تبدلت المواد لتصنيف آخر ولم يجد المادة
  if (!adminSubjects.find(s => s.id === app.selectedAdminSubjectId) && adminSubjects.length > 0) {
    app.selectedAdminSubjectId = adminSubjects[0].id;
  }

  const selectedSub = app.data.subjects.find(s => s.id === app.selectedAdminSubjectId);

  // قائمة خيارات المواد للـ Select Menu
  const subjectOptions = adminSubjects.map(s => `
    <option value="${s.id}" ${s.id === app.selectedAdminSubjectId ? 'selected' : ''}>${s.name}</option>
  `).join('');

  // قائمة الدروس في هذه المادة للتعديل والترتيب
  let lessonsListHTML = '';
  if (selectedSub) {
    const subLessons = app.data.lessons
      .filter(l => l.subject_id === selectedSub.id)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    lessonsListHTML = subLessons.map((l, index) => `
      <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 15px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
        <div style="text-align: right;">
          <h4 style="font-weight: 700; font-size: 15px; color: var(--text-primary);">${index + 1}. ${l.title}</h4>
          <span style="font-size: 12px; color: var(--text-secondary); margin-left: 10px;">
            <i class="fab fa-youtube" style="color: #ff0000; margin-left: 4px;"></i> يوتيوب
          </span>
          <span style="font-size: 12px; color: var(--text-secondary);">
            <i class="far fa-file-pdf" style="color: var(--danger); margin-left: 4px;"></i> ${l.pdf_drive_url ? 'ملف PDF متوفر' : 'لا يوجد PDF'}
          </span>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <!-- أزرار الترتيب -->
          <button class="btn btn-outline" style="padding: 4px 8px; font-size: 11px;" onclick="app.moveLesson('${l.id}', 'up')" ${index === 0 ? 'disabled' : ''} title="نقل لأعلى"><i class="fas fa-arrow-up"></i></button>
          <button class="btn btn-outline" style="padding: 4px 8px; font-size: 11px;" onclick="app.moveLesson('${l.id}', 'down')" ${index === subLessons.length - 1 ? 'disabled' : ''} title="نقل لأسفل"><i class="fas fa-arrow-down"></i></button>
          
          <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px; border-color: var(--accent); color: var(--accent);" onclick="app.openEditLessonModal('${l.id}')">تعديل</button>
          <button class="btn btn-outline" style="padding: 6px 12px; font-size: 12px; border-color: var(--danger); color: var(--danger);" onclick="app.deleteLesson('${l.id}')">حذف</button>
        </div>
      </div>
    `).join('');
  }

  // واجهة الإعدادات الخاصة بـ Google Drive
  const settingsHTML = `
    <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 30px;">
      <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 15px;"><i class="fab fa-google-drive" style="color: #34a853;"></i> إعدادات الربط التلقائي بـ Google Drive API</h3>
      <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 25px;">
        لتتمكن من رفع ملفات الـ PDF مباشرة من جهازك وتخزينها تلقائياً على Google Drive، يرجى ملء البيانات التالية من مشروعك في Google Cloud Console. 
        <br><strong style="color: var(--accent);">ملاحظة هامة:</strong> إذا بقيت هذه الحقول فارغة، سيقوم النظام تلقائياً بحفظ وتخزين الملفات محلياً في المتصفح، مما يتيح لك تجربة المنصة والرفع مباشرة بدون أي إعدادات!
      </p>
      
      <form onsubmit="event.preventDefault(); app.saveSettings(this);">
        <div class="form-group" style="margin-bottom: 15px;">
          <label class="form-label">Client ID (معرّف العميل)</label>
          <input type="text" name="clientId" class="form-input" value="${app.data.gdrive_settings.clientId || ''}" placeholder="أدخل Client ID الخاص بمشروع جوجل">
        </div>
        <div class="form-group" style="margin-bottom: 15px;">
          <label class="form-label">API Key (مفتاح الواجهة البرمجية)</label>
          <input type="text" name="apiKey" class="form-input" value="${app.data.gdrive_settings.apiKey || ''}" placeholder="أدخل API Key">
        </div>
        <div class="form-group" style="margin-bottom: 15px;">
          <label class="form-label">ID المجلد الرئيسي لملوك المعادلة على Drive (اختياري)</label>
          <input type="text" name="folderId" class="form-input" value="${app.data.gdrive_settings.folderId || ''}" placeholder="إذا كان لديك مجلد فارغ ترغب بالرفع داخله مباشرة">
        </div>
        
        <div style="display: flex; gap: 15px; margin-top: 25px;">
          <button type="submit" class="btn btn-primary">حفظ الإعدادات</button>
          ${app.data.gdrive_settings.clientId ? `
            <button type="button" class="btn btn-success" onclick="app.requestGoogleToken()" style="background-color: var(--success); color: white;">
              <i class="fas fa-key"></i> الحصول على تصريح رفع (Google Login)
            </button>
          ` : ''}
        </div>
      </form>
    </div>
  `;

  // واجهة اللوحة الرئيسية
  root.innerHTML = `
    <div class="container" style="padding: 40px 0;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
        <h2 style="font-size: 28px; font-weight: 800;"><i class="fas fa-user-shield"></i> لوحة التحكم وإدارة المحتوى</h2>
        <span style="background: var(--success); color: white; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700;">
          الأدمن متصل
        </span>
      </div>

      <!-- نظام التبويب -->
      <div class="tab-nav" style="margin-bottom: 30px; display: flex; border-bottom: 1px solid var(--border-color); gap: 20px;">
        <button class="tab-btn ${app.activeAdminTab === 'mahad' ? 'active' : ''}" onclick="app.switchAdminTab('mahad')">معادلة المعاهد</button>
        <button class="tab-btn ${app.activeAdminTab === 'diploma' ? 'active' : ''}" onclick="app.switchAdminTab('diploma')">معادلة الدبلومات</button>
        <button class="tab-btn ${app.activeAdminTab === 'settings' ? 'active' : ''}" onclick="app.switchAdminTab('settings')"><i class="fas fa-cog"></i> إعدادات Google Drive</button>
      </div>

      <!-- المحتوى حسب التبويب النشط -->
      ${app.activeAdminTab === 'settings' ? settingsHTML : `
        <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 25px; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px;">
            <div style="display: flex; align-items: center; gap: 10px; min-width: 250px;">
              <label style="font-weight: 800; white-space: nowrap; font-size: 15px;">المادة المستهدفة:</label>
              <select class="form-input" style="padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); width: 100%; background: var(--bg-primary); color: var(--text-primary);" onchange="app.selectedAdminSubjectId = this.value; router.handleRouting();">
                ${subjectOptions.length ? subjectOptions : '<option value="">لا توجد مواد</option>'}
              </select>
            </div>
            
            ${selectedSub ? `
              <button class="btn btn-primary" onclick="app.openAddLessonModal()"><i class="fas fa-plus"></i> إضافة درس جديد لـ ${selectedSub.name}</button>
            ` : ''}
          </div>

          <div style="margin-top: 20px;">
            <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 15px; border-bottom: 2px solid var(--primary-light); padding-bottom: 8px;">الدروس الحالية في المادة</h3>
            ${lessonsListHTML || '<p style="color: var(--text-secondary); text-align: center; padding: 30px; background: var(--bg-primary); border-radius: 8px;">لا توجد دروس مضافة حالياً في هذه المادة.</p>'}
          </div>
        </div>
      `}
    </div>

    <!-- مودال إضافة/تعديل درس -->
    <div id="lesson-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); align-items: center; justify-content: center; z-index: 9999; padding: 20px;">
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); width: 100%; max-width: 600px; border-radius: var(--radius-md); padding: 30px; position: relative; max-height: 90vh; overflow-y: auto;">
        <button onclick="app.closeLessonModal()" style="position: absolute; left: 20px; top: 20px; border: 0; background: transparent; font-size: 20px; cursor: pointer; color: var(--text-secondary);">&times;</button>
        <h3 id="modal-title" style="font-size: 20px; font-weight: 800; margin-bottom: 20px; text-align: right; color: var(--text-primary);">إضافة درس جديد</h3>
        
        <form id="lesson-form" onsubmit="event.preventDefault(); app.saveLesson(this);">
          <input type="hidden" name="lesson_id" value="">
          
          <div class="form-group" style="margin-bottom: 15px; text-align: right;">
            <label class="form-label">عنوان الدرس</label>
            <input type="text" name="title" class="form-input" required placeholder="مثال: الدرس الأول: المحددات والعمليات عليها" style="width: 100%;">
          </div>

          <div class="form-group" style="margin-bottom: 15px; text-align: right;">
            <label class="form-label">رابط فيديو يوتيوب (اختياري)</label>
            <input type="text" name="youtube_url" class="form-input" placeholder="https://www.youtube.com/watch?v=..." style="width: 100%;">
          </div>

          <div class="form-group" style="margin-bottom: 15px; text-align: right;">
            <label class="form-label">وصف الدرس / ملاحظات (اختياري)</label>
            <textarea name="description" class="form-input" rows="3" style="width: 100%; resize: none;" placeholder="اكتب نبذة مختصرة عن الدرس..."></textarea>
          </div>

          <!-- نظام ملفات PDF -->
          <div style="border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 15px; margin-bottom: 20px; background: var(--bg-primary); text-align: right;">
            <label class="form-label" style="font-weight: 800; margin-bottom: 10px; display: block;">ملف الـ PDF المرفق</label>
            
            <div style="display: flex; gap: 20px; margin-bottom: 12px; font-size: 13px;">
              <label style="cursor: pointer;">
                <input type="radio" name="pdf_source" value="file" checked onchange="app.togglePdfSourceInput('file')"> اختيار ملف من الجهاز (أوتوماتيكي)
              </label>
              <label style="cursor: pointer;">
                <input type="radio" name="pdf_source" value="url" onchange="app.togglePdfSourceInput('url')"> إدخال رابط مباشر/Drive جاهز
              </label>
            </div>

            <!-- حقل اختيار ملف -->
            <div id="pdf-file-field" style="display: block;">
              <input type="file" name="pdf_file" accept="application/pdf" class="form-input" style="width: 100%; padding: 6px;">
              <span style="font-size: 11px; color: var(--text-tertiary); display: block; margin-top: 5px;">
                سيتم رفع الملف تلقائياً إلى مجلد المادة على Google Drive أو حفظه محلياً كاحتياطي.
              </span>
            </div>

            <!-- حقل الرابط المباشر -->
            <div id="pdf-url-field" style="display: none;">
              <input type="text" name="pdf_url" class="form-input" placeholder="https://drive.google.com/..." style="width: 100%;">
            </div>
          </div>

          <div id="modal-upload-status" style="display: none; text-align: center; margin-bottom: 15px; font-weight: 700; color: var(--accent); font-size: 13px;">
            <i class="fas fa-spinner fa-spin"></i> جاري حفظ الدرس وتخزين الملف...
          </div>

          <div style="display: flex; gap: 12px;">
            <button type="submit" class="btn btn-primary" id="modal-save-btn" style="flex-grow: 1; padding: 12px;">حفظ الدرس</button>
            <button type="button" class="btn btn-outline" onclick="app.closeLessonModal()" style="padding: 12px;">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  `;
});

// ==========================================
// وظائف الأدمن ولوحة التحكم (Admin Functions)
// ==========================================
app.switchAdminTab = function (tab) {
  app.activeAdminTab = tab;
  router.handleRouting();
};

app.saveSettings = function (form) {
  app.data.gdrive_settings.clientId = form.clientId.value.trim();
  app.data.gdrive_settings.apiKey = form.apiKey.value.trim();
  app.data.gdrive_settings.folderId = form.folderId.value.trim();
  app.save();
  alert('تم حفظ الإعدادات بنجاح!');
  app.initGoogleClient();
  router.handleRouting();
};

// التبديل بين الرفع والروابط
app.togglePdfSourceInput = function (source) {
  const fileField = document.getElementById('pdf-file-field');
  const urlField = document.getElementById('pdf-url-field');
  if (source === 'file') {
    fileField.style.display = 'block';
    urlField.style.display = 'none';
  } else {
    fileField.style.display = 'none';
    urlField.style.display = 'block';
  }
};

// فتح مودال الإضافة
app.openAddLessonModal = function () {
  const modal = document.getElementById('lesson-modal');
  const form = document.getElementById('lesson-form');
  document.getElementById('modal-title').innerText = 'إضافة درس جديد لمادة ' + app.data.subjects.find(s => s.id === app.selectedAdminSubjectId).name;
  form.reset();
  form.lesson_id.value = '';
  app.togglePdfSourceInput('file');
  modal.style.display = 'flex';
};

// فتح مودال التعديل
app.openEditLessonModal = function (lessonId) {
  const lesson = app.data.lessons.find(l => l.id === lessonId);
  if (!lesson) return;

  const modal = document.getElementById('lesson-modal');
  const form = document.getElementById('lesson-form');
  document.getElementById('modal-title').innerText = 'تعديل الدرس الحالي';

  form.lesson_id.value = lesson.id;
  form.title.value = lesson.title;
  form.youtube_url.value = lesson.youtube_url;
  form.description.value = lesson.description || '';

  if (lesson.pdf_drive_url) {
    if (lesson.pdf_drive_url.startsWith('local_file_')) {
      app.togglePdfSourceInput('file');
      form.pdf_source[0].checked = true;
    } else {
      app.togglePdfSourceInput('url');
      form.pdf_source[1].checked = true;
      form.pdf_url.value = lesson.pdf_drive_url;
    }
  } else {
    app.togglePdfSourceInput('file');
    form.pdf_source[0].checked = true;
  }

  modal.style.display = 'flex';
};

app.closeLessonModal = function () {
  document.getElementById('lesson-modal').style.display = 'none';
};

// حفظ الدرس (إضافة أو تعديل)
app.saveLesson = async function (form) {
  const lessonId = form.lesson_id.value;
  const title = form.title.value.trim();
  const youtubeUrl = form.youtube_url.value.trim();
  const description = form.description.value.trim();
  const pdfSource = form.pdf_source.value;

  const saveBtn = document.getElementById('modal-save-btn');
  const statusDiv = document.getElementById('modal-upload-status');

  saveBtn.disabled = true;
  statusDiv.style.display = 'block';

  let pdfUrl = '';

  try {
    if (pdfSource === 'url') {
      pdfUrl = form.pdf_url.value.trim();
    } else {
      const file = form.pdf_file.files[0];
      if (file) {
        // الرفع الأوتوماتيكي
        pdfUrl = await app.uploadPdfFile(file);
      } else if (lessonId) {
        // المحافظة على الملف القديم عند التعديل
        const oldLesson = app.data.lessons.find(l => l.id === lessonId);
        pdfUrl = oldLesson ? oldLesson.pdf_drive_url : '';
      }
    }

    if (lessonId) {
      // تعديل
      const lesson = app.data.lessons.find(l => l.id === lessonId);
      if (lesson) {
        lesson.title = title;
        lesson.youtube_url = youtubeUrl;
        lesson.description = description;
        lesson.pdf_drive_url = pdfUrl;
      }
    } else {
      // إضافة جديد
      const subLessons = app.data.lessons.filter(l => l.subject_id === app.selectedAdminSubjectId);
      const nextOrder = subLessons.length > 0 ? Math.max(...subLessons.map(l => l.order || 0)) + 1 : 1;

      const newLesson = {
        id: 'lesson_' + Date.now(),
        subject_id: app.selectedAdminSubjectId,
        title,
        description,
        youtube_url: youtubeUrl,
        pdf_drive_url: pdfUrl,
        order: nextOrder,
        created_at: Date.now()
      };
      app.data.lessons.push(newLesson);
    }

    app.save();
    alert('تم حفظ الدرس بنجاح!');
    app.closeLessonModal();
    router.handleRouting();

  } catch (err) {
    console.error(err);
    alert('حدث خطأ أثناء حفظ الملف: ' + err.message);
  } finally {
    saveBtn.disabled = false;
    statusDiv.style.display = 'none';
  }
};

// وظيفة الرفع التي تختار بين Google Drive و التخزين المحلي الاحتياطي
app.uploadPdfFile = async function (file) {
  const settings = app.data.gdrive_settings;
  const subject = app.data.subjects.find(s => s.id === app.selectedAdminSubjectId);
  const categoryName = subject.category === 'mahad' ? 'معادلة المعاهد' : 'معادلة الدبلومات';
  const subjectName = subject.name;

  // في حال توفر Google Drive credentials والـ token
  if (settings.clientId && settings.token && typeof gapi !== 'undefined' && gapi.client && gapi.client.drive) {
    try {
      console.log('Starting Google Drive Upload process...');

      // 1. إيجاد أو إنشاء المجلد الرئيسي "ملوك المعادلة"
      let rootFolderId = settings.folderId;
      if (!rootFolderId) {
        rootFolderId = await app.getOrCreateDriveFolder('ملوك المعادلة', null);
      }

      // 2. إيجاد أو إنشاء مجلد الفئة (معادلة المعاهد / الدبلومات)
      const categoryFolderId = await app.getOrCreateDriveFolder(categoryName, rootFolderId);

      // 3. إيجاد أو إنشاء مجلد المادة (مثل المحاسبة)
      const subjectFolderId = await app.getOrCreateDriveFolder(subjectName, categoryFolderId);

      // 4. رفع الملف الفعلي إلى مجلد المادة
      const fileId = await app.uploadFileToDriveFolder(file, subjectFolderId);

      // 5. جعل الملف عاماً للقراءة (Public sharing)
      await app.makeDriveFilePublic(fileId);

      // 6. جلب رابط الملف المباشر للمشاهدة والتنزيل
      const fileMetadata = await gapi.client.drive.files.get({
        fileId: fileId,
        fields: 'webViewLink, webContentLink'
      });

      return fileMetadata.result.webViewLink || fileMetadata.result.webContentLink;

    } catch (e) {
      console.error('Failed to upload to Google Drive: ', e);
      throw new Error('فشل الرفع لـ Google Drive: ' + e.message);
    }
  } else {
    // حل محلي احتياطي: استخدام IndexedDB المحلي
    console.log('No Google Drive credentials configured. Falling back to local IndexedDB store.');
    const localId = await window.mediaStore.saveMedia(file);
    return localId;
  }
};

// دوال مساعدة لـ Google Drive API
app.getOrCreateDriveFolder = async function (folderName, parentId) {
  let query = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' and trashed = false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }

  const response = await gapi.client.drive.files.list({
    q: query,
    spaces: 'drive',
    fields: 'files(id, name)'
  });

  const files = response.result.files;
  if (files && files.length > 0) {
    return files[0].id;
  } else {
    // إنشاء مجلد جديد
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    };
    if (parentId) {
      fileMetadata.parents = [parentId];
    }

    const folder = await gapi.client.drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    });
    return folder.result.id;
  }
};

app.uploadFileToDriveFolder = async function (file, parentFolderId) {
  const metadata = {
    name: file.name,
    parents: [parentFolderId]
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST',
    headers: new Headers({ 'Authorization': 'Bearer ' + app.data.gdrive_settings.token }),
    body: form
  });

  if (!response.ok) {
    throw new Error('API Request failure: ' + response.statusText);
  }

  const result = await response.json();
  return result.id;
};

app.makeDriveFilePublic = async function (fileId) {
  // استخدام fetch لإنشاء صلاحيات الوصول
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: 'POST',
    headers: new Headers({
      'Authorization': 'Bearer ' + app.data.gdrive_settings.token,
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify({
      role: 'reader',
      type: 'anyone'
    })
  });

  if (!response.ok) {
    console.warn('Failed to set permissions: ', response.statusText);
  }
};

// حذف درس
app.deleteLesson = function (lessonId) {
  if (confirm('هل أنت متأكد من رغبتك في حذف هذا الدرس نهائياً؟')) {
    app.data.lessons = app.data.lessons.filter(l => l.id !== lessonId);
    app.save();
    alert('تم حذف الدرس بنجاح.');
    router.handleRouting();
  }
};

// ترتيب الدروس
app.moveLesson = function (lessonId, direction) {
  const subjectId = app.selectedAdminSubjectId;
  const subLessons = app.data.lessons
    .filter(l => l.subject_id === subjectId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const index = subLessons.findIndex(l => l.id === lessonId);
  if (index === -1) return;

  if (direction === 'up' && index > 0) {
    // التبديل مع السابق
    const temp = subLessons[index].order;
    subLessons[index].order = subLessons[index - 1].order;
    subLessons[index - 1].order = temp;
  } else if (direction === 'down' && index < subLessons.length - 1) {
    // التبديل مع التالي
    const temp = subLessons[index].order;
    subLessons[index].order = subLessons[index + 1].order;
    subLessons[index + 1].order = temp;
  }

  app.save();
  router.handleRouting();
};

// ==========================================
// مسارات الصفحات الفرعية والاتصال
// ==========================================
router.addRoute('contact', () => {
  const root = document.getElementById('main-content');
  root.innerHTML = `
    <div class="container" style="padding: 60px 0; max-width: 600px;">
      <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 40px; box-shadow: var(--card-shadow);">
        <h2 style="font-size: 28px; font-weight: 800; margin-bottom: 20px; text-align: center;">تواصل معنا</h2>
        <p style="text-align: center; color: var(--text-secondary); margin-bottom: 25px; font-size: 14px;">يسعدنا دائماً استقبال استفساراتكم واقتراحاتكم لتطوير المنصة.</p>
        <form onsubmit="event.preventDefault(); alert('تم إرسال رسالتك بنجاح! وسنتواصل معك قريباً.'); this.reset();">
          <div class="form-group" style="margin-bottom: 15px;">
            <label class="form-label">الاسم الكامل</label>
            <input type="text" class="form-input" required style="width: 100%;">
          </div>
          <div class="form-group" style="margin-bottom: 15px;">
            <label class="form-label">البريد الإلكتروني</label>
            <input type="email" class="form-input" required style="width: 100%;">
          </div>
          <div class="form-group" style="margin-bottom: 20px;">
            <label class="form-label">رسالتك</label>
            <textarea class="form-input" rows="5" style="resize: none; width: 100%;" required placeholder="اكتب استفسارك هنا..."></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px;">إرسال الرسالة</button>
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

router.addRoute('privacy', () => {
  const root = document.getElementById('main-content');
  root.innerHTML = `
    <div class="container" style="padding: 60px 0; max-width: 800px; text-align: right;">
      <h1 style="font-size: 32px; font-weight: 800; margin-bottom: 25px; color: var(--text-primary);">سياسة الخصوصية</h1>
      <p style="line-height: 1.8; color: var(--text-secondary); font-size: 15px;">
        نحن في منصة <strong>ملوك المعادلة</strong> نلتزم بحفظ خصوصيتك التامة وسلامة بياناتك. المنصة مصممة للطلاب للاستخدام المجاني المباشر دون الحاجة إلى إنشاء حساب أو تسجيل دخول، وبالتالي لا نقوم بجمع أو حفظ أي بيانات شخصية تخص الطلاب.
      </p>
    </div>
  `;
});

router.addRoute('terms', () => {
  const root = document.getElementById('main-content');
  root.innerHTML = `
    <div class="container" style="padding: 60px 0; max-width: 800px; text-align: right;">
      <h1 style="font-size: 32px; font-weight: 800; margin-bottom: 25px; color: var(--text-primary);">الشروط والأحكام</h1>
      <p style="line-height: 1.8; color: var(--text-secondary); font-size: 15px;">
        جميع المواد التعليمية والملخصات والروابط المتوفرة على منصة <strong>ملوك المعادلة</strong> مقدمة مجاناً لوجه الله تعالى وللاستخدام الشخصي والدراسي لطلاب المعادلة فقط. لا يجوز استخدامها لأغراض تجارية.
      </p>
    </div>
  `;
});

// تفعيل التنقل عند التحميل
window.addEventListener('load', () => router.handleRouting());
