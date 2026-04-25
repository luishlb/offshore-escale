function obterEscala() {
  const embarcado = parseInt(document.getElementById('dias-embarque').value);
  const desembarcado = parseInt(document.getElementById('dias-desembarque').value);

  if (!embarcado || !desembarcado || embarcado < 1 || desembarcado < 1) {
    return null;
  }

  return { diasEmbarcado: embarcado, diasDesembarcado: desembarcado };
}

function formatarData(date) {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

let _calcularAposSalvar = false;

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

  if (perfilAtivoId === null) {
    document.getElementById('modal-confirmar-perfil').classList.remove('hidden');
    return;
  }

  _executarCalculo();
}

function responderSalvarPerfil(salvar) {
  document.getElementById('modal-confirmar-perfil').classList.add('hidden');
  if (salvar) {
    _calcularAposSalvar = true;
    abrirModalPerfil();
  } else {
    _executarCalculo();
  }
}

function _executarCalculo() {
  const dataInput = document.getElementById('data-inicio').value;
  const escala = obterEscala();

  const [ano, mes, dia] = dataInput.split('-').map(Number);
  const dataEmbarqueInicial = new Date(ano, mes - 1, dia);

  const hoje = new Date();
  const hojeNormalizado = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  const { diasEmbarcado, diasDesembarcado } = escala;

  const statusHoje = calcularStatus(dataEmbarqueInicial, diasEmbarcado, diasDesembarcado, hojeNormalizado);
  const estaEmbarcado = statusHoje ? statusHoje.embarcado : false;

  const proxEmbarque = proximoEmbarque(dataEmbarqueInicial, diasEmbarcado, diasDesembarcado, hojeNormalizado);
  const proxDesembarque = proximoDesembarque(dataEmbarqueInicial, diasEmbarcado, diasDesembarcado, hojeNormalizado);

  const diasParaEmbarque = diferencaDias(hojeNormalizado, proxEmbarque);
  const diasParaDesembarque = diferencaDias(hojeNormalizado, proxDesembarque);

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

  const infoGrid = document.querySelector('.info-grid');
  const cardEmbarque = document.getElementById('proximo-embarque').closest('.info-card');
  const cardDesembarque = document.getElementById('proximo-desembarque').closest('.info-card');

  if (estaEmbarcado) {
    infoGrid.prepend(cardDesembarque);
  } else {
    infoGrid.prepend(cardEmbarque);
  }

  document.getElementById('resultado').classList.remove('hidden');
}

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
