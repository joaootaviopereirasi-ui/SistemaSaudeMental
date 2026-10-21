/* Pausa+ modo demonstração: o "servidor" roda dentro do navegador, dados salvos em localStorage. */
(function(){
'use strict';
function cyrb(str,seed){let h1=0xdeadbeef^seed,h2=0x41c6ce57^seed;for(let i=0;i<str.length;i++){const c=str.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677);}
h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
return (h2>>>0).toString(16).padStart(8,'0')+(h1>>>0).toString(16).padStart(8,'0');}
const crypto={
 createHash(){let s='';return{update(x){s+=x;return this;},digest(){return cyrb(s,1)+cyrb(s,2);}};},
 randomBytes(n){const a=new Uint8Array(n);globalThis.crypto.getRandomValues(a);return{toString(){return Array.from(a,b=>b.toString(16).padStart(2,'0')).join('');}};},
 randomInt(n){return globalThis.crypto.getRandomValues(new Uint32Array(1))[0]%n;}
};
const mods={};const srcs={};
function req(name){
 if(name==='crypto')return crypto;
 if(name==='fs'||name==='path')return {};
 const k=name.replace(/^\.\/(lib\/)?/,'');
 if(mods[k])return mods[k].exports;
 const m=mods[k]={exports:{}};srcs[k](m,m.exports,req);return m.exports;
}
srcs['constants']=function(module,exports,require){
'use strict';

module.exports = {
  K_MIN: 5, // minimo de respondentes para exibir um grupo (anonimato)
  STORES: ['Loja Centro', 'Loja Norte', 'Loja Sul'],
  SECTORS: ['Caixa', 'Reposição', 'Estoque', 'Padaria', 'Açougue', 'Atendimento', 'Limpeza', 'Logística', 'Administrativo'],
  JOBS: [
    'Operador(a) de caixa', 'Fiscal de caixa', 'Empacotador(a)', 'Repositor(a)', 'Promotor(a) de vendas',
    'Atendente de loja', 'Balconista', 'Açougueiro(a)', 'Auxiliar de açougue', 'Padeiro(a)', 'Confeiteiro(a)',
    'Auxiliar de padaria', 'Cozinheiro(a)', 'Auxiliar de cozinha', 'Estoquista', 'Auxiliar de depósito',
    'Conferente de mercadorias', 'Separador(a) de pedidos', 'Operador(a) de empilhadeira', 'Motorista',
    'Entregador(a)', 'Auxiliar de limpeza', 'Encarregado(a) de limpeza', 'Fiscal de prevenção de perdas',
    'Agente de segurança', 'Recepcionista', 'Atendente de SAC', 'Televendas', 'Separador(a) de e-commerce',
    'Entregador(a) de e-commerce', 'Gerente de loja', 'Subgerente', 'Encarregado(a) de setor', 'Líder de equipe',
    'Comprador(a)', 'Assistente de compras', 'Analista de estoque', 'Assistente administrativo', 'Auxiliar financeiro',
    'Analista financeiro', 'Profissional de RH', 'Profissional de Saúde e Segurança do Trabalho',
    'Técnico(a) de segurança do trabalho', 'Enfermeiro(a) do trabalho', 'Técnico(a) de enfermagem do trabalho',
    'Analista de TI', 'Suporte de TI', 'Técnico(a) de manutenção', 'Eletricista de manutenção',
    'Analista de marketing', 'Operador(a) de loja', 'Outro cargo'
  ],
  SHIFTS: [
    { key: 'manha', label: 'Manhã', hours: '06h às 14h' },
    { key: 'tarde', label: 'Tarde', hours: '14h às 22h' },
    { key: 'noite', label: 'Noite', hours: '22h às 06h' }
  ],
  // As 8 causas listadas no enunciado do Desafio 4
  BARRIERS: [
    { key: 'nao_soube', label: 'Não fiquei sabendo da ação' },
    { key: 'horario', label: 'Horário ruim para o meu turno' },
    { key: 'beneficio', label: 'Não entendi para que serve' },
    { key: 'esqueci', label: 'Esqueci da data' },
    { key: 'posto', label: 'Não consegui sair do posto' },
    { key: 'interesse', label: 'Não me identifiquei com a ação' },
    { key: 'prefere_outra', label: 'Prefiro outro tipo de ação' },
    { key: 'inscricao', label: 'Inscrição complicada' }
  ],
  TYPES: [
    { key: 'ginastica', label: 'Ginástica laboral' },
    { key: 'ergonomia', label: 'Ergonomia' },
    { key: 'exame', label: 'Exames e prevenção' },
    { key: 'alimentacao', label: 'Alimentação saudável' },
    { key: 'atividade', label: 'Atividade física' },
    { key: 'sono_estresse', label: 'Sono e estresse' },
    { key: 'palestra', label: 'Palestra de conscientização' }
  ],
  // Check-in de saude: escala 1 a 5. worse=true significa que valor alto e pior.
  ITEMS: [
    { key: 'dor', group: 'fisica', worse: true, short: 'Dor no corpo', question: 'Como está a dor no corpo (costas, pernas, braços)?', low: 'Nenhuma', high: 'Muita' },
    { key: 'cansaco', group: 'fisica', worse: true, short: 'Cansaço', question: 'Quanto cansaço você sente no trabalho?', low: 'Nenhum', high: 'Muito' },
    { key: 'sono', group: 'fisica', worse: false, short: 'Sono', question: 'Como tem sido o seu sono nos últimos dias?', low: 'Péssimo', high: 'Ótimo' },
    { key: 'satisfacao', group: 'mental', worse: false, short: 'Satisfação', question: 'Como foi sua satisfação com o trabalho hoje?', low: 'Muito baixa', high: 'Muito alta' },
    { key: 'humor', group: 'mental', worse: false, short: 'Humor', question: 'Como está o seu humor?', low: 'Muito mal', high: 'Muito bem' },
    { key: 'estresse', group: 'mental', worse: true, short: 'Estresse', question: 'Quanto estresse você sente?', low: 'Nenhum', high: 'Muito' },
    { key: 'sobrecarga', group: 'mental', worse: true, short: 'Sobrecarga', question: 'Você se sente sobrecarregado(a) no trabalho?', low: 'Nunca', high: 'Sempre' },
    { key: 'apoio', group: 'mental', worse: false, short: 'Apoio da equipe', question: 'Você sente apoio da sua equipe?', low: 'Nenhum', high: 'Total' }
  ]
};

};
srcs['analytics']=function(module,exports,require){
'use strict';
const crypto = require('crypto');
const C = require('./constants');

const DAY = 86400000;
const K = C.K_MIN;
const itemByKey = Object.fromEntries(C.ITEMS.map(i => [i.key, i]));
const barrierLabel = Object.fromEntries(C.BARRIERS.map(b => [b.key, b.label]));
const typeLabel = Object.fromEntries(C.TYPES.map(t => [t.key, t.label]));
const shiftLabel = Object.fromEntries(C.SHIFTS.map(s => [s.key, s.label]));

const mean = a => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);
const r1 = x => (x == null ? null : Math.round(x * 10) / 10);
const r0 = x => (x == null ? null : Math.round(x));
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

function hashId(id, salt) {
  return crypto.createHash('sha256').update(String(id) + String(salt)).digest('hex').slice(0, 16);
}

function weekStart(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}

function weekLabel(ts) {
  const d = new Date(ts);
  return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
}

function itemScore(key, v) {
  return itemByKey[key].worse ? ((5 - v) / 4) * 100 : ((v - 1) / 4) * 100;
}

function statusOf(g) {
  if (g == null) return null;
  const r = Math.round(g);
  return r >= 68 ? 'verde' : r >= 58 ? 'amarelo' : 'vermelho';
}

// Estatisticas de um conjunto de check-ins. n = respondentes distintos.
function groupStats(rows) {
  const n = new Set(rows.map(r => r.h)).size;
  if (!rows.length) return { n: 0, responses: 0, means: {}, fisica: null, mental: null, geral: null, status: null };
  const means = {};
  C.ITEMS.forEach(i => { means[i.key] = mean(rows.map(r => r.answers[i.key])); });
  const grp = g => mean(C.ITEMS.filter(i => i.group === g).map(i => itemScore(i.key, means[i.key])));
  const geral = mean(C.ITEMS.map(i => itemScore(i.key, means[i.key])));
  return { n, responses: rows.length, means, fisica: grp('fisica'), mental: grp('mental'), geral, status: statusOf(geral) };
}

const publicStats = s => {
  if (s.n < K) return { n: s.n, hidden: true };
  const means = {};
  Object.keys(s.means).forEach(k => { means[k] = r1(s.means[k]); });
  return { n: s.n, hidden: false, means, fisica: r0(s.fisica), mental: r0(s.mental), geral: r0(s.geral), status: s.status };
};

const matchEmp = (e, f) =>
  (!f.store || e.store === f.store) && (!f.sector || e.sector === f.sector) && (!f.shift || e.shift === f.shift);

function targets(action, e) {
  return (
    (action.sectors === 'all' || action.sectors.includes(e.sector)) &&
    (action.shifts === 'all' || action.shifts.includes(e.shift)) &&
    (!action.store || action.store === e.store)
  );
}

function groupBy(arr, fn) {
  const m = new Map();
  arr.forEach(x => { const k = fn(x); if (!m.has(k)) m.set(k, []); m.get(k).push(x); });
  return m;
}

function barrierBreakdown(rows) {
  const total = rows.length;
  const counts = {};
  rows.forEach(r => { counts[r.barrier] = (counts[r.barrier] || 0) + 1; });
  const items = C.BARRIERS.map(b => ({ key: b.key, label: b.label, count: counts[b.key] || 0, pct: pct(counts[b.key] || 0, total) }))
    .sort((a, b) => b.count - a.count);
  return { total, items };
}

// ---------------------------------------------------------------------------
// Dashboard do RH
// ---------------------------------------------------------------------------
function dashboard(db, f, now) {
  const days = Math.max(7, Math.min(120, Number(f.days) || 28));
  const since = now - days * DAY;
  const emps = db.employees.filter(e => matchEmp(e, f));
  const empIds = new Set(emps.map(e => e.id));
  const empHashes = new Set(emps.map(e => hashId(e.id, db.meta.salt)));
  const empById = Object.fromEntries(db.employees.map(e => [e.id, e]));

  const attBy = groupBy(db.attendances.filter(a => empIds.has(a.eid)), a => a.actionId);
  const rsvpBy = groupBy(db.rsvps.filter(r => empIds.has(r.eid)), r => r.actionId);
  const fbBy = groupBy(db.feedbacks.filter(x => empIds.has(x.eid)), x => x.actionId);

  // ---- Acoes
  const actions = [];
  db.actions.forEach(a => {
    const elig = emps.filter(e => targets(a, e));
    if (!elig.length) return;
    const att = attBy.get(a.id) || [];
    const fbs = fbBy.get(a.id) || [];
    const past = a.date < now;
    actions.push({
      id: a.id, title: a.title, type: a.type, typeLabel: typeLabel[a.type], date: a.date, duration: a.duration,
      location: a.location, code: a.code, sectors: a.sectors, shifts: a.shifts,
      eligible: elig.length,
      inscritos: (rsvpBy.get(a.id) || []).filter(r => r.status === 'vou').length,
      participantes: att.length,
      adesao: past ? pct(att.length, elig.length) : null,
      rating: fbs.length >= 3 ? r1(mean(fbs.map(x => x.rating))) : null,
      ratings: fbs.length,
      again: fbs.length ? pct(fbs.filter(x => x.again).length, fbs.length) : null,
      past
    });
  });
  actions.sort((a, b) => b.date - a.date);
  const pastInPeriod = actions.filter(a => a.past && a.date >= since);

  // ---- Adesao semanal (8 semanas)
  const thisWeek = weekStart(now);
  const weeks = [];
  for (let i = 7; i >= 0; i--) weeks.push(thisWeek - i * 7 * DAY);
  const adesaoSemanal = weeks.map(w => {
    const list = actions.filter(a => a.past && a.date >= w && a.date < w + 7 * DAY);
    const e = list.reduce((s, a) => s + a.eligible, 0);
    const p = list.reduce((s, a) => s + a.participantes, 0);
    return { week: w, label: weekLabel(w), acoes: list.length, adesao: e ? pct(p, e) : null };
  });

  // ---- Saude
  const checkins = db.checkins.filter(c => matchEmp(c, f));
  const saudeSemanal = weeks.map(w => {
    const rows = checkins.filter(c => c.ts >= w && c.ts < w + 7 * DAY);
    const s = publicStats(groupStats(rows));
    return { week: w, label: weekLabel(w), n: s.n, hidden: s.hidden, fisica: s.fisica ?? null, mental: s.mental ?? null, geral: s.geral ?? null };
  });
  const periodRows = checkins.filter(c => c.ts >= since);
  const overall = publicStats(groupStats(periodRows));

  const last7 = now - 7 * DAY;
  const respondersLast7 = new Set(checkins.filter(c => c.ts >= last7).map(c => c.h));
  const responseRate = pct(respondersLast7.size, emps.length);

  // Mapa de calor setor x turno
  const heatmap = [];
  C.SECTORS.forEach(sector => {
    C.SHIFTS.forEach(sh => {
      const group = emps.filter(e => e.sector === sector && e.shift === sh.key);
      if (!group.length) return;
      const hs = new Set(group.map(e => hashId(e.id, db.meta.salt)));
      const rows = periodRows.filter(c => c.sector === sector && c.shift === sh.key);
      const resp7 = new Set(rows.filter(c => c.ts >= last7).map(c => c.h));
      const rowsAll = checkins.filter(c => c.sector === sector && c.shift === sh.key && c.ts >= since);
      const s = publicStats(groupStats(rowsAll));
      heatmap.push({ sector, shift: sh.key, shiftLabel: sh.label, colaboradores: group.length, respRate: pct(resp7.size, hs.size), ...s });
    });
  });

  // Itens por setor (ranking de riscos)
  const itensPorSetor = C.SECTORS.map(sector => {
    const rows = periodRows.filter(c => c.sector === sector);
    return { sector, ...publicStats(groupStats(rows)) };
  }).filter(x => emps.some(e => e.sector === x.sector));

  // Alertas de tendencia: ultimas 2 semanas x 2 semanas anteriores
  const alerts = [];
  const t1 = now - 14 * DAY, t0 = now - 28 * DAY;
  const watch = [
    { k: 'dor', dir: 1, text: 'dor no corpo' },
    { k: 'cansaco', dir: 1, text: 'cansaço' },
    { k: 'estresse', dir: 1, text: 'estresse' },
    { k: 'sono', dir: -1, text: 'qualidade do sono' }
  ];
  C.SECTORS.forEach(sector => {
    C.SHIFTS.map(s => s.key).forEach(shift => {
      const base = checkins.filter(c => c.sector === sector && (!shift || c.shift === shift));
      const cur = base.filter(c => c.ts >= t1), prev = base.filter(c => c.ts >= t0 && c.ts < t1);
      if (new Set(cur.map(c => c.h)).size < 8 || new Set(prev.map(c => c.h)).size < 8) return;
      watch.forEach(w => {
        const a = mean(prev.map(c => c.answers[w.k])), b = mean(cur.map(c => c.answers[w.k]));
        const worsen = (b - a) * w.dir;
        if (worsen >= 0.4) {
          alerts.push({
            sector, shift, shiftLabel: shift ? shiftLabel[shift] : null, item: w.k, delta: r1(worsen),
            text: `${sector}${shift ? ' / ' + shiftLabel[shift] : ''}: ${w.text} ${w.dir > 0 ? 'subiu' : 'caiu'} de ${r1(a)} para ${r1(b)} (escala 1 a 5) nas últimas 2 semanas.`
          });
        }
      });
    });
  });
  alerts.sort((a, b) => b.delta - a.delta);

  // ---- Barreiras
  const bRows = db.barrierAnswers.filter(b => matchEmp(b, f) && b.ts >= since);
  const barriers = barrierBreakdown(bRows);
  const breakdown = [];
  groupBy(bRows, b => b.sector).forEach((rows, sector) => breakdown.push({ kind: 'sector', group: sector, n: rows.length, ...barrierBreakdown(rows) }));
  groupBy(bRows, b => b.shift).forEach((rows, shift) => breakdown.push({ kind: 'shift', group: shiftLabel[shift], key: shift, n: rows.length, ...barrierBreakdown(rows) }));
  const barrierGroups = breakdown.filter(g => g.n >= K).map(g => ({ kind: g.kind, group: g.group, key: g.key, n: g.n, top: g.items.slice(0, 3).filter(i => i.count) }));

  // Taxa de resposta ao "por que nao fui"
  const missed = pastInPeriod.reduce((s, a) => s + (a.eligible - a.participantes), 0);
  const barrierResponseRate = pct(bRows.length, missed);

  // ---- Demanda (o que os colaboradores querem)
  const votes = db.votes.filter(v => matchEmp(v, f));
  const demand = C.TYPES.map(t => {
    const c = votes.filter(v => v.types.includes(t.key)).length;
    return { key: t.key, label: t.label, votos: c, pct: pct(c, votes.length) };
  }).sort((a, b) => b.votos - a.votos);

  // ---- Por tipo de acao
  const byType = C.TYPES.map(t => {
    const list = pastInPeriod.filter(a => a.type === t.key);
    const e = list.reduce((s, a) => s + a.eligible, 0), p = list.reduce((s, a) => s + a.participantes, 0);
    const rated = list.filter(a => a.rating != null);
    return { key: t.key, label: t.label, acoes: list.length, adesao: e ? pct(p, e) : null, rating: rated.length ? r1(mean(rated.map(a => a.rating))) : null };
  }).filter(t => t.acoes);

  // ---- KPIs
  const eAll = pastInPeriod.reduce((s, a) => s + a.eligible, 0);
  const pAll = pastInPeriod.reduce((s, a) => s + a.participantes, 0);
  const firstWeeks = adesaoSemanal.slice(0, 4).filter(w => w.adesao != null).map(w => w.adesao);
  const lastWeeks = adesaoSemanal.slice(4).filter(w => w.adesao != null).map(w => w.adesao);
  const kpis = {
    colaboradores: emps.length,
    adesao: eAll ? pct(pAll, eAll) : null,
    adesaoVar: firstWeeks.length && lastWeeks.length ? Math.round(mean(lastWeeks) - mean(firstWeeks)) : null,
    participacoes: pAll,
    acoes: pastInPeriod.length,
    proximas: actions.filter(a => !a.past).length,
    respostaCheckin: responseRate,
    barrierResponseRate,
    saudeGeral: overall.hidden ? null : overall.geral,
    saudeStatus: overall.hidden ? null : overall.status,
    gruposVermelhos: heatmap.filter(h => h.status === 'vermelho').length
  };

  // ---- Recomendacoes
  const recs = [];
  const add = (r) => recs.push({ id: recs.length + 1, ...r });
  const sevRank = { alta: 0, media: 1, baixa: 2 };

  breakdown.filter(g => g.kind === 'shift' && g.n >= K).forEach(g => {
    const i = g.items.find(x => x.key === 'horario');
    if (i && i.pct >= 40) add({
      sev: i.pct >= 50 ? 'alta' : 'media', area: 'Participação', scope: 'Turno ' + g.group,
      title: `Turno ${g.group}: ${i.pct}% dos que não participaram apontam horário ruim`,
      evidence: `${i.count} de ${g.n} respostas no período.`,
      action: g.key === 'noite' ? 'Realizar a próxima ação na troca de turno (por volta das 22h) ou no início do turno da noite.' : 'Oferecer duas janelas de horário para a mesma ação, uma próxima à troca de turno.',
      notice: g.key === 'noite' ? 'Vocês pediram ações em horário que caiba no turno da noite. A partir de agora elas acontecem na troca de turno.' : null
    });
  });
  breakdown.filter(g => g.kind === 'sector' && g.n >= K).forEach(g => {
    const i = g.items.find(x => x.key === 'posto');
    if (i && i.pct >= 40) add({
      sev: i.pct >= 50 ? 'alta' : 'media', area: 'Participação', scope: g.group,
      title: `${g.group}: ${i.pct}% não conseguem sair do posto`,
      evidence: `${i.count} de ${g.n} respostas no período.`,
      action: 'Combinar com o gestor um revezamento de 10 minutos e preferir ações curtas (5 a 10 min) feitas no próprio setor.',
      notice: `${g.group}: as ações passam a ser curtas e com revezamento, para ninguém precisar deixar o posto descoberto.`
    });
    const n = g.items.find(x => x.key === 'nao_soube');
    if (n && n.pct >= 25) add({
      sev: 'media', area: 'Comunicação', scope: g.group,
      title: `${g.group}: ${n.pct}% não ficaram sabendo da ação`,
      evidence: `${n.count} de ${g.n} respostas no período.`,
      action: 'Reforçar a divulgação: QR code no relógio de ponto, aviso do gestor no início do turno e convite direto pelo celular.',
      notice: null
    });
    const b = g.items.find(x => x.key === 'beneficio');
    if (b && b.pct >= 25) add({
      sev: 'baixa', area: 'Comunicação', scope: g.group,
      title: `${g.group}: ${b.pct}% não entenderam para que serve a ação`,
      evidence: `${b.count} de ${g.n} respostas no período.`,
      action: 'Incluir em cada convite uma frase com o benefício prático (ex.: "reduz dor nas costas") e a duração.',
      notice: null
    });
  });

  byType.filter(t => t.rating != null && t.rating < 3.5).forEach(t => add({
    sev: 'media', area: 'Engajamento', scope: t.label,
    title: `${t.label}: nota média ${t.rating} de 5`,
    evidence: `${t.acoes} ação(ões) no período, adesão ${t.adesao}%.`,
    action: 'Revisar formato e horário ou substituir por um tipo de ação mais pedido pelos colaboradores.',
    notice: null
  }));

  itensPorSetor.filter(s => !s.hidden).forEach(s => {
    if (s.means.dor >= 3.0) add({
      sev: s.means.dor >= 3.4 ? 'alta' : 'media', area: 'Saúde física', scope: s.sector,
      title: `${s.sector}: dor no corpo média ${s.means.dor} de 5`,
      evidence: `${s.n} respondentes no período.`,
      action: 'Priorizar ginástica laboral curta, revisão ergonômica do posto e avaliação da Saúde e Segurança do Trabalho.',
      notice: `${s.sector}: vocês relataram dor no corpo. Vamos priorizar ginástica curta e revisar os postos de trabalho.`
    });
    if (s.means.estresse >= 3.3 || s.means.sobrecarga >= 3.5) add({
      sev: 'media', area: 'Saúde mental', scope: s.sector,
      title: `${s.sector}: estresse ${s.means.estresse} e sobrecarga ${s.means.sobrecarga} (de 5)`,
      evidence: `${s.n} respondentes no período.`,
      action: 'Realizar roda de conversa, revisar a carga nos horários de pico e divulgar o canal de apoio psicológico.',
      notice: null
    });
  });
  heatmap.filter(h => !h.hidden && h.means.sono <= 2.8).forEach(h => add({
    sev: h.means.sono <= 2.4 ? 'alta' : 'media', area: 'Saúde física', scope: `${h.sector} / ${h.shiftLabel}`,
    title: `${h.sector} (${h.shiftLabel}): sono médio ${h.means.sono} de 5`,
    evidence: `${h.n} respondentes no período.`,
    action: 'Orientação sobre sono para trabalho em turnos, revisão de escalas com viradas curtas e pausa de descanso.',
    notice: null
  }));
  C.SECTORS.forEach(sector => {
    const g = emps.filter(e => e.sector === sector);
    if (g.length < K) return;
    const hs = new Set(g.map(e => hashId(e.id, db.meta.salt)));
    const resp = new Set(checkins.filter(c => c.sector === sector && c.ts >= last7).map(c => c.h));
    const rate = pct(resp.size, hs.size);
    if (rate < 35) add({
      sev: 'baixa', area: 'Engajamento', scope: sector,
      title: `${sector}: só ${rate}% responderam o check-in esta semana`,
      evidence: `${resp.size} de ${hs.size} colaboradores.`,
      action: 'Disponibilizar o check-in em quiosque na copa e pedir ao gestor para lembrar no início do turno (30 segundos).',
      notice: null
    });
  });
  const offeredRecent = new Set(db.actions.filter(a => a.date >= now - 56 * DAY).map(a => a.type));
  demand.slice(0, 3).forEach(d => {
    if (votes.length >= K && d.pct >= 30 && !offeredRecent.has(d.key)) add({
      sev: 'media', area: 'Engajamento', scope: d.label,
      title: `${d.label} é muito pedida (${d.pct}%) e não foi oferecida nas últimas 8 semanas`,
      evidence: `${d.votos} de ${votes.length} colaboradores votaram.`,
      action: 'Programar uma ação deste tipo no próximo ciclo.',
      notice: `Vocês pediram ${d.label.toLowerCase()}. Ela entra na programação do próximo ciclo.`
    });
  });
  recs.sort((a, b) => sevRank[a.sev] - sevRank[b.sev]);
  recs.forEach((r, i) => { r.id = i + 1; });

  return {
    filters: { store: f.store || '', sector: f.sector || '', shift: f.shift || '', days },
    generatedAt: now,
    kpis, adesaoSemanal, saudeSemanal, overall, heatmap, itensPorSetor, alerts: alerts.slice(0, 8),
    actions, byType, barriers, barrierGroups, demand: demand.slice(0, 8), recommendations: recs,
    league: league(db, f.store, now),
    k: K
  };
}

// ---------------------------------------------------------------------------
// Liga das Secoes (competicao coletiva entre equipes, nunca individual)
// ---------------------------------------------------------------------------
function league(db, store, now) {
  const d = new Date(now);
  const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
  const emps = db.employees.filter(e => !store || e.store === store);
  const attBy = new Set(db.attendances.filter(a => a.ts >= monthStart).map(a => a.eid));
  const chk = new Set(db.checkins.filter(c => c.ts >= monthStart).map(c => c.h));
  // Index daily responses once. Re-scanning every check-in for every employee/week
  // made the first page load stall on larger localStorage demo datasets.
  const daysByPerson = new Map();
  for (const c of db.checkins) {
    let byWeek = daysByPerson.get(c.h);
    if (!byWeek) daysByPerson.set(c.h, byWeek = new Map());
    const week = weekStart(c.ts);
    let days = byWeek.get(week);
    if (!days) byWeek.set(week, days = new Set());
    days.add(new Date(c.ts).toDateString());
  }
  const hashFor = new Map(emps.map(e => [e.id, hashId(e.id, db.meta.salt)]));
  const META = 80;
  const rows = C.SECTORS.map(sector => {
    const g = emps.filter(e => e.sector === sector);
    if (!g.length) return null;
    // Only real employee profiles (which have a selected supermarket job) count
    // toward rewards; seeded demo accounts cannot block the team from earning.
    const rewardGroup = g.filter(e => !!e.job && !e.seeded);
    const part = g.filter(e => attBy.has(e.id)).length;
    const resp = g.filter(e => chk.has(hashFor.get(e.id))).length;
    const week = weekStart(now), weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(week + i * DAY).toDateString();
      if (rewardGroup.length && rewardGroup.every(e => daysByPerson.get(hashFor.get(e.id))?.get(week)?.has(day))) weekDays.push(day);
    }
    let coins = 0;
    for (let w = week - 52 * 7 * DAY; w < week; w += 7 * DAY) {
      const fullyComplete = rewardGroup.length && rewardGroup.every(e => (daysByPerson.get(hashFor.get(e.id))?.get(w)?.size || 0) >= 7);
      if (fullyComplete) coins += 10;
    }
    const partPct = pct(part, g.length), respPct = pct(resp, g.length);
    return {
      sector, colaboradores: g.length, participaram: part, participacao: partPct, checkin: respPct,
      pontos: Math.round(partPct * 0.6 + respPct * 0.4),
      faltam: Math.max(0, Math.ceil(g.length * META / 100) - part), moedas: coins, diasEquipe: weekDays.length
    };
  }).filter(Boolean).sort((a, b) => b.pontos - a.pontos);
  rows.forEach((r, i) => { r.pos = i + 1; });
  return { meta: META, mes: monthStart, rows };
}

