const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const OUTPUT_FILE = path.join(ROOT_DIR, 'data.json');

// Subject Configurations & Metadata Lookup
const MAPEL_CONFIG = [
  { match: ['matematika tingkat lanjut', 'matematika_lanjut', 'matematika lanjut'], name: 'Matematika Tingkat Lanjut', category: 'MIPA', iconKey: 'chart', defaultQuestions: 25 },
  { match: ['matematika'], name: 'Matematika', category: 'Wajib / Umum', iconKey: 'math', defaultQuestions: 25 },
  { match: ['bahasa indonesia lanjut', 'bahasa_indonesia_lanjut'], name: 'Bahasa Indonesia Lanjut', category: 'Bahasa & Budaya', iconKey: 'feather', defaultQuestions: 30 },
  { match: ['bahasa indonesia', 'bahasa_indonesia'], name: 'Bahasa Indonesia', category: 'Wajib / Umum', iconKey: 'book', defaultQuestions: 25 },
  { match: ['bahasa inggris lanjut', 'bahasa_inggris_lanjut'], name: 'Bahasa Inggris Lanjut', category: 'Bahasa & Budaya', iconKey: 'globe', defaultQuestions: 30 },
  { match: ['bahasa inggris', 'bahasa_inggris'], name: 'Bahasa Inggris', category: 'Wajib / Umum', iconKey: 'globe', defaultQuestions: 25 },
  { match: ['ppkn', 'pancasila'], name: 'PPKn', category: 'Wajib / Umum', iconKey: 'scale', defaultQuestions: 30 },
  { match: ['fisika'], name: 'Fisika', category: 'MIPA', iconKey: 'bolt', defaultQuestions: 25 },
  { match: ['kimia'], name: 'Kimia', category: 'MIPA', iconKey: 'flask', defaultQuestions: 25 },
  { match: ['biologi'], name: 'Biologi', category: 'MIPA', iconKey: 'dna', defaultQuestions: 30 },
  { match: ['ekonomi'], name: 'Ekonomi', category: 'IPS / Soshum', iconKey: 'cash', defaultQuestions: 30 },
  { match: ['geografi'], name: 'Geografi', category: 'IPS / Soshum', iconKey: 'map', defaultQuestions: 30 },
  { match: ['sosiologi'], name: 'Sosiologi', category: 'IPS / Soshum', iconKey: 'users', defaultQuestions: 31 },
  { match: ['sejarah'], name: 'Sejarah', category: 'IPS / Soshum', iconKey: 'landmark', defaultQuestions: 30 },
  { match: ['antropologi'], name: 'Antropologi', category: 'IPS / Soshum', iconKey: 'culture', defaultQuestions: 31 },
  { match: ['bahasa arab', 'bahasa_arab', 'arab'], name: 'Bahasa Arab', category: 'Bahasa Asing', iconKey: 'language', defaultQuestions: 30 },
  { match: ['bahasa jepang', 'bahasa_jepang', 'jepang'], name: 'Bahasa Jepang', category: 'Bahasa Asing', iconKey: 'language', defaultQuestions: 30 },
  { match: ['bahasa mandarin', 'bahasa_mandarin', 'mandarin'], name: 'Bahasa Mandarin', category: 'Bahasa Asing', iconKey: 'language', defaultQuestions: 30 },
  { match: ['bahasa jerman', 'bahasa_jerman', 'jerman'], name: 'Bahasa Jerman', category: 'Bahasa Asing', iconKey: 'language', defaultQuestions: 30 },
  { match: ['bahasa korea', 'bahasa_korea', 'korea'], name: 'Bahasa Korea', category: 'Bahasa Asing', iconKey: 'language', defaultQuestions: 30 },
  { match: ['bahasa prancis', 'bahasa_prancis', 'prancis'], name: 'Bahasa Prancis', category: 'Bahasa Asing', iconKey: 'language', defaultQuestions: 30 },
  { match: ['projek kreatif', 'kewirausahaan', 'pkk'], name: 'Projek Kreatif & Kewirausahaan', category: 'Kejuruan / Vokasi', iconKey: 'lightbulb', defaultQuestions: 31 },
];

function identifySubject(filename) {
  const cleanName = filename.toLowerCase()
    .replace(/\.pdf$/i, '')
    .replace(/^contoh[_-]soal[_-]/i, '')
    .replace(/[_-]/g, ' ')
    .trim();

  for (const item of MAPEL_CONFIG) {
    for (const pattern of item.match) {
      if (cleanName.includes(pattern)) {
        return {
          name: item.name,
          category: item.category,
          iconKey: item.iconKey,
          questions: item.defaultQuestions
        };
      }
    }
  }

  // Fallback for new unknown subjects
  const titleCase = cleanName.replace(/\b\w/g, c => c.toUpperCase());
  return {
    name: titleCase,
    category: 'Pilihan / Umum',
    iconKey: 'book',
    questions: 25
  };
}

function findYearDirs(baseDir) {
  const results = [];
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && /^\d{4}$/.test(entry.name)) {
      const subDirPath = path.join(baseDir, entry.name);
      const subEntries = fs.readdirSync(subDirPath, { withFileTypes: true });
      for (const sub of subEntries) {
        if (sub.isDirectory() && /^\d{4}$/.test(sub.name)) {
          results.push(`${entry.name}/${sub.name}`);
        }
      }
    }
  }
  return results.sort();
}

function scanRepository() {
  console.log('🔍 Memindai seluruh folder tahun ajaran...');
  const yearDirs = findYearDirs(ROOT_DIR);
  console.log('Tahun ajaran terdeteksi:', yearDirs);

  const subjects = [];

  for (const yearDir of yearDirs) {
    const fullDirPath = path.join(ROOT_DIR, ...yearDir.split('/'));
    if (!fs.existsSync(fullDirPath)) continue;

    const files = fs.readdirSync(fullDirPath);
    for (const file of files) {
      if (!file.toLowerCase().endsWith('.pdf')) continue;

      const fullFilePath = path.join(fullDirPath, file);
      const stat = fs.statSync(fullFilePath);
      const sizeMB = (stat.size / (1024 * 1024)).toFixed(1) + ' MB';

      const info = identifySubject(file);
      const id = file.toLowerCase().replace(/\.pdf$/i, '').replace(/[_\s]+/g, '-');
      const relativeFileName = `${yearDir}/${file}`;

      subjects.push({
        id,
        name: info.name,
        category: info.category,
        year: yearDir,
        iconKey: info.iconKey,
        questions: info.questions,
        size: sizeMB,
        fileName: relativeFileName
      });
    }
  }

  // Sort: Wajib first, then MIPA, IPS, Bahasa, Bahasa Asing, Vokasi
  const categoryOrder = {
    "Wajib / Umum": 1,
    "MIPA": 2,
    "IPS / Soshum": 3,
    "Bahasa & Budaya": 4,
    "Bahasa Asing": 5,
    "Kejuruan / Vokasi": 6
  };

  subjects.sort((a, b) => {
    if (a.year !== b.year) return a.year.localeCompare(b.year);
    const orderA = categoryOrder[a.category] || 99;
    const orderB = categoryOrder[b.category] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });

  const payload = {
    updatedAt: new Date().toISOString(),
    totalSubjects: subjects.length,
    academicYears: yearDirs,
    subjects: subjects
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`✅ Berhasil! Ditemukan ${subjects.length} berkas PDF.`);
  console.log(`📁 Katalog disimpan ke: ${OUTPUT_FILE}`);
}

scanRepository();
