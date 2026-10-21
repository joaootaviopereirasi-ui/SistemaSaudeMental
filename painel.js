(() => {
'use strict';
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ss = {
  get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } },
  del(k) { try { sessionStorage.removeItem(k); } catch { /* ignore */ } }
};
const S = { pin: ss.get('pausa_pin') || '', eid: ss.get('pausa_panel_eid') || '', role: ss.get('pausa_panel_role') || '', employee: null, isAdmin: false, meta: null, data: null, contacts: null, activities: [], agendaMonth: '', tab: 'geral', noticeDraft: '' };
const TABS = [['geral', 'Visão geral'], ['saude', 'Saúde'], ['acoes', 'Ações e participação'], ['barreiras', 'Barreiras'], ['recs', 'Recomendações'], ['liga', 'Liga das seções'], ['sst', 'Contatos SST'], ['agenda', 'Agenda']];

async function api(path, body) {
  const opt = { headers: { 'x-pin': S.pin, 'x-eid': S.eid } };
  if (body) { opt.method = 'POST'; opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
  const r = await fetch(path, opt);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(j.error || 'Erro'); e.status = r.status; throw e; }
  return j;
}

// ---------------------------------------------------------------- helpers
const fmtDT = (ts) => new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const fmtD = (ts) => new Date(ts).toLocaleDateString('pt-BR');
const stLabel = { verde: 'Verde', amarelo: 'Amarelo', vermelho: 'Vermelho' };
const stp = (s) => (s ? `<span class="st ${s}">${stLabel[s]}</span>` : '');
const sevLabel = { alta: 'Prioridade alta', media: 'Prioridade média', baixa: 'Prioridade baixa' };
const monthKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const monthTitle = (key) => new Date(`${key}-01T12:00:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
const isRH = () => /\bRH\b|recursos humanos/i.test(S.employee?.job || S.role);
function moveMonth(delta) { const d = new Date(`${(S.agendaMonth || monthKey())}-01T12:00:00`); d.setMonth(d.getMonth() + delta); S.agendaMonth = monthKey(d); }

function lineChart(labels, series, { min = 0, max = 100, suffix = '' } = {}) {
  const W = 640, H = 230, pl = 36, pr = 12, pt = 12, pb = 28;
  const x = (i) => pl + (i * (W - pl - pr)) / Math.max(1, labels.length - 1);
  const y = (v) => pt + (1 - (v - min) / (max - min)) * (H - pt - pb);
  let g = '';
  for (let i = 0; i <= 4; i++) {
    const v = min + ((max - min) * i) / 4;
    g += `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/><text x="${pl - 6}" y="${y(v) + 4}" text-anchor="end">${Math.round(v)}${suffix}</text>`;
  }
  g += labels.map((l, i) => `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${esc(l)}</text>`).join('');
  const lines = series.map(s => {
    let d = '', pen = false, dots = '';
    s.values.forEach((v, i) => {
      if (v == null) { pen = false; return; }
      d += `${pen ? 'L' : 'M'}${x(i)},${y(v)} `; pen = true;
      dots += `<circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="${s.color}"><title>${esc(s.name)} ${esc(labels[i])}: ${v}${suffix}</title></circle>`;
    });
    return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linejoin="round"/>${dots}`;
  }).join('');
  const legend = series.length > 1 ? `<div class="legend">${series.map(s => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>` : '';
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(series.map(s => s.name).join(', '))} por semana">${g}${lines}</svg>${legend}`;
}

function hbars(items, { warn = false } = {}) {
  if (!items.length) return '<p class="empty">Sem dados no período.</p>';
  return items.map(i => `<div class="hb ${warn ? 'warn' : ''}"><span>${esc(i.label)}</span><div class="track"><i style="width:${Math.min(100, i.pct)}%"></i></div><b>${i.pct}%</b></div>`).join('');
}

const kpi = (l, v, s = '') => `<div class="card kpi"><div class="l">${l}</div><div class="v">${v}</div><div class="s">${s}</div></div>`;
const num = (v, suf = '') => (v == null ? '-' : v + suf);

