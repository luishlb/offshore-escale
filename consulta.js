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

document.getElementById('modal-consulta').addEventListener('click', function (e) {
  if (e.target === this) fecharModalConsulta();
});