module.exports = {
  dashboard, league, hashId, weekStart, targets, matchEmp, groupStats, publicStats, itemScore, statusOf,
  barrierLabel, typeLabel, shiftLabel, DAY
};

};
srcs['seed']=function(module,exports,require){
'use strict';
// Gera uma base FICTICIA e coerente para demonstracao. Nenhum dado real.
// Padroes embutidos (para o painel ter o que mostrar):
//  - Estoque/Logistica no turno da noite: sono ruim e piorando, "horario ruim" como principal barreira
//  - Acougue, Caixa, Reposicao: dor alta e "nao consegui sair do posto"
//  - Caixa a tarde e Atendimento: estresse alto
//  - Adesao e taxa de resposta crescem ao longo de 8 semanas
const fs = require('fs');
const path = require('path');
const C = require('./lib/constants');
const { hashId, DAY } = require('./lib/analytics');

function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PROFILE = {
  'Caixa': { n: 18, shifts: [0.35, 0.45, 0.2] },
  'Reposição': { n: 14, shifts: [0.35, 0.3, 0.35] },
  'Estoque': { n: 12, shifts: [0.25, 0.3, 0.45] },
  'Padaria': { n: 8, shifts: [0.7, 0.3, 0] },
  'Açougue': { n: 8, shifts: [0.55, 0.45, 0] },
  'Atendimento': { n: 6, shifts: [0.45, 0.55, 0] },
  'Limpeza': { n: 8, shifts: [0.4, 0.35, 0.25] },
  'Logística': { n: 8, shifts: [0.3, 0.3, 0.4] },
  'Administrativo': { n: 6, shifts: [0.6, 0.4, 0] }
};
const SHIFT_KEYS = ['manha', 'tarde', 'noite'];
const POSTO_SECTORS = ['Caixa', 'Reposição', 'Açougue'];

function buildSeed(now = Date.now(), seedNum = 2026) {
  const rand = rng(seedNum);
  const gauss = () => Math.sqrt(-2 * Math.log(rand() || 1e-9)) * Math.cos(2 * Math.PI * rand());
  const pick = (weights) => { let r = rand() * weights.reduce((a, b) => a + b, 0); for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r <= 0) return i; } return weights.length - 1; };
  const hex = (n) => Array.from({ length: n }, () => '0123456789abcdef'[Math.floor(rand() * 16)]).join('');
  const salt = hex(16);
  const db = { meta: { createdAt: now, salt, seeded: true }, employees: [], actions: [], rsvps: [], attendances: [], feedbacks: [], checkins: [], barrierAnswers: [], votes: [], announcements: [], contacts: [] };

  // ---- Colaboradores (anonimos: so loja, setor e turno)
  const factor = [1.2, 1, 0.9];
  C.STORES.forEach((store, si) => {
    C.SECTORS.forEach(sector => {
      const p = PROFILE[sector];
      const n = Math.round(p.n * factor[si]);
      for (let i = 0; i < n; i++) {
        db.employees.push({ id: 'e' + hex(11), store, sector, shift: SHIFT_KEYS[pick(p.shifts)], createdAt: now - 60 * DAY, seeded: true });
      }
    });
  });

  const at = (offDays, h, m) => { const d = new Date(now); d.setDate(d.getDate() + offDays); d.setHours(h, m || 0, 0, 0); return d.getTime(); };
  const code = () => Array.from({ length: 6 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(rand() * 31)]).join('');
  let aid = 1;
  const A = (title, type, offDays, h, m, duration, sectors, shifts, location, benefit, description) =>
    ({ id: 'a' + aid++, title, type, date: at(offDays, h, m), duration, sectors, shifts, store: null, location, benefit, description: description || '', code: code() });

  const ALLS = 'all';
  const PHYS = ['Caixa', 'Reposição', 'Estoque', 'Padaria', 'Açougue'];
  const past = [
    A('Ginástica laboral', 'ginastica', -48, 14, 50, 10, PHYS, ['manha', 'tarde'], 'Área do estoque', 'Alivia dor nas costas e pernas.'),
    A('Palestra: sono e saúde', 'palestra', -45, 15, 0, 40, ALLS, ALLS, 'Sala de treinamento', 'Dicas para dormir melhor.'),
    A('Orientação de ergonomia para caixas', 'ergonomia', -41, 10, 0, 20, ['Caixa'], ['manha', 'tarde'], 'Frente de loja', 'Postura certa reduz dor.'),
    A('Exames ocupacionais e preventivos', 'exame', -38, 8, 0, 240, ALLS, ALLS, 'Sala de atendimento', 'Prevenção e acompanhamento da sua saúde.'),
    A('Oficina de alimentação saudável', 'alimentacao', -34, 15, 0, 30, ALLS, ALLS, 'Refeitório', 'Escolhas simples para o dia a dia.'),
    A('Ginástica laboral', 'ginastica', -31, 14, 50, 10, PHYS, ['manha', 'tarde'], 'Área do estoque', 'Alivia dor nas costas e pernas.'),
    A('Caminhada em grupo', 'atividade', -27, 18, 30, 40, ALLS, ['tarde', 'noite'], 'Estacionamento', 'Movimento e convivência com a equipe.'),
    A('Ergonomia no levantamento de carga', 'ergonomia', -24, 22, 0, 15, ['Estoque', 'Logística', 'Reposição'], ['tarde', 'noite'], 'Doca de recebimento', 'Evita lesões ao carregar peso.'),
    A('Palestra: saúde mental no trabalho', 'palestra', -20, 15, 0, 40, ALLS, ALLS, 'Sala de treinamento', 'Reconhecer sinais de estresse.'),
    A('Ginástica na troca de turno', 'ginastica', -17, 22, 0, 10, ALLS, ['tarde', 'noite'], 'Área do estoque', 'Ginástica no horário do turno da noite.'),
    A('Ginástica laboral', 'ginastica', -17, 14, 50, 10, PHYS, ['manha', 'tarde'], 'Área do estoque', 'Alivia dor nas costas e pernas.'),
    A('Roda de conversa: sono e estresse', 'sono_estresse', -12, 14, 30, 30, ALLS, ['manha', 'tarde'], 'Sala de treinamento', 'Troca de experiências e dicas práticas.'),
    A('Ginástica na troca de turno', 'ginastica', -7, 22, 0, 10, ALLS, ['tarde', 'noite'], 'Área do estoque', 'Ginástica no horário do turno da noite.'),
    A('Oficina de alimentação saudável', 'alimentacao', -4, 15, 0, 30, ALLS, ALLS, 'Refeitório', 'Escolhas simples para o dia a dia.')
  ];
  const upcoming = [
    A('Ginástica laboral de 7 minutos', 'ginastica', 0, new Date(now + 2 * 3600e3).getHours(), 0, 7, ALLS, ALLS, 'No seu setor', 'Alivia dor e cansaço sem sair do posto.', 'Sete minutos de alongamento guiado, no próprio setor.'),
    A('Ginástica na troca de turno', 'ginastica', 1, 22, 0, 10, ALLS, ['tarde', 'noite'], 'Área do estoque', 'Ginástica no horário do turno da noite.'),
    A('Orientação de ergonomia: levantamento de carga', 'ergonomia', 2, 14, 50, 15, ['Estoque', 'Reposição', 'Logística', 'Açougue'], ['manha', 'tarde'], 'Doca de recebimento', 'Evita lesões ao carregar peso.'),
    A('Roda de conversa: sono e turno da noite', 'sono_estresse', 4, 6, 0, 30, ALLS, ['noite', 'manha'], 'Sala de treinamento', 'Dicas para dormir bem depois do turno.'),
    A('Caminhada em grupo', 'atividade', 8, 18, 30, 40, ALLS, ['tarde', 'noite'], 'Estacionamento', 'Movimento e convivência com a equipe.')
  ];
  db.actions = [...past, ...upcoming];

  // ---- Check-ins semanais (8 semanas)
  const base = { dor: 1.7, cansaco: 2.1, sono: 3.9, satisfacao: 3.8, humor: 4.1, estresse: 2.1, sobrecarga: 2.1, apoio: 4.1 };
  function delta(sec, shift, item, p) {
    let d = 0;
    if (sec === 'Estoque') {
      if (item === 'dor') d += 1.2 + 0.05 * p;
      if (item === 'cansaco') d += 0.5;
      if (item === 'sobrecarga') d += 0.4;
      if (shift === 'noite') { if (item === 'sono') d -= 1.3 + 0.08 * p; if (item === 'cansaco') d += 0.7; if (item === 'humor') d -= 0.7; if (item === 'estresse') d += 0.6; if (item === 'sobrecarga') d += 0.3; }
    }
    if (sec === 'Logística' && shift === 'noite') { if (item === 'sono') d -= 0.9 + 0.05 * p; if (item === 'cansaco') d += 0.6; }
    if (sec === 'Açougue') { if (item === 'dor') d += 1.1; if (item === 'estresse') d += 0.6; if (item === 'cansaco') d += 0.4; }
    if (sec === 'Caixa') { if (item === 'dor') d += 0.7; if (item === 'estresse') d += 0.5 + (shift === 'tarde' ? 0.7 : 0); if (item === 'cansaco') d += 0.3; }
    if (sec === 'Reposição') { if (item === 'dor') d += 0.9; if (item === 'cansaco') d += 0.4; if (item === 'sono' && shift === 'noite') d -= 0.6; }
    if (sec === 'Atendimento') { if (item === 'estresse') d += 1.0; if (item === 'humor') d -= 0.3; if (item === 'sobrecarga') d += 0.7; }
    if (sec === 'Limpeza') { if (item === 'dor') d += 0.7; if (item === 'apoio') d -= 0.3; }
    if (sec === 'Padaria' && shift === 'manha') { if (item === 'sono') d -= 0.7; }
    if (sec === 'Administrativo') { if (item === 'estresse') d += 0.3; if (item === 'dor') d += 0.2; }
    return d;
  }
  const thisWeekStart = (() => { const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); })();
  for (let wAgo = 7; wAgo >= 0; wAgo--) {
    const p = 7 - wAgo;
    const ws = thisWeekStart - wAgo * 7 * DAY;
    db.employees.forEach(e => {
      let pr = 0.38 + 0.045 * p;
      if (e.shift === 'noite') pr -= 0.12;
      if (e.sector === 'Açougue') pr -= 0.08;
      if (e.sector === 'Administrativo') pr += 0.12;
      pr = Math.max(0.12, Math.min(0.9, pr));
      if (rand() > pr) return;
      const ts = ws + Math.floor(rand() * 5.5 * DAY);
      if (ts > now) return;
      const answers = {};
      C.ITEMS.forEach(it => { answers[it.key] = Math.max(1, Math.min(5, Math.round(base[it.key] + delta(e.sector, e.shift, it.key, p) + gauss() * 0.85))); });
      db.checkins.push({ id: 'c' + hex(8), h: hashId(e.id, salt), store: e.store, sector: e.sector, shift: e.shift, answers, ts });
    });
  }

  // ---- Participacao nas acoes
  const baseP = { exame: 0.55, ginastica: 0.45, ergonomia: 0.36, alimentacao: 0.3, sono_estresse: 0.28, palestra: 0.22, atividade: 0.2 };
  const rate = { exame: 4.2, ginastica: 4.4, ergonomia: 4.0, alimentacao: 3.8, sono_estresse: 4.1, palestra: 3.2, atividade: 3.4 };
  const inWindow = (shift, h) => (shift === 'manha' ? h >= 5 && h < 15 : shift === 'tarde' ? h >= 13 && h < 23 : h >= 21 || h < 7);
  const barrierBase = { nao_soube: 0.2, horario: 0.08, beneficio: 0.1, esqueci: 0.15, posto: 0.08, interesse: 0.12, prefere_outra: 0.1, inscricao: 0.07 };

  past.forEach((a, idx) => {
    const p = idx / (past.length - 1); // 0..1 evolucao
    const h = new Date(a.date).getHours() + new Date(a.date).getMinutes() / 60;
    db.employees.filter(e => (a.sectors === 'all' || a.sectors.includes(e.sector)) && (a.shifts === 'all' || a.shifts.includes(e.shift))).forEach(e => {
      let pr = baseP[a.type] * (0.78 + 0.35 * p);
      const fits = inWindow(e.shift, h);
      if (!fits) pr *= a.shifts !== 'all' && a.shifts.includes(e.shift) ? 0.9 : 0.35;
      if (POSTO_SECTORS.includes(e.sector)) pr *= e.sector === 'Açougue' ? 0.6 : 0.75;
      if (e.sector === 'Administrativo') pr *= 1.15;
      pr = Math.min(0.92, pr);
      const went = rand() < pr;
      const ts = a.date + Math.floor(rand() * a.duration * 60e3);
      if (went) {
        db.attendances.push({ eid: e.id, actionId: a.id, ts });
        if (rand() < 0.65) db.rsvps.push({ eid: e.id, actionId: a.id, status: 'vou', ts: a.date - DAY });
        if (rand() < 0.85) {
          const rt = Math.max(1, Math.min(5, Math.round(rate[a.type] + gauss() * 0.7)));
          db.feedbacks.push({ eid: e.id, actionId: a.id, rating: rt, again: rand() < (rt >= 4 ? 0.9 : 0.4), ts: ts + 3600e3 });
        }
      } else {
        const r = rand();
        if (r < 0.08) db.rsvps.push({ eid: e.id, actionId: a.id, status: 'vou', ts: a.date - DAY });
        else if (r < 0.12) db.rsvps.push({ eid: e.id, actionId: a.id, status: 'nao_consigo', ts: a.date - DAY });
        if (rand() < 0.1 + 0.4 * p) { // taxa de resposta ao "por que nao fui" cresce
          const w = C.BARRIERS.map(b => barrierBase[b.key]);
          const ix = k => C.BARRIERS.findIndex(b => b.key === k);
          if (!fits) w[ix('horario')] += 1.3;
          if (POSTO_SECTORS.includes(e.sector)) w[ix('posto')] += e.sector === 'Açougue' ? 0.95 : 0.6;
          w[ix('nao_soube')] += 0.2 * (1 - p);
          if (a.type === 'palestra') w[ix('interesse')] += 0.15;
          if (a.type === 'atividade') w[ix('prefere_outra')] += 0.15;
          db.barrierAnswers.push({ eid: e.id, actionId: a.id, barrier: C.BARRIERS[pick(w)].key, store: e.store, sector: e.sector, shift: e.shift, ts: a.date + 6 * 3600e3 });
        }
      }
    });
  });
  // Inscritos nas proximas acoes
  upcoming.forEach(a => {
    db.employees.filter(e => (a.sectors === 'all' || a.sectors.includes(e.sector)) && (a.shifts === 'all' || a.shifts.includes(e.shift))).forEach(e => {
      if (rand() < 0.22) db.rsvps.push({ eid: e.id, actionId: a.id, status: 'vou', ts: now - Math.floor(rand() * DAY) });
    });
  });

  // ---- O que os colaboradores gostariam de ter (votos)
  db.employees.forEach(e => {
    if (rand() > 0.62) return;
    const w = [0.9, 0.5, 0.3, 0.35, 0.3, 0.5, 0.15];
    if (e.shift === 'noite') w[5] += 0.5;
    if (['Estoque', 'Açougue', 'Caixa', 'Reposição'].includes(e.sector)) w[0] += 0.4;
    if (e.sector === 'Atendimento') w[6] += 0.5;
    const types = new Set();
    const n = 1 + Math.floor(rand() * 3);
    for (let i = 0; i < n; i++) types.add(C.TYPES[pick(w)].key);
    db.votes.push({ eid: e.id, store: e.store, sector: e.sector, shift: e.shift, types: [...types], ts: now - Math.floor(rand() * 20 * DAY) });
  });

  // ---- Pedidos de contato (unico dado individual, e so com consentimento)
  const cstat = ['novo', 'em_contato', 'resolvido'];
  for (let i = 0; i < 9; i++) {
    const e = db.employees[Math.floor(rand() * db.employees.length)];
    db.contacts.push({ id: 'p' + hex(6), kind: rand() < 0.55 ? 'saude' : 'psicologia', store: e.store, sector: e.sector, shift: e.shift, contact: 'WhatsApp (00) 00000-0000', status: cstat[pick([0.4, 0.3, 0.3])], ts: now - Math.floor(rand() * 25 * DAY) });
  }

  // ---- "Voce disse, nos fizemos"
  db.announcements = [
    { id: 'n1', text: 'Vocês pediram ginástica em horário que caiba no turno da noite. A partir de agora ela acontece às 22h, na troca de turno.', ts: now - 30 * DAY },
    { id: 'n2', text: 'Vocês pediram mais informações sobre o benefício de cada ação. Agora todo convite mostra o motivo e a duração.', ts: now - 14 * DAY },
    { id: 'n3', text: 'O check-in de saúde agora leva 30 segundos e continua anônimo. Ninguém da loja vê resposta individual.', ts: now - 5 * DAY }
  ];
  return db;
}

