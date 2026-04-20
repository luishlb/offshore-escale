const MESES_NOMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                     'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

// Lê os parâmetros da URL
const params = new URLSearchParams(window.location.search);
const dataEmbarqueStr = params.get('embarque');
const diasEmbarcado   = parseInt(params.get('embarcado'));
const diasDesembarcado = parseInt(params.get('desembarcado'));
let viewAtual = params.get('view') || 'mensal';
let periodoOffset = 0;
const nomeParam = params.get('nome');

if (nomeParam) {
  const subtitulo = document.getElementById('cal-subtitulo');
  subtitulo.textContent = nomeParam;
  subtitulo.classList.remove('hidden');
}

if (!dataEmbarqueStr || !diasEmbarcado || !diasDesembarcado) {
  document.getElementById('cal-view').innerHTML =
    '<p style="color:#f87171;text-align:center">Dados inválidos. <a href="index.html">Voltar</a></p>';
}

const [ano0, mes0, dia0] = dataEmbarqueStr.split('-').map(Number);
const dataEmbarqueInicial = new Date(ano0, mes0 - 1, dia0);


// Renderiza um único mês como bloco HTML
function renderMes(ano, mes, tamanho) {
  const hoje = new Date();
  const hojeNorm = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const primeiroDia = new Date(ano, mes, 1).getDay();

  const diasSemana = tamanho === 'mensal'
    ? ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
    : ['D','S','T','Q','Q','S','S'];

  const isMesAtual = ano === hoje.getFullYear() && mes === hoje.getMonth();
  let html = `<div class="mes-bloco${isMesAtual ? ' mes-atual' : ''}">`;
  html += `<div class="mes-titulo">${MESES_NOMES[mes]} ${ano}</div>`;
  html += `<div class="mes-dias-semana">${diasSemana.map(d => `<span>${d}</span>`).join('')}</div>`;
  html += `<div class="mes-grid">`;

  for (let i = 0; i < primeiroDia; i++) {
    html += `<div class="dia vazio"></div>`;
  }

  for (let d = 1; d <= totalDias; d++) {
    const data = new Date(ano, mes, d);
    const resultado = calcularStatus(dataEmbarqueInicial, diasEmbarcado, diasDesembarcado, data);
    const status = resultado && resultado.embarcado ? 'embarcado' : 'desembarcado';
    const isHoje = diferencaDias(hojeNorm, data) === 0 ? 'hoje' : '';

    let transicao = '';
    if (resultado) {
      if (resultado.diaDoCiclo === 0) transicao = 'dia-embarque';
      else if (resultado.diaDoCiclo === diasEmbarcado) transicao = 'dia-desembarque';
    }

    const feriado = obterFeriado(ano, mes, d);
    const classFeriado = feriado ? 'feriado' : '';
    const onclickFeriado = feriado ? `onclick="mostrarFeriado('${feriado.nome}')"` : '';

    html += `<div class="dia ${status} ${transicao} ${isHoje} ${classFeriado}" ${onclickFeriado}>${d}</div>`;
  }

  html += `</div></div>`;
  return html;
}

// Calcula o ano e mês inicial do período com base no offset
function calcularPeriodo(view) {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth();

  if (view === 'mensal') {
    const absTarget = (anoAtual * 12 + mesAtual) + periodoOffset;
    const ano = Math.floor(absTarget / 12);
    const mes = absTarget % 12;
    return { ano, mesInicio: mes, titulo: `${MESES_NOMES[mes]} ${ano}` };
  } else if (view === 'semestral') {
    const halfBase = mesAtual < 6 ? 0 : 1;
    const absTarget = (anoAtual * 2 + halfBase) + periodoOffset;
    const ano = Math.floor(absTarget / 2);
    const mesInicio = (absTarget % 2) === 0 ? 0 : 6;
    const semestre = mesInicio === 0 ? '1º Semestre' : '2º Semestre';
    return { ano, mesInicio, titulo: `${semestre} ${ano}` };
  } else {
    const ano = anoAtual + periodoOffset;
    return { ano, mesInicio: 0, titulo: `${ano}` };
  }
}

