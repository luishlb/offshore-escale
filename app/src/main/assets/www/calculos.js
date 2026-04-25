// Funções de cálculo compartilhadas entre app.js e calendario.js

const FERIADOS_FIXOS = {
  '1-1':   'Ano Novo',
  '4-21':  'Tiradentes',
  '5-1':   'Dia do Trabalho',
  '9-7':   'Independência do Brasil',
  '10-12': 'Nossa Senhora Aparecida',
  '11-2':  'Finados',
  '11-15': 'Proclamação da República',
  '11-20': 'Consciência Negra',
  '12-25': 'Natal',
};

function obterFeriado(ano, mes, dia) {
  const fixo = FERIADOS_FIXOS[`${mes + 1}-${dia}`];
  if (fixo) return { nome: fixo, tipo: 'feriado' };

  // 2ª sexta-feira de agosto = Dia do Trabalhador Offshore
  if (mes === 7) {
    const primeiroDia = new Date(ano, 7, 1).getDay();
    const diasAtePrimeiraSexta = (5 - primeiroDia + 7) % 7;
    const segundaSexta = 1 + diasAtePrimeiraSexta + 7;
    if (dia === segundaSexta) return { nome: 'Dia do Trabalhador Offshore', tipo: 'feriado' };
  }

  return null;
}

function diferencaDias(dataA, dataB) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const a = Date.UTC(dataA.getFullYear(), dataA.getMonth(), dataA.getDate());
  const b = Date.UTC(dataB.getFullYear(), dataB.getMonth(), dataB.getDate());
  return Math.round((b - a) / msPerDay);
}

function calcularStatus(dataEmbarqueInicial, diasEmbarcado, diasDesembarcado, dataAlvo) {
  const ciclo = diasEmbarcado + diasDesembarcado;
  const totalDias = diferencaDias(dataEmbarqueInicial, dataAlvo);
  // Módulo positivo: funciona corretamente com datas anteriores ao embarque inicial
  const diaDoCiclo = ((totalDias % ciclo) + ciclo) % ciclo;
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
