// Mostra/oculta campos de escala personalizada
document.getElementById('escala').addEventListener('change', function () {
  const customFields = document.getElementById('custom-fields');
  if (this.value === 'custom') {
    customFields.classList.remove('hidden');
  } else {
    customFields.classList.add('hidden');
  }
});

// Retorna { diasEmbarcado, diasDesembarcado } com base na seleção
function obterEscala() {
  const select = document.getElementById('escala').value;

  if (select !== 'custom') {
    const partes = select.split('x');
    return {
      diasEmbarcado: parseInt(partes[0]),
      diasDesembarcado: parseInt(partes[1]),
    };
  }

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

// Retorna a diferença em dias inteiros entre duas datas (sem horário)
function diferencaDias(dataA, dataB) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const a = Date.UTC(dataA.getFullYear(), dataA.getMonth(), dataA.getDate());
  const b = Date.UTC(dataB.getFullYear(), dataB.getMonth(), dataB.getDate());
  return Math.round((b - a) / msPerDay);
}

// Dado o dia do ciclo (0-based) e a escala, diz se está embarcado
function estaEmbarcadoNoDia(diaDoCiclo, diasEmbarcado) {
  return diaDoCiclo < diasEmbarcado;
}

// Calcula o status para uma data alvo a partir de uma data de embarque inicial
function calcularStatus(dataEmbarqueInicial, diasEmbarcado, diasDesembarcado, dataAlvo) {
  const ciclo = diasEmbarcado + diasDesembarcado;
  const totalDias = diferencaDias(dataEmbarqueInicial, dataAlvo);

  // Se a data alvo é antes do embarque inicial, não há dados
  if (totalDias < 0) return null;

  const diaDoCiclo = totalDias % ciclo;
  const embarcado = estaEmbarcadoNoDia(diaDoCiclo, diasEmbarcado);

  return { embarcado, diaDoCiclo };
}

// Encontra a próxima data de embarque a partir de hoje (exclusivo se já estiver embarcado hoje)
function proximoEmbarque(dataEmbarqueInicial, diasEmbarcado, diasDesembarcado, hoje) {
  const ciclo = diasEmbarcado + diasDesembarcado;
  const totalDias = diferencaDias(dataEmbarqueInicial, hoje);

  if (totalDias < 0) return dataEmbarqueInicial;

  const diaDoCiclo = totalDias % ciclo;

  // Quantos dias até o início do próximo ciclo (início = embarque)
  let diasAteProximoEmbarque;
  if (diaDoCiclo < diasEmbarcado) {
    // Está embarcado agora: próximo embarque é no próximo ciclo
    diasAteProximoEmbarque = ciclo - diaDoCiclo;
  } else {
    // Está desembarcado: próximo embarque é no começo do próximo ciclo
    diasAteProximoEmbarque = ciclo - diaDoCiclo;
  }

  const proxEmbarque = new Date(hoje);
  proxEmbarque.setDate(proxEmbarque.getDate() + diasAteProximoEmbarque);
  return proxEmbarque;
}

// Encontra a próxima data de desembarque a partir de hoje
function proximoDesembarque(dataEmbarqueInicial, diasEmbarcado, diasDesembarcado, hoje) {
  const ciclo = diasEmbarcado + diasDesembarcado;
  const totalDias = diferencaDias(dataEmbarqueInicial, hoje);

  if (totalDias < 0) {
    // Antes do ciclo começar: desembarque é diasEmbarcado dias após o início
    const desembarque = new Date(dataEmbarqueInicial);
    desembarque.setDate(desembarque.getDate() + diasEmbarcado);
    return desembarque;
  }

  const diaDoCiclo = totalDias % ciclo;

  let diasAteDesembarque;
  if (diaDoCiclo < diasEmbarcado) {
    // Está embarcado: desembarque acontece quando acabam os dias embarcados
    diasAteDesembarque = diasEmbarcado - diaDoCiclo;
  } else {
    // Está desembarcado: próximo desembarque é após o próximo embarque + dias embarcado
    diasAteDesembarque = ciclo - diaDoCiclo + diasEmbarcado;
  }

  const proxDesembarque = new Date(hoje);
  proxDesembarque.setDate(proxDesembarque.getDate() + diasAteDesembarque);
  return proxDesembarque;
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

  document.getElementById('resultado').classList.remove('hidden');
}
