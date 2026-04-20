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

  if (_calcularAposSalvar) {
    _calcularAposSalvar = false;
    _executarCalculo();
  }
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