// ---------------------------------------------------------------- views
function vGeral(d) {
  const k = d.kpis;
  const varTxt = k.adesaoVar == null ? '' : `<span class="${k.adesaoVar >= 0 ? 'up' : 'down'}">${k.adesaoVar >= 0 ? '+' : ''}${k.adesaoVar} pontos vs. início</span>`;
  return `
  <div class="grid kpis">
    ${kpi('Colaboradores no filtro', k.colaboradores)}
    ${kpi('Adesão às ações', num(k.adesao, '%'), varTxt || 'participantes / público-alvo')}
    ${kpi('Participações', k.participacoes, `${k.acoes} ações no período`)}
    ${kpi('Check-in na semana', k.respostaCheckin + '%', 'quem respondeu nos últimos 7 dias')}
    ${kpi('Índice de saúde', k.saudeGeral == null ? '-' : k.saudeGeral, k.saudeStatus ? stp(k.saudeStatus) : 'dados insuficientes')}
    ${kpi('Grupos em vermelho', k.gruposVermelhos, 'setor x turno')}
    ${kpi('Resposta ao "por que não fui"', k.barrierResponseRate + '%', 'de quem não participou')}
  </div>
  <div class="grid two">
    <section class="card"><h2 class="t">Adesão semanal</h2><p class="sub">% do público-alvo que participou das ações da semana.</p>
      ${lineChart(d.adesaoSemanal.map(w => w.label), [{ name: 'Adesão', color: 'var(--brand)', values: d.adesaoSemanal.map(w => w.adesao) }], { suffix: '%' })}</section>
    <section class="card"><h2 class="t">Índice de saúde semanal</h2><p class="sub">0 a 100 (maior é melhor). Aparece só com ${d.k}+ respondentes na semana.</p>
      ${lineChart(d.saudeSemanal.map(w => w.label), [
        { name: 'Física', color: 'var(--brand)', values: d.saudeSemanal.map(w => w.fisica) },
        { name: 'Mental', color: 'var(--accent)', values: d.saudeSemanal.map(w => w.mental) }], { min: 40, max: 100 })}</section>
  </div>
  <div class="grid two">
    <section class="card"><h2 class="t">Alertas de tendência</h2><p class="sub">Piora nas últimas 2 semanas contra as 2 anteriores.</p>
      ${d.alerts.length ? d.alerts.map(a => `<div class="alert">${esc(a.text)}</div>`).join('') : '<p class="empty">Nenhum alerta no momento.</p>'}</section>
    <section class="card"><h2 class="t">Recomendações prioritárias</h2><p class="sub">Geradas automaticamente pelos dados.</p>
      ${d.recommendations.slice(0, 4).map(r => `<div class="alert"><span class="badge">${sevLabel[r.sev]}</span>${esc(r.title)}</div>`).join('') || '<p class="empty">Sem recomendações.</p>'}
      <p style="margin:10px 0 0"><button class="btn sm" data-tab="recs">Ver todas</button></p></section>
  </div>`;
}

