// ── Calendário customizado ──────────────────────────────────────
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

let calAno = new Date().getFullYear();
let calMes = new Date().getMonth();
let calDataSelecionada = null;

function abrirCalendario() {
  const dropdown = document.getElementById('cal-dropdown');
  dropdown.classList.toggle('hidden');
  if (!dropdown.classList.contains('hidden')) renderCalendario();
}

function renderCalendario() {
  document.getElementById('cal-titulo').textContent = `${MESES[calMes]} ${calAno}`;

  const grid = document.getElementById('cal-grid');
  grid.innerHTML = '';

  const hoje = new Date();
  const primeiroDia = new Date(calAno, calMes, 1).getDay();
  const totalDias = new Date(calAno, calMes + 1, 0).getDate();

  for (let i = 0; i < primeiroDia; i++) {
    const vazio = document.createElement('button');
    vazio.classList.add('vazio');
    grid.appendChild(vazio);
  }

  for (let d = 1; d <= totalDias; d++) {
    const btn = document.createElement('button');
    btn.textContent = d;

    const eHoje = d === hoje.getDate() && calMes === hoje.getMonth() && calAno === hoje.getFullYear();
    if (eHoje) btn.classList.add('hoje');

    if (calDataSelecionada &&
        d === calDataSelecionada.getDate() &&
        calMes === calDataSelecionada.getMonth() &&
        calAno === calDataSelecionada.getFullYear()) {
      btn.classList.add('selecionado');
    }

    btn.addEventListener('click', () => selecionarDia(d));
    grid.appendChild(btn);
  }
}

function selecionarDia(dia) {
  calDataSelecionada = new Date(calAno, calMes, dia);

  const dd = String(dia).padStart(2, '0');
  const mm = String(calMes + 1).padStart(2, '0');
  document.getElementById('data-inicio-display').value = `${dd}/${mm}/${calAno}`;
  document.getElementById('data-inicio').value = `${calAno}-${mm}-${dd}`;

  document.getElementById('cal-dropdown').classList.add('hidden');
}

document.getElementById('cal-prev').addEventListener('click', () => {
  calMes--;
  if (calMes < 0) { calMes = 11; calAno--; }
  renderCalendario();
});

document.getElementById('cal-next').addEventListener('click', () => {
  calMes++;
  if (calMes > 11) { calMes = 0; calAno++; }
  renderCalendario();
});

document.getElementById('data-inicio-display').addEventListener('click', abrirCalendario);

document.addEventListener('click', (e) => {
  const wrapper = document.getElementById('cal-dropdown').closest('.cal-wrapper');
  if (!wrapper.contains(e.target)) {
    document.getElementById('cal-dropdown').classList.add('hidden');
  }
});
// ────────────────────────────────────────────────────────────────

// ── Calendário da consulta por data ─────────────────────────────
let calConsultaAno = new Date().getFullYear();
let calConsultaMes = new Date().getMonth();
let calConsultaDataSelecionada = null;

function renderCalConsulta() {
  document.getElementById('cal-consulta-titulo').textContent = `${MESES[calConsultaMes]} ${calConsultaAno}`;
  const grid = document.getElementById('cal-consulta-grid');
  grid.innerHTML = '';
  const hoje = new Date();
  const primeiroDia = new Date(calConsultaAno, calConsultaMes, 1).getDay();
  const totalDias = new Date(calConsultaAno, calConsultaMes + 1, 0).getDate();

  for (let i = 0; i < primeiroDia; i++) {
    const vazio = document.createElement('button');
    vazio.classList.add('vazio');
    grid.appendChild(vazio);
  }

  for (let d = 1; d <= totalDias; d++) {
    const btn = document.createElement('button');
    btn.textContent = d;
    const eHoje = d === hoje.getDate() && calConsultaMes === hoje.getMonth() && calConsultaAno === hoje.getFullYear();
    if (eHoje) btn.classList.add('hoje');
    if (calConsultaDataSelecionada &&
        d === calConsultaDataSelecionada.getDate() &&
        calConsultaMes === calConsultaDataSelecionada.getMonth() &&
        calConsultaAno === calConsultaDataSelecionada.getFullYear()) {
      btn.classList.add('selecionado');
    }
    btn.addEventListener('click', () => selecionarDiaConsulta(d));
    grid.appendChild(btn);
  }
}