module.exports = { buildSeed };


};
const C=req('./lib/constants'),A=req('./lib/analytics'),{buildSeed}=req('./seed');
const PIN='9781',STRICT_CHECKIN=false;
const KEY='pausa_demo_db_v1';
const SHOP_ITEMS = [
  { id: 'cafe', icon: '☕', name: 'Vale café', description: 'Um café ou bebida quente no intervalo.', cost: 10 },
  { id: 'lanche', icon: '🥪', name: 'Vale lanche', description: 'Um lanche para aproveitar na pausa.', cost: 25 },
  { id: 'garrafa', icon: '🥤', name: 'Garrafa reutilizável', description: 'Uma garrafa para acompanhar seu turno.', cost: 50 },
  { id: 'kit', icon: '🎁', name: 'Kit de reconhecimento', description: 'Um pequeno presente da equipe.', cost: 80 }
];
const ROLES = ['Vendedor', 'Caixa', 'RH', 'Segurança', 'Gerente', 'Estoque'];
function roleOfJob(job) {
  const j = String(job || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (ROLES.some(r => r.toLowerCase() === j)) return ROLES.find(r => r.toLowerCase() === j);
  if (/caixa|empacotador/.test(j)) return 'Caixa';
  if (/rh|recursos humanos/.test(j)) return 'RH';
  if (/seguranca|prevencao/.test(j)) return 'Segurança';
  if (/gerente|subgerente|encarregado|lider/.test(j)) return 'Gerente';
  if (/estoque|deposito|conferente|separador|empilhadeira/.test(j)) return 'Estoque';
  return 'Vendedor';
}
let db;
try{const raw=localStorage.getItem(KEY);db=raw?JSON.parse(raw):null;}catch(e){db=null;}
if(!db){db=buildSeed();try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){}}
db.shopPurchases ||= [];
db.rhActivities ||= [];
for (const emp of db.employees || []) {
  if (db.meta?.seeded && String(emp.id).length === 12) emp.seeded = true;
  else if (!emp.job) emp.job = 'Outro cargo';
}
// Remove vaccine and flu campaign entries from existing local demo data too.
db.actions = (db.actions || []).filter(a => a.type !== 'vacinacao' && !/(?:campanha.{0,60}(?:sa[uú]de|gripe|vacina)|gripe|vacina)/i.test(a.title || ''));
function save(){try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){}}
const uid=(p)=>p+crypto.randomBytes(6).toString();
const now=()=>Date.now();
const HASH=(id)=>A.hashId(id,db.meta.salt);
const typeLabel=A.typeLabel;
if (!db.employees.some(e => e.isSystemRH)) {
  db.employees.push({ id: 'e-rh-system', name: 'Recursos Humanos', job: 'RH', store: C.STORES[0], sector: 'Administrativo', shift: 'manha', passwordHash: A.hashId('9871', 'maslow-account-v1'), seeded: true, isSystemRH: true, createdAt: Date.now() });
  save();
}
class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }
const bad = (msg) => new HttpError(400, msg);