function vSaude(d) {
  const sectors = [...new Set(d.heatmap.map(h => h.sector))];
  const heat = sectors.map(sec => `<tr><th scope="row">${esc(sec)}</th>${['manha', 'tarde', 'noite'].map(sh => {
    const h = d.heatmap.find(x => x.sector === sec && x.shift === sh);
    if (!h) return '<td><div class="cell none">-</div></td>';
    if (h.hidden) return `<td><div class="cell hidden"><b>n/d</b><small>menos de ${d.k} respostas</small></div></td>`;
    return `<td><div class="cell ${h.status}"><b>${h.geral}</b><small>${stLabel[h.status]} · ${h.n} resp.</small><small>check-in ${h.respRate}%</small></div></td>`;
  }).join('')}</tr>`).join('');
  const itemCls = (key, v) => { const it = window.__items.find(i => i.key === key); const sc = it.worse ? (5 - v) / 4 * 100 : (v - 1) / 4 * 100; return sc >= 68 ? 'verde' : sc >= 58 ? 'amarelo' : 'vermelho'; };
  const rows = d.itensPorSetor.map(s => s.hidden
    ? `<tr><th scope="row">${esc(s.sector)}</th><td colspan="${window.__items.length + 1}" class="muted">menos de ${d.k} respondentes</td></tr>`
    : `<tr><th scope="row">${esc(s.sector)}</th>${window.__items.map(i => `<td><span class="st ${itemCls(i.key, s.means[i.key])}">${s.means[i.key]}</span></td>`).join('')}<td class="num">${s.n}</td></tr>`).join('');
  return `
  <section class="card"><h2 class="t">Mapa de calor: setor x turno</h2>
    <p class="sub">Índice de saúde de 0 a 100 (física + mental, autopercepção). Verde 68+, amarelo 58 a 67, vermelho abaixo de 58. Grupos com menos de ${d.k} respostas ficam ocultos para proteger o anonimato.</p>
    <div class="tw"><table class="heat"><thead><tr><th>Setor</th><th>Manhã</th><th>Tarde</th><th>Noite</th></tr></thead><tbody>${heat}</tbody></table></div></section>
  <div class="grid">
    <section class="card"><h2 class="t">Ranking de riscos por setor</h2><p class="sub">Média de 1 a 5 em cada pergunta. Cor considera o sentido da pergunta (dor alta é pior, sono alto é melhor).</p>
      <div class="tw"><table><thead><tr><th>Setor</th>${window.__items.map(i => `<th>${esc(i.short)}</th>`).join('')}<th class="num">n</th></tr></thead><tbody>${rows}</tbody></table></div></section>
    <section class="card"><h2 class="t">Alertas de tendência</h2><p class="sub">Piora de pelo menos 0,4 ponto em 2 semanas, com 8+ respondentes por período.</p>
      ${d.alerts.length ? d.alerts.map(a => `<div class="alert">${esc(a.text)}</div>`).join('') : '<p class="empty">Nenhum alerta no momento.</p>'}
      <h2 class="t" style="margin-top:16px">Privacidade</h2>
      <p class="sub" style="margin:0">Este painel nunca mostra resposta individual. O check-in diário guarda apenas um código irreversível do colaborador (para evitar duplicidade no dia), setor e turno.</p></section>
  </div>`;
}

function vAcoes(d) {
  const rows = d.actions.map(a => `<tr>
    <td><b>${esc(a.title)}</b><br><span class="muted small">${esc(a.typeLabel)} · ${a.duration} min</span></td>
    <td>${fmtDT(a.date)}<br><span class="st ${a.past ? 'verde' : 'amarelo'}" style="${a.past ? 'background:var(--line);color:var(--muted)' : ''}">${a.past ? 'Realizada' : 'Programada'}</span></td>
    <td class="num">${a.eligible}</td><td class="num">${a.inscritos}</td><td class="num">${a.past ? a.participantes : '-'}</td>
    <td class="num">${a.adesao == null ? '-' : a.adesao + '%'}</td><td class="num">${a.rating == null ? '-' : a.rating}</td>
    ${S.isAdmin ? `<td><button class="btn sm" data-qr="${a.id}">QR / código</button></td>` : ''}</tr>`).join('');
  return `
  <div class="row" style="justify-content:space-between;margin-top:12px"><h2 class="t" style="margin:0">Ações</h2>
    ${S.isAdmin ? '<div class="row"><button class="btn sm" id="btnQrCad">QR de cadastro</button><button class="btn primary sm" id="btnNew">Nova ação</button></div>' : ''}</div>
  <section class="card" style="margin-top:8px"><div class="tw"><table><thead><tr><th>Ação</th><th>Data</th><th class="num">Público</th><th class="num">Vou</th><th class="num">Presentes</th><th class="num">Adesão</th><th class="num">Nota</th>${S.isAdmin ? '<th></th>' : ''}</tr></thead><tbody>${rows || `<tr><td colspan="${S.isAdmin ? 8 : 7}" class="empty">Nenhuma ação no filtro.</td></tr>`}</tbody></table></div></section>
  <div class="grid two">
    <section class="card"><h2 class="t">Adesão por tipo de ação</h2><p class="sub">No período selecionado.</p>
      ${hbars(d.byType.map(t => ({ label: `${t.label}${t.rating ? ' (nota ' + t.rating + ')' : ''}`, pct: t.adesao || 0 })))}</section>
    <section class="card"><h2 class="t">O que os colaboradores querem</h2><p class="sub">Votos (até 3 tipos por pessoa) em "O que você gostaria de ter?".</p>
      ${hbars(d.demand.map(t => ({ label: t.label, pct: t.pct })))}</section>
  </div>`;
}

