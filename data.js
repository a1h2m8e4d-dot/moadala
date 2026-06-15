// ملوك المعادلة - قاعدة البيانات والتكوينات الافتراضية
const defaultData = {
  subjects: [
    // مواد معادلة المعاهد
    { id: "accounting-mahad", name: "المحاسبة", category: "mahad" },
    { id: "business-mahad", name: "إدارة الأعمال", category: "mahad" },
    { id: "math-mahad", name: "الرياضيات", category: "mahad" },
    { id: "economics-mahad", name: "تخصصات دراسية باللغة الانجليزية", category: "mahad" },

    // مواد معادلة الدبلومات
    { id: "english-diploma", name: "اللغة الإنجليزية", category: "diploma" },
    { id: "french-diploma", name: "اللغة الفرنسية", category: "diploma" },
    { id: "math-diploma", name: "الرياضيات", category: "diploma" },
    { id: "geography-diploma", name: "الجغرافيا", category: "diploma" }
  ],
  lessons: [
    // بعض الدروس الافتراضية للتجربة
    {
      id: "lesson-math-1",
      subject_id: "math-mahad",
      title: "الدرس الأول: مقدمة في المصفوفات",
      description: "شرح تفصيلي للمصفوفات وأنواعها والعمليات الأساسية عليها.",
      youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      pdf_drive_url: "",
      order: 1,
      created_at: Date.now()
    },
    {
      id: "lesson-english-1",
      subject_id: "english-diploma",
      title: "الدرس الأول: قواعد الأزمنة البسيطة",
      description: "شرح زمن المضارع البسيط والماضي البسيط والفرق بينهما مع أمثلة عملية.",
      youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      pdf_drive_url: "",
      order: 1,
      created_at: Date.now()
    }
  ],
  faq: [
    {
      q: "ما هي شروط التقديم لمعادلة كلية التجارة؟",
      a: "أن يكون الطالب حاصلاً على دبلوم المدارس الثانوية الفنية التجارية بنظام 3 سنوات بمجموع 70% فأكثر، أو معاهد فنية تجارية دون شرط المجموع."
    },
    {
      q: "هل المنصة مجانية بالكامل؟",
      a: "نعم، المنصة مجانية بالكامل لوجه الله تعالى لخدمة الطلاب وتيسير العلم عليهم، ولا توجد أي اشتراكات أو رسوم."
    }
  ],
  gdrive_settings: {
    clientId: "",
    apiKey: "",
    folderId: "", // المجلد الرئيسي لملوك المعادلة
    token: ""
  }
};
