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