function vBarreiras(d) {
  const b = d.barriers;
  const grp = (kind) => d.barrierGroups.filter(g => g.kind === kind).map(g => `<tr><th scope="row">${esc(g.group)}</th><td class="num">${g.n}</td><td>${g.top.map(t => `${esc(t.label)} <b>${t.pct}%</b>`).join('<br>')}</td></tr>`).join('');
  return `
  <div class="grid two">
    <section class="card"><h2 class="t">Por que não participaram</h2>
      <p class="sub">${b.total} respostas no período (1 toque, anônimas). Cobertura: ${d.kpis.barrierResponseRate}% de quem não participou. As 8 opções vêm das causas do enunciado do desafio.</p>
      ${hbars(b.items, { warn: true })}</section>
    <section class="card"><h2 class="t">Principais barreiras por turno</h2><div class="tw"><table><thead><tr><th>Turno</th><th class="num">Resp.</th><th>Top 3</th></tr></thead><tbody>${grp('shift') || '<tr><td colspan="3" class="empty">Dados insuficientes.</td></tr>'}</tbody></table></div></section>
  </div>
  <section class="card" style="margin-top:12px"><h2 class="t">Principais barreiras por setor</h2><div class="tw"><table><thead><tr><th>Setor</th><th class="num">Resp.</th><th>Top 3</th></tr></thead><tbody>${grp('sector') || '<tr><td colspan="3" class="empty">Dados insuficientes.</td></tr>'}</tbody></table></div></section>`;
}

function vRecs(d) {
  return `
  <p class="sub" style="margin-top:12px">Regras automáticas sobre barreiras, saúde, nota das ações e pedidos dos colaboradores. Cada uma traz a evidência e a ação sugerida.</p>
  <div class="grid">${d.recommendations.map(r => `
    <article class="card rec ${r.sev}"><span class="badge">${sevLabel[r.sev]}</span><span class="badge">${esc(r.area)}</span><span class="badge">${esc(r.scope)}</span>
      <h3>${esc(r.title)}</h3><p class="muted small">Evidência: ${esc(r.evidence)}</p><p><b>Sugestão:</b> ${esc(r.action)}</p>
      ${S.isAdmin && r.notice ? `<button class="btn sm" data-notice="${esc(r.notice)}">Usar como aviso "Você disse, nós fizemos"</button>` : ''}</article>`).join('') || '<p class="empty">Sem recomendações para este filtro.</p>'}</div>
  ${S.isAdmin ? `<section class="card" style="margin-top:16px"><h2 class="t">Publicar aviso "Você disse, nós fizemos"</h2>
    <p class="sub">Fecha o ciclo: o colaborador vê que o retorno dele mudou algo. Aparece na aba Novidades do app.</p>
    <textarea id="noticeText" maxlength="280" placeholder="Ex.: Vocês pediram ginástica na troca de turno. A partir de segunda, ela acontece às 22h.">${esc(S.noticeDraft)}</textarea>
    <p style="margin:10px 0 0"><button class="btn primary" id="btnNotice">Publicar aviso</button></p></section>` : ''}`;
}

