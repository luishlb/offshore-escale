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
