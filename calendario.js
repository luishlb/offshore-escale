const MESES_NOMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                     'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

// Lê os parâmetros da URL
const params = new URLSearchParams(window.location.search);
const dataEmbarqueStr = params.get('embarque');
const diasEmbarcado   = parseInt(params.get('embarcado'));
const diasDesembarcado = parseInt(params.get('desembarcado'));
let viewAtual = params.get('view') || 'mensal';
let periodoOffset = 0;

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

    html += `<div class="dia ${status} ${transicao} ${isHoje}">${d}</div>`;
  }

  html += `</div></div>`;
  return html;
}

// Calcula o ano e mês inicial do período com base no offset
function calcularPeriodo(view) {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth();

  if (view === 'semestral') {
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
  const hoje = new Date();
  let mesInicio, mesesCount, colunas, anoView;

  if (view === 'mensal') {
    mesInicio  = hoje.getMonth();
    mesesCount = 1;
    colunas    = 'mensal';
    anoView    = hoje.getFullYear();
  } else {
    const periodo = calcularPeriodo(view);
    mesInicio  = periodo.mesInicio;
    anoView    = periodo.ano;
    mesesCount = view === 'semestral' ? 6 : 12;
    colunas    = view;
  }

  let html = '';

  if (view !== 'mensal') {
    const periodo = calcularPeriodo(view);
    html += `<div class="cal-nav">
      <button onclick="navegarPeriodo(-1)">&#8249;</button>
      <span>${periodo.titulo}</span>
      <button onclick="navegarPeriodo(1)">&#8250;</button>
    </div>`;
  }

  html += `<div class="meses-grid ${colunas}">`;
  for (let i = 0; i < mesesCount; i++) {
    html += renderMes(anoView, mesInicio + i, view);
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

// Inicializa ao carregar
trocarView(viewAtual);