function vLiga(d) {
  const L = d.league;
  return `<section class="card" style="margin-top:12px"><h2 class="t">Liga das seções</h2>
    <p class="sub">Disputa coletiva do mês. Pontos = 60% participação em ações + 40% check-in. Meta coletiva: ${L.meta}% da equipe participando.</p>
    <div class="tw"><table><thead><tr><th>#</th><th>Setor</th><th class="num">Colab.</th><th class="num">Participação</th><th class="num">Check-in</th><th class="num">Pontos</th><th>Meta</th></tr></thead><tbody>
    ${L.rows.map(r => `<tr><td>${r.pos}</td><th scope="row">${esc(r.sector)}</th><td class="num">${r.colaboradores}</td><td class="num">${r.participacao}%</td><td class="num">${r.checkin}%</td><td class="num"><b>${r.pontos}</b></td>
    <td>${r.faltam ? `faltam ${r.faltam}` : '<span class="st verde">meta batida</span>'}</td></tr>`).join('')}</tbody></table></div>
    <p class="sub" style="margin:10px 0 0">Reconhecimento sugerido: café da manhã para a equipe campeã, troféu itinerante e destaque no mural.</p></section>`;
}

function vSST() {
  if (!S.isAdmin) return '<section class="card" style="margin-top:12px"><h2 class="t">Contatos SST</h2><p class="sub">Esta área mostra pedidos de contato com dados pessoais e fica disponível apenas para a administração.</p></section>';
  const items = S.contacts || [];
  const kind = { saude: 'Saúde ocupacional', psicologia: 'Apoio psicológico' };
  return `<section class="card" style="margin-top:12px"><h2 class="t">Pedidos de contato</h2>
    <p class="sub">Único dado individual do sistema: só existe quando o colaborador pede e autoriza o contato. Não há ligação com as respostas do check-in. Acesso restrito à Saúde e Segurança do Trabalho.</p>
    <div class="tw"><table><thead><tr><th>Data</th><th>Tipo</th><th>Local</th><th>Contato informado</th><th>Status</th></tr></thead><tbody>
    ${items.map(c => `<tr><td>${fmtD(c.ts)}</td><td>${kind[c.kind]}</td><td>${esc(c.store)} · ${esc(c.sector)} · ${esc(window.__shiftLabel[c.shift])}</td><td>${esc(c.contact || '-')}</td>
      <td><select data-contact="${c.id}" aria-label="Status do pedido"><option value="novo" ${c.status === 'novo' ? 'selected' : ''}>Novo</option><option value="em_contato" ${c.status === 'em_contato' ? 'selected' : ''}>Em contato</option><option value="resolvido" ${c.status === 'resolvido' ? 'selected' : ''}>Resolvido</option></select></td></tr>`).join('') || '<tr><td colspan="5" class="empty">Nenhum pedido.</td></tr>'}</tbody></table></div></section>`;
}

function vAgenda() {
  if (!S.agendaMonth) S.agendaMonth = monthKey();
  const items = S.activities.filter(a => monthKey(new Date(a.date)) === S.agendaMonth).sort((a, b) => a.date - b.date);
  const form = isRH() ? `<section class="card agenda-form"><h2 class="t">Cadastrar atividade</h2><p class="sub">A programação será exibida para todos os funcionários.</p>
    <label class="f"><span>Atividade</span><input id="agendaTitle" type="text" maxlength="100" placeholder="Ex.: Treinamento de atendimento"></label>
    <label class="f"><span>Data e horário</span><input id="agendaDate" type="datetime-local"></label>
    <label class="f"><span>Local</span><input id="agendaLocation" type="text" maxlength="120" placeholder="Ex.: sala de treinamento"></label>
    <label class="f"><span>Detalhes</span><textarea id="agendaDescription" maxlength="600" placeholder="Orientações para os participantes"></textarea></label>
    <button type="button" class="btn primary" id="btnAgendaCreate">Publicar atividade</button></section>` : '';
  const cards = items.map(a => {
    const future = a.date > Date.now();
    const presence = S.eid ? future
      ? `<button class="btn sm ${a.confirmed ? 'confirmed' : ''}" data-attendance="${esc(a.id)}" data-going="${a.confirmed ? '0' : '1'}">${a.confirmed ? 'Presença confirmada · Cancelar' : 'Confirmar presença'}</button>`
      : '<span class="small muted">Atividade encerrada</span>' : '';
    return `<article class="card agenda-item"><div class="agenda-date"><b>${fmtDT(a.date)}</b><span>${a.attendeeCount || 0} confirmação${a.attendeeCount === 1 ? '' : 'ões'}</span></div><div><h3>${esc(a.title)}</h3>${a.location ? `<p class="sub">${esc(a.location)}</p>` : ''}${a.description ? `<p>${esc(a.description)}</p>` : ''}${presence}</div></article>`;
  }).join('');
  return `<section class="row agenda-heading"><div><h2 class="t">Agenda de atividades</h2><p class="sub">Atividades e treinamentos publicados pelo RH.</p></div><div class="month-pick"><button class="btn sm" data-agenda-month="-1" aria-label="Mês anterior">‹</button><b>${esc(monthTitle(S.agendaMonth))}</b><button class="btn sm" data-agenda-month="1" aria-label="Próximo mês">›</button></div></section>
    ${form}<div class="agenda-list">${cards || '<section class="card empty">Nenhuma atividade publicada neste mês.</section>'}</div>`;
}

