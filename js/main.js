// js/main.js

document.addEventListener('DOMContentLoaded', () => {
  const conteudoPrincipal = document.getElementById('conteudoPrincipal');
  const searchInput = document.getElementById('searchInput');
  let faqs = [];

  // 🔹 Carrega FAQ inicial
  async function carregarFAQs() {
    try {
      const resp = await fetch('content/faq.json');
      faqs = await resp.json();
      exibirFAQs(faqs);
    } catch (err) {
      conteudoPrincipal.innerHTML = '<p>Erro ao carregar FAQs.</p>';
      console.error(err);
    }
  }

  // 🔹 Exibe FAQ no conteúdo principal
  function exibirFAQs(lista) {
    conteudoPrincipal.innerHTML = `
      <section class="faq-list">
        <h2>Perguntas Frequentes</h2>
        ${lista.map(f => `
          <div class="faq-item">
            <strong class="faq-titulo" style="cursor:pointer;color:#0b63d6">${f.titulo}</strong>
            <div class="faq-resposta" style="display:none;margin-top:6px;">${f.resposta}</div>
          </div>
        `).join('')}
      </section>
    `;

    // Expande respostas ao clicar
    document.querySelectorAll('.faq-titulo').forEach(titulo => {
      titulo.addEventListener('click', e => {
        const resposta = e.target.nextElementSibling;
        resposta.style.display = resposta.style.display === 'none' ? 'block' : 'none';
      });
    });
  }

  // 🔹 Carrega páginas internas (sem duplicar header/footer)
  async function carregarPagina(arquivo) {
    try {
      const resp = await fetch(arquivo);
      const html = await resp.text();
      conteudoPrincipal.innerHTML = html;
      window.scrollTo(0, 0); // sobe para o topo
    } catch (err) {
      conteudoPrincipal.innerHTML = `<p>Erro ao carregar página ${arquivo}.</p>`;
    }
  }

  // 🔹 Liga os botões de menu
  document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.getAttribute('data-page');
      carregarPagina(page);
    });
  });

  // 🔹 Barra de pesquisa unificada (FAQ + páginas carregadas)
  searchInput.addEventListener('input', e => {
    const termo = e.target.value.toLowerCase();
    if (!termo) {
      exibirFAQs(faqs);
      return;
    }

    // Busca nas FAQs
    const filtradas = faqs.filter(f =>
      f.titulo.toLowerCase().includes(termo) ||
      f.resposta.toLowerCase().includes(termo)
    );

    if (filtradas.length > 0) {
      exibirFAQs(filtradas);
    } else {
      // Busca no conteúdo atual
      const textoAtual = conteudoPrincipal.innerText.toLowerCase();
      conteudoPrincipal.innerHTML = textoAtual.includes(termo)
        ? `<p>O termo <strong>${termo}</strong> foi encontrado no conteúdo atual.</p>`
        : `<p>Nenhum resultado encontrado para "${termo}".</p>`;
    }
  });

  // 🔹 Inicializa com FAQs
  carregarFAQs();
});

// --- Função para carregar o header e footer automaticamente ---
async function carregarHeaderFooter() {
  const header = document.createElement('div');
  const footer = document.createElement('div');

  // Carrega o header
  const headerResponse = await fetch('content/header.html');
  header.innerHTML = await headerResponse.text();
  document.body.prepend(header);

  // Carrega o footer
  const footerResponse = await fetch('content/footer.html');
  footer.innerHTML = await footerResponse.text();
  document.body.appendChild(footer);
}

// Executa quando a página é carregada
document.addEventListener('DOMContentLoaded', carregarHeaderFooter);

