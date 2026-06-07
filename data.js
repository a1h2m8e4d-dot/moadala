// ملوك المعادلة - قاعدة البيانات التجريبية
const defaultData = {
  courses: [
    {
      id: "math",
      title: "الرياضيات العامة والخاصة",
      category: "math",
      categoryName: "الرياضيات",
      thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600",
      description: "كورس شامل ومبسط يغطي كافة جوانب منهج الرياضيات لمعادلة كلية التجارة، من الجبر والمصفوفات وحتى الاحتمالات والتفاضل.",
      instructor: {
        name: "أ.د. محمد أحمد عثمان",
        title: "أستاذ الرياضيات المساعد بجامعة القاهرة",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150",
        bio: "خبرة أكثر من 15 عاماً في تدريس وتأهيل الطلاب لاجتياز اختبارات المعادلة بنسب نجاح تتخطى 95%."
      },
      stats: { duration: "32 ساعة", lessonsCount: 16, studentsCount: 1420, rating: 4.9 },
      lessons: [
        {
          id: "math-l1",
          title: "الدرس الأول: المصفوفات والعمليات عليها",
          duration: "45 دقيقة",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          homework: "حل تمارين الباب الأول من كتاب المعادلة - صفحة 12 إلى 15",
          notes: "تأكد من مراجعة قاعدة كرامر لحل المعادلات قبل البدء بالفيديو."
        },
        {
          id: "math-l2",
          title: "الدرس الثاني: المحددات وطريقة كرامر",
          duration: "50 دقيقة",
          videoUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
          pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          homework: "أوجد قيمة المحدد الثنائي والثلاثي للمسائل المرفقة.",
          notes: "المحددات هي مفتاح حل الأنظمة المعقدة من المعادلات الخطية."
        },
        {
          id: "math-l3",
          title: "الدرس الثالث: مبدأ العد والتوافيق والتباديل",
          duration: "40 دقيقة",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          homework: "حل مسائل اختيار اللجان والترتيب الدائري.",
          notes: "قوانين التباديل والتوافيق تحتاج إلى فهم الفروق الجوهرية بين الترتيب والاختيار العشوائي."
        },
        {
          id: "math-l4",
          title: "الدرس الرابع: نظرية ذات الحدين وتطبيقاتها",
          duration: "55 دقيقة",
          videoUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
          pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          homework: "إيجاد الحد الخالي من س والحد الأوسط في المفكوكات المعطاة.",
          notes: "الحد الأوسط والحد الخالي من س من الأسئلة المؤكدة في امتحان نهاية العام."
        }
      ],
      reviews: [
        { studentName: "أحمد محمود", rating: 5, comment: "شرح أستاذ محمد ممتاز جداً ويبسط المعقد! جزاه الله خيراً.", date: "2026-05-12" },
        { studentName: "سارة محمد", rating: 5, comment: "الكورس منظم جداً وبنك الأسئلة المرفق لا يخرج عنه الامتحان.", date: "2026-05-28" }
      ]
    },
    {
      id: "geography",
      title: "جغرافيا مصر الطبيعية والبشرية",
      category: "geography",
      categoryName: "الجغرافيا",
      thumbnail: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600",
      description: "شرح تفصيلي وممتع لجغرافيا مصر بأسلوب تفاعلي مدعوم بالخرائط الذهنية لضمان الحفظ والفهم السريع.",
      instructor: {
        name: "د. طارق الحسين",
        title: "خبير الجغرافيا بوزارة التربية والتعليم",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
        bio: "مؤلف العديد من المراجع الجغرافية التعليمية، ومحاضر متميز لأكثر من 10 سنوات في برامج إعداد المعادلة."
      },
      stats: { duration: "25 ساعة", lessonsCount: 12, studentsCount: 980, rating: 4.8 },
      lessons: [
        {
          id: "geo-l1",
          title: "الدرس الأول: موقع مصر الجغرافي وأهميته وروافد الحدود",
          duration: "35 دقيقة",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          homework: "ارسم خريطة مصر وحدد عليها أهم المنافذ البرية والبحرية.",
          notes: "احرص على حفظ أسماء المضايق والخلجان المجاورة."
        },
        {
          id: "geo-l2",
          title: "الدرس الثاني: أقسام مصر التضاريسية (وادي النيل والدلتا)",
          duration: "40 دقيقة",
          videoUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
          pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          homework: "مقارنة بين الدلتا والوادي من حيث الاتساع ونوع التربة.",
          notes: "تضاريس مصر هي العمود الفقري لأسئلة الجغرافيا."
        }
      ],
      reviews: [
        { studentName: "محمود حسن", rating: 5, comment: "طريقة استخدام الخرائط رائعة وممتازة تجعل الحفظ سهلاً.", date: "2026-06-01" }
      ]
    },
    {
      id: "english",
      title: "اللغة الإنجليزية الشاملة",
      category: "english",
      categoryName: "الانجليزي",
      thumbnail: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=600",
      description: "تغطية كاملة لقواعد اللغة الإنجليزية والمفردات وقطع الفهم المقررة على طلاب المعادلة مع حل امتحانات السنوات السابقة.",
      instructor: {
        name: "مستر أمجد عادل",
        title: "محاضر اللغة الإنجليزية بالمركز الثقافي البريطاني سابقاً",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150",
        bio: "مطور مناهج ومحاضر معتمد لمستويات الـ ESL واختبارات القبول للجامعات المصرية."
      },
      stats: { duration: "30 ساعة", lessonsCount: 15, studentsCount: 1150, rating: 4.7 },
      lessons: [
        {
          id: "eng-l1",
          title: "الدرس الأول: الأزمنة الأساسية (المضارع والماضي البسيط والمستمر)",
          duration: "50 دقيقة",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          homework: "حل الـ 50 سؤال الاختياري المرفق في نهاية ملخص الـ PDF.",
          notes: "الكلمات الدالة هي دليلك لاختيار الزمن الصحيح."
        }
      ],
      reviews: [
        { studentName: "منى خالد", rating: 4, comment: "الشرح مبسط والملفات المرفقة تلخص القواعد بشكل ممتاز.", date: "2026-06-03" }
      ]
    },
    {
      id: "french",
      title: "اللغة الفرنسية من الصفر للاحتراف",
      category: "french",
      categoryName: "الفرنساوي",
      thumbnail: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600",
      description: "منهج اللغة الفرنسية مبسط لجميع المستويات للتمكن من الحصول على الدرجة النهائية بسهولة تامة.",
      instructor: {
        name: "مدام إيمان سليم",
        title: "كبير معلمي اللغة الفرنسية بمدرسة السعيدية الثانوية",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
        bio: "خبيرة تدريس المنهج الفرنسي لطلاب الثانوية والمعادلة منذ أكثر من 12 عاماً."
      },
      stats: { duration: "20 ساعة", lessonsCount: 10, studentsCount: 720, rating: 4.6 },
      lessons: [
        {
          id: "fr-l1",
          title: "الدرس الأول: أدوات المعرفة والنكرة والتأنيث والجمع",
          duration: "40 دقيقة",
          videoUrl: "https://media.w3.org/2010/05/sintel/trailer_hd.mp4",
          pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          homework: "صنف الكلمات التالية إلى مذكر ومؤنث مستخدماً أدوات المعرفة المناسبة.",
          notes: "انتبه للنهايات الخاصة بالكلمات لتحديد جنس الاسم بسهولة."
        }
      ],
      reviews: []
    }
  ],
  questionBank: [
    {
      id: "q1",
      courseId: "math",
      type: "mcq",
      question: "إذا كانت أ مصفوفة من النظم 2×3، وب مصفوفة من النظم 3×2، فإن حاصل ضرب المصفوفة أ×ب يكون مصفوفة من النظم:",
      options: ["2×2", "3×3", "2×3", "لا يمكن الضرب"],
      answer: "2×2",
      explanation: "عند ضرب مصفوفتين، عدد أعمدة الأولى (3) يجب أن يساوي عدد صفوف الثانية (3)، وتكون رتبة المصفوفة الناتجة هي (عدد صفوف الأولى × عدد أعمدة الثانية) أي 2×2.",
      difficulty: "easy"
    },
    {
      id: "q2",
      courseId: "math",
      type: "mcq",
      question: "قيمة المحدد الثنائي |5  2| |3  4| تساوي:",
      options: ["14", "26", "22", "10"],
      answer: "14",
      explanation: "قيمة المحدد الثنائي = (5 × 4) - (2 × 3) = 20 - 6 = 14.",
      difficulty: "easy"
    },
    {
      id: "q3",
      courseId: "math",
      type: "tf",
      question: "تكون المصفوفة المربعة منفردة (ليس لها معكوس ضربي) إذا كانت قيمة محددها تساوي صفراً.",
      options: ["صواب", "خطأ"],
      answer: "صواب",
      explanation: "المعكوس الضربي للمصفوفة يعتمد على قسمة المصفوفة الملحقة على محدد أ. فإذا كان المحدد يساوي صفراً، تصبح القسمة على صفر غير معرفة وبالتالي ليس لها معكوس ضربي.",
      difficulty: "medium"
    },
    {
      id: "q4",
      courseId: "geography",
      type: "mcq",
      question: "يمر مدار السرطان في جنوب مصر بـ:",
      options: ["بحيرة ناصر", "منخفض القطارة", "شبه جزيرة سيناء", "الدلتا"],
      answer: "بحيرة ناصر",
      explanation: "يمر مدار السرطان (23.5 درجة شمالاً) بالجنوب المصري مخترقاً الأجزاء الجنوبية من بحيرة ناصر في النوبة.",
      difficulty: "medium"
    },
    {
      id: "q5",
      courseId: "geography",
      type: "tf",
      question: "تعتبر الصحراء الغربية أكبر الأقسام التضاريسية مساحة في مصر.",
      options: ["صواب", "خطأ"],
      answer: "صواب",
      explanation: "تبلغ مساحة الصحراء الغربية حوالي 680 ألف كم مربع، أي ما يعادل 68% تقريباً من المساحة الكلية لجمهورية مصر العربية.",
      difficulty: "easy"
    },
    {
      id: "q6",
      courseId: "english",
      type: "mcq",
      question: "He ______ to Alexandria every summer since his childhood.",
      options: ["has been going", "goes", "went", "is going"],
      answer: "has been going",
      explanation: "تستخدم صيغة المضارع التام المستمر للتعبير عن حدث متكرر بدأ في الماضي ومستمر حتى الوقت الحاضر ومصحوب بـ since.",
      difficulty: "medium"
    },
    {
      id: "q7",
      courseId: "french",
      type: "mcq",
      question: "Choisissez l'article convenable: _____ tableau.",
      options: ["Le", "La", "L'", "Les"],
      answer: "Le",
      explanation: "كلمة tableau (سبورة/لوحة) اسم مفرد مذكر بالفرنسية، وتأخذ أداة المعرفة Le.",
      difficulty: "easy"
    }
  ],
  community: [
    {
      id: "c1",
      courseId: "math",
      title: "سؤال بخصوص طريقة كرامر للمحددات الثلاثية",
      content: "هل تأتي في الامتحان محددات من الدرجة الثالثة لحلها بطريقة كرامر أم يكتفي بالثنائية لضيق الوقت؟",
      author: "يوسف الهواري",
      date: "2026-06-05",
      replies: [
        {
          id: "r1",
          author: "أ.د. محمد أحمد عثمان",
          role: "teacher",
          content: "مرحباً يوسف. نعم، تأتي أحياناً مصفوفات ثلاثية ولكن تكون الأرقام بسيطة ومباشرة لتسهيل الحساب المباشر. يفضل التدرب عليها جيداً.",
          likes: 12,
          isBest: true
        },
        {
          id: "r2",
          author: "أحمد علي",
          role: "student",
          content: "بالفعل امتحانات العام الماضي تضمنت سؤالين على المحددات الثلاثية وكانت سهلة وبسيطة.",
          likes: 3,
          isBest: false
        }
      ]
    },
    {
      id: "c2",
      courseId: "geography",
      title: "أسهل طريقة لحفظ نسب إنتاج المعادن في مصر؟",
      content: "هل يجب حفظ الأرقام والنسب المئوية الدقيقة لإنتاج الحديد والفوسفات أم نكتفي بالترتيب التنازلي؟",
      author: "فاطمة الزهراء",
      date: "2026-06-06",
      replies: [
        {
          id: "r3",
          author: "د. طارق الحسين",
          role: "teacher",
          content: "الأولوية لحفظ الترتيب وأهم حقول الإنتاج (مثل الواحات البحرية للحديد والسباعية للفوسفات). النسب الدقيقة نادراً ما تأتي ولكن يفضل معرفة التقريبية منها.",
          likes: 8,
          isBest: true
        }
      ]
    }
  ],
  faq: [
    {
      q: "ما هي شروط التقديم لمعادلة كلية التجارة؟",
      a: "أن يكون الطالب حاصلاً على دبلوم المدارس الثانوية الفنية التجارية بنظام 3 سنوات بمجموع 70% فأكثر، أو دبلوم 5 سنوات، أو معاهد فنية تجارية دون شرط المجموع."
    },
    {
      q: "ما هي المواد المقررة في اختبار المعادلة؟",
      a: "يختبر طلاب الدبلومات (3 سنوات) في أربع مواد أساسية: الرياضيات، الجغرافيا، اللغة الإنجليزية، واللغة الفرنسية."
    },
    {
      q: "كيف تساهم منصة ملوك المعادلة في نجاحي؟",
      a: "توفر المنصة شرحاً بالفيديو لكل المواد، ملخصات بصيغة PDF، بنك أسئلة ضخم يحاكي نظام البابل شيت (MCQ)، اختبارات تقييمية ومتابعة دورية، بالإضافة إلى منتدى طلابي للإجابة عن استفساراتكم فوراً."
    },
    {
      q: "هل الشهادات المقدمة من المنصة معتمدة؟",
      a: "الشهادات هي شهادات إتمام دراسة تحفيزية وتأهيلية تثبت اجتيازك لكامل المنهج بنجاح، ويمكن التحقق منها برقم سري فريد على منصتنا."
    }
  ],
  statistics: {
    students: 3850,
    courses: 4,
    lessons: 53,
    exams: 24,
    successRate: 94
  }
};