// ---------------------------------------------------------------- render
function render() {
  const d = S.data;
  if (!d) return;
  const views = { geral: vGeral, saude: vSaude, acoes: vAcoes, barreiras: vBarreiras, recs: vRecs, liga: vLiga, sst: vSST, agenda: vAgenda };
  $('#view').innerHTML = views[S.tab](d);
  $('#nav').innerHTML = TABS.map(([k, l]) => `<button data-tab="${k}" ${S.tab === k ? 'aria-current="page"' : ''}>${l}</button>`).join('');
  $('#anon').textContent = `Dados agregados. Grupos com menos de ${d.k} pessoas não são exibidos. Dados fictícios de demonstração.`;
}

async function refresh() {
  const q = new URLSearchParams({ store: $('#fStore').value, sector: $('#fSector').value, shift: $('#fShift').value, days: $('#fDays').value });
  try {
    S.data = await api('/api/admin/dashboard?' + q);
    if (S.tab === 'sst' && S.isAdmin) S.contacts = (await api('/api/admin/contacts')).items;
    if (S.tab === 'agenda') S.activities = (await api('/api/rh/activities?eid=' + encodeURIComponent(S.eid))).activities;
    render();
  } catch (e) { if (e.status === 401) logout(); else alert(e.message); }
}

function setupFilters() {
  const opt = (arr, first) => `<option value="">${first}</option>` + arr.map(x => `<option value="${esc(x.v ?? x)}">${esc(x.l ?? x)}</option>`).join('');
  $('#fStore').innerHTML = opt(S.meta.stores, 'Todas as lojas');
  $('#fSector').innerHTML = opt(S.meta.sectors, 'Todos os setores');
  $('#fShift').innerHTML = opt(S.meta.shifts.map(s => ({ v: s.key, l: s.label })), 'Todos os turnos');
  window.__items = S.meta.items;
  window.__shiftLabel = Object.fromEntries(S.meta.shifts.map(s => [s.key, s.label]));
}

function logout() {
  ss.del('pausa_pin'); S.pin = '';
  if (!S.isAdmin) {
    ss.del('pausa_panel_eid'); ss.del('pausa_panel_role'); ss.del('pausa_eid');
    location.href = 'index.html'; return;
  }
  ss.del('pausa_panel_eid'); ss.del('pausa_panel_role');
  S.isAdmin = false; $('#shell').hidden = true; $('#login').hidden = false;
}

async function start() {
  S.meta = await (await fetch('/api/meta')).json();
  setupFilters();
  let authorized = false;
  if (S.pin) {
    try { await api('/api/admin/ping'); S.isAdmin = true; S.eid = ''; S.employee = null; ss.del('pausa_panel_eid'); ss.del('pausa_panel_role'); authorized = true; }
    catch { ss.del('pausa_pin'); S.pin = ''; }
  }
  if (!authorized && S.eid) {
    try { S.employee = (await api('/api/me?eid=' + encodeURIComponent(S.eid))).employee; S.role = S.employee.job; authorized = true; }
    catch { ss.del('pausa_panel_eid'); ss.del('pausa_panel_role'); S.eid = ''; }
  }
  if (!authorized) { $('#login').hidden = false; return; }
  $('#employeeSpace').hidden = S.isAdmin;
  $('#login').hidden = true; $('#shell').hidden = false;
  await refresh();
}

