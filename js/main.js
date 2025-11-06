// main.js — Adventist Health FAQ Prototype
// -----------------------------------------

let faqs = []; // Array global com todas as FAQs
let categorias = []; // Lista de categorias únicas

// 🔹 Aguarda o carregamento do DOM antes de iniciar
document.addEventListener('DOMContentLoaded', () => {
  carregarFAQs();
  configurarEventos();
});

// ================================
// 1️⃣ CARREGAR FAQS DO JSON
// ================================
async function carregarFAQs() {
  try {
    const resposta = await fetch('content/faq.json');
    if (!resposta.ok) throw new Error('Erro ao carregar o arquivo faq.json');

    faqs = await resposta.json();

    // Extrai categorias únicas
    categorias = [...new Set(faqs.map(f => f.categoria))];
    preencherCategorias();
    exibirResultados(faqs);
  } catch (erro) {
    console.error(erro);
    document.getElementById('resultadosBusca').innerHTML = '<p>Erro ao carregar FAQs.</p>';
  }
}

// ================================
// 2️⃣ POPULAR CATEGORIAS NO SELECT
// ================================
function preencherCategorias() {
  const select = document.getElementById('filterCategoria');
  categorias.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

// ================================
// 3️⃣ CONFIGURAR EVENTOS
// ================================
function configurarEventos() {
  const searchInput = document.getElementById('searchInput');
  const filterSystem = document.getElementById('filterSystem');
  const filterCategoria = document.getElementById('filterCategoria');
  const filterNivel = document.getElementById('filterNivel');

  searchInput.addEventListener('input', filtrarFAQs);
  filterSystem.addEventListener('change', filtrarFAQs);
  filterCategoria.addEventListener('change', filtrarFAQs);
  filterNivel.addEventListener('change', filtrarFAQs);
}

// ================================
// 4️⃣ BUSCA PRINCIPAL (FAQs + conteúdo estático)
// ================================
function filtrarFAQs() {
  const termo = document.getElementById('searchInput').value.toLowerCase();
  const sistema = document.getElementById('filterSystem').value;
  const categoria = document.getElementById('filterCategoria').value;
  const nivel = document.getElementById('filterNivel').value;

  let resultados = faqs.filter(f => {
    const termoBusca =
      f.titulo.toLowerCase().includes(termo) ||
      f.resposta.toLowerCase().includes(termo) ||
      (f.tags && f.tags.join(' ').toLowerCase().includes(termo));

    const filtroSistema = !sistema || f.sistema === sistema;
    const filtroCategoria = !categoria || f.categoria === categoria;
    const filtroNivel = !nivel || f.nivel === nivel;

    return termoBusca && filtroSistema && filtroCategoria && filtroNivel;
  });

  // Busca extra dentro do conteúdo estático
  const extras = termo ? buscarConteudoEstatico(termo) : [];

  exibirResultados(resultados, extras);
}

// ================================
// 5️⃣ BUSCAR TAMBÉM NO CONTEÚDO ESTÁTICO (HTML da landpage)
// ================================
function buscarConteudoEstatico(termo) {
  const resultadosExtras = [];

  const cards = document.querySelectorAll('.card h3');
  const recursos = document.querySelectorAll('ul li');
  const secoes = document.querySelectorAll('section h2');

  termo = termo.toLowerCase();

  cards.forEach(card => {
    if (card.textContent.toLowerCase().includes(termo)) {
      resultadosExtras.push({
        tipo: 'Seção',
        titulo: card.textContent,
        descricao: 'Conteúdo relacionado dentro dos cards principais.'
      });
    }
  });

  recursos.forEach(item => {
    if (item.textContent.toLowerCase().includes(termo)) {
      resultadosExtras.push({
        tipo: 'Recurso rápido',
        titulo: item.textContent,
        descricao: 'Item listado na seção de recursos rápidos.'
      });
    }
  });

  secoes.forEach(sec => {
    if (sec.textContent.toLowerCase().includes(termo)) {
      resultadosExtras.push({
        tipo: 'Seção',
        titulo: sec.textContent,
        descricao: 'Título de seção relacionado.'
      });
    }
  });

  return resultadosExtras;
}

// ================================
// 6️⃣ EXIBIR RESULTADOS COM ANIMAÇÃO
// ================================
function exibirResultados(lista, extras = []) {
  const container = document.getElementById('resultadosBusca');
  const contador = document.getElementById('resultCount');

  container.innerHTML = '';

  if (!lista.length && !extras.length) {
    contador.textContent = 'Nenhum resultado encontrado.';
    return;
  }

  contador.textContent = `${lista.length + extras.length} resultado(s) encontrado(s).`;

  // Primeiro mostra os extras (conteúdo estático)
  if (extras.length) {
    const blocoExtras = document.createElement('div');
    blocoExtras.classList.add('card', 'fade-in');
    blocoExtras.innerHTML = '<h3>Outros conteúdos relacionados</h3>';
    extras.forEach(item => {
      const el = document.createElement('div');
      el.classList.add('faq-item');
      el.innerHTML = `<strong>${item.titulo}</strong><div class="small">${item.descricao}</div>`;
      blocoExtras.appendChild(el);
    });
    container.appendChild(blocoExtras);
  }

  // Depois mostra as FAQs
  lista.forEach(faq => {
    const item = document.createElement('div');
    item.classList.add('faq-item', 'fade-in');
    item.innerHTML = `
      <strong style="cursor:pointer;color:#0b63d6">${faq.titulo}</strong>
      <div class="small" style="display:none;margin-top:6px;line-height:1.5;">${faq.resposta}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:4px;">
        Sistema: ${faq.sistema} • Nível: ${faq.nivel} • Categoria: ${faq.categoria}
      </div>
    `;
    const titulo = item.querySelector('strong');
    const resposta = item.querySelector('.small');
    titulo.addEventListener('click', () => {
      resposta.style.display = resposta.style.display === 'none' ? 'block' : 'none';
    });
    container.appendChild(item);
  });
}