function send(){}
function getEmp(eid) {
  const e = db.employees.find(x => x.id === eid);
  if (!e) throw new HttpError(401, 'Colaborador nao encontrado. Refaça o acesso.');
  return e;
}
const upsert = (arr, pred, make) => { const i = arr.findIndex(pred); const v = make(i >= 0 ? arr[i] : null); if (i >= 0) arr[i] = v; else arr.push(v); return v; };
const requireAdmin = (req) => { if (req.headers['x-pin'] !== PIN) throw new HttpError(401, 'PIN invalido'); };

const requireDashboardAccess = (req) => {
  if (req.headers['x-pin'] === PIN) return null;
  const eid = req.headers['x-eid'];
  if (!eid) throw new HttpError(401, 'Faça login para abrir o painel.');
  return getEmp(eid);
};

function actionView(a, emp) {
  const going = db.rsvps.filter(r => r.actionId === a.id && r.status === 'vou').length;
  const mine = db.rsvps.find(r => r.actionId === a.id && r.eid === emp.id);
  return {
    id: a.id, title: a.title, type: a.type, typeLabel: typeLabel[a.type], date: a.date, duration: a.duration,
    location: a.location, benefit: a.benefit, description: a.description, going,
    myStatus: mine ? mine.status : null,
    attended: db.attendances.some(x => x.actionId === a.id && x.eid === emp.id),
    forMe: A.targets(a, emp)
  };
}

