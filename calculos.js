// Funções de cálculo compartilhadas entre app.js e calendario.js

function diferencaDias(dataA, dataB) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const a = Date.UTC(dataA.getFullYear(), dataA.getMonth(), dataA.getDate());
  const b = Date.UTC(dataB.getFullYear(), dataB.getMonth(), dataB.getDate());
  return Math.round((b - a) / msPerDay);
}

function calcularStatus(dataEmbarqueInicial, diasEmbarcado, diasDesembarcado, dataAlvo) {
  const ciclo = diasEmbarcado + diasDesembarcado;
  const totalDias = diferencaDias(dataEmbarqueInicial, dataAlvo);
  if (totalDias < 0) return null;
  const diaDoCiclo = totalDias % ciclo;
  return { embarcado: diaDoCiclo < diasEmbarcado, diaDoCiclo };
}

function proximoEmbarque(dataEmbarqueInicial, diasEmbarcado, diasDesembarcado, hoje) {
  const ciclo = diasEmbarcado + diasDesembarcado;
  const totalDias = diferencaDias(dataEmbarqueInicial, hoje);
  if (totalDias < 0) return dataEmbarqueInicial;
  const diaDoCiclo = totalDias % ciclo;
  const proxEmbarque = new Date(hoje);
  proxEmbarque.setDate(proxEmbarque.getDate() + (ciclo - diaDoCiclo));
  return proxEmbarque;
}

function proximoDesembarque(dataEmbarqueInicial, diasEmbarcado, diasDesembarcado, hoje) {
  const ciclo = diasEmbarcado + diasDesembarcado;
  const totalDias = diferencaDias(dataEmbarqueInicial, hoje);
  if (totalDias < 0) {
    const desembarque = new Date(dataEmbarqueInicial);
    desembarque.setDate(desembarque.getDate() + diasEmbarcado);
    return desembarque;
  }
  const diaDoCiclo = totalDias % ciclo;
  const diasAte = diaDoCiclo < diasEmbarcado
    ? diasEmbarcado - diaDoCiclo
    : ciclo - diaDoCiclo + diasEmbarcado;
  const proxDesembarque = new Date(hoje);
  proxDesembarque.setDate(proxDesembarque.getDate() + diasAte);
  return proxDesembarque;
}
