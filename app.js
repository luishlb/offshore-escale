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
  const wrapper = document.querySelector('.cal-wrapper');
  if (!wrapper.contains(e.target)) {
    document.getElementById('cal-dropdown').classList.add('hidden');
  }
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

function irParaCalendario(view) {
  const dataInicio = document.getElementById('data-inicio').value;
  const escala = obterEscala();
  if (!dataInicio || !escala) return;

  const params = new URLSearchParams({
    embarque: dataInicio,
    embarcado: escala.diasEmbarcado,
    desembarcado: escala.diasDesembarcado,
    view: view,
  });

  window.location.href = `calendario.html?${params.toString()}`;
}
