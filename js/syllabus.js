/* Syllabus data layer. SAMPLE curriculum-aligned content, NOT an official NERDC document. */
(function (w) {
  'use strict';
  var KEY = 'bia_syllabus', E = 'English Language', M = 'Mathematics';
  var L = {
    'Primary 1': {
      [E]: ['Letters and sounds: Alphabet a to z|Phonic sounds|Simple words', 'Reading simple sentences: Sight words|Short sentences|Picture reading', 'Writing and speaking: Letter formation|Copying sentences|Greetings and introductions'],
      [M]: ['Numbers 1 to 50: Counting|Reading and writing numbers|More and less', 'Addition and subtraction: Adding within 20|Subtracting within 20|Number stories', 'Shapes and measurement: Basic shapes|Length and size|Telling time by the hour'],
      'Basic Science': ['Living things: Plants and animals|Parts of the body|The five senses', 'Our environment: Day and night|Weather|Keeping clean', 'Materials and water: Everyday materials|Sources of water|Uses of water']
    },
    'Primary 2': {
      [E]: ['Phonics and vocabulary: Blends and digraphs|Naming words|Action words', 'Reading comprehension: Short stories|Answering questions|Simple poems', 'Sentence writing: Capital letters and full stops|Describing words|Writing a short note'],
      [M]: ['Numbers to 100: Place value|Counting in tens|Ordering numbers', 'Operations: Addition with carrying|Subtraction with borrowing|Introduction to multiplication', 'Money and time: Naira and kobo|Days and months|Telling time'],
      'Basic Science': ['Living and non-living things: Characteristics of living things|Plant parts|Animal habitats', 'Our bodies: Care of teeth|Healthy foods|Personal hygiene', 'Weather and energy: Seasons|Sources of light|Sources of heat']
    },
    'Primary 3': {
      [E]: ['Grammar basics: Nouns and pronouns|Verbs and tenses|Adjectives', 'Reading and comprehension: Fiction passages|Main idea|Dictionary use', 'Writing: Paragraph writing|Letter writing|Simple compositions'],
      [M]: ['Whole numbers: Numbers to 1000|Addition and subtraction|Multiplication tables', 'Division and fractions: Sharing equally|Halves and quarters|Comparing fractions', 'Measurement and data: Length, mass and capacity|Perimeter|Pictograms'],
      'Basic Science': ['Plants: Parts and functions|Seeds and germination|Uses of plants', 'Animals: Groups of animals|Life cycles|Pets and farm animals', 'Matter and forces: Solids, liquids and gases|Pushes and pulls|Magnets']
    },
    'Primary 4': {
      [E]: ['Parts of speech: Adverbs|Prepositions|Conjunctions', 'Comprehension and summary: Reading for meaning|Summary writing|Vocabulary development', 'Composition: Descriptive writing|Narrative writing|Informal letters'],
      [M]: ['Number operations: Numbers to 10,000|Multiplication by 2-digit numbers|Long division', 'Fractions and decimals: Equivalent fractions|Adding fractions|Decimals and money', 'Geometry and data: Angles|Area of rectangles|Bar charts'],
      'Basic Science': ['Living things: Classification of plants|Food chains|Habitats', 'Human body: Digestive system|Teeth and care|Balanced diet', 'Energy and environment: Forms of energy|Conservation of resources|Pollution']
    },
    'Primary 5': {
      [E]: ['Grammar: Tenses|Subject-verb agreement|Direct and indirect speech', 'Reading skills: Comprehension passages|Summary|Figures of speech', 'Writing: Formal letters|Essay writing|Speech writing'],
      [M]: ['Numbers: Factors and multiples|LCM and HCF|Fraction operations', 'Decimals and percentages: Decimal operations|Converting percentages|Ratio and proportion', 'Geometry and measurement: Area and perimeter|Volume|Averages'],
      'Basic Science': ['Living systems: Reproduction in plants|Reproduction in animals|Adaptation', 'Matter: Properties of matter|Changes in matter|Mixtures', 'Earth and space: The solar system|Rocks and soil|Simple machines']
    },
    'Primary 6': {
      [E]: ['Advanced grammar: Clauses|Active and passive voice|Idioms', 'Literature and comprehension: Prose passages|Poetry appreciation|Summary skills', 'Exam preparation: Essay types|Comprehension practice|Entrance exam revision'],
      [M]: ['Number work: Indices|Fractions and decimals review|Percentages', 'Algebra and ratio: Simple algebraic expressions|Simple equations|Ratio and rate', 'Geometry and data: Angles in shapes|Volume of solids|Mean, median and mode'],
      'Basic Science': ['Human systems: Circulatory system|Respiratory system|Excretory system', 'Physical science: Electricity|Magnetism|Light and sound', 'Environment and technology: Ecosystems|Conservation|Introduction to technology']
    },
    'JSS 1': {
      [E]: ['Speech work: Vowels and consonants|Word stress|Listening skills', 'Grammar and structure: Sentence types|Tenses|Punctuation', 'Writing and reading: Narrative composition|Letter writing|Comprehension'],
      [M]: ['Number and numeration: Whole numbers and place value|Fractions|Decimals and approximation', 'Algebra and ratio: Algebraic expressions|Simple equations|Ratio, rate and proportion', 'Geometry and statistics: Angles and lines|Plane shapes|Data collection and presentation'],
      'Basic Science': ['Introduction to science: Scientific method|Living and non-living things|Measurement', 'Matter and energy: States of matter|Forms of energy|Simple machines', 'Environment and health: Ecosystem|Pollution|Personal hygiene and diseases']
    },
    'JSS 2': {
      [E]: ['Grammar: Parts of speech review|Tenses and concord|Phrases and clauses', 'Reading and literature: Comprehension|Prose appreciation|Poetry', 'Writing: Formal letters|Argumentative essays|Report writing'],
      [M]: ['Number and algebra: Indices|Standard form|Linear equations', 'Geometry: Congruent triangles|Pythagoras theorem|Construction', 'Mensuration and data: Perimeter and area|Volume|Mean, median and mode'],
      'Basic Science': ['Living things: Classification|Cell structure|Nutrition', 'Chemistry basics: Elements and compounds|Mixtures and separation|Acids and bases', 'Physics basics: Heat|Light|Electricity']
    },
    'JSS 3': {
      [E]: ['Junior exam grammar: Concord|Tenses|Sentence structure', 'Comprehension and summary: Passage analysis|Summary writing|Literary terms', 'Exam revision: Essay types|Oral English|Past questions'],
      [M]: ['Algebra: Factorisation|Quadratic equations|Simultaneous equations', 'Geometry and trigonometry: Circle theorems|Bearings|Introduction to trigonometry', 'Exam revision: Statistics and probability|Number revision|Past questions'],
      'Basic Science': ['Biology: Reproduction|Introduction to genetics|Ecology', 'Chemistry and physics: Chemical reactions|Electricity|Magnetism', 'Exam revision: Practical skills|Key concepts review|Past questions']
    },
    'SSS 1': {
      [E]: ['Lexis and structure: Word classes|Registers|Phrases and clauses', 'Writing skills: Formal letters|Speeches|Articles', 'Comprehension and summary: Passage types|Summary techniques|Oral English'],
      [M]: ['Number and algebra: Number bases|Indices and logarithms|Surds', 'Algebra and sets: Sets and Venn diagrams|Quadratic equations|Variation', 'Geometry and statistics: Angles and polygons|Mensuration|Statistics'],
      'Biology': ['Basic biology: Cell structure|Cell division|Classification of living things', 'Nutrition and transport: Plant nutrition|Animal nutrition|Transport systems', 'Ecology: Ecosystem|Population studies|Conservation']
    },
    'SSS 2': {
      [E]: ['Advanced grammar: Concord|Figurative expressions|Sentence analysis', 'Writing: Argumentative essays|Report writing|Debate', 'Literature and oral: Prose and drama|Poetry|Oral English'],
      [M]: ['Algebra: Binary operations|Polynomials|Sequences and series', 'Trigonometry and geometry: Trigonometric ratios|Circle theorems|Coordinate geometry', 'Statistics and probability: Measures of dispersion|Probability|Permutation and combination'],
      'Biology': ['Physiology: Respiration|Excretion|Nervous coordination', 'Reproduction and growth: Reproduction in plants|Reproduction in humans|Growth', 'Genetics and evolution: Heredity|Variation|Evolution']
    },
    'SSS 3': {
      [E]: ['External exam revision: Essay writing|Comprehension|Summary', 'Oral English and lexis: Vowels and consonants|Stress and intonation|Lexis and structure', 'Past questions: Timed practice|Marking schemes|Final revision'],
      [M]: ['Calculus: Differentiation|Integration|Applications', 'Further topics: Vectors|Matrices|Loci', 'Revision: Past questions|Weak topic review|Timed practice'],
      'Biology': ['Revision: Cell biology|Physiology|Ecology', 'Revision: Genetics|Evolution|Practicals', 'Past questions: Timed practice|Marking schemes|Final revision']
    }
  };
  var ACT = {
    lang: ['Reading aloud in groups', 'Short writing task with peer review', 'Class discussion and questions'],
    math: ['Worked examples on the board', 'Practice exercises in pairs', 'Real-life problem solving'],
    sci: ['Simple demonstration or experiment', 'Labelled drawings and notes', 'Group project or quiz']
  };
  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }

  function build(cls, sub, t) {
    var s = L[cls][sub][t - 1], i = s.indexOf(':'), topic = s.slice(0, i), subs = s.slice(i + 1).split('|').map(function (x) { return x.trim(); });
    var kind = sub === E ? 'lang' : sub === M ? 'math' : 'sci';
    return {
      subject: sub, topic: topic, subs: subs,
      objectives: ['Explain the main ideas of “' + topic + '”.', 'Complete simple tasks on ' + subs[0] + ' and ' + subs[1] + '.'],
      outcomes: ['Learners use “' + topic + '” correctly in class exercises.', 'Learners answer short questions on ' + subs[2] + '.'],
      activities: ACT[kind]
    };
  }

  var Syl = {
    CLASSES: Object.keys(L), TERMS: ['First Term', 'Second Term', 'Third Term'],
    /* Returns the subject entries for a class and term (1 to 3), with any admin edits applied. */
    get: function (cls, term) {
      var ov = read();
      return Object.keys(L[cls]).map(function (sub) {
        var e = build(cls, sub, term), o = ov[cls] && ov[cls][sub] && ov[cls][sub][term];
        return o ? Object.assign(e, o) : e;
      });
    },
    /* For the Phase 9 admin editor. */
    update: function (cls, sub, term, entry) {
      var ov = read(); ov[cls] = ov[cls] || {}; ov[cls][sub] = ov[cls][sub] || {}; ov[cls][sub][term] = entry;
      try { localStorage.setItem(KEY, JSON.stringify(ov)); return true; } catch (e) { return false; }
    }
  };
  w.BIA = w.BIA || {}; w.BIA.syl = Syl;
})(window);
