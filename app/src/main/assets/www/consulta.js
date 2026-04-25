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
    const ciclo = p.diasEmbarcado + p.diasDesembarcado;
    const preEmbarque = !status.embarcado && status.diaDoCiclo === ciclo - 1;
    if (status.embarcado) {
      embarcados.push(p.nome);
    } else {
      desembarcados.push({ nome: p.nome, preEmbarque });
    }
  });

  const nomesEmbarcados = lista =>
    lista.length
      ? lista.map(n => `<span class="consulta-nome">${n}</span>`).join('')
      : '<span class="consulta-vazio">Nenhum</span>';

  const nomesDesembarcados = lista =>
    lista.length
      ? lista.map(({ nome, preEmbarque }) =>
          `<span class="consulta-nome">${nome}${preEmbarque ? '<sup>*</sup>' : ''}</span>`
        ).join('')
      : '<span class="consulta-vazio">Nenhum</span>';

  const temPreEmbarque = desembarcados.some(d => d.preEmbarque);

  document.getElementById('resultado-consulta').innerHTML = `
    <div class="consulta-resultado">
      <div class="consulta-grupo embarcados">
        <span class="consulta-grupo-titulo">Embarcados</span>
        ${nomesEmbarcados(embarcados)}
      </div>
      <div class="consulta-grupo desembarcados">
        <span class="consulta-grupo-titulo">Desembarcados</span>
        ${nomesDesembarcados(desembarcados)}
        ${temPreEmbarque ? '<p class="consulta-pre-embarque">*Dia de pré-embarque</p>' : ''}
      </div>
    </div>`;
}

document.getElementById('modal-consulta').addEventListener('click', function (e) {
  if (e.target === this) fecharModalConsulta();
});
