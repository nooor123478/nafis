import { GradeInfo, ScienceUnit, Resource, Activity, LeaderboardUser, UserProfile } from '../types';

export const DEMO_USERS: Record<string, UserProfile> = {
  teacher: {
    id: 't-101',
    name: 'أ. فاطمة الزهراء',
    role: 'teacher',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    school: 'مدرسة رواد العلوم الحديثة',
  },
  student: {
    id: 's-201',
    name: 'أحمد خالد المطوع',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    grade: 4,
    points: 380,
    school: 'مدرسة النخبة الابتدائية',
  },
  admin: {
    id: 'a-001',
    name: 'د. يوسف المنصوري',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    school: 'إدارة التعليم الرقمي والتطوير',
  }
};

export const GRADES_DATA: GradeInfo[] = [
  // Cycle 1: Grades 1-4
  {
    id: 1,
    cycleId: 'cycle-1',
    number: 1,
    name: 'الصف الأول الابتدائي',
    subtitle: 'استكشاف العالم من حولي',
    icon: '🌱',
    color: 'from-emerald-500 to-teal-700',
    unitsCount: 4,
    description: 'الحواس الخمس، النباتات وأجزاؤها، ومواطن الحيوانات الأليفة.'
  },
  {
    id: 2,
    cycleId: 'cycle-1',
    number: 2,
    name: 'الصف الثاني الابتدائي',
    subtitle: 'الكائنات الحية والبيئة',
    icon: '🦋',
    color: 'from-cyan-500 to-blue-700',
    unitsCount: 4,
    description: 'دورة حياة الكائنات، حالات المادة البسيطة، والقوى السحرية كالمغناطيس.'
  },
  {
    id: 3,
    cycleId: 'cycle-1',
    number: 3,
    name: 'الصف الثالث الابتدائي',
    subtitle: 'السلاسل الغذائية والنظام الشمسي',
    icon: '🪐',
    color: 'from-amber-500 to-orange-700',
    unitsCount: 4,
    description: 'سلاسل الغذاء، تغيرات المادة، الصوت والضوء وكواكب المجموعة الشمسية.'
  },
  {
    id: 4,
    cycleId: 'cycle-1',
    number: 4,
    name: 'الصف الرابع الابتدائي',
    subtitle: 'أجهزة الجسم والتكيف والطاقة',
    icon: '⚡',
    color: 'from-purple-500 to-indigo-800',
    unitsCount: 4,
    description: 'أجهزة جسم الإنسان، التكيف والبقاء، الطاقة الكهربائية، والصخور.'
  },
  // Cycle 2: Grades 5-10
  {
    id: 5,
    cycleId: 'cycle-2',
    number: 5,
    name: 'الصف الخامس',
    subtitle: 'الخلية والأنظمة البيئية والمغناطيسية',
    icon: '🔬',
    color: 'from-blue-600 to-indigo-900',
    unitsCount: 4,
    description: 'الخلية النباتية والحيوانية، التوازن البيئي، المغناطيسية ودورة الماء.'
  },
  {
    id: 6,
    cycleId: 'cycle-2',
    number: 6,
    name: 'الصف السادس',
    subtitle: 'أجهزة الجسم والذرات والحرارة',
    icon: '🧬',
    color: 'from-violet-600 to-purple-950',
    unitsCount: 4,
    description: 'الجهاز العصبي والهضمي، تركيب المادة والذرة، وانتقال الحرارة.'
  },
  {
    id: 7,
    cycleId: 'cycle-2',
    number: 7,
    name: 'الصف السابع',
    subtitle: 'التصنيف الحيوي والضوء والتفاعلات',
    icon: '🧪',
    color: 'from-fuchsia-600 to-pink-900',
    unitsCount: 4,
    description: 'ممالك الكائنات الحية، البصريات والمرايا، والتفاعلات الكيميائية الأساسية.'
  },
  {
    id: 8,
    cycleId: 'cycle-2',
    number: 8,
    name: 'الصف الثامن',
    subtitle: 'علم الوراثة والموجات والجدول الدوري',
    icon: '⚛️',
    color: 'from-rose-600 to-red-950',
    unitsCount: 4,
    description: 'مبادئ الوراثة والجينات، الموجات الكهرومغناطيسية، والجدول الدوري.'
  },
  {
    id: 9,
    cycleId: 'cycle-2',
    number: 9,
    name: 'الصف التاسع',
    subtitle: 'الميكانيكا الكلاسيكية والروابط الكيميائية',
    icon: '🚀',
    color: 'from-sky-600 to-blue-950',
    unitsCount: 4,
    description: 'قوانين نيوتن للحركة، الروابط التساهمية والأيونية، وانقسام الخلية.'
  },
  {
    id: 10,
    cycleId: 'cycle-2',
    number: 10,
    name: 'الصف العاشر',
    subtitle: 'الفيزياء المتقدمة والكيمياء وعلم الفلك',
    icon: '🔭',
    color: 'from-purple-700 to-indigo-950',
    unitsCount: 4,
    description: 'الديناميكا الحرارية، الكيمياء العضوية، النسبية وعلم الفلك والكون.'
  }
];