// ---------------------------------------------------------------- dialogs
const dlg = $('#dlg');
function openDlg(html) { dlg.innerHTML = html; if (!dlg.open) dlg.showModal(); }
dlg.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) dlg.close(); });

function qrBlock(text) {
  const id = 'qr' + Math.random().toString(36).slice(2, 7);
  setTimeout(() => {
    const el = document.getElementById(id);
    if (!el) return;
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    s.onload = () => { el.innerHTML = ''; new window.QRCode(el, { text, width: 200, height: 200 }); };
    s.onerror = () => { el.innerHTML = '<p class="small muted">QR indisponível sem internet. Use o link abaixo.</p>'; };
    if (window.QRCode) s.onload(); else document.head.appendChild(s);
  }, 0);
  return `<div class="qr"><div id="${id}"></div></div><p class="small" style="word-break:break-all;text-align:center">${esc(text)}</p>`;
}

function newActionForm() {
  const m = S.meta;
  const d = new Date(Date.now() + 864e5); d.setHours(14, 50, 0, 0);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  openDlg(`<form id="fNew"><h2 class="t">Nova ação</h2>
    <label class="f"><span>Nome</span><input type="text" name="title" required maxlength="100" placeholder="Ex.: Ginástica laboral de 7 minutos"></label>
    <label class="f"><span>Tipo</span><select name="type">${m.types.map(t => `<option value="${t.key}">${esc(t.label)}</option>`).join('')}</select></label>
    <div class="row"><label class="f" style="flex:2"><span>Data e hora</span><input type="datetime-local" name="date" value="${local}" required></label>
    <label class="f" style="flex:1"><span>Duração (min)</span><input type="number" name="duration" value="10" min="1" max="480"></label></div>
    <label class="f"><span>Local</span><input type="text" name="location" maxlength="80" placeholder="Ex.: Área do estoque"></label>
    <label class="f"><span>Para que serve (aparece no convite)</span><input type="text" name="benefit" maxlength="160" placeholder="Ex.: Alivia dor nas costas e pernas."></label>
    <div class="f"><span>Setores (vazio = todos)</span><div class="checks">${m.sectors.map(s => `<label><input type="checkbox" name="sectors" value="${esc(s)}">${esc(s)}</label>`).join('')}</div></div>
    <div class="f"><span>Turnos (vazio = todos)</span><div class="checks">${m.shifts.map(s => `<label><input type="checkbox" name="shifts" value="${s.key}">${s.label}</label>`).join('')}</div></div>
    <div class="row" style="justify-content:flex-end;margin-top:16px"><button type="button" class="btn" data-close>Cancelar</button><button class="btn primary">Criar e divulgar</button></div></form>`);
}

// ---------------------------------------------------------------- eventos
$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  S.pin = $('#pin').value; $('#loginErr').textContent = '';
  try { await api('/api/admin/ping'); ss.set('pausa_pin', S.pin); $('#login').hidden = true; $('#shell').hidden = false; await refresh(); }
  catch { $('#loginErr').textContent = 'PIN inválido.'; }
});
$('#logout').addEventListener('click', logout);
['fStore', 'fSector', 'fShift', 'fDays'].forEach(id => $('#' + id).addEventListener('change', refresh));

