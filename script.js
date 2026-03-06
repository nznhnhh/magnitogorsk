// ===== SUPABASE CONFIG =====
const supabaseUrl = 'https://qnxqbayfkjbsempbodou.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFueHFiYXlma2pic2VtcGJvZG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTk2NTQsImV4cCI6MjA4ODI5NTY1NH0.XTAWdafqCgkk9IbdAEqHU3t5dvNc0OgzsOfXHCJJCSk';

// Отправка через чистый fetch — без SDK, без CDN, без блокировок
async function insertToSupabase(data) {
  const response = await fetch(`${supabaseUrl}/rest/v1/reguests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }
}

// ===== HEADER SCROLL =====
const header = document.getElementById('mainHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
});

// ===== MOBILE NAV =====
function toggleMobileNav() {
  const nav = document.getElementById('mobileNav');
  const overlay = document.getElementById('mobileNavOverlay');
  const isOpen = nav.classList.contains('open');
  if (isOpen) {
    nav.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  } else {
    nav.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

// ===== TABS =====
function switchTab(btn, panelId) {
  const section = btn.closest('.tabs');
  section.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  section.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(panelId).classList.add('active');
}

// ===== MODAL =====
function openModal() {
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function closeModalOnOverlay(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ===== FORM HANDLERS =====
async function handleFormSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');

  // Собираем данные из реальных id полей формы
  const name    = document.getElementById('fname').value.trim();
  const phone   = document.getElementById('fphone').value.trim();
  const email   = document.getElementById('femail').value.trim();
  const category = document.getElementById('fcat').value.trim();
  const message = document.getElementById('fmsg').value.trim();

  try {
    await insertToSupabase({ name, phone, email, category, message });

    btn.textContent = '✓ Заявка отправлена!';
    btn.style.background = '#27ae60';
    e.target.reset();
    setTimeout(() => { btn.textContent = 'Отправить заявку'; btn.style.background = ''; }, 3000);

  } catch (err) {
    console.error('Supabase error:', err);
    btn.textContent = '✗ Ошибка отправки';
    btn.style.background = '#e74c3c';
    setTimeout(() => { btn.textContent = 'Отправить заявку'; btn.style.background = ''; }, 3000);
  }
}
async function handleCallbackSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');

  const name  = document.getElementById('mname').value.trim();
  const phone = document.getElementById('mphone').value.trim();
  const time  = document.getElementById('mtime').value.trim();

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/reguests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ name, phone, message: `Удобное время: ${time}` })
    });

    if (!response.ok) throw new Error(await response.text());

    btn.textContent = '✓ Ждите звонка!';
    btn.style.background = '#27ae60';
    setTimeout(() => { closeModal(); btn.textContent = 'Перезвоните мне'; btn.style.background = ''; }, 2000);

  } catch (err) {
    console.error('Supabase error:', err);
    btn.textContent = '✗ Ошибка отправки';
    btn.style.background = '#e74c3c';
    setTimeout(() => { btn.textContent = 'Перезвоните мне'; btn.style.background = ''; }, 3000);
  }
}

// ===== SCROLL ANIMATIONS =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ===== ACTIVE NAV =====
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + current);
  });
});

// ===== SEARCH FUNCTION =====
function searchProducts(query) {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) {
    document.querySelectorAll('.product-card, .cat-card').forEach(card => {
      card.style.display = '';
      card.classList.remove('search-match');
    });
    return;
  }

  let foundResults = false;
  document.querySelectorAll('.product-card, .cat-card').forEach(card => {
    const text = card.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      card.style.display = '';
      card.classList.add('search-match');
      foundResults = true;
    } else {
      card.style.display = 'none';
      card.classList.remove('search-match');
    }
  });

  if (!foundResults) {
    const msg = document.getElementById('searchNoResults');
    if (msg) msg.style.display = 'block';
  } else {
    const msg = document.getElementById('searchNoResults');
    if (msg) msg.style.display = 'none';
  }
}

function clearSearch() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = '';
    searchProducts('');
  }
}

function openSearchModal() {
  const modal = document.getElementById('searchModal');
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const input = document.getElementById('searchInput');
      if (input) input.focus();
    }, 100);
  }
}

function closeSearchModal() {
  const modal = document.getElementById('searchModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    clearSearch();
  }
}

// Close search on overlay click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('searchModal');
  if (modal && e.target === modal) {
    closeSearchModal();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      searchProducts(e.target.value);
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSearchModal();
    });
  }
});

// ===== DOWNLOAD PRICE LIST =====
function downloadPriceList(sectionName) {
  const priceFiles = {
    'sandvich': 'Прайс СЭНДВИЧ ПАНЕЛИ.pdf',
    'metal': 'Прайс Металл от 21.04.2025г..pdf',
    'pipes': 'Прайс-лист Трубы 11.01. 2024 г..pdf',
    'fittings': 'Прайс-лiст. Фитинги.pdf'
  };

  const fileName = priceFiles[sectionName];
  if (!fileName) {
    alert('Файл прайса не найден');
    return;
  }

  // Create a download link for the file
  const link = document.createElement('a');
  link.href = fileName;
  link.download = fileName;
  link.style.display = 'none';
  
  // Append to body, click, then remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);  
  // Show success message
  console.log('Загрузка файла: ' + fileName);
}