export const SCIENCE_UNITS: ScienceUnit[] = [
  // Grade 4 Units
  {
    id: 'u-g4-1',
    gradeId: 4,
    number: 1,
    title: 'الوحدة الأولى: الكائنات الحية والتكيف',
    description: 'دراسة طرق تكيف الحيوانات والنباتات للبقاء على قيد الحياة في بيئات مختلفة.',
    iconName: 'Fish',
    lessons: [
      { id: 'l-g4-1-1', unitId: 'u-g4-1', gradeId: 4, number: 1, title: 'الدرس الأول: التكيف السلوكي والتركيبي', summary: 'الفرق بين التكيف في الجسم والسلوك للحيوانات مثل الجمل والبطريق.' },
      { id: 'l-g4-1-2', unitId: 'u-g4-1', gradeId: 4, number: 2, title: 'الدرس الثاني: الحواس الفائقة عند الحيوانات', summary: 'كيف تستخدم الخفافيش والكلاب والقطط الحواس للتواصل والاصطياد.' },
      { id: 'l-g4-1-3', unitId: 'u-g4-1', gradeId: 4, number: 3, title: 'الدرس الثالث: الضوء وحاسة البصر', summary: 'كيف نرى الأشياء وانعكاس الضوء وتشريح العين البسيط.' }
    ]
  },
  {
    id: 'u-g4-2',
    gradeId: 4,
    number: 2,
    title: 'الوحدة الثانية: المادة والطاقة والحركة',
    description: 'مفاهيم الطاقة الحركية وطاقة الوضع وقوى التصادم والسرعة.',
    iconName: 'Zap',
    lessons: [
      { id: 'l-g4-2-1', unitId: 'u-g4-2', gradeId: 4, number: 1, title: 'الدرس الأول: الحركة والتوقف والقوى', summary: 'القوى المتزنة وغير المتزنة وتأثير الاحتكاك.' },
      { id: 'l-g4-2-2', unitId: 'u-g4-2', gradeId: 4, number: 2, title: 'الدرس الثاني: الطاقة والتصادم', summary: 'تحولات الطاقة عند تصادم الأجسام ووسائل الأمان كحزام الأمان.' }
    ]
  },
  {
    id: 'u-g4-3',
    gradeId: 4,
    number: 3,
    title: 'الوحدة الثالثة: أجهزة جسم الإنسان',
    description: 'استكشاف الجهاز التنفسي والدوري والهضمي.',
    iconName: 'Heart',
    lessons: [
      { id: 'l-g4-3-1', unitId: 'u-g4-3', gradeId: 4, number: 1, title: 'الدرس الأول: الجهاز الهضمي ورحلة الطعام', summary: 'الفم والمعدة والأمعاء وامتصاص الغذاء الصحي.' },
      { id: 'l-g4-3-2', unitId: 'u-g4-3', gradeId: 4, number: 2, title: 'الدرس الثاني: الجهاز التنفسي وتبادل الغازات', summary: 'الرئتان والحجاب الحاجز والأكسجين.' }
    ]
  },
  {
    id: 'u-g4-4',
    gradeId: 4,
    number: 4,
    title: 'الوحدة الرابعة: الأرض والفضاء',
    description: 'دوران الأرض وتعاقب الليل والنهار والفصول الأربعة.',
    iconName: 'Globe',
    lessons: [
      { id: 'l-g4-4-1', unitId: 'u-g4-4', gradeId: 4, number: 1, title: 'الدرس الأول: دوران الأرض حول محورها', summary: 'حدوث الليل والنهار وظل الأجسام خلال اليوم.' }
    ]
  },

  // Grade 6 Units
  {
    id: 'u-g6-1',
    gradeId: 6,
    number: 1,
    title: 'الوحدة الأولى: الخلية وحدة بناء الحياة',
    description: 'الخلية الحيوانية والنباتية، العضيات، واستخدام المجهر.',
    iconName: 'Microscope',
    lessons: [
      { id: 'l-g6-1-1', unitId: 'u-g6-1', gradeId: 6, number: 1, title: 'الدرس الأول: المجهر والخلية', summary: 'تاريخ اكتشاف الخلية وأجزاء المجهر الضوئي.' },
      { id: 'l-g6-1-2', unitId: 'u-g6-1', gradeId: 6, number: 2, title: 'الدرس الثاني: مقارنة بين الخلية النباتية والحيوانية', summary: 'الجدار الخلوي والبلاستيدات الخضراء والغشاء البلازمي.' }
    ]
  },
  {
    id: 'u-g6-2',
    gradeId: 6,
    number: 2,
    title: 'الوحدة الثانية: الحرارة وطرق انتقالها',
    description: 'التوصيل والحمل والإشعاع وتطبيقات العزل الحراري.',
    iconName: 'Flame',
    lessons: [
      { id: 'l-g6-2-1', unitId: 'u-g6-2', gradeId: 6, number: 1, title: 'الدرس الأول: انتقال الحرارة بالتوصيل', summary: 'المواد الموصلة والمواد العازلة للحرارة.' },
      { id: 'l-g6-2-2', unitId: 'u-g6-2', gradeId: 6, number: 2, title: 'الدرس الثاني: الحمل والإشعاع الحراري', summary: 'تيارات الحمل في السوائل والغازات وأشعة الشمس.' }
    ]
  },

  // Grade 8 Units
  {
    id: 'u-g8-1',
    gradeId: 8,
    number: 1,
    title: 'الوحدة الأولى: الجدول الدوري وتركيب الذرة',
    description: 'الإلكترونات والبروتونات والنيوترونات والدورات والمجموعات.',
    iconName: 'Atom',
    lessons: [
      { id: 'l-g8-1-1', unitId: 'u-g8-1', gradeId: 8, number: 1, title: 'الدرس الأول: بنية الذرة', summary: 'النواة ومستويات الطاقة والتوزيع الإلكتروني.' },
      { id: 'l-g8-1-2', unitId: 'u-g8-1', gradeId: 8, number: 2, title: 'الدرس الثاني: تصنيف العناصر في الجدول الدوري', summary: 'الفلزات واللافلزات وأشباه الفلزات والغازات النبيلة.' }
    ]
  },

  // Grade 1 Units
  {
    id: 'u-g1-1',
    gradeId: 1,
    number: 1,
    title: 'الوحدة الأولى: الحواس الخمس المدهشة',
    description: 'كيف نكتشف العالم من خلال السمع والبصر والشم واللمس والتذوق.',
    iconName: 'Eye',
    lessons: [
      { id: 'l-g1-1-1', unitId: 'u-g1-1', gradeId: 1, number: 1, title: 'الدرس الأول: عيناي تبصران وأذناي تسمعان', summary: 'التعرف على الألوان والأصوات المحيطة بنا.' },
      { id: 'l-g1-1-2', unitId: 'u-g1-1', gradeId: 1, number: 2, title: 'الدرس الثاني: أنفي ولساني ويدي', summary: 'التمييز بين الروائح والمذاقات والملمس الناعم والخشن.' }
    ]
  }
];