function selecionarDiaConsulta(dia) {
  calConsultaDataSelecionada = new Date(calConsultaAno, calConsultaMes, dia);
  const dd = String(dia).padStart(2, '0');
  const mm = String(calConsultaMes + 1).padStart(2, '0');
  document.getElementById('data-consulta-display').value = `${dd}/${mm}/${calConsultaAno}`;
  document.getElementById('data-consulta').value = `${calConsultaAno}-${mm}-${dd}`;
  document.getElementById('cal-consulta-dropdown').classList.add('hidden');
}

document.getElementById('cal-consulta-prev').addEventListener('click', (e) => {
  e.stopPropagation();
  calConsultaMes--;
  if (calConsultaMes < 0) { calConsultaMes = 11; calConsultaAno--; }
  renderCalConsulta();
});

document.getElementById('cal-consulta-next').addEventListener('click', (e) => {
  e.stopPropagation();
  calConsultaMes++;
  if (calConsultaMes > 11) { calConsultaMes = 0; calConsultaAno++; }
  renderCalConsulta();
});

document.getElementById('data-consulta-display').addEventListener('click', (e) => {
  e.stopPropagation();
  const dropdown = document.getElementById('cal-consulta-dropdown');
  dropdown.classList.toggle('hidden');
  if (!dropdown.classList.contains('hidden')) renderCalConsulta();
});
// ────────────────────────────────────────────────────────────────

// Retorna { diasEmbarcado, diasDesembarcado } com base nos inputs
function obterEscala() {
  const embarcado = parseInt(document.getElementById('dias-embarque').value);
  const desembarcado = parseInt(document.getElementById('dias-desembarque').value);

  if (!embarcado || !desembarcado || embarcado < 1 || desembarcado < 1) {
    return null;
  }

  return { diasEmbarcado: embarcado, diasDesembarcado: desembarcado };
}

// Formata uma Date para exibição no padrão brasileiro
function formatarData(date) {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}


function calcular() {
  const escala = obterEscala();
  if (!escala) {
    alert('Preencha corretamente os dias da escala personalizada.');
    return;
  }

  const dataInput = document.getElementById('data-inicio').value;
  if (!dataInput) {
    alert('Informe a data do primeiro embarque.');
    return;
  }

  // Cria a data sem problema de fuso horário (input retorna YYYY-MM-DD)
  const [ano, mes, dia] = dataInput.split('-').map(Number);
  const dataEmbarqueInicial = new Date(ano, mes - 1, dia);

  const hoje = new Date();
  const hojeNormalizado = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  const { diasEmbarcado, diasDesembarcado } = escala;

  // Status de hoje
  const statusHoje = calcularStatus(dataEmbarqueInicial, diasEmbarcado, diasDesembarcado, hojeNormalizado);

  // Se a data inicial é no futuro, trata como desembarcado
  const estaEmbarcado = statusHoje ? statusHoje.embarcado : false;

  // Próximos eventos
  const proxEmbarque = proximoEmbarque(dataEmbarqueInicial, diasEmbarcado, diasDesembarcado, hojeNormalizado);
  const proxDesembarque = proximoDesembarque(dataEmbarqueInicial, diasEmbarcado, diasDesembarcado, hojeNormalizado);

  const diasParaEmbarque = diferencaDias(hojeNormalizado, proxEmbarque);
  const diasParaDesembarque = diferencaDias(hojeNormalizado, proxDesembarque);

  // Atualiza o DOM
  const statusCard = document.getElementById('status-card');
  const statusHojeEl = document.getElementById('status-hoje');

  if (estaEmbarcado) {
    statusCard.className = 'status-card embarcado';
    statusHojeEl.textContent = 'Embarcado';
  } else {
    statusCard.className = 'status-card desembarcado';
    statusHojeEl.textContent = 'Desembarcado';
  }

  document.getElementById('proximo-embarque').textContent = formatarData(proxEmbarque);
  document.getElementById('dias-para-embarque').textContent =
    diasParaEmbarque === 0 ? 'Hoje!' : `em ${diasParaEmbarque} dia${diasParaEmbarque !== 1 ? 's' : ''}`;

  document.getElementById('proximo-desembarque').textContent = formatarData(proxDesembarque);
  document.getElementById('dias-para-desembarque').textContent =
    diasParaDesembarque === 0 ? 'Hoje!' : `em ${diasParaDesembarque} dia${diasParaDesembarque !== 1 ? 's' : ''}`;

  // Reordena os cards: o evento mais próximo aparece primeiro
  const infoGrid = document.querySelector('.info-grid');
  const cardEmbarque = document.getElementById('proximo-embarque').closest('.info-card');
  const cardDesembarque = document.getElementById('proximo-desembarque').closest('.info-card');

  if (estaEmbarcado) {
    infoGrid.prepend(cardDesembarque); // desembarcado vem antes quando está embarcado
  } else {
    infoGrid.prepend(cardEmbarque);    // embarque vem antes quando está desembarcado
  }

  document.getElementById('resultado').classList.remove('hidden');
}