// ---------------------------------------------------------------- rotas
const routes = [];
const route = (method, p, fn) => routes.push({ method, p, fn });

route('GET', '/api/meta', () => ({
  stores: C.STORES, sectors: C.SECTORS, jobs: C.JOBS, roles: ROLES, loginRoles: [...ROLES, 'Administrador'], shifts: C.SHIFTS, barriers: C.BARRIERS, types: C.TYPES, items: C.ITEMS, shopItems: SHOP_ITEMS, kMin: C.K_MIN
}));

route('POST', '/api/employee/login', (req, res, q, body) => {
  const store = String(body.store || '');
  const role = String(body.role || '');
  const password = String(body.password || '');
  if (!C.STORES.includes(store) || !ROLES.includes(role) || !password) throw new HttpError(401, 'Informe loja, função e senha.');
  let matches = db.employees.filter(x => !x.isSystemRH && x.store === store && roleOfJob(x.job) === role && x.passwordHash === A.hashId(password, 'maslow-account-v1'));
  if (!matches.length && role === 'RH') {
    const systemRH = db.employees.find(x => x.isSystemRH && x.passwordHash === A.hashId(password, 'maslow-account-v1'));
    if (systemRH) matches = [systemRH];
  }
  if (!matches.length) throw new HttpError(401, 'Função ou senha incorretas.');
  if (matches.length > 1) throw new HttpError(409, 'Há mais de um acesso com essa função e senha. Cada colaborador deve usar uma senha pessoal exclusiva.');
  const e = matches[0];
  return { eid: e.id, employee: { name: e.name, job: e.job, store: e.store, sector: e.sector, shift: e.shift } };
});

