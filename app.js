(() => {
'use strict';
const $app = document.getElementById('app');
const ls = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* sem armazenamento */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } }
};
const params = new URLSearchParams(location.search);
const S = {
  meta: null, eid: (() => { try { return sessionStorage.getItem('pausa_panel_eid'); } catch { return null; } })(), me: null, tab: 'acoes', actions: [], showAll: false, league: null, votes: [], rhActivities: [], agendaMonth: '', rhDraft: { title: '', date: '', location: '', description: '' },
  answers: {}, sleepHours: '', dailyFeedback: '', accessMode: null, adminPin: '', contact: { kind: 'saude', contact: '', consent: false, open: false }, barrierFor: null, fb: {}, codeOpen: false,
  code: params.get('presenca') || '', presenca: params.get('presenca') || '', edit: false, justDone: false, reg: { name: '', job: '', store: '', sector: '', shift: '', consent: false },
  loading: false, error: '', login: { store: '', role: '', password: '' }
};

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
async function api(path, body) {
  if (typeof window.pausaDemoRequest === 'function') return window.pausaDemoRequest(path, body);
  const opt = body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {};
  const r = await fetch(path, opt);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(j.error || 'Erro de conexão'); e.status = r.status; throw e; }
  return j;
}
let toastT;
function toast(msg) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  document.body.appendChild(t); clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 3200);
}
function fmtDate(ts) {
  const d = new Date(ts), now = new Date(), tm = new Date(Date.now() + 864e5);
  const hm = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === now.toDateString()) return 'Hoje, ' + hm;
  if (d.toDateString() === tm.toDateString()) return 'Amanhã, ' + hm;
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }) + ', ' + hm;
}
const shiftName = (k) => (S.meta.shifts.find(s => s.key === k) || {}).label || k;
const typeName = (k) => (S.meta.types.find(t => t.key === k) || {}).label || k;
const localMonthKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
function shiftMonth(key, delta) { const d = new Date(`${key}-01T12:00:00`); d.setMonth(d.getMonth() + delta); return localMonthKey(d); }
function monthLabel(key) { return new Date(`${key}-01T12:00:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }); }
const isRhEmployee = (employee) => /\bRH\b|recursos humanos/i.test(employee?.job || '');

// ------------------------------------------------------------------ dados
async function load() {
  S.loading = true;
  try {
    if (!S.meta) S.meta = await api('/api/meta');
    if (!S.eid) { S.loading = false; return render(); }
    const [me, ac, lg, vt, rh] = await Promise.all([
      api('/api/me?eid=' + S.eid), api(`/api/actions?eid=${S.eid}&all=${S.showAll ? 1 : 0}`),
      api('/api/league?eid=' + S.eid), api('/api/votes?eid=' + S.eid), api('/api/rh/activities?eid=' + S.eid)
    ]);
    S.me = me; S.actions = ac.actions; S.league = lg; S.votes = vt.types; S.rhActivities = rh.activities; S.error = '';
  } catch (e) {
    if (e.status === 401) { ls.del('pausa_eid'); S.eid = null; S.me = null; }
    else S.error = !S.meta ? `Falha ao iniciar a aplicação: ${e.message || 'não foi possível carregar os dados iniciais.'}` : 'Não foi possível carregar. Verifique a conexão e tente de novo.';
  }
  S.loading = false; render();
  if (S.eid && S.presenca) { const c = S.presenca; S.presenca = ''; history.replaceState(null, '', location.pathname); await attend(c); }
}

async function attend(code) {
  try {
    const r = await api('/api/attend', { eid: S.eid, code });
    S.codeOpen = false; S.code = ''; toast('Presença registrada: ' + r.action.title); await load();
  } catch (e) { toast(e.message); }
}

// ------------------------------------------------------------------ views
function viewAccess() {
  if (!S.login.store && S.meta.stores.length) S.login.store = S.meta.stores[0];
  if (!S.login.role && S.meta.roles?.length) S.login.role = S.meta.roles[0];
  return `<main class="login-layout"><section class="login-panel">
    <p class="login-kicker">ACESSO AO SISTEMA</p>
    <h1>Seja bem-vindo</h1><p class="login-intro">Selecione sua função e informe a senha para acessar.</p>
    <label class="field"><span>Loja / empresa</span><select id="loginStore">${S.meta.stores.map(x => `<option ${S.login.store === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></label>
    <label class="field"><span>Usuário / função</span><select id="loginRole">${S.meta.loginRoles.map(x => `<option ${S.login.role === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></label>
    <label class="field"><span>Senha</span><input id="loginPassword" type="password" value="${esc(S.login.password)}" autocomplete="current-password" placeholder="Sua senha"></label>
    ${S.error ? `<p class="small" role="alert" style="color:var(--vermelho)">${esc(S.error)}</p>` : ''}
    <button class="btn primary login-submit" data-act="employee-login">Entrar</button>
    <div class="login-links"><button class="link" data-act="register-open">Criar acesso de colaborador</button></div>
  </section><aside class="login-art"><div class="art-shape"></div><p class="login-kicker">CUIDADO NO DIA A DIA</p><h2>Um bom trabalho começa com pessoas bem.</h2><span>Agenda, saúde e reconhecimento em um só lugar.</span></aside></main>`;
}
function viewAdminAccess() {
  return `<header class="top"><img class="app-logo" src="assets/piramide-maslow-logo.png" alt="Pirâmide de Maslow"></header><section class="card access-form"><h1>Acesso administrador</h1><p class="muted">Área de gestão do programa.</p><label class="field"><span>Senha</span><input id="adminPin" type="password" inputmode="numeric" autocomplete="current-password" value="${esc(S.adminPin)}" maxlength="12"></label>${S.error ? `<p class="small" role="alert" style="color:var(--vermelho)">${esc(S.error)}</p>` : ''}<div class="row"><button class="btn ghost" data-act="back-access">Voltar</button><button class="btn primary" data-act="admin-login">Entrar</button></div></section>`;
}
function viewOnboarding() {
  const m = S.meta, r = S.edit && S.me ? S.me.employee : S.reg;
  const editing = S.edit && S.me;
  return `
  <header class="top"><img class="app-logo" src="assets/piramide-maslow-logo.png" alt="Pirâmide de Maslow"></header>
  <section class="card hero stack">
    <h1>${editing ? 'Atualizar meu perfil' : 'Criar acesso'}</h1>
    <p>${editing ? 'Atualize seus dados de trabalho.' : 'Preencha seus dados para acessar a aplicação.'}</p>
  </section>
  <section class="card" style="margin-top:12px">
    <label class="field"><span>Nome</span><input type="text" data-f="name" value="${esc(r.name)}" maxlength="80" autocomplete="name" placeholder="Seu nome" ${editing ? '' : 'required'}></label>
    ${editing ? '' : `<label class="field"><span>Senha (mínimo 6 caracteres)</span><input type="password" data-f="password" value="${esc(S.reg.password)}" autocomplete="new-password" required></label><label class="field"><span>Confirme a senha</span><input type="password" data-f="passwordConfirm" value="${esc(S.reg.passwordConfirm)}" autocomplete="new-password" required></label><p class="small muted">No login, a função selecionada e a senha identificam seu acesso. Use uma senha pessoal.</p>`}
    <label class="field"><span>Função no supermercado</span><select data-f="job" ${editing ? '' : 'required'}><option value="">Selecione sua função</option>${(editing ? [...new Set([...m.roles, ...m.jobs])] : m.roles).map(x => `<option value="${esc(x)}" ${r.job === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></label>
    <label class="field"><span>Loja</span><select data-f="store"><option value="">Selecione</option>${m.stores.map(x => `<option ${r.store === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></label>
    <label class="field"><span>Setor</span><select data-f="sector"><option value="">Selecione</option>${m.sectors.map(x => `<option ${r.sector === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></label>
    <label class="field"><span>Turno</span><select data-f="shift"><option value="">Selecione</option>${m.shifts.map(x => `<option value="${x.key}" ${r.shift === x.key ? 'selected' : ''}>${x.label} (${x.hours})</option>`).join('')}</select></label>
    ${editing ? '' : `<label class="check"><input type="checkbox" data-f="consent" ${S.reg.consent ? 'checked' : ''}><span>Entendo que minhas respostas de saúde são <b>anônimas</b>: a empresa só vê resultados de grupos (mínimo de ${m.kMin} pessoas). Não é diagnóstico médico.</span></label>`}
    <div class="row">
      ${editing ? '' : '<button class="btn ghost" data-act="back-access">Voltar ao login</button>'}
      ${editing ? '<button class="btn ghost" data-act="cancel-edit">Cancelar</button>' : ''}
      <button class="btn primary" data-act="${editing ? 'save-profile' : 'register'}">${editing ? 'Salvar' : 'Criar acesso'}</button>
    </div>
    ${S.error ? `<p class="small" style="color:var(--vermelho)">${esc(S.error)}</p>` : ''}
  </section>`;
}

function actionCard(a) {
  const barrierOpen = S.barrierFor === a.id;
  return `
  <article class="card action" data-id="${a.id}">
    <span class="tag">${esc(a.typeLabel)}</span>${a.forMe ? '' : ' <span class="small muted">outro turno ou setor</span>'}
    <h3>${esc(a.title)}</h3>
    <div class="meta">${esc(fmtDate(a.date))} · ${a.duration} min · ${esc(a.location || '')}</div>
    ${a.benefit ? `<p class="why"><b>Para que serve:</b> ${esc(a.benefit)}</p>` : ''}
    ${a.going ? `<div class="small muted" style="margin-top:6px">${a.going} colega${a.going > 1 ? 's' : ''} vão</div>` : ''}
    ${a.attended ? '<p class="small" style="color:var(--verde);font-weight:700;margin:10px 0 0">Presença registrada</p>' : `
    <div class="row">
      <button class="btn ${a.myStatus === 'vou' ? 'on' : ''}" data-act="rsvp" data-s="vou" aria-pressed="${a.myStatus === 'vou'}">Vou</button>
      <button class="btn ${a.myStatus === 'nao_consigo' ? 'off' : ''}" data-act="rsvp" data-s="nao_consigo" aria-pressed="${a.myStatus === 'nao_consigo'}">Não consigo</button>
    </div>`}
    ${barrierOpen ? `<div class="notice" style="margin-top:12px"><b>O que atrapalhou?</b> (1 toque, ajuda a melhorar)${chips('barrier-fo', a.id)}</div>` : ''}
  </article>`;
}
function chips(act, actionId) {
  return `<div class="chips">${S.meta.barriers.map(b => `<button class="chip" data-act="${act}" data-a="${actionId}" data-b="${b.key}">${esc(b.label)}</button>`).join('')}</div>`;
}

function viewMonthlyAgenda() {
  if (!S.agendaMonth) S.agendaMonth = localMonthKey();
  const monthItems = S.rhActivities.filter(a => localMonthKey(new Date(a.date)) === S.agendaMonth).sort((a, b) => a.date - b.date);
  const createForm = isRhEmployee(S.me.employee) ? `<form class="card rh-create" onsubmit="return false">
    <h3>Nova atividade</h3>
    <label class="field"><span>Atividade</span><input type="text" id="rhTitle" maxlength="100" value="${esc(S.rhDraft.title)}" placeholder="Ex.: Orientação sobre ergonomia" required></label>
    <label class="field"><span>Data e horário</span><input type="datetime-local" id="rhDate" value="${esc(S.rhDraft.date)}" required></label>
    <label class="field"><span>Local</span><input type="text" id="rhLocation" maxlength="120" value="${esc(S.rhDraft.location)}" placeholder="Ex.: sala de treinamento"></label>
    <label class="field"><span>Detalhes</span><textarea id="rhDescription" maxlength="600" rows="3" placeholder="Informações para os colaboradores">${esc(S.rhDraft.description)}</textarea></label>
    <button class="btn primary" style="width:100%;margin-top:12px" data-act="rh-create">Publicar atividade</button>
  </form>` : '';
  const events = monthItems.map(a => {
    const canConfirm = a.date > Date.now();
    const attendance = canConfirm
      ? a.confirmed ? `<button class="btn sm attendance-confirmed" data-act="rh-attendance" data-id="${esc(a.id)}" data-going="0">Presença confirmada · Cancelar</button>` : `<button class="btn sm" data-act="rh-attendance" data-id="${esc(a.id)}" data-going="1">Confirmar presença</button>`
      : '<span class="small muted">Atividade encerrada</span>';
    return `<article class="card rh-event"><div class="rh-event-date"><b>${new Date(a.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</b><span>${new Date(a.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span></div><div><span class="tag">Atividade do RH</span><h3>${esc(a.title)}</h3>${a.location ? `<p class="small muted">📍 ${esc(a.location)}</p>` : ''}${a.description ? `<p>${esc(a.description)}</p>` : ''}<p class="small muted">${a.attendeeCount || 0} confirmação${a.attendeeCount === 1 ? '' : 'ões'}</p>${attendance}</div></article>`;
  }).join('');
  return `<section class="card rh-agenda">
    <div class="rh-agenda-heading"><div><span class="login-kicker">PROGRAMAÇÃO</span><h2>Agenda mensal</h2></div><div class="month-controls"><button class="btn sm" aria-label="Mês anterior" data-act="agenda-month" data-delta="-1">‹</button><b>${esc(monthLabel(S.agendaMonth))}</b><button class="btn sm" aria-label="Próximo mês" data-act="agenda-month" data-delta="1">›</button></div></div>
    ${isRhEmployee(S.me.employee) ? '<p class="small muted">Apenas o RH pode publicar atividades. Todos os colaboradores podem consultar a agenda.</p>' : ''}
    ${createForm}
    <div class="rh-events">${events || '<p class="muted">Não há atividades publicadas para este mês.</p>'}</div>
  </section>`;
}

function viewAgenda() {
  const me = S.me, emp = me.employee;
  const pend = [];
  me.pendingFeedback.forEach(p => {
    const f = S.fb[p.id] || {};
    pend.push(`<article class="card pending"><b>Como foi "${esc(p.title)}"?</b>
      <div class="stars" role="group" aria-label="Nota de 1 a 5">${[1, 2, 3, 4, 5].map(n => `<button data-act="rate" data-a="${p.id}" data-n="${n}" aria-pressed="${f.rating === n}">${n}</button>`).join('')}</div>
      ${f.rating ? `<div class="row"><button class="btn primary" data-act="fb-send" data-a="${p.id}" data-y="1">Quero mais ações assim</button><button class="btn" data-act="fb-send" data-a="${p.id}" data-y="0">Não precisa</button></div>` : '<div class="small muted" style="margin-top:6px">1 = ruim, 5 = ótima</div>'}
    </article>`);
  });
  me.pendingBarrier.forEach(p => pend.push(`<article class="card pending"><b>Você não participou de "${esc(p.title)}" (${esc(fmtDate(p.date))}).</b><div class="small muted">Por quê? Escolha uma opção.</div>${chips('barrier-pending', p.id)}</article>`));

  const extra = pend.length > 1 ? `<p class="small muted" style="margin:0">Mais ${pend.length - 1} pergunta${pend.length > 2 ? 's' : ''} depois desta.</p>` : '';
  pend.splice(1);
  return `
  <section class="card hero">
    <h1>Ações para o seu turno</h1>
    <p>${esc(shiftName(emp.shift))} · ${esc(emp.sector)}${me.participacoesMes ? ` · ${me.participacoesMes} participaç${me.participacoesMes > 1 ? 'ões' : 'ão'} neste mês` : ''}</p>
  </section>
  <section class="card coin-card"><b>🪙 ${me.teamCoins || 0} moedas da sua equipe</b><p class="small muted">${me.weekDays || 0} de 7 dias completos nesta semana. Ganhem 10 moedas quando todos registrarem o check-in diário.</p><button class="btn sm" data-act="tab" data-t="equipe">Ver moedas e classificação</button></section>
  ${me.checkinDone ? '' : `<button class="card daily-checkin" style="width:100%;text-align:left;margin-top:12px" data-act="go-saude"><b>Check-in de saúde de hoje</b><div class="small muted">Conte como está se sentindo e registre seu sono.</div></button>`}
  <div class="stack" style="margin-top:12px">
    ${pend.join('')}${extra}
        <div class="card">
      ${S.codeOpen ? `<label class="field" style="margin-top:0"><span>Código da ação (está no QR code ou no local)</span><input type="text" id="code" value="${esc(S.code)}" autocapitalize="characters" autocomplete="off" maxlength="8" placeholder="Ex.: A1B2C3"></label>
        <div class="row"><button class="btn ghost" data-act="code-close">Fechar</button><button class="btn primary" data-act="code-send">Registrar presença</button></div>`
        : `<button class="btn primary" style="width:100%" data-act="code-open">Registrar presença com código</button>`}
    </div>
  </div>
  <h2>${S.showAll ? 'Todas as ações' : 'Próximas ações para você'}</h2>
  <div class="stack">${S.actions.length ? S.actions.map(actionCard).join('') : '<div class="card muted">Nenhuma ação programada para o seu turno agora.</div>'}</div>
  <p style="text-align:center;margin-top:16px"><button class="link" data-act="toggle-all">${S.showAll ? 'Mostrar só as do meu turno e setor' : 'Ver ações de outros turnos e setores'}</button></p>`;
}

function viewSaude() {
  const items = S.meta.items;
  const answered = items.filter(i => S.answers[i.key]).length;
  const done = S.me.checkinDone || S.justDone;
  const c = S.contact;
  const reportBlock = S.me.canReport ? `<section class="card report-card" style="margin-top:12px"><h3>Avaliação semanal de saúde</h3><p class="small muted">O PDF reúne seus check-ins dos últimos sete dias, horas de sono, satisfação e feedbacks.</p><button class="btn primary" style="width:100%" data-act="health-report">Gerar avaliação semanal em PDF</button></section>` : '';
  const contactBlock = `
  <section class="card" style="margin-top:12px">
    <h3>Quer conversar com alguém?</h3>
    <p class="small muted" style="margin:6px 0 0">É opcional e separado do check-in. Só a equipe de saúde da empresa recebe o seu pedido, e só se você aceitar.</p>
    ${c.open ? `
      <div class="chips" role="group" aria-label="Tipo de apoio">
        <button class="chip" data-act="ck" data-k="saude" aria-pressed="${c.kind === 'saude'}">Saúde ocupacional</button>
        <button class="chip" data-act="ck" data-k="psicologia" aria-pressed="${c.kind === 'psicologia'}">Apoio psicológico</button>
      </div>
      <label class="field"><span>Como prefere ser contatado(a)? (nome e telefone)</span><input type="text" id="contact" value="${esc(c.contact)}" maxlength="120" autocomplete="off"></label>
      <label class="check"><input type="checkbox" data-f="cconsent" ${c.consent ? 'checked' : ''}><span>Autorizo a equipe de saúde a entrar em contato comigo.</span></label>
      <div class="row"><button class="btn ghost" data-act="contact-close">Cancelar</button><button class="btn primary" data-act="contact-send" ${c.consent ? '' : 'disabled'}>Enviar pedido</button></div>`
      : `<div class="row"><button class="btn" data-act="contact-open">Quero conversar</button></div>`}
  </section>`;
  if (done) return `
    <section class="card hero"><h1>Check-in de hoje concluído</h1><p>Obrigado por cuidar de você e da sua equipe.</p></section>
    <section class="card coin-card" style="margin-top:12px"><b>🪙 ${S.me.teamCoins || 0} moedas da equipe</b><p class="small muted">A equipe ganha 10 moedas por semana quando todas as pessoas completam os sete check-ins diários.</p><div class="progress"><i style="width:${Math.round((S.me.weekDays || 0)/7*100)}%"></i></div><p class="small muted">${S.me.weekDays || 0} de 7 dias registrados nesta semana</p></section>
    ${reportBlock}
    <section class="card notice" style="margin-top:12px">Suas respostas de check-in são anônimas para a empresa. O PDF semanal fica acessível apenas neste perfil e reúne as respostas dos últimos sete dias.</section>${contactBlock}`;
  return `
  <section class="card hero"><h1>Check-in de hoje</h1><p>Responda sobre dores, sono e satisfação com o trabalho.</p></section>
  <div class="progress" style="margin:12px 0" aria-hidden="true"><i style="width:${Math.round(answered / items.length * 100)}%"></i></div>
  <section class="card">
    ${items.map(i => `<div class="q"><p id="q-${i.key}">${esc(i.question)}</p>
      <div class="scale" role="group" aria-labelledby="q-${i.key}">${[1, 2, 3, 4, 5].map(n => `<button data-act="ans" data-k="${i.key}" data-n="${n}" aria-pressed="${S.answers[i.key] === n}">${n}</button>`).join('')}</div>
      <div class="ends"><span>${esc(i.low)}</span><span>${esc(i.high)}</span></div></div>`).join('')}
    <label class="field"><span>Quantas horas você dormiu nas últimas 24 horas?</span><input type="number" id="sleepHours" min="0" max="24" step="0.5" inputmode="decimal" value="${esc(S.sleepHours)}" placeholder="Ex.: 7,5" required></label>
    <label class="field"><span>Quer deixar um feedback sobre seu dia? (opcional)</span><textarea id="dailyFeedback" maxlength="500" rows="3" placeholder="Conte sobre uma dor, algo que foi bem ou o que poderia melhorar.">${esc(S.dailyFeedback)}</textarea></label>
    <button class="btn primary" style="width:100%;margin-top:12px" data-act="checkin-send" ${answered === items.length && S.sleepHours !== '' ? '' : 'disabled'}>Enviar check-in (${answered}/${items.length})</button>
  </section>
  <p class="small muted" style="margin-top:10px">Anônimo. Não é diagnóstico médico: mede como você se sente para a empresa agir onde há mais necessidade.</p>
  ${reportBlock}
  ${contactBlock}`;
}

function viewEquipe() {
  const L = S.league;
  if (!L) return '<div class="card muted">Carregando...</div>';
  const mine = L.rows.find(r => r.sector === L.mySector);
  const month = new Date(L.mes).toLocaleDateString('pt-BR', { month: 'long' });
  return `
  <section class="card hero"><h1>Liga das Seções</h1><p>${esc(L.store)} · ${esc(month)}. A disputa é entre equipes, nunca entre pessoas.</p></section>
  ${mine ? `<section class="card notice" style="margin-top:12px">${mine.faltam ? `Faltam <b>${mine.faltam} pessoa${mine.faltam > 1 ? 's' : ''}</b> participar de uma ação para <b>${esc(mine.sector)}</b> bater a meta de ${L.meta}%.` : `<b>${esc(mine.sector)}</b> bateu a meta de ${L.meta}% de participação.`}</section>` : ''}
  <section class="card" style="margin-top:12px">
    ${L.rows.map(r => `<div class="rank ${r.sector === L.mySector ? 'me' : ''}"><span class="pos">${r.pos}</span>
      <div><b>${esc(r.sector)}</b>${r.sector === L.mySector ? ' <span class="tag">sua equipe</span>' : ''}
        <div class="bar" role="img" aria-label="${r.participacao}% participaram"><i style="width:${r.participacao}%"></i></div>
        <div class="small muted">${r.participacao}% participaram · ${r.checkin}% responderam o check-in</div></div>
      <b>${r.pontos} pts</b><span class="coin-count">🪙 ${r.moedas || 0}</span></div>`).join('')}
    <section class="coin-card"><b>🪙 ${mine?.moedas || 0} moedas</b><p class="small muted">Moedas acumuladas pela sua equipe: 10 por cada semana completa com os sete check-ins diários de todas as pessoas.</p><p class="small muted">Nesta semana: ${mine?.diasEquipe || 0} de 7 dias registrados por toda a equipe.</p></section>
    <p class="small muted" style="margin:12px 0 0">A classificação mensal combina participação em ações e check-ins. As moedas premiam o cuidado coletivo diário.</p>
  </section>`;
}

function viewShop() {
  const coins = S.me.coins || 0;
  return `<section class="card hero"><h1>Loja virtual</h1><p>Troque suas moedas por itens de reconhecimento.</p></section>
    <section class="wallet-panel"><span>Seu saldo</span><b>🪙 ${coins} moedas</b><small>10 moedas para cada pessoa quando a equipe completa todos os check-ins da semana.</small></section>
    <div class="shop-grid">${S.meta.shopItems.map(p => `<article class="card shop-item"><span class="shop-icon">${esc(p.icon)}</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><div class="shop-buy"><b>🪙 ${p.cost}</b><button class="btn sm ${coins < p.cost ? 'ghost' : 'primary'}" data-act="shop-buy" data-item="${esc(p.id)}" ${coins < p.cost ? 'disabled' : ''}>Resgatar</button></div></article>`).join('')}</div>
    <p class="small muted" style="margin:14px 2px">Catálogo demonstrativo. Os itens e condições reais de resgate devem ser definidos pela administração.</p>`;
}

function viewMain() {
  const emp = S.me.employee;
  const body = S.tab === 'saude' ? viewSaude() : S.tab === 'equipe' ? viewEquipe() : S.tab === 'loja' ? viewShop() : S.tab === 'agenda' ? viewMonthlyAgenda() : viewAgenda();
  const tab = (k, l) => `<button data-act="tab" data-t="${k}" ${S.tab === k ? 'aria-current="page"' : ''}>${l}</button>`;
  return `
  <header class="top"><img class="app-logo" src="assets/piramide-maslow-logo.png" alt="Pirâmide de Maslow">
    <div class="top-right"><span class="wallet-pill">🪙 ${S.me.coins || 0} moedas</span><div class="who">${esc(emp.name || 'Colaborador')} · ${esc(emp.job || shiftName(emp.shift))}<br>${esc(emp.store)} · <button data-act="edit">perfil</button> · <button data-act="logout">sair</button></div></div></header>
  ${S.error ? `<div class="card" style="color:var(--vermelho);margin-bottom:12px">${esc(S.error)}</div>` : ''}
  ${body}
  <nav class="tabs" aria-label="Seções">${tab('agenda', 'Agenda')}${tab('saude', 'Saúde')}${tab('equipe', 'Equipe')}${tab('loja', 'Loja virtual')}${tab('acoes', 'Ações')}</nav>`;
}

function render() {
  if (!S.meta) {
    $app.innerHTML = S.loading
      ? '<p style="padding:24px" class="muted">Carregando...</p>'
      : `<section class="card startup-error"><h1>Não foi possível abrir a aplicação</h1><p>${esc(S.error || 'Os dados iniciais não responderam.')}</p><p class="small muted">Abra o arquivo index.html depois de extrair a pasta completa do ZIP.</p><button class="btn primary" data-act="retry">Tentar novamente</button></section>`;
    return;
  }
  const active = document.activeElement && document.activeElement.id;
  if (!S.eid) $app.innerHTML = S.accessMode === 'admin' ? viewAdminAccess() : S.accessMode === 'register' ? viewOnboarding() : viewAccess();
  else if (S.edit && S.me) $app.innerHTML = viewOnboarding();
  else if (!S.me) $app.innerHTML = S.error
    ? `<section class="card startup-error"><h1>Não foi possível carregar seus dados</h1><p>${esc(S.error)}</p><button class="btn primary" data-act="retry">Tentar novamente</button></section>`
    : '<p style="padding:24px" class="muted">Carregando...</p>';
  else $app.innerHTML = viewMain();
  if (active) { const el = document.getElementById(active); if (el) el.focus(); }
}

// ------------------------------------------------------------------ eventos
$app.addEventListener('input', (e) => {
  if (e.target.id === 'rhTitle') S.rhDraft.title = e.target.value;
  if (e.target.id === 'rhDate') S.rhDraft.date = e.target.value;
  if (e.target.id === 'rhLocation') S.rhDraft.location = e.target.value;
  if (e.target.id === 'rhDescription') S.rhDraft.description = e.target.value;
  if (e.target.id === 'loginPassword') S.login.password = e.target.value;
  if (e.target.dataset.f && !S.edit) S.reg[e.target.dataset.f] = e.target.value;
  if (e.target.id === 'code') S.code = e.target.value;
  if (e.target.id === 'contact') S.contact.contact = e.target.value;
  if (e.target.id === 'adminPin') S.adminPin = e.target.value;
  if (e.target.id === 'dailyFeedback') S.dailyFeedback = e.target.value;
  if (e.target.id === 'sleepHours') { S.sleepHours = e.target.value; render(); }
});
$app.addEventListener('change', (e) => {
  if (e.target.id === 'loginStore') { S.login.store = e.target.value; return; }
  if (e.target.id === 'loginRole') { S.login.role = e.target.value; return; }
  const f = e.target.dataset.f;
  if (!f) return;
  if (f === 'cconsent') { S.contact.consent = e.target.checked; return render(); }
  const tgt = S.edit && S.me ? S.me.employee : S.reg;
  if (f === 'consent') S.reg.consent = e.target.checked; else tgt[f] = e.target.value;
});

$app.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const d = b.dataset;
  try {
    switch (d.act) {
      case 'retry': S.error = ''; await load(); break;
      case 'register-open': S.accessMode = 'register'; S.error = ''; render(); break;
      case 'admin-open': S.accessMode = 'admin'; S.error = ''; render(); break;
      case 'back-access': S.accessMode = null; S.adminPin = ''; S.error = ''; render(); break;
      case 'employee-login': {
        if (S.login.role === 'Administrador') {
          await api('/api/admin/login', { pin: S.login.password });
          try { sessionStorage.setItem('pausa_pin', S.login.password); sessionStorage.removeItem('pausa_panel_eid'); sessionStorage.removeItem('pausa_panel_role'); } catch {}
          location.href = 'painel.html'; break;
        }
        const result = await api('/api/employee/login', S.login);
        try { sessionStorage.setItem('pausa_panel_eid', result.eid); sessionStorage.setItem('pausa_panel_role', result.employee.job); sessionStorage.removeItem('pausa_pin'); } catch {}
        location.href = 'painel.html'; break;
      }
      case 'admin-login': {
        await api('/api/admin/login', { pin: S.adminPin });
        try { sessionStorage.setItem('pausa_pin', S.adminPin); } catch {}
        location.href = 'painel.html'; break;
      }
      case 'logout': ls.del('pausa_eid'); try { sessionStorage.removeItem('pausa_panel_eid'); sessionStorage.removeItem('pausa_panel_role'); } catch {} S.eid = null; S.me = null; S.accessMode = null; render(); break;
      case 'register': {
        const r = S.reg;
        if (r.password !== r.passwordConfirm) return toast('As senhas não conferem.');
        const res = await api('/api/register', { name: r.name, password: r.password, job: r.job, store: r.store, sector: r.sector, shift: r.shift, consent: r.consent });
        try { sessionStorage.setItem('pausa_panel_eid', res.eid); sessionStorage.setItem('pausa_panel_role', res.employee.job); sessionStorage.removeItem('pausa_pin'); } catch {}
        location.href = 'painel.html'; break;
      }
      case 'shop-buy': {
        const result = await api('/api/shop/buy', { eid: S.eid, productId: d.item });
        toast(`Resgate registrado: ${result.product}. Saldo: ${result.coins} moedas.`); await load(); break;
      }
      case 'edit': S.edit = true; render(); break;
      case 'cancel-edit': S.edit = false; await load(); break;
      case 'save-profile': {
        const m = S.me.employee;
        await api('/api/update-profile', { eid: S.eid, name: m.name, store: m.store, sector: m.sector, shift: m.shift, job: m.job });
        S.edit = false; toast('Atualizado.'); await load(); break;
      }
      case 'tab': S.tab = d.t; render(); window.scrollTo(0, 0); break;
      case 'agenda-month': S.agendaMonth = shiftMonth(S.agendaMonth || localMonthKey(), Number(d.delta)); render(); break;
      case 'rh-attendance': {
        await api('/api/rh/activities/attendance', { eid: S.eid, activityId: d.id, attending: d.going === '1' });
        toast(d.going === '1' ? 'Presença confirmada.' : 'Confirmação cancelada.'); await load(); break;
      }
      case 'rh-create': {
        const draft = S.rhDraft;
        if (!draft.title.trim() || !draft.date) return toast('Informe o nome, a data e o horário da atividade.');
        await api('/api/rh/activities', { eid: S.eid, title: draft.title, date: draft.date, location: draft.location, description: draft.description });
        S.rhDraft = { title: '', date: '', location: '', description: '' };
        toast('Atividade publicada para todos os colaboradores.'); await load(); break;
      }
      case 'go-saude': S.tab = 'saude'; render(); window.scrollTo(0, 0); break;
      case 'toggle-all': S.showAll = !S.showAll; await load(); break;
      case 'rsvp': {
        const id = b.closest('[data-id]').dataset.id;
        await api('/api/rsvp', { eid: S.eid, actionId: id, status: d.s });
        S.barrierFor = d.s === 'nao_consigo' ? id : null;
        toast(d.s === 'vou' ? 'Combinado. Avisamos 30 minutos antes.' : 'Tudo bem. Conte o motivo se quiser.');
        const ac = await api(`/api/actions?eid=${S.eid}&all=${S.showAll ? 1 : 0}`); S.actions = ac.actions; render(); break;
      }
      case 'barrier-fo': case 'barrier-pending': {
        await api('/api/barrier', { eid: S.eid, actionId: d.a, barrier: d.b });
        S.barrierFor = null; toast('Obrigado. Isso ajuda a melhorar as ações.'); await load(); break;
      }
      case 'code-open': S.codeOpen = true; render(); document.getElementById('code')?.focus(); break;
      case 'code-close': S.codeOpen = false; render(); break;
      case 'code-send': await attend(S.code); break;
      case 'rate': S.fb[d.a] = { ...(S.fb[d.a] || {}), rating: Number(d.n) }; render(); break;
      case 'fb-send': {
        await api('/api/feedback', { eid: S.eid, actionId: d.a, rating: S.fb[d.a].rating, again: d.y === '1' });
        toast('Obrigado pela avaliação.'); await load(); break;
      }
      case 'ans': S.answers[d.k] = Number(d.n); render(); break;
      case 'checkin-send': {
        if (S.sleepHours === '' || Number(S.sleepHours) < 0 || Number(S.sleepHours) > 24) return toast('Informe as horas de sono entre 0 e 24.');
        await api('/api/checkin', { eid: S.eid, answers: S.answers, sleepHours: Number(String(S.sleepHours).replace(',', '.')), feedbackText: S.dailyFeedback });
        S.justDone = true; S.answers = {}; S.sleepHours = ''; S.dailyFeedback = ''; toast('Check-in enviado. Obrigado.'); await load(); window.scrollTo(0, 0); break;
      }
      case 'health-report': {
        const w = window.open('', '_blank'); if (!w) return toast('Permita a abertura da janela para gerar o relatório.');
        const report = await api('/api/health-report?eid=' + encodeURIComponent(S.eid));
        if (!report.rows.length) { w.close(); return toast('Ainda não há check-ins para o relatório.'); }
        const headers = S.meta.items.map(i => `<th>${esc(i.short)}</th>`).join('');
        const lines = report.rows.map(x => `<tr><td>${new Date(x.ts).toLocaleDateString('pt-BR')}</td><td>${x.sleepHours} h</td>${S.meta.items.map(i => `<td>${esc(x.answers[i.key] ?? '—')}</td>`).join('')}<td>${esc(x.feedbackText || '—')}</td></tr>`);
        w.document.write(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Avaliação semanal de saúde · Pirâmide de Maslow</title><style>body{font:13px Arial,sans-serif;margin:28px;color:#24332c}h1{color:#255e49}table{width:100%;border-collapse:collapse;margin-top:20px;font-size:10px}td,th{padding:6px 4px;border-bottom:1px solid #ddd;text-align:center}td:first-child,th:first-child,td:last-child,th:last-child{text-align:left}.note{color:#53635b;font-size:12px}.feedback{max-width:260px;overflow-wrap:anywhere}@page{size:landscape;margin:12mm}@media print{button{display:none}}</style><h1>Avaliação semanal de saúde</h1><p>${esc(report.employee?.name || S.me.employee.name)} · ${esc(report.employee?.job || S.me.employee.job)} · ${esc(report.employee?.sector || S.me.employee.sector)} · ${esc(report.employee?.store || S.me.employee.store)}</p><p>Período: últimos sete dias · Emitido em ${new Date().toLocaleDateString('pt-BR')}</p><table><thead><tr><th>Data</th><th>Horas de sono</th>${headers}<th>Feedback diário</th></tr></thead><tbody>${lines.join('')}</tbody></table><p class="note">Escala de 1 a 5; respostas referentes às perguntas exibidas no check-in. Este relatório pessoal não é diagnóstico médico. Na impressão, escolha “Salvar como PDF”.</p><button onclick="window.print()">Imprimir / Salvar como PDF</button><script>window.onload=()=>window.print()<\/script></html>`);
        w.document.close(); localStorage.setItem('maslow_last_health_report_' + S.eid, String(Date.now())); S.me.canReport = false; render(); break;
      }
      case 'contact-open': S.contact.open = true; render(); break;
      case 'contact-close': S.contact = { kind: 'saude', contact: '', consent: false, open: false }; render(); break;
      case 'ck': S.contact.kind = d.k; render(); break;
      case 'contact-send': {
        await api('/api/contact', { eid: S.eid, kind: S.contact.kind, contact: S.contact.contact, consent: S.contact.consent });
        S.contact = { kind: 'saude', contact: '', consent: false, open: false };
        toast('Pedido enviado. A equipe de saúde vai entrar em contato.'); render(); break;
      }
      case 'vote': {
        const set = new Set(S.votes);
        if (set.has(d.t)) set.delete(d.t); else if (set.size < 3) set.add(d.t); else return toast('Escolha até 3 tipos.');
        S.votes = [...set]; render();
        await api('/api/votes', { eid: S.eid, types: S.votes }); break;
      }
    }
  } catch (err) {
    if (err.status === 409) { S.justDone = true; await load(); }
    if (S.accessMode === 'admin') { S.error = err.message; render(); }
    toast(err.message);
  }
});

if (S.eid && !params.has('space') && !params.has('presenca')) location.replace('painel.html');
else load();
})();