// ── Perfis de usuário (localStorage) ────────────────────────────
const CHAVE_PERFIS = 'offshoreScalePerfis';
let perfilAtivoId = null;

function lerPerfis() {
  const salvo = localStorage.getItem(CHAVE_PERFIS);
  return salvo ? JSON.parse(salvo) : [];
}

function gravarPerfis(perfis) {
  localStorage.setItem(CHAVE_PERFIS, JSON.stringify(perfis));
}

function proximoEventoPerfil(perfil) {
  const hoje = new Date();
  const hojeNorm = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const [ano, mes, dia] = perfil.dataInicio.split('-').map(Number);
  const dataInicio = new Date(ano, mes - 1, dia);

  const status = calcularStatus(dataInicio, perfil.diasEmbarcado, perfil.diasDesembarcado, hojeNorm);
  const fmt = d => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  if (status.embarcado) {
    const data = proximoDesembarque(dataInicio, perfil.diasEmbarcado, perfil.diasDesembarcado, hojeNorm);
    const dias = diferencaDias(hojeNorm, data);
    return `Desembarca ${fmt(data)}${dias === 0 ? ' (hoje)' : ` (${dias}d)`}`;
  } else {
    const data = proximoEmbarque(dataInicio, perfil.diasEmbarcado, perfil.diasDesembarcado, hojeNorm);
    const dias = diferencaDias(hojeNorm, data);
    return `Embarca ${fmt(data)}${dias === 0 ? ' (hoje)' : ` (${dias}d)`}`;
  }
}

function renderizarPerfis() {
  const perfis = lerPerfis();
  const section = document.getElementById('perfis-section');

  if (perfis.length === 0) {
    section.classList.add('hidden');
    document.getElementById('btn-consulta').classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
  document.getElementById('btn-consulta').classList.remove('hidden');
  const select = document.getElementById('perfis-select');
  select.innerHTML =
    '<option value="">Selecione um perfil...</option>' +
    perfis.map(p =>
      `<option value="${p.id}" ${p.id === perfilAtivoId ? 'selected' : ''}>
        ${p.nome} — ${p.diasEmbarcado}×${p.diasDesembarcado} — ${proximoEventoPerfil(p)}
      </option>`
    ).join('');
}

function selecionarPerfilDropdown() {
  const id = parseInt(document.getElementById('perfis-select').value);
  if (id) ativarPerfil(id);
}

function ativarPerfil(id) {
  const perfil = lerPerfis().find(p => p.id === id);
  if (!perfil) return;

  perfilAtivoId = id;

  document.getElementById('dias-embarque').value = perfil.diasEmbarcado;
  document.getElementById('dias-desembarque').value = perfil.diasDesembarcado;
  document.getElementById('data-inicio').value = perfil.dataInicio;
  document.getElementById('data-inicio-display').value = perfil.dataInicioDisplay;

  const [ano, mes, dia] = perfil.dataInicio.split('-').map(Number);
  calDataSelecionada = new Date(ano, mes - 1, dia);
  calAno = ano;
  calMes = mes - 1;

  document.getElementById('btn-salvar-perfil').textContent = 'Atualizar perfil';
  document.getElementById('btn-novo-perfil').classList.remove('hidden');
  renderizarPerfis();
}

function clicarSalvarPerfil() {
  if (perfilAtivoId !== null) {
    atualizarPerfilAtivo();
  } else {
    abrirModalPerfil();
  }
}

function atualizarPerfilAtivo() {
  const escala = obterEscala();
  const dataInicio = document.getElementById('data-inicio').value;
  if (!escala || !dataInicio) {
    alert('Preencha a escala e a data de embarque antes de atualizar.');
    return;
  }

  const perfis = lerPerfis();
  const idx = perfis.findIndex(p => p.id === perfilAtivoId);
  if (idx === -1) return;

  perfis[idx] = {
    ...perfis[idx],
    diasEmbarcado: escala.diasEmbarcado,
    diasDesembarcado: escala.diasDesembarcado,
    dataInicio,
    dataInicioDisplay: document.getElementById('data-inicio-display').value,
  };

  gravarPerfis(perfis);
  renderizarPerfis();
}

function abrirModalPerfil() {
  document.getElementById('input-nome').value = '';
  document.getElementById('modal-perfil').classList.remove('hidden');
  document.getElementById('input-nome').focus();
}

function fecharModalPerfil() {
  document.getElementById('modal-perfil').classList.add('hidden');
}

function confirmarSalvarPerfil() {
  const nome = document.getElementById('input-nome').value.trim();
  if (!nome) { document.getElementById('input-nome').focus(); return; }

  const escala = obterEscala();
  const dataInicio = document.getElementById('data-inicio').value;
  if (!escala || !dataInicio) {
    alert('Preencha a escala e a data de embarque antes de salvar.');
    fecharModalPerfil();
    return;
  }

  const perfis = lerPerfis();
  const novoPerfil = {
    id: Date.now(),
    nome,
    diasEmbarcado: escala.diasEmbarcado,
    diasDesembarcado: escala.diasDesembarcado,
    dataInicio,
    dataInicioDisplay: document.getElementById('data-inicio-display').value,
  };

  perfis.push(novoPerfil);
  gravarPerfis(perfis);
  perfilAtivoId = novoPerfil.id;

  document.getElementById('btn-salvar-perfil').textContent = 'Atualizar perfil';
  document.getElementById('btn-novo-perfil').classList.remove('hidden');
  renderizarPerfis();
  fecharModalPerfil();
}

function deletarPerfilAtivo() {
  if (!perfilAtivoId || !confirm('Apagar este perfil?')) return;
  gravarPerfis(lerPerfis().filter(p => p.id !== perfilAtivoId));
  perfilAtivoId = null;
  document.getElementById('btn-salvar-perfil').textContent = 'Salvar perfil';
  document.getElementById('btn-novo-perfil').classList.add('hidden');
  renderizarPerfis();
}

document.getElementById('modal-perfil').addEventListener('click', function (e) {
  if (e.target === this) fecharModalPerfil();
});

document.getElementById('input-nome').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') confirmarSalvarPerfil();
});