route('POST', '/api/register', (req, res, q, body) => {
  const { store, sector, shift, consent } = body;
  if (!C.STORES.includes(store) || !C.SECTORS.includes(sector) || !C.SHIFTS.some(s => s.key === shift)) throw bad('Informe loja, setor e turno.');
  const name = String(body.name || '').trim().slice(0, 80);
  if (name.length < 2 || !ROLES.includes(body.job)) throw bad('Informe seu nome e selecione sua função.');
  const password = String(body.password || '');
  if (password.length < 6) throw bad('A senha precisa ter pelo menos 6 caracteres.');
  const passwordHash = A.hashId(password, 'maslow-account-v1');
  const existing = db.employees.find(e => !e.seeded && !e.passwordHash && e.name && e.name.trim().toLowerCase() === name.toLowerCase() && e.store === store && e.sector === sector && e.shift === shift && roleOfJob(e.job) === body.job);
  if (!consent) throw bad('E necessario aceitar o termo para continuar.');
  if (db.employees.some(e => e !== existing && e.store === store && roleOfJob(e.job) === body.job && e.passwordHash === passwordHash)) throw new HttpError(409, 'Escolha uma senha pessoal diferente das demais pessoas com esta função.');
  if (existing) {
    existing.passwordHash = passwordHash; save();
    return { eid: existing.id, employee: { name: existing.name, job: existing.job, store, sector, shift } };
  }
  const emp = { id: uid('e'), name, passwordHash, job: body.job, store, sector, shift, createdAt: now() };
  db.employees.push(emp); save();
  return { eid: emp.id, employee: { name, job: emp.job, store, sector, shift } };
});