export const INITIAL_RESOURCES: Resource[] = [
  {
    id: 'res-1',
    title: 'محاكاة تفاعلية: بنية الخلية النباتية والحيوانية ثلاثية الأبعاد',
    description: 'تجربة محاكاة معملية تسمح للطلاب بفحص النواة والميتوكوندريا والجدار الخلوي بدقة عالية.',
    url: 'https://phet.colorado.edu/',
    cycleId: 'cycle-2',
    gradeId: 6,
    subject: 'العلوم',
    unitId: 'u-g6-1',
    unitTitle: 'الوحدة الأولى: الخلية وحدة بناء الحياة',
    lessonId: 'l-g6-1-2',
    lessonTitle: 'الدرس الثاني: مقارنة بين الخلية النباتية والحيوانية',
    type: 'simulation',
    coverImage: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=500&auto=format&fit=crop&q=80',
    authorName: 'أ. فاطمة الزهراء',
    dateAdded: '2026-09-15',
    clicksCount: 245
  },
  {
    id: 'res-2',
    title: 'فيديو تعليمي عالي الجودة: كيف تتكيف الجمال والدببة القطبية؟',
    description: 'شرح ممتع بالرسوم المتحركة لأنواع التكيف السلوكي والتركيبي لدى الحيوانات في الصحراء والقطب.',
    url: 'https://www.youtube.com/',
    cycleId: 'cycle-1',
    gradeId: 4,
    subject: 'العلوم',
    unitId: 'u-g4-1',
    unitTitle: 'الوحدة الأولى: الكائنات الحية والتكيف',
    lessonId: 'l-g4-1-1',
    lessonTitle: 'الدرس الأول: التكيف السلوكي والتركيبي',
    type: 'video',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    authorName: 'أ. محمد السعيد',
    dateAdded: '2026-09-18',
    clicksCount: 420
  },
  {
    id: 'res-3',
    title: 'لعبة تفاعلية: متاهة أجهزة الجسم ورحلة لقمة الطعام',
    description: 'لعبة تعليمية ممتعة يوجه فيها الطالب الطعام داخل أعضاء الجهاز الهضمي لكسب النقاط.',
    url: 'https://learningapps.org/',
    cycleId: 'cycle-1',
    gradeId: 4,
    subject: 'العلوم',
    unitId: 'u-g4-3',
    unitTitle: 'الوحدة الثالثة: أجهزة جسم الإنسان',
    lessonId: 'l-g4-3-1',
    lessonTitle: 'الدرس الأول: الجهاز الهضمي ورحلة الطعام',
    type: 'game',
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80',
    authorName: 'أ. سارة الهاشمي',
    dateAdded: '2026-09-19',
    clicksCount: 310
  },
  {
    id: 'res-4',
    title: 'موقع تعليمي تفاعلي: الجدول الدوري الذكي للعناصر',
    description: 'جدول دوري تفاعلي باللغة العربية يعرض الخواص الكيميائية والفيزيائية لكل عنصر بصور واقعية.',
    url: 'https://ptable.com/?lang=ar',
    cycleId: 'cycle-2',
    gradeId: 8,
    subject: 'العلوم',
    unitId: 'u-g8-1',
    unitTitle: 'الوحدة الأولى: الجدول الدوري وتركيب الذرة',
    lessonId: 'l-g8-1-2',
    lessonTitle: 'الدرس الثاني: تصنيف العناصر في الجدول الدوري',
    type: 'website',
    coverImage: 'https://images.unsplash.com/photo-1603555501671-8f96b3fce8b5?w=500&auto=format&fit=crop&q=80',
    authorName: 'أ. فاطمة الزهراء',
    dateAdded: '2026-09-12',
    clicksCount: 180
  },
  {
    id: 'res-5',
    title: 'ملف ملخص مصور: قوانين الحركة والتصادم وأحزمة الأمان',
    description: 'كتيب PDF عالي الوضوح يتضمن رسوم بيانية توضح القوى والطاقة الحركية والتصادم.',
    url: 'https://drive.google.com/',
    cycleId: 'cycle-1',
    gradeId: 4,
    subject: 'العلوم',
    unitId: 'u-g4-2',
    unitTitle: 'الوحدة الثانية: المادة والطاقة والحركة',
    lessonId: 'l-g4-2-2',
    lessonTitle: 'الدرس الثاني: الطاقة والتصادم',
    type: 'document',
    coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500&auto=format&fit=crop&q=80',
    authorName: 'أ. خالد التميمي',
    dateAdded: '2026-09-17',
    clicksCount: 290
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    title: 'تحدي أبطال التكيف والبقاء في الطبيعة',
    description: 'نشاط تفاعلي حماسي يقيس مدى فهمك لطرق تكيف الحيوانات والنباتات والحواس الفائقة.',
    teacherId: 't-101',
    teacherName: 'أ. فاطمة الزهراء',
    cycleId: 'cycle-1',
    gradeId: 4,
    subject: 'العلوم',
    unitId: 'u-g4-1',
    unitTitle: 'الوحدة الأولى: الكائنات الحية والتكيف',
    lessonId: 'l-g4-1-1',
    lessonTitle: 'الدرس الأول: التكيف السلوكي والتركيبي',
    type: 'challenge',
    questionsCount: 5,
    totalTimeSeconds: 150,
    totalPoints: 50,
    createdAt: '2026-09-16',
    status: 'published',
    shareCode: 'SCI-401',
    playsCount: 148,
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    questions: [
      {
        id: 'q-1',
        activityId: 'act-1',
        questionText: 'أي من الآتي يعتبر مثالاً على التكيف السلوكي لدى الحيوانات؟',
        choices: [
          'هجرة الطيور إلى المناطق الدافئة شتاءً',
          'وجود الفراء السميك لدى الدب القطبي',
          'طول رقبة الزرافة لتناول أوراق الأشجار',
          'الأقدام العريضة للجمل في الرمال'
        ],
        correctAnswerIndex: 0,
        points: 10,
        timeLimitSeconds: 30,
        hint: 'فكر في تصرف أو نشاط يقوم به الحيوان وليس في شكل جسده الداخلي أو الخارجي.',
        explanation: 'هجرة الطيور سلوك تقوم به هرباً من البرد، بينما الفراء والرقبة وأقدام الجمل تكيفات تركيبية في أجسادها.'
      },
      {
        id: 'q-2',
        activityId: 'act-1',
        questionText: 'ما هي الحاسة الفائقة التي يستخدمها الخفاش في الطيران واصطياد الحشرات في الظلام الدامس؟',
        choices: [
          'حاسة الشم الحادة',
          'تحديد الموقع بصدى الصوت',
          'الرؤية الليلية بالأشعة تحت الحمراء',
          'حاسة التذوق المتطورة'
        ],
        correctAnswerIndex: 1,
        points: 10,
        timeLimitSeconds: 20,
        hint: 'يصدر الخفاش موجات صوتية ترتد إليه عندما تصطدم بالعوائق أو الفريسة.',
        explanation: 'الخفافيش تصدر موجات صوتية عالية التردد وترتد كصدى، مما يسمح لها بتحديد المسافة والاتجاه بدقة.'
      },
      {
        id: 'q-3',
        activityId: 'act-1',
        questionText: 'تتميز النباتات الصحراوية مثل نبات الصبار بوجود أوراق تحولت إلى أشواك، ما فائدة ذلك؟',
        choices: [
          'لتقليل فقدان الماء بالتبخر وحمايتها من الحيوانات',
          'لجذب الحشرات للتلقيح',
          'لزيادة عملية البناء الضوئي',
          'لتخزين الهواء البارد'
        ],
        correctAnswerIndex: 0,
        points: 10,
        timeLimitSeconds: 25,
        hint: 'الصحراء قليلة الأمطار وحارة جداً وتعيش بها حيوانات تبحث عن رطوبة.',
        explanation: 'الأشواك تقلل مساحة السطح المعرضة للشمس لمنع التبخر، كما تحمي النبتة من أن تأكلها الحيوانات العطشى.'
      },
      {
        id: 'q-4',
        activityId: 'act-1',
        questionText: 'ما الذي يساعد البطريق على الوقوف فوق الجليد دون أن تتجمد قدماه؟',
        choices: [
          'أوعية دموية دافئة تلتف حول الأوعية الباردة لتدفئتها',
          'طبقة سميكة جداً من الفراء على باطن قدميه',
          'إفراز زيت ساخن يحمي قدميه من الثلج',
          'أنه لا يشعر بالبرد نهائياً'
        ],
        correctAnswerIndex: 0,
        points: 10,
        timeLimitSeconds: 30,
        hint: 'نظام رائع لتبادل الحرارة في الدورة الدموية للأقدام.',
        explanation: 'تلتف الأوعية الدموية الحاملة للدم الدافئ من الجسم حول الأوعية الباردة القادمة من القدمين، فتدفئها باستمرار.'
      },
      {
        id: 'q-5',
        activityId: 'act-1',
        questionText: 'تعتبر حاسة البصر لدى الصقور والنسور حادة جداً لأنها:',
        choices: [
          'تحتاج إلى رصد الفرائس الصغيرة من ارتفاعات شاهقة في السماء',
          'تطير ليلاً فقط',
          'تتغذى على النباتات الأرضية فقط',
          'تستخدمها لتوليد حرارة للجسم'
        ],
        correctAnswerIndex: 0,
        points: 10,
        timeLimitSeconds: 20,
        hint: 'الجوارح تطير على مسافات بعيدة جداً وتبحث عن فئران أو أرانب صغيرة.',
        explanation: 'الطيور الجارحة تمتلك عيوناً متطورة جداً تتيح لها رؤية حركة دقيقة لفريسة صغيرة من مسافة كيلومترات.'
      }
    ]
  },
  {
    id: 'act-2',
    title: 'لغز الخلية المجهرية: النباتية والحيوانية',
    description: 'تحدي المعمل للصف السادس: اكتشف أسرار الميتوكوندريا والجدار الخلوي والبلاستيدات الخضراء.',
    teacherId: 't-101',
    teacherName: 'أ. فاطمة الزهراء',
    cycleId: 'cycle-2',
    gradeId: 6,
    subject: 'العلوم',
    unitId: 'u-g6-1',
    unitTitle: 'الوحدة الأولى: الخلية وحدة بناء الحياة',
    lessonId: 'l-g6-1-2',
    lessonTitle: 'الدرس الثاني: مقارنة بين الخلية النباتية والحيوانية',
    type: 'timed_quiz',
    questionsCount: 4,
    totalTimeSeconds: 100,
    totalPoints: 40,
    createdAt: '2026-09-18',
    status: 'published',
    shareCode: 'SCI-602',
    playsCount: 92,
    coverImage: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=500&auto=format&fit=crop&q=80',
    questions: [
      {
        id: 'q-2-1',
        activityId: 'act-2',
        questionText: 'أي من العضيات التالية توجد في الخلية النباتية ولا توجد في الخلية الحيوانية؟',
        choices: [
          'الجدار الخلوي والبلاستيدات الخضراء',
          'النواة والغشاء البلازمي',
          'الميتوكوندريا والريبوسومات',
          'السيتوبلازم والفجوات الصغيرة'
        ],
        correctAnswerIndex: 0,
        points: 10,
        timeLimitSeconds: 25,
        hint: 'تمنح النبات شكله الصلب ولونه الأخضر لصنع الغذاء.',
        explanation: 'الخلية النباتية تنفرد بوجود جدار خلوي مصنوع من السيليلوز لحمايتها وبلاستيدات خضراء للبناء الضوئي.'
      },
      {
        id: 'q-2-2',
        activityId: 'act-2',
        questionText: 'ما هي العضية المسؤولة عن إنتاج الطاقة في الخلية وتسمى محطة توليد الطاقة؟',
        choices: [
          'الميتوكوندريا',
          'الشبكة الإندوبلازمية',
          'جهاز جولجي',
          'الغشاء النووي'
        ],
        correctAnswerIndex: 0,
        points: 10,
        timeLimitSeconds: 25,
        hint: 'تحرق الجلوكوز بوجود الأكسجين لإنتاج ATP.',
        explanation: 'الميتوكوندريا هي مصانع ومحطات توليد الطاقة الحيوية في الخلايا الحية.'
      },
      {
        id: 'q-2-3',
        activityId: 'act-2',
        questionText: 'تحتوي الخلية على سائل هلامي تسبح فيه العضيات وتحدث فيه الأنشطة الحيوية، ما اسمه؟',
        choices: [
          'السيتوبلازم',
          'الكروموسوم',
          'الكلوروفيل',
          'الهيموجلوبين'
        ],
        correctAnswerIndex: 0,
        points: 10,
        timeLimitSeconds: 20,
        hint: 'محلول مائي يملأ الحيز بين الغشاء والنواة.',
        explanation: 'السيتوبلازم هو الوسط السائل الهلامي الذي يحيط بجميع عضيات الخلية.'
      },
      {
        id: 'q-2-4',
        activityId: 'act-2',
        questionText: 'تحتوي الخلية النباتية على فجوة عصارية مركزية واحدة كبيرة مقارنة بالخلية الحيوانية، وظيفتها الرئيسية:',
        choices: [
          'تخزين الماء والأملاح والمواد الغذائية والحفاظ على ضغط الامتلاء',
          'تنظيم التنفس الخلوي فقط',
          'تكوين الجينات الوراثية',
          'صنع الدهون والبروتينات'
        ],
        correctAnswerIndex: 0,
        points: 10,
        timeLimitSeconds: 30,
        hint: 'مستودع السوائل الذي يحافظ على انتصاب ساق وأوراق النبتة.',
        explanation: 'الفجوة العصارية الكبيرة تخزن العصارة والماء، وضغطها على الجدار يمنح النبتة تماسكها ونضارتها.'
      }
    ]
  },
  {
    id: 'act-3',
    title: 'تحدي الحواس الخمس للصغار',
    description: 'نشاط ممتع وسريع لتلاميذ الصف الأول للتعرف على استخدام الحواس الخمس في الحياة اليومية.',
    teacherId: 't-101',
    teacherName: 'أ. فاطمة الزهراء',
    cycleId: 'cycle-1',
    gradeId: 1,
    subject: 'العلوم',
    unitId: 'u-g1-1',
    unitTitle: 'الوحدة الأولى: الحواس الخمس المدهشة',
    lessonId: 'l-g1-1-1',
    lessonTitle: 'الدرس الأول: عيناي تبصران وأذناي تسمعان',
    type: 'quick_blitz',
    questionsCount: 3,
    totalTimeSeconds: 45,
    totalPoints: 30,
    createdAt: '2026-09-19',
    status: 'published',
    shareCode: 'SCI-101',
    playsCount: 215,
    coverImage: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500&auto=format&fit=crop&q=80',
    questions: [
      {
        id: 'q-3-1',
        activityId: 'act-3',
        questionText: 'بأي عضو نشاهد ألوان قوس قزح الجميلة في السماء؟',
        choices: ['بالعينين 👁️', 'بالأذنين 👂', 'باللسان 👅', 'بالأنف 👃'],
        correctAnswerIndex: 0,
        points: 10,
        timeLimitSeconds: 15,
        hint: 'عضو حاسة البصر الرائع!',
        explanation: 'نرى الأشياء والألوان الجميلة بواسطة أعيننا.'
      },
      {
        id: 'q-3-2',
        activityId: 'act-3',
        questionText: 'عندما ترن ساعة المنبه في الصباح، كيف نسمع صوتها؟',
        choices: ['بواسطة الأذن 👂', 'بواسطة اليد 🖐️', 'بواسطة الأنف 👃', 'بواسطة القدم 🦶'],
        correctAnswerIndex: 0,
        points: 10,
        timeLimitSeconds: 15,
        hint: 'عضو حاسة السمع!',
        explanation: 'الأذن هي العضو الذي نستمع به إلى الأصوات والأناشيد.'
      },
      {
        id: 'q-3-3',
        activityId: 'act-3',
        questionText: 'كيف نتذوق طعم الآيس كريم اللذيذ والشوكولاتة؟',
        choices: ['باللسان 👅', 'بالأذن 👂', 'بالعين 👁️', 'بالشعر 💇'],
        correctAnswerIndex: 0,
        points: 10,
        timeLimitSeconds: 15,
        hint: 'عضو حاسة التذوق داخل الفم!',
        explanation: 'اللسان يحتوي على براعم التذوق لنميز الحلو والمالح والحامض.'
      }
    ]
  }
];