// Monta a view completa com meses fixos por tipo de visualização
function renderView(view) {
  const mesesCount = view === 'mensal' ? 1 : view === 'semestral' ? 6 : 12;
  const periodo = calcularPeriodo(view);

  const nomeHtml = nomeParam ? `<span class="cal-nav-nome">• ${nomeParam}</span>` : '';
  let html = `<div class="cal-nav">
    <button onclick="navegarPeriodo(-1)">&#8249;</button>
    <span>${periodo.titulo} ${nomeHtml}</span>
    <button onclick="navegarPeriodo(1)">&#8250;</button>
  </div>`;

  html += `<div class="meses-grid ${view}">`;
  for (let i = 0; i < mesesCount; i++) {
    html += renderMes(periodo.ano, periodo.mesInicio + i, view);
  }
  html += `</div>`;

  document.getElementById('cal-view').innerHTML = html;
}

function navegarPeriodo(delta) {
  periodoOffset += delta;
  renderView(viewAtual);
}

function trocarView(view) {
  viewAtual = view;
  periodoOffset = 0;

  ['mensal','semestral','anual'].forEach(v => {
    document.getElementById(`btn-${v}`).classList.toggle('ativo', v === view);
  });

  const novosParams = new URLSearchParams(window.location.search);
  novosParams.set('view', view);
  history.replaceState(null, '', `?${novosParams.toString()}`);

  renderView(view);
}

async function exportarPDF() {
  const btn = document.querySelector('.btn-exportar');
  btn.textContent = 'Gerando...';
  btn.disabled = true;

  // Esconde as setas de navegação para ficarem fora do PDF
  const botoesNav = document.querySelectorAll('.cal-nav button');
  botoesNav.forEach(b => b.style.visibility = 'hidden');

  // Força grid de 3 colunas no anual (para PDF consistente em mobile)
  const mesGrid = document.querySelector('.meses-grid');
  const gridOriginal = mesGrid ? mesGrid.style.gridTemplateColumns : null;
  if (mesGrid && viewAtual === 'anual') {
    mesGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
  }

  try {
    const elemento = document.querySelector('.cal-container');
    document.getElementById('cal-view').classList.add('pdf-export');
    const canvas = await html2canvas(elemento, {
      scale: Math.min(1.5, 1.5 / window.devicePixelRatio),
      backgroundColor: '#0f172a',
      logging: false,
      windowWidth: 1024,
    });

    const { jsPDF } = window.jspdf;
    const isLandscape = canvas.width > canvas.height;
    const pdf = new jsPDF({
      orientation: isLandscape ? 'l' : 'p',
      unit: 'mm',
      format: 'a4',
    });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
    const imgW = canvas.width * ratio;
    const imgH = canvas.height * ratio;

    pdf.addImage(
      canvas.toDataURL('image/jpeg', 0.85), 'JPEG',
      (pageW - imgW) / 2,
      (pageH - imgH) / 2,
      imgW, imgH
    );

    const periodo = calcularPeriodo(viewAtual);
    const prefixo = nomeParam ? `${nomeParam} - ` : '';
    pdf.save(`offshore-scale-${prefixo}${periodo.titulo}.pdf`);

  } finally {
    document.getElementById('cal-view').classList.remove('pdf-export');
    if (mesGrid && gridOriginal !== null) mesGrid.style.gridTemplateColumns = gridOriginal;
    botoesNav.forEach(b => b.style.visibility = '');
    btn.textContent = '⬇ Exportar PDF';
    btn.disabled = false;
  }
}

function mostrarFeriado(nome) {
  document.getElementById('modal-feriado-nome').textContent = nome;
  document.getElementById('modal-feriado').classList.remove('hidden');
}

document.getElementById('modal-feriado').addEventListener('click', function(e) {
  if (e.target === this) this.classList.add('hidden');
});

// Inicializa ao carregar
trocarView(viewAtual);