route('POST', '/api/admin/login', (req, res, q, body) => {
  if (String(body.pin || '') !== PIN) throw new HttpError(401, 'Senha de administrador incorreta.');
  return { ok: true };
});

route('POST', '/api/update-profile', (req, res, q, body) => {
  const e = getEmp(body.eid);
  const name = String(body.name || '').trim().slice(0, 80);
  if (name.length >= 2) e.name = name;
  if (C.SECTORS.includes(body.sector)) e.sector = body.sector;
  if (C.SHIFTS.some(s => s.key === body.shift)) e.shift = body.shift;
  if (C.JOBS.includes(body.job) || ROLES.includes(body.job)) e.job = body.job;
  if (C.STORES.includes(body.store)) e.store = body.store;
  save();
  return { employee: { store: e.store, sector: e.sector, shift: e.shift } };
});

route('GET', '/api/me', (req, res, q) => {
  const e = getEmp(q.eid);
  const t = now();
  const ws = A.weekStart(t);
  const h = HASH(e.id);
  const dayStart = new Date(t); dayStart.setHours(0,0,0,0);
  const checkinDone = db.checkins.some(c => c.h === h && c.ts >= dayStart.getTime());
  const weekDays = new Set(db.checkins.filter(c => c.h === h && c.ts >= ws).map(c => new Date(c.ts).toDateString())).size;
  const teamCoins = A.league(db, e.store, t).rows.find(x => x.sector === e.sector)?.moedas || 0;
  const spentCoins = (db.shopPurchases || []).filter(p => p.eid === e.id).reduce((sum, p) => sum + p.cost, 0);
  const coins = Math.max(0, teamCoins - spentCoins);
  const firstCheckin = db.checkins.filter(c => c.h === h).sort((a,b)=>a.ts-b.ts)[0];
  const lastReport = Number(localStorage.getItem('maslow_last_health_report_' + e.id) || 0);
  const canReport = !!firstCheckin && t - firstCheckin.ts >= 7 * 86400000 && t - lastReport >= 7 * 86400000;
  const myAtt = new Set(db.attendances.filter(a => a.eid === e.id).map(a => a.actionId));
  const fbDone = new Set(db.feedbacks.filter(f => f.eid === e.id).map(f => f.actionId));
  const barDone = new Set(db.barrierAnswers.filter(b => b.eid === e.id).map(b => b.actionId));
  const pendingFeedback = db.actions.filter(a => myAtt.has(a.id) && !fbDone.has(a.id)).slice(-2).map(a => ({ id: a.id, title: a.title, date: a.date }));
  const pendingBarrier = db.actions
    .filter(a => a.date < t && a.date > t - 14 * A.DAY && A.targets(a, e) && !myAtt.has(a.id) && !barDone.has(a.id))
    .sort((a, b) => b.date - a.date).slice(0, 2).map(a => ({ id: a.id, title: a.title, date: a.date }));
  const monthStart = new Date(new Date(t).getFullYear(), new Date(t).getMonth(), 1).getTime();
  return {
    employee: { name: e.name || '', job: e.job || '', store: e.store, sector: e.sector, shift: e.shift },
    checkinDone, pendingFeedback, pendingBarrier, weekDays, teamCoins, coins, canReport,
    participacoesMes: db.attendances.filter(a => a.eid === e.id && a.ts >= monthStart).length
  };
});

route('GET', '/api/rh/activities', (req, res, q) => {
  const isAdmin = req.headers['x-pin'] === PIN;
  const e = isAdmin ? null : getEmp(q.eid);
  return { activities: [...(db.rhActivities || [])].sort((a, b) => a.date - b.date).map(a => ({
    id: a.id, title: a.title, date: a.date, location: a.location, description: a.description,
    confirmed: !!e && (a.attendees || []).includes(e.id), attendeeCount: (a.attendees || []).length
  })) };
});

route('POST', '/api/rh/activities', (req, res, q, body) => {
  const e = getEmp(body.eid);
  if (roleOfJob(e.job) !== 'RH') throw new HttpError(403, 'Somente o RH pode publicar atividades na agenda.');
  const title = String(body.title || '').trim().slice(0, 100);
  const date = new Date(body.date).getTime();
  if (title.length < 3 || !Number.isFinite(date) || date <= now()) throw bad('Informe o nome e uma data futura para a atividade.');
  const activity = {
    id: uid('rh'), title, date,
    location: String(body.location || '').trim().slice(0, 120),
    description: String(body.description || '').trim().slice(0, 600),
    createdBy: e.id, createdAt: now()
  };
  db.rhActivities.push(activity); save();
  return { activity };
});

route('POST', '/api/rh/activities/attendance', (req, res, q, body) => {
  const e = getEmp(body.eid);
  const activity = (db.rhActivities || []).find(a => a.id === body.activityId);
  if (!activity) throw new HttpError(404, 'Atividade não encontrada.');
  if (activity.date < now()) throw bad('A confirmação está fechada porque a atividade já começou.');
  activity.attendees ||= [];
  const index = activity.attendees.indexOf(e.id);
  if (body.attending === true && index < 0) activity.attendees.push(e.id);
  if (body.attending !== true && index >= 0) activity.attendees.splice(index, 1);
  save();
  return { confirmed: activity.attendees.includes(e.id), attendeeCount: activity.attendees.length };
});

route('POST', '/api/shop/buy', (req, res, q, body) => {
  const e = getEmp(body.eid);
  const product = SHOP_ITEMS.find(x => x.id === body.productId);
  if (!product) throw bad('Item não encontrado.');
  const t = now();
  const teamCoins = A.league(db, e.store, t).rows.find(x => x.sector === e.sector)?.moedas || 0;
  const spent = (db.shopPurchases || []).filter(p => p.eid === e.id).reduce((sum, p) => sum + p.cost, 0);
  const balance = Math.max(0, teamCoins - spent);
  if (balance < product.cost) throw new HttpError(400, 'Você ainda não tem moedas suficientes para este resgate.');
  db.shopPurchases.push({ id: uid('p'), eid: e.id, productId: product.id, cost: product.cost, ts: t });
  save();
  return { ok: true, product: product.name, coins: balance - product.cost };
});

route('GET', '/api/actions', (req, res, q) => {
  const e = getEmp(q.eid);
  const t = now();
  const list = db.actions.filter(a => a.date + a.duration * 60000 >= t - 2 * 3600e3 && a.date >= t - 3 * 3600e3)
    .map(a => actionView(a, e))
    .filter(a => q.all === '1' || a.forMe)
    .sort((a, b) => a.date - b.date);
  return { actions: list };
});

route('POST', '/api/rsvp', (req, res, q, body) => {
  const e = getEmp(body.eid);
  const a = db.actions.find(x => x.id === body.actionId);
  if (!a) throw bad('Acao nao encontrada.');
  if (!['vou', 'nao_consigo'].includes(body.status)) throw bad('Status invalido.');
  upsert(db.rsvps, r => r.eid === e.id && r.actionId === a.id, () => ({ eid: e.id, actionId: a.id, status: body.status, ts: now() }));
  if (body.status === 'nao_consigo' && body.barrier) saveBarrier(e, a, body.barrier);
  save();
  return { ok: true };
});

function saveBarrier(e, a, barrier) {
  if (!C.BARRIERS.some(b => b.key === barrier)) throw bad('Motivo invalido.');
  upsert(db.barrierAnswers, b => b.eid === e.id && b.actionId === a.id,
    () => ({ eid: e.id, actionId: a.id, barrier, store: e.store, sector: e.sector, shift: e.shift, ts: now() }));
}

route('POST', '/api/barrier', (req, res, q, body) => {
  const e = getEmp(body.eid);
  const a = db.actions.find(x => x.id === body.actionId);
  if (!a) throw bad('Acao nao encontrada.');
  saveBarrier(e, a, body.barrier); save();
  return { ok: true };
});

route('POST', '/api/attend', (req, res, q, body) => {
  const e = getEmp(body.eid);
  const codeIn = String(body.code || '').trim().toUpperCase();
  const a = db.actions.find(x => x.code === codeIn);
  if (!a) throw new HttpError(404, 'Codigo nao encontrado. Confira o QR code ou o codigo no local.');
  if (STRICT_CHECKIN) {
    const t = now();
    if (t < a.date - 30 * 60000 || t > a.date + a.duration * 60000 + 2 * 3600e3) throw bad('Esta acao nao esta aberta para registro agora.');
  }
  upsert(db.attendances, x => x.eid === e.id && x.actionId === a.id, () => ({ eid: e.id, actionId: a.id, ts: now() }));
  upsert(db.rsvps, r => r.eid === e.id && r.actionId === a.id, (old) => old || { eid: e.id, actionId: a.id, status: 'vou', ts: now() });
  save();
  return { ok: true, action: { id: a.id, title: a.title } };
});

