// ===== Match de Vaga — lógica de análise =====

// Tira acentos e deixa minúsculo ("Gestão" -> "gestao")
function semAcento(t) {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// Palavras comuns que não dizem nada sobre a vaga (já sem acento)
const STOPWORDS = new Set([
  // português
  'a','o','e','de','da','do','das','dos','em','para','com','um','uma','os','as','que','no','na','nos','nas',
  'por','ao','aos','se','sua','seu','suas','seus','ou','como','mais','muito','muita','este','esta','isso',
  'tambem','ja','pelo','pela','pelos','pelas','entre','sobre','ate','sem','apos','ele','ela','eles','elas',
  'voce','voces','sao','ser','ter','tem','vai','foi','sera','serao','nossa','nosso','nossos','nossas',
  'essa','esse','esses','essas','desta','deste','nesta','neste','nessa','nesse','aqui','onde','quando','qual',
  'quais','cada','todo','toda','todos','todas','outro','outra','outros','outras','bem','bom','boa','bons',
  'boas','alem','atraves','junto','demais','etc','seja','sejam','estar','estamos','sendo','possui','possuir',
  'forma','parte','dia','dias','ano','anos','meses','mes','nao','sim','pois','porque','mas','num','numa',
  // "enchimento" típico de anúncio de vaga
  'vaga','vagas','empresa','empresas','area','areas','experiencia','experiencias','conhecimento','conhecimentos',
  'requisito','requisitos','atividade','atividades','responsabilidade','responsabilidades','desejavel',
  'desejaveis','diferencial','diferenciais','beneficio','beneficios','candidato','candidata','candidatos',
  'profissional','profissionais','buscamos','procuramos','oportunidade','oportunidades','local','regime',
  'clt','salario','horario','nivel','completo','completa','cursando','superior','formacao','principais',
  'principal','seguintes','informacoes','descricao','necessario','necessaria','obrigatorio','obrigatoria',
  'preferencialmente','realizar','atuar','atuacao','garantir','fazer','apoiar','apoio','trabalho','trabalhar',
  'junte','venha','faca','time','cargo','funcao','perfil','buscando','contratacao','modelo','presencial',
  // inglês
  'the','and','of','to','in','for','with','an','is','are','on','at','be','as','by','or','from','this','that',
  'who','will','you','your','our','we','have','has','experience','years','job','role','company','work'
]);

// Habilidades e termos técnicos que valem mais no cálculo (escreva normal, com acento)
const HARD_SKILLS = [
  'liderança','gestão','python','javascript','java','sql','excel','power bi','comunicação','negociação',
  'planejamento','estratégia','vendas','marketing','atendimento','logística','processos','qualidade',
  'segurança','manutenção','operação','produção','indústria','engenharia','projetos','equipes','análise',
  'dados','relatórios','kpi','indicadores','iso','pmp','scrum','agile','inglês','espanhol','supervisão',
  'coordenação','treinamento','auditoria','sap','autocad','lean','kaizen','5s','pdca','masp','fmea','tpm',
  'pcm','six sigma','lean manufacturing','melhoria contínua','gestão de pessoas','nr-10','nr-12','nr-33',
  'nr-35','html','css','react','node.js','typescript','c#','git','api','bi','dax','powerpoint','crm',
  'atendimento ao cliente','banco de dados','machine learning','rh','ti','ux','ui','sustentabilidade',
  'controle','custos','orçamento','compras','contratos','pcp'
];

// Palavras diferentes que significam a mesma coisa (raiz -> raiz)
const SINONIMOS = {
  'gerenciamento': 'gestao', 'gerencia': 'gestao', 'powerbi': 'power bi', 'english': 'ingle',
  'agil': 'agile', 'lider': 'lideranca', 'supervisionar': 'supervisao', 'coordenar': 'coordenacao',
  'planejar': 'planejamento', 'analisar': 'analise', 'treinar': 'treinamento', 'kpi': 'indicador'
};

// Reduz a palavra à "raiz" para que plural e singular batam (projetos = projeto, gestões = gestão)
function raiz(palavra) {
  let w = semAcento(palavra);
  if (w.includes(' ') || w.length <= 3) return SINONIMOS[w] || w;
  if (w.endsWith('coes')) w = w.slice(0, -4) + 'cao';
  else if (w.endsWith('oes')) w = w.slice(0, -3) + 'ao';
  else if (w.endsWith('ais')) w = w.slice(0, -3) + 'al';
  else if (w.endsWith('res') || w.endsWith('zes')) w = w.slice(0, -2);
  else if (w.endsWith('s') && !w.endsWith('ss')) w = w.slice(0, -1);
  return SINONIMOS[w] || w;
}

const SKILL_UNICA = new Set(HARD_SKILLS.filter(s => !s.includes(' ')).map(raiz));
const SKILL_FRASE = HARD_SKILLS.filter(s => s.includes(' '))
  .map(s => ({ texto: s, chave: semAcento(s) }));

// Quebra o texto em palavras, mantendo coisas como "c#", "node.js", "nr-10"
function tokenizar(texto) {
  const brutos = texto.toLowerCase().match(/[a-z0-9à-öø-ÿ][a-z0-9à-öø-ÿ+#.\-]*/gi) || [];
  return brutos
    .map(t => t.replace(/[.\-]+$/, ''))               // tira ponto/hífen do final
    .filter(t => {
      const s = semAcento(t);
      if (STOPWORDS.has(s)) return false;
      if (/^\d+$/.test(s)) return false;                // números soltos
      return s.length > 2 || SKILL_UNICA.has(raiz(t)); // palavras curtas só se forem skill (bi, ti, 5s)
    });
}

// Texto "achatado" para procurar expressões de 2+ palavras
function textoPlano(texto) {
  return (' ' + semAcento(texto).replace(/powerbi/g, 'power bi').replace(/[^a-z0-9#+.\-]+/g, ' ') + ' ')
    .replace(/[.\-]+ /g, ' '); // "bi." no fim da frase vira "bi"
}

function extrairTermos(texto) {
  const plano = textoPlano(texto);
  const termos = new Map(); // raiz -> { rotulo, freq, skill }

  tokenizar(texto).forEach(t => {
    const r = raiz(t);
    const item = termos.get(r);
    if (item) item.freq++;
    else termos.set(r, { rotulo: t, freq: 1, skill: SKILL_UNICA.has(r) });
  });

  SKILL_FRASE.forEach(({ texto: rotulo, chave }) => {
    const ocorrencias = plano.split(' ' + chave + ' ').length - 1;
    if (ocorrencias > 0) {
      termos.set(raiz(chave), { rotulo, freq: ocorrencias, skill: true });
      // as palavras da expressão não contam de novo sozinhas ("lean manufacturing" não duplica "lean")
      chave.split(' ').forEach(p => {
        const item = termos.get(raiz(p));
        if (item) { item.freq -= ocorrencias; if (item.freq <= 0) termos.delete(raiz(p)); }
      });
    }
  });

  return termos;
}

function mostrarErro(msg) {
  const el = document.getElementById('erro');
  el.textContent = msg;
  el.hidden = !msg;
}

function analisar() {
  const perfilTxt = document.getElementById('perfil').value.trim();
  const vagaTxt = document.getElementById('vaga').value.trim();
  if (!perfilTxt || !vagaTxt) {
    mostrarErro('Cole o texto do perfil e da vaga antes de analisar.');
    document.getElementById(!perfilTxt ? 'perfil' : 'vaga').focus();
    return;
  }
  mostrarErro('');
  salvarPerfil();

  const resultado = calcularMatch(perfilTxt, vagaTxt);
  mostrarResultado(resultado.pct, resultado.presentes, resultado.faltando);
}

// Cálculo puro (sem tela) — fácil de testar
function calcularMatch(perfilTxt, vagaTxt) {
  const termosVaga = extrairTermos(vagaTxt);
  const termosPerfil = extrairTermos(perfilTxt);

  // Peso: skill técnica vale 3 (até 5 se repetir); termo comum que se repete vale pela frequência (máx. 3)
  const candidatos = [...termosVaga.entries()]
    .map(([chave, t]) => ({ chave, ...t, peso: t.skill ? 3 + Math.min(t.freq - 1, 2) : Math.min(t.freq, 3) }))
    .filter(t => t.skill || t.freq > 1);

  // Se a vaga for curta e quase nada se repetir, completa com as palavras mais frequentes
  if (candidatos.length < 6) {
    [...termosVaga.entries()]
      .filter(([chave]) => !candidatos.some(c => c.chave === chave))
      .sort((a, b) => b[1].freq - a[1].freq)
      .slice(0, 8 - candidatos.length)
      .forEach(([chave, t]) => candidatos.push({ chave, ...t, peso: 1 }));
  }

  candidatos.sort((a, b) => b.peso - a.peso || b.freq - a.freq);
  const selecionados = candidatos.slice(0, 20);

  const presentes = [], faltando = [];
  let pesoTotal = 0, pesoAchado = 0;
  selecionados.forEach(c => {
    pesoTotal += c.peso;
    if (termosPerfil.has(c.chave)) { presentes.push(c); pesoAchado += c.peso; }
    else faltando.push(c);
  });

  const pct = pesoTotal ? Math.round((pesoAchado / pesoTotal) * 100) : 0;
  return { pct, presentes, faltando };
}

function preencherLista(ul, itens, vazio) {
  ul.innerHTML = '';
  if (itens.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty-note';
    li.textContent = vazio;
    ul.appendChild(li);
    return;
  }
  itens.forEach(i => {
    const li = document.createElement('li');
    li.textContent = i.rotulo;
    if (i.skill) { li.classList.add('skill'); li.title = 'Habilidade-chave (peso maior)'; }
    ul.appendChild(li);
  });
}

function mostrarResultado(pct, presentes, faltando) {
  const res = document.getElementById('resultado');
  res.hidden = false;

  document.getElementById('scoreNum').textContent = pct + '%';
  const ring = document.getElementById('ringFg');
  const circunferencia = 327;
  ring.style.stroke = pct < 40 ? 'var(--red)' : pct <= 70 ? 'var(--gold)' : 'var(--green)';
  ring.style.strokeDashoffset = circunferencia;
  requestAnimationFrame(() => {
    ring.style.strokeDashoffset = circunferencia - (circunferencia * pct / 100);
  });

  let headline, desc;
  if (pct < 40) {
    headline = 'Precisa de ajustes significativos';
    desc = 'Seu perfil ainda fala pouco a língua dessa vaga. Vale revisar headline e sobre.';
  } else if (pct <= 70) {
    headline = 'Bom começo, dá pra melhorar';
    desc = 'Você tem boa parte da base, mas faltam termos-chave importantes.';
  } else {
    headline = 'Excelente compatibilidade';
    desc = 'Seu perfil já conversa bem com essa vaga. Pequenos ajustes finais.';
  }
  document.getElementById('scoreHeadline').textContent = headline;
  document.getElementById('scoreDesc').textContent = desc;

  preencherLista(document.getElementById('kwPresent'), presentes, 'Nenhuma palavra-chave da vaga encontrada ainda.');
  preencherLista(document.getElementById('kwMissing'), faltando, 'Nenhuma lacuna encontrada — ótimo sinal.');

  const sugestoes = [];
  const skillsFaltando = faltando.filter(f => f.skill);
  const prioridade = (skillsFaltando.length ? skillsFaltando : faltando).slice(0, 3).map(f => f.rotulo);
  if (prioridade.length) {
    sugestoes.push('Prioridade: inclua "' + prioridade.join('", "') + '" no seu "Sobre" ou na experiência mais recente — só se for verdade para você.');
  }
  if (pct < 40) sugestoes.push('Reescreva sua headline usando o mesmo vocabulário da vaga, não só o seu cargo atual.');
  if (pct >= 40 && pct <= 70) sugestoes.push('Adicione 1-2 resultados quantificados (números, %, prazos) usando os termos que faltam.');
  if (pct > 70) sugestoes.push('Revise se as palavras-chave aparecem também nas primeiras linhas do "Sobre" — isso pesa mais na busca do recrutador.');
  if (skillsFaltando.length) sugestoes.push('Adicione as habilidades que faltam também na seção "Competências" do LinkedIn — ela entra na busca de recrutadores.');
  sugestoes.push('Peça para alguém da área ler seu perfil e apontar o que soa genérico.');

  const sug = document.getElementById('sugestoes');
  sug.innerHTML = '';
  sugestoes.forEach(s => {
    const li = document.createElement('li');
    li.textContent = s;
    sug.appendChild(li);
  });

  res.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// "Analisar outra vaga": mantém o perfil (você reaproveita) e limpa só a vaga
function reiniciar() {
  document.getElementById('vaga').value = '';
  document.getElementById('resultado').hidden = true;
  mostrarErro('');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('vaga').focus();
}

// Guarda o perfil no navegador para não precisar colar toda vez
const CHAVE_PERFIL = 'matchVaga.perfil';
function salvarPerfil() {
  try { localStorage.setItem(CHAVE_PERFIL, document.getElementById('perfil').value); } catch (e) {}
}
function carregarPerfil() {
  try {
    const salvo = localStorage.getItem(CHAVE_PERFIL);
    if (salvo) document.getElementById('perfil').value = salvo;
  } catch (e) {}
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    carregarPerfil();
    document.getElementById('btnAnalisar').addEventListener('click', analisar);
    document.getElementById('btnReiniciar').addEventListener('click', reiniciar);
    // Ctrl+Enter analisa direto de dentro das caixas de texto
    ['perfil', 'vaga'].forEach(id => {
      document.getElementById(id).addEventListener('keydown', e => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) analisar();
      });
    });
  });
}
