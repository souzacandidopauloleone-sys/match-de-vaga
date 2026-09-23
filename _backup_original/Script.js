const STOPWORDS = new Set(['a','o','e','de','da','do','das','dos','em','para','com','um','uma','os','as','que','no','na','nos','nas','por','ao','aos','se','sua','seu','suas','seus','é','ou','como','mais','muito','este','esta','isso','também','já','pelo','pela','entre','sobre','até','sem','após','nas','nos','à','às','ele','ela','eles','elas','você','vocês','nós','são','ser','ter','tem','vai','foi','será','ser','the','and','of','to','in','for','with','a','an','is','are','on','at'].map(w=>w.toLowerCase()));

const HARD_SKILLS = ['liderança','gestão','gerenciamento','python','javascript','java','sql','excel','power bi','powerbi','comunicação','negociação','planejamento','estratégia','vendas','marketing','atendimento','logística','processos','qualidade','segurança','manutenção','operação','produção','indústria','engenharia','projeto','projetos','equipe','equipes','análise','dados','relatórios','kpi','indicadores','iso','pmp','scrum','agile','ágil','inglês','espanhol','supervisão','coordenação','treinamento','auditoria'];

function limparEExtrairPalavras(texto){
  return texto
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^\w\sáéíóúâêôãõçüà-]/g,' ')
    .split(/\s+/)
    .filter(w=>w.length>2 && !STOPWORDS.has(normalizar(w)));
}

function normalizar(w){
  return w.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
}

function analisar(){
  const perfilTxt = document.getElementById('perfil').value.trim();
  const vagaTxt = document.getElementById('vaga').value.trim();
  if(!perfilTxt || !vagaTxt){
    alert('Cole o texto do perfil e da vaga antes de analisar.');
    return;
  }

  const perfilPalavras = new Set(limparEExtrairPalavras(perfilTxt).map(normalizar));
  const vagaPalavrasRaw = limparEExtrairPalavras(vagaTxt);

  // frequência para achar termos mais relevantes da vaga
  const freq = {};
  vagaPalavrasRaw.forEach(w=>{
    const n = normalizar(w);
    freq[n] = (freq[n]||0)+1;
  });

  // candidatos: palavras que aparecem mais de uma vez OU são hard skills conhecidas
  let candidatos = Object.keys(freq).filter(w => freq[w] > 1 || HARD_SKILLS.some(s=>normalizar(s)===w));
  // fallback se poucas candidatas
  if(candidatos.length < 6){
    candidatos = Object.keys(freq).sort((a,b)=>freq[b]-freq[a]).slice(0,12);
  }
  candidatos = candidatos.slice(0, 16);

  const presentes = [];
  const faltando = [];
  candidatos.forEach(c=>{
    if(perfilPalavras.has(c)) presentes.push(c);
    else faltando.push(c);
  });

  const total = candidatos.length || 1;
  const pct = Math.round((presentes.length/total)*100);

  mostrarResultado(pct, presentes, faltando);
}

function mostrarResultado(pct, presentes, faltando){
  const res = document.getElementById('resultado');
  res.style.display = 'block';

  document.getElementById('scoreNum').textContent = pct + '%';
  const circumference = 327;
  const offset = circumference - (circumference * pct / 100);
  document.getElementById('ringFg').style.strokeDashoffset = offset;

  let headline, desc;
  if(pct < 40){
    headline = 'Precisa de ajustes significativos';
    desc = 'Seu perfil ainda fala pouco a língua dessa vaga. Vale revisar headline e sobre.';
  } else if(pct <= 70){
    headline = 'Bom começo, dá pra melhorar';
    desc = 'Você tem boa parte da base, mas faltam termos-chave importantes.';
  } else {
    headline = 'Excelente compatibilidade';
    desc = 'Seu perfil já conversa bem com essa vaga. Pequenos ajustes finais.';
  }
  document.getElementById('scoreHeadline').textContent = headline;
  document.getElementById('scoreDesc').textContent = desc;

  const presentUl = document.getElementById('kwPresent');
  const missingUl = document.getElementById('kwMissing');
  presentUl.innerHTML = '';
  missingUl.innerHTML = '';

  if(presentes.length === 0){
    presentUl.innerHTML = '<p class="empty-note">Nenhuma palavra-chave da vaga encontrada ainda.</p>';
  } else {
    presentes.forEach(p=>{
      const li = document.createElement('li');
      li.textContent = p;
      presentUl.appendChild(li);
    });
  }

  if(faltando.length === 0){
    missingUl.innerHTML = '<p class="empty-note">Nenhuma lacuna encontrada — ótimo sinal.</p>';
  } else {
    faltando.forEach(f=>{
      const li = document.createElement('li');
      li.textContent = f;
      missingUl.appendChild(li);
    });
  }

  const sug = document.getElementById('sugestoes');
  sug.innerHTML = '';
  const sugestoes = [];
  if(faltando.length > 0){
    sugestoes.push('Inclua os termos "' + faltando.slice(0,3).join('", "') + '" no seu "Sobre" ou na experiência mais recente.');
  }
  if(pct < 40){
    sugestoes.push('Reescreva sua headline usando o mesmo vocabulário da vaga, não só o seu cargo atual.');
  }
  if(pct >= 40 && pct <= 70){
    sugestoes.push('Adicione 1-2 resultados quantificados (números, %, prazos) usando os termos que faltam.');
  }
  if(pct > 70){
    sugestoes.push('Revise se as palavras-chave aparecem também nas primeiras linhas do "Sobre" — isso pesa mais na busca do recrutador.');
  }
  sugestoes.push('Peça para alguém da área ler seu perfil e apontar o que soa genérico.');

  sugestoes.forEach(s=>{
    const li = document.createElement('li');
    li.textContent = s;
    sug.appendChild(li);
  });

  res.scrollIntoView({behavior:'smooth', block:'start'});
}

function reiniciar(){
  document.getElementById('perfil').value = '';
  document.getElementById('vaga').value = '';
  document.getElementById('resultado').style.display = 'none';
  window.scrollTo({top:0, behavior:'smooth'});
}