route('POST', '/api/feedback', (req, res, q, body) => {
  const e = getEmp(body.eid);
  const a = db.actions.find(x => x.id === body.actionId);
  if (!a) throw bad('Acao nao encontrada.');
  const rating = Number(body.rating);
  if (!(rating >= 1 && rating <= 5)) throw bad('Nota invalida.');
  upsert(db.feedbacks, f => f.eid === e.id && f.actionId === a.id, () => ({ eid: e.id, actionId: a.id, rating, again: !!body.again, ts: now() }));
  save();
  return { ok: true };
});

route('POST', '/api/checkin', (req, res, q, body) => {
  const e = getEmp(body.eid);
  const answers = {};
  for (const it of C.ITEMS) {
    const v = Number(body.answers && body.answers[it.key]);
    if (!(v >= 1 && v <= 5)) throw bad('Responda todas as perguntas.');
    answers[it.key] = v;
  }
  const sleepHours = Number(body.sleepHours);
  if (!Number.isFinite(sleepHours) || sleepHours < 0 || sleepHours > 24) throw bad('Informe as horas dormidas entre 0 e 24.');
  const h = HASH(e.id), t = now(), today = new Date(t); today.setHours(0,0,0,0);
  if (db.checkins.some(c => c.h === h && c.ts >= today.getTime())) throw new HttpError(409, 'Voce ja respondeu o check-in de hoje.');
  // Respostas de saúde mantêm o identificador irreversível usado para agregação anônima.
  db.checkins.push({ id: uid('c'), h, store: e.store, sector: e.sector, shift: e.shift, answers, sleepHours, feedbackText: String(body.feedbackText || '').slice(0, 500), ts: t });
  // Pedido de contato: opcional, com consentimento, sem ligacao com o check-in.
  const cr = body.contactRequest;
  if (cr && cr.consent && ['saude', 'psicologia'].includes(cr.kind)) {
    db.contacts.push({ id: uid('p'), kind: cr.kind, store: e.store, sector: e.sector, shift: e.shift, contact: String(cr.contact || '').slice(0, 120), status: 'novo', ts: t });
  }
  save();
  return { ok: true };
});

route('GET', '/api/health-report', (req, res, q) => {
  const e = getEmp(q.eid), h = HASH(e.id), since = now() - 7 * 86400000;
  const rows = db.checkins.filter(c => c.h === h && c.ts >= since).sort((a,b)=>a.ts-b.ts).map(c => ({ts:c.ts, sleepHours:c.sleepHours ?? '—', answers:c.answers, feedbackText:c.feedbackText || ''}));
  return { employee: { name: e.name || 'Colaborador', job: e.job || '', sector: e.sector, store: e.store }, rows };
});

route('POST', '/api/contact', (req, res, q, body) => {
  const e = getEmp(body.eid);
  if (!body.consent || !['saude', 'psicologia'].includes(body.kind)) throw bad('Informe o tipo de apoio e aceite o contato.');
  db.contacts.push({ id: uid('p'), kind: body.kind, store: e.store, sector: e.sector, shift: e.shift, contact: String(body.contact || '').slice(0, 120), status: 'novo', ts: now() });
  save();
  return { ok: true };
});

route('GET', '/api/league', (req, res, q) => {
  const e = getEmp(q.eid);
  return { store: e.store, mySector: e.sector, ...A.league(db, e.store, now()) };
});

route('GET', '/api/announcements', () => ({ items: [...db.announcements].sort((a, b) => b.ts - a.ts).slice(0, 10) }));

route('GET', '/api/votes', (req, res, q) => {
  const e = getEmp(q.eid);
  const v = db.votes.find(x => x.eid === e.id);
  return { types: v ? v.types : [] };
});
route('POST', '/api/votes', (req, res, q, body) => {
  const e = getEmp(body.eid);
  const types = (Array.isArray(body.types) ? body.types : []).filter(t => C.TYPES.some(x => x.key === t)).slice(0, 3);
  upsert(db.votes, x => x.eid === e.id, () => ({ eid: e.id, store: e.store, sector: e.sector, shift: e.shift, types, ts: now() }));
  save();
  return { ok: true, types };
});

// ---- Painel (RH / SST / gestores)
route('GET', '/api/admin/ping', (req) => { requireAdmin(req); return { ok: true }; });

route('GET', '/api/admin/dashboard', (req, res, q) => {
  requireDashboardAccess(req);
  return A.dashboard(db, { store: q.store, sector: q.sector, shift: q.shift, days: q.days }, now());
});

route('GET', '/api/admin/contacts', (req) => {
  requireAdmin(req);
  return { items: [...db.contacts].sort((a, b) => b.ts - a.ts) };
});
route('POST', '/api/admin/contacts/status', (req, res, q, body) => {
  requireAdmin(req);
  const c = db.contacts.find(x => x.id === body.id);
  if (!c || !['novo', 'em_contato', 'resolvido'].includes(body.status)) throw bad('Dados invalidos.');
  c.status = body.status; save();
  return { ok: true };
});

route('POST', '/api/admin/actions', (req, res, q, body) => {
  requireAdmin(req);
  const title = String(body.title || '').trim();
  const date = Number(body.date);
  if (/(?:campanha.{0,60}(?:sa[uú]de|gripe|vacina)|gripe|vacina)/i.test(title)) throw bad('Campanhas de saúde e gripe foram removidas desta aplicação.');
  if (!title || !date || !C.TYPES.some(t => t.key === body.type)) throw bad('Preencha nome, tipo e data/hora.');
  const sectors = body.sectors === 'all' || !Array.isArray(body.sectors) || !body.sectors.length ? 'all' : body.sectors.filter(s => C.SECTORS.includes(s));
  const shifts = body.shifts === 'all' || !Array.isArray(body.shifts) || !body.shifts.length ? 'all' : body.shifts.filter(s => C.SHIFTS.some(x => x.key === s));
  let code;
  do { code = Array.from({ length: 6 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[crypto.randomInt(31)]).join(''); } while (db.actions.some(a => a.code === code));
  const a = {
    id: uid('a'), title: title.slice(0, 100), type: body.type, date, duration: Math.max(1, Math.min(480, Number(body.duration) || 15)),
    sectors, shifts, store: C.STORES.includes(body.store) ? body.store : null,
    location: String(body.location || '').slice(0, 80), benefit: String(body.benefit || '').slice(0, 160), description: String(body.description || '').slice(0, 300), code
  };
  db.actions.push(a); save();
  return { ok: true, action: a };
});

route('POST', '/api/admin/announcements', (req, res, q, body) => {
  requireAdmin(req);
  const text = String(body.text || '').trim().slice(0, 280);
  if (!text) throw bad('Escreva o aviso.');
  db.announcements.push({ id: uid('n'), text, ts: now() }); save();
  return { ok: true };
});

route('POST', '/api/admin/reset', (req) => {
  requireAdmin(req);
  db = buildSeed(); save();
  return { ok: true };
});


const realFetch=typeof window.fetch==='function'?window.fetch.bind(window):null;
window.pausaDemoRequest=async function(path,body){
 const u=new URL(path,location.href),m=u.pathname.indexOf('/api/');
 if(m<0)throw new Error('Rota local inválida');
 const pathname=u.pathname.slice(m),method=body?'POST':'GET';
 const r=routes.find(x=>x.method===method&&x.p===pathname);
 if(!r)throw new Error('Rota não encontrada: '+pathname);
 const q=Object.fromEntries(u.searchParams);
 try{return JSON.parse(JSON.stringify(r.fn({headers:{}},null,q,body||{})));}
 catch(err){const e=new Error(err.status?err.message:(err.message||'Erro interno ao carregar os dados.'));e.status=err.status||500;throw e;}
};
window.fetch=async function(input,init){
 const u=new URL(typeof input==='string'?input:input.url,location.href);
 const m=u.pathname.indexOf('/api/');
 if(m<0){if(realFetch)return realFetch(input,init);throw new Error('Fetch não está disponível neste navegador.');}
 const pathname=u.pathname.slice(m);
 const method=((init&&init.method)||'GET').toUpperCase();
 const r=routes.find(x=>x.method===method&&x.p===pathname);
 const reply=(s,b)=>new Response(JSON.stringify(b),{status:s,headers:{'Content-Type':'application/json'}});
 if(!r)return reply(404,{error:'Rota nao encontrada'});
 try{
  const headers={};const h=(init&&init.headers)||{};for(const k in h)headers[k.toLowerCase()]=h[k];
  const body=method==='POST'&&init&&init.body?JSON.parse(init.body):{};
  const q=Object.fromEntries(u.searchParams);
  return reply(200,JSON.parse(JSON.stringify(r.fn({headers},null,q,body))));
 }catch(err){return reply(err.status||500,{error:err.status?err.message:'Erro interno'});}
};
window.DEMO_BASE=location.href.replace(/[#?].*$/,'').replace(/[^/]*$/,'');
window.pausaDemoReset=function(){try{localStorage.removeItem(KEY);}catch(e){}location.reload();};
})();