document.addEventListener('click', async (e) => {
  const t = e.target.closest('[data-tab]');
  if (t) {
    S.tab = t.dataset.tab;
    if (S.tab === 'sst' && S.isAdmin) S.contacts = (await api('/api/admin/contacts')).items;
    if (S.tab === 'agenda') S.activities = (await api('/api/rh/activities?eid=' + encodeURIComponent(S.eid))).activities;
    render(); window.scrollTo(0, 0); return;
  }
  const month = e.target.closest('[data-agenda-month]');
  if (month) { moveMonth(Number(month.dataset.agendaMonth)); render(); return; }
  const attendance = e.target.closest('[data-attendance]');
  if (attendance) {
    try {
      await api('/api/rh/activities/attendance', { eid: S.eid, activityId: attendance.dataset.attendance, attending: attendance.dataset.going === '1' });
      await refresh();
    } catch (err) { alert(err.message); }
    return;
  }
  if (e.target.id === 'btnAgendaCreate') {
    const body = { eid: S.eid, title: $('#agendaTitle').value, date: $('#agendaDate').value, location: $('#agendaLocation').value, description: $('#agendaDescription').value };
    if (!body.title.trim() || !body.date) return alert('Informe o nome, a data e o horário da atividade.');
    try { await api('/api/rh/activities', body); alert('Atividade publicada para todos os funcionários.'); await refresh(); }
    catch (err) { alert(err.message); }
    return;
  }
  const n = e.target.closest('[data-notice]');
  if (n) { S.noticeDraft = n.dataset.notice; S.tab = 'recs'; render(); $('#noticeText').focus(); $('#noticeText').scrollIntoView({ block: 'center' }); return; }
  if (e.target.id === 'btnNotice') {
    const text = $('#noticeText').value.trim();
    if (!text) return alert('Escreva o aviso.');
    try { await api('/api/admin/announcements', { text }); S.noticeDraft = ''; $('#noticeText').value = ''; alert('Aviso publicado. Ele já aparece no app do colaborador.'); } catch (err) { alert(err.message); }
    return;
  }
  if (e.target.id === 'btnNew') return newActionForm();
  if (e.target.id === 'btnQrCad') return openDlg(`<h2 class="t">QR de cadastro</h2><p class="sub">Cole no relógio de ponto, na copa e no vestiário. O colaborador informa só loja, setor e turno.</p>${qrBlock(DEMO_BASE + 'index.html')}<div class="row" style="justify-content:flex-end"><button class="btn" data-close>Fechar</button></div>`);
  const q = e.target.closest('[data-qr]');
  if (q) {
    const a = S.data.actions.find(x => x.id === q.dataset.qr);
    openDlg(`<h2 class="t">Presença: ${esc(a.title)}</h2><p class="sub">Exiba este QR no local da ação. O colaborador aponta a câmera e a presença é registrada. Se não tiver câmera, ele digita o código.</p>
      ${qrBlock(DEMO_BASE + 'index.html?presenca=' + a.code)}<p style="text-align:center;font-size:1.6rem;font-weight:800;letter-spacing:.15em;margin:8px 0">${a.code}</p>
      <div class="row" style="justify-content:flex-end"><button class="btn" data-close>Fechar</button></div>`);
  }
});

document.addEventListener('change', async (e) => {
  const c = e.target.closest('[data-contact]');
  if (c) { try { await api('/api/admin/contacts/status', { id: c.dataset.contact, status: c.value }); } catch (err) { alert(err.message); } }
});

document.addEventListener('submit', async (e) => {
  if (e.target.id !== 'fNew') return;
  e.preventDefault();
  const f = new FormData(e.target);
  const body = {
    title: f.get('title'), type: f.get('type'), date: new Date(f.get('date')).getTime(), duration: Number(f.get('duration')),
    location: f.get('location'), benefit: f.get('benefit'), sectors: f.getAll('sectors'), shifts: f.getAll('shifts')
  };
  try {
    const r = await api('/api/admin/actions', body);
    await refresh();
    openDlg(`<h2 class="t">Ação criada</h2><p>O convite já aparece no app dos colaboradores do público-alvo (filtrado por setor e turno).</p>
      <p class="sub">Código de presença:</p><p style="text-align:center;font-size:1.6rem;font-weight:800;letter-spacing:.15em;margin:4px 0">${r.action.code}</p>
      ${qrBlock(DEMO_BASE + 'index.html?presenca=' + r.action.code)}<div class="row" style="justify-content:flex-end"><button class="btn" data-close>Fechar</button></div>`);
  } catch (err) { alert(err.message); }
});

start();
})();