renderizarPerfis();
// ────────────────────────────────────────────────────────────────

// ── Consulta por data ────────────────────────────────────────────
function abrirModalConsulta() {
  const hoje = new Date();
  calConsultaAno = hoje.getFullYear();
  calConsultaMes = hoje.getMonth();
  calConsultaDataSelecionada = null;
  document.getElementById('data-consulta-display').value = '';
  document.getElementById('data-consulta').value = '';
  document.getElementById('cal-consulta-dropdown').classList.add('hidden');
  document.getElementById('resultado-consulta').innerHTML = '';
  document.getElementById('modal-consulta').classList.remove('hidden');
}

function fecharModalConsulta() {
  document.getElementById('modal-consulta').classList.add('hidden');
}

function consultarData() {
  const dataStr = document.getElementById('data-consulta').value;
  if (!dataStr) return;

  const [ano, mes, dia] = dataStr.split('-').map(Number);
  const dataAlvo = new Date(ano, mes - 1, dia);

  const perfis = lerPerfis();
  const embarcados = [];
  const desembarcados = [];

  perfis.forEach(p => {
    const [a, m, d] = p.dataInicio.split('-').map(Number);
    const dataInicio = new Date(a, m - 1, d);
    const status = calcularStatus(dataInicio, p.diasEmbarcado, p.diasDesembarcado, dataAlvo);
    (status.embarcado ? embarcados : desembarcados).push(p.nome);
  });

  const nomes = lista =>
    lista.length
      ? lista.map(n => `<span class="consulta-nome">${n}</span>`).join('')
      : '<span class="consulta-vazio">Nenhum</span>';

  document.getElementById('resultado-consulta').innerHTML = `
    <div class="consulta-resultado">
      <div class="consulta-grupo embarcados">
        <span class="consulta-grupo-titulo">Embarcados</span>
        ${nomes(embarcados)}
      </div>
      <div class="consulta-grupo desembarcados">
        <span class="consulta-grupo-titulo">Desembarcados</span>
        ${nomes(desembarcados)}
      </div>
    </div>`;
}

document.getElementById('modal-consulta').addEventListener('click', function(e) {
  if (e.target === this) fecharModalConsulta();
});
// ────────────────────────────────────────────────────────────────

function irParaCalendario(view) {
  const dataInicio = document.getElementById('data-inicio').value;
  const escala = obterEscala();
  if (!dataInicio || !escala) return;

  const perfilAtivo = lerPerfis().find(p => p.id === perfilAtivoId);
  const urlParams = {
    embarque: dataInicio,
    embarcado: escala.diasEmbarcado,
    desembarcado: escala.diasDesembarcado,
    view: view,
  };
  if (perfilAtivo) urlParams.nome = perfilAtivo.nome;

  window.location.href = `calendario.html?${new URLSearchParams(urlParams).toString()}`;
}
