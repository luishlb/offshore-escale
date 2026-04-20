const MESES_NOMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                     'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

// Lê os parâmetros da URL
const params = new URLSearchParams(window.location.search);
const dataEmbarqueStr = params.get('embarque');
const diasEmbarcado   = parseInt(params.get('embarcado'));
const diasDesembarcado = parseInt(params.get('desembarcado'));
let viewAtual = params.get('view') || 'mensal';

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

  let html = `<div class="mes-bloco">`;
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
    html += `<div class="dia ${status} ${isHoje}">${d}</div>`;
  }

  html += `</div></div>`;
  return html;
}

// Monta a view completa com N meses a partir do mês atual
function renderView(view) {
  const hoje = new Date();
  let mesesCount, colunas;

  if (view === 'mensal')    { mesesCount = 1;  colunas = 'mensal'; }
  if (view === 'semestral') { mesesCount = 6;  colunas = 'semestral'; }
  if (view === 'anual')     { mesesCount = 12; colunas = 'anual'; }

  let html = `<div class="meses-grid ${colunas}">`;

  for (let i = 0; i < mesesCount; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    html += renderMes(d.getFullYear(), d.getMonth(), view);
  }

  html += `</div>`;
  document.getElementById('cal-view').innerHTML = html;
}

function trocarView(view) {
  viewAtual = view;

  // Atualiza botão ativo
  ['mensal','semestral','anual'].forEach(v => {
    document.getElementById(`btn-${v}`).classList.toggle('ativo', v === view);
  });

  // Atualiza URL sem recarregar a página
  const novosParams = new URLSearchParams(window.location.search);
  novosParams.set('view', view);
  history.replaceState(null, '', `?${novosParams.toString()}`);

  renderView(view);
}

// Inicializa ao carregar
trocarView(viewAtual);