export const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  {
    id: 'lead-1',
    name: 'سارة محمد الشامسي',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    gradeId: 4,
    totalPoints: 890,
    correctAnswers: 86,
    activitiesCompleted: 18,
    fastestTimeSeconds: 14,
    badge: '🏆 عبقري العلوم'
  },
  {
    id: 'lead-2',
    name: 'أحمد خالد المطوع',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    gradeId: 4,
    totalPoints: 820,
    correctAnswers: 78,
    activitiesCompleted: 16,
    fastestTimeSeconds: 16,
    badge: '🥈 بطل التحدي'
  },
  {
    id: 'lead-3',
    name: 'عمر سلطان المهيري',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    gradeId: 6,
    totalPoints: 760,
    correctAnswers: 71,
    activitiesCompleted: 14,
    fastestTimeSeconds: 18,
    badge: '🥉 مستكشف المختبر'
  },
  {
    id: 'lead-4',
    name: 'مريم راشد الكعبي',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    gradeId: 6,
    totalPoints: 690,
    correctAnswers: 64,
    activitiesCompleted: 12,
    fastestTimeSeconds: 19,
    badge: '⭐ نجم العلوم'
  },
  {
    id: 'lead-5',
    name: 'خالد عبد الله النعيمي',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    gradeId: 8,
    totalPoints: 640,
    correctAnswers: 59,
    activitiesCompleted: 11,
    fastestTimeSeconds: 21,
    badge: '⚡ باحث المستقبل'
  },
  {
    id: 'lead-6',
    name: 'ريم منصور الظاهري',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    gradeId: 4,
    totalPoints: 590,
    correctAnswers: 52,
    activitiesCompleted: 10,
    fastestTimeSeconds: 22,
    badge: '🌟 متفوق واعد'
  }
];
