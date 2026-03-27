(function (global) {
  const feriados = [
    "2024-01-01", "2024-02-12", "2024-02-13", "2024-02-14", "2024-03-28", "2024-03-29", "2024-04-21", "2024-05-01", "2024-05-30", "2024-05-31", "2024-08-15", "2024-08-16", "2024-09-07", "2024-10-12", "2024-10-14", "2024-10-15", "2024-10-16", "2024-10-28", "2024-11-02", "2024-11-15", "2024-11-20", "2024-12-08", "2024-12-20", "2024-12-21", "2024-12-22", "2024-12-23", "2024-12-24", "2024-12-25", "2024-12-26", "2024-12-27", "2024-12-28", "2024-12-29", "2024-12-30", "2024-12-31", "2025-01-01", "2025-01-02", "2025-01-03", "2025-01-04", "2025-01-05", "2025-01-06", "2025-01-07", "2025-01-08", "2025-01-09", "2025-01-10", "2025-01-11", "2025-01-12", "2025-01-13", "2025-01-14", "2025-01-15", "2025-01-16", "2025-01-17", "2025-01-18", "2025-01-19", "2025-01-20", "2025-03-03", "2025-03-04", "2025-03-05", "2025-04-17", "2025-04-18", "2025-04-21", "2025-05-01", "2025-05-02", "2025-06-19", "2025-06-20", "2025-08-15", "2025-09-07", "2025-10-12", "2025-10-13", "2025-10-27", "2025-10-28", "2025-11-02", "2025-11-15", "2025-11-20", "2025-11-21", "2025-12-08", "2025-12-20", "2025-12-21", "2025-12-22", "2025-12-23", "2025-12-24", "2025-12-25", "2025-12-26", "2025-12-27", "2025-12-28", "2025-12-29", "2025-12-30", "2025-12-31", "2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04", "2026-01-05", "2026-01-06", "2026-01-07", "2026-01-08", "2026-01-09", "2026-01-10", "2026-01-11", "2026-01-12", "2026-01-13", "2026-01-14", "2026-01-15", "2026-01-16", "2026-01-17", "2026-01-18", "2026-01-19", "2026-01-20", "2026-02-16", "2026-02-17", "2026-02-18", "2026-04-02", "2026-04-03", "2026-04-20", "2026-04-21", "2026-05-01", "2026-06-04", "2026-06-05", "2026-09-07", "2026-10-12", "2026-10-26", "2026-10-30", "2026-11-02", "2026-11-20", "2026-12-07", "2026-12-08", "2026-12-20", "2026-12-21", "2026-12-22", "2026-12-23", "2026-12-24", "2026-12-25", "2026-12-26", "2026-12-27", "2026-12-28", "2026-12-29", "2026-12-30", "2026-12-31", "2027-01-01", "2027-01-02", "2027-01-03", "2027-01-04", "2027-01-05", "2027-01-06", "2027-01-07", "2027-01-08", "2027-01-09", "2027-01-10", "2027-01-11", "2027-01-12", "2027-01-13", "2027-01-14", "2027-01-15", "2027-01-16", "2027-01-17", "2027-01-18", "2027-01-19", "2027-01-20"
  ];

  const DESTINATARIOS_DOBRO = new Set(['mp', 'defensoria', 'fazenda', 'autarquia', 'fundacao_publica']);

  function formatDateKey(data) {
    const y = data.getFullYear();
    const m = String(data.getMonth() + 1).padStart(2, '0');
    const d = String(data.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatDatePtBr(data) {
    return data.toLocaleDateString('pt-BR');
  }

  function parseDateFromInput(value) {
    if (!value) return null;
    const [ano, mes, dia] = String(value).trim().slice(0, 10).split('-').map((n) => Number.parseInt(n, 10));
    if (!ano || !mes || !dia) return null;

    const parsed = new Date(ano, mes - 1, dia);
    if (parsed.getFullYear() !== ano || parsed.getMonth() !== mes - 1 || parsed.getDate() !== dia) {
      return null;
    }

    return parsed;
  }

  function parseDateTimeFromInput(value) {
    if (!value) return null;
    const [dataParte, horaParte] = String(value).trim().split('T');
    const data = parseDateFromInput(dataParte);
    if (!data || !horaParte) return null;

    const [hora, minuto] = horaParte.split(':').map((n) => Number.parseInt(n, 10));
    if (!Number.isInteger(hora) || !Number.isInteger(minuto) || hora < 0 || hora > 23 || minuto < 0 || minuto > 59) {
      return null;
    }

    data.setHours(hora, minuto, 0, 0);
    return data;
  }

  function addDays(data, quantidade) {
    const copia = new Date(data);
    copia.setDate(copia.getDate() + quantidade);
    return copia;
  }

  // Regra-base do CPC art. 219: prazos processuais em dias úteis, com exclusão de fins de semana e feriados locais cadastrados.
  function isDiaUtil(data) {
    const diaSemana = data.getDay();
    return diaSemana !== 0 && diaSemana !== 6 && !feriados.includes(formatDateKey(data));
  }

  // Retorna o próximo dia útil após a data informada.
  function proximoDiaUtil(dataBase) {
    let cursor = addDays(dataBase, 1);
    while (!isDiaUtil(cursor)) {
      cursor = addDays(cursor, 1);
    }
    return cursor;
  }

  // Soma dias úteis considerando o dia de início como 1º dia do prazo.
  function somarDiasUteis(dataInicio, quantidadeDiasUteis) {
    let restantes = quantidadeDiasUteis;
    let cursor = new Date(dataInicio);

    while (restantes > 1) {
      cursor = proximoDiaUtil(cursor);
      restantes -= 1;
    }

    return cursor;
  }

  function adicionarDiasCorridos(dataBase, quantidade) {
    return addDays(dataBase, quantidade);
  }

  function adicionarDiasUteisApos(dataBase, quantidade) {
    let cursor = new Date(dataBase);
    let contagem = 0;

    while (contagem < quantidade) {
      cursor = proximoDiaUtil(cursor);
      contagem += 1;
    }

    return cursor;
  }

  function calcularPublicacaoDJEN(dataDisponibilizacao) {
    return proximoDiaUtil(dataDisponibilizacao);
  }

  function calcularInicioPrazo(dataPublicacao) {
    return proximoDiaUtil(dataPublicacao);
  }

  function contarPrazoDiasUteis(dataInicio, prazoDias) {
    return somarDiasUteis(dataInicio, prazoDias);
  }

  function estimarDisponibilizacaoPorEnvio(dataEnvio) {
    const diaUtil = isDiaUtil(dataEnvio);
    const ateDezessete = dataEnvio.getHours() < 17 || (dataEnvio.getHours() === 17 && dataEnvio.getMinutes() === 0);
    const estimativaSimples = diaUtil && ateDezessete;
    const disponibilizacaoEstimada = estimativaSimples
      ? proximoDiaUtil(dataEnvio)
      : proximoDiaUtil(proximoDiaUtil(dataEnvio));

    return {
      disponibilizacaoEstimada,
      statusCiencia: 'estimado',
      exigeAvisoConferencia: !estimativaSimples,
      observacaoEstimativa: estimativaSimples
        ? 'Estimativa com base na Resolução TJPA nº 14/2021 (envio em dia útil até 17h).'
        : 'Envio após 17h ou em dia não útil: estimativa conservadora para o próximo ciclo útil possível.'
    };
  }

  // Fluxo clássico DJEN: disponibilização -> publicação (dia útil seguinte) -> início do prazo (dia útil seguinte à publicação).
  function calcularDJEN({ dataBase, prazoDias }) {
    const disponibilizacao = new Date(dataBase);
    const publicacao = calcularPublicacaoDJEN(disponibilizacao);
    const inicioPrazo = calcularInicioPrazo(publicacao);
    const dataFinal = contarPrazoDiasUteis(inicioPrazo, prazoDias);

    return {
      statusCiencia: 'confirmada',
      marcoLegal: 'Lei 11.419/2006, art. 4º, §§3º e 4º; CPC, arts. 219 e 224',
      disponibilizacao,
      publicacao,
      inicioPrazo,
      dataFinal,
      observacoes: []
    };
  }

  function calcularDJENEstimado({ dataEnvio, prazoDias }) {
    const estimativa = estimarDisponibilizacaoPorEnvio(dataEnvio);
    const publicacaoEstimada = calcularPublicacaoDJEN(estimativa.disponibilizacaoEstimada);
    const inicioPrazoEstimado = calcularInicioPrazo(publicacaoEstimada);
    const dataFinal = contarPrazoDiasUteis(inicioPrazoEstimado, prazoDias);
    const observacoes = [
      estimativa.observacaoEstimativa,
      'Este cálculo é uma estimativa prévia. Confira a data de disponibilização no DJEN/CNJ assim que a publicação constar no sistema.'
    ];

    return {
      statusCiencia: 'estimado',
      marcoLegal: 'Lei 11.419/2006, art. 4º, §§3º e 4º; CPC, arts. 219 e 224; Resolução TJPA nº 14/2021',
      envio: new Date(dataEnvio),
      disponibilizacaoEstimada: estimativa.disponibilizacaoEstimada,
      publicacao: publicacaoEstimada,
      inicioPrazo: inicioPrazoEstimado,
      dataFinal,
      exigeAvisoConferencia: estimativa.exigeAvisoConferencia,
      observacoes
    };
  }

  // Intimação pessoal no Domicílio: ciência confirmada inicia no próximo dia útil; sem consulta gera ciência automática em 10 dias corridos.
  function calcularDomicilioIntimacao({ dataBase, situacaoCiencia }) {
    if (situacaoCiencia === 'bloqueado') {
      return {
        bloqueado: true,
        statusCiencia: 'bloqueado',
        marcoLegal: 'CPC, art. 183/186/180 e regras do Domicílio Judicial Eletrônico',
        observacoes: ['Caso depende de conferência manual da comunicação no sistema do tribunal.']
      };
    }

    if (situacaoCiencia === 'estimativa') {
      const cienciaAutomatica = adicionarDiasCorridos(dataBase, 10);
      const inicioPrazo = proximoDiaUtil(cienciaAutomatica);
      return {
        statusCiencia: 'estimativa',
        marcoLegal: 'Regra estimada do Domicílio Judicial Eletrônico (10 dias corridos para ciência automática)',
        cienciaAutomatica,
        inicioPrazo,
        observacoes: ['Estimativa: confirmar no sistema quando houver registro oficial da ciência.']
      };
    }

    if (situacaoCiencia === 'sem_consulta') {
      const cienciaAutomatica = adicionarDiasCorridos(dataBase, 10);
      const inicioPrazo = proximoDiaUtil(cienciaAutomatica);
      return {
        statusCiencia: 'automatica',
        marcoLegal: 'Domicílio Judicial Eletrônico: ciência automática após 10 dias corridos sem consulta',
        cienciaAutomatica,
        inicioPrazo,
        observacoes: ['Os 10 dias de ciência automática são corridos (não seguem o art. 219 do CPC).']
      };
    }

    const inicioPrazo = proximoDiaUtil(dataBase);
    return {
      statusCiencia: 'confirmada',
      marcoLegal: 'Domicílio Judicial Eletrônico: intimação pessoal com início no dia útil seguinte à consulta',
      cienciaConfirmada: dataBase,
      inicioPrazo,
      observacoes: []
    };
  }

  // Citação no Domicílio: confirmação inicia no 5º dia útil seguinte; PJ de direito público sem consulta em 10 dias corridos admite citação automática.
  function calcularDomicilioCitacao({ dataBase, situacaoCiencia, destinatario }) {
    if (situacaoCiencia === 'bloqueado') {
      return {
        bloqueado: true,
        statusCiencia: 'bloqueado',
        marcoLegal: 'Regras de citação eletrônica no Domicílio Judicial Eletrônico',
        observacoes: ['Cenário bloqueado: necessário conferir o evento exato no sistema.']
      };
    }

    if (situacaoCiencia === 'confirmada') {
      const inicioPrazo = adicionarDiasUteisApos(dataBase, 5);
      return {
        statusCiencia: 'confirmada',
        marcoLegal: 'Domicílio Judicial Eletrônico: resposta inicia no 5º dia útil após confirmação da citação',
        citacaoConfirmada: dataBase,
        inicioPrazo,
        observacoes: []
      };
    }

    const pessoaJuridicaDireitoPublico = ['fazenda', 'autarquia', 'fundacao_publica'].includes(destinatario);
    if (situacaoCiencia === 'sem_consulta' && pessoaJuridicaDireitoPublico) {
      const citacaoAutomatica = adicionarDiasCorridos(dataBase, 10);
      const inicioPrazo = proximoDiaUtil(citacaoAutomatica);
      return {
        statusCiencia: 'automatica',
        marcoLegal: 'Citação automática da PJ de direito público após 10 dias corridos sem consulta',
        citacaoAutomatica,
        inicioPrazo,
        observacoes: ['Sem consulta em 10 dias corridos: citação automática para PJ de direito público.']
      };
    }

    if (situacaoCiencia === 'estimativa') {
      const citacaoEstimada = adicionarDiasCorridos(dataBase, 10);
      const inicioPrazo = proximoDiaUtil(citacaoEstimada);
      return {
        statusCiencia: 'estimativa',
        marcoLegal: 'Estimativa para citação no Domicílio Judicial Eletrônico',
        citacaoAutomatica: citacaoEstimada,
        inicioPrazo,
        observacoes: ['Estimativa: o marco oficial depende do evento confirmado no sistema.']
      };
    }

    return {
      bloqueado: true,
      statusCiencia: 'bloqueado',
      marcoLegal: 'Regras de citação no Domicílio Judicial Eletrônico',
      observacoes: ['Sem confirmação válida, o início depende de conferência manual.']
    };
  }

  function calcularExecucaoContraFazenda({ tema, destinatario }) {
    if (tema === 'execucao_titulo' && destinatario === 'fazenda') {
      return {
        temPrazoProprio: true,
        prazoDias: 30,
        marcoLegal: 'CPC, art. 910 (embargos da Fazenda Pública em 30 dias)',
        observacao: 'Prazo próprio aplicado: não há nova dobra sobre os 30 dias.'
      };
    }

    return { temPrazoProprio: false };
  }

  // Detecta cenários com prazo próprio legal e sinais de cautela por tema.
  function verificarPrazoProprio({ tema, naturezaPrazo, destinatario }) {
    const observacoes = [];
    let dependeConferencia = false;

    if (tema === 'registros_publicos') {
      observacoes.push('Registros públicos: normalmente prevalece prazo de lei especial.');
      if (naturezaPrazo !== 'comum') dependeConferencia = true;
    }

    if (tema === 'recuperacao_judicial' || tema === 'falencia') {
      observacoes.push('Recuperação judicial/falência: verificar prazos próprios da Lei 11.101/2005.');
      if (naturezaPrazo !== 'comum') dependeConferencia = true;
    }

    if (tema === 'busca_apreensao_fiduciaria') {
      observacoes.push('Busca e apreensão fiduciária: normalmente segue DL 911/1969.');
      dependeConferencia = true;
    }

    if (tema === 'acidente_trabalho' && destinatario === 'autarquia') {
      observacoes.push('Acidente de trabalho com autarquia: em regra admite prazo em dobro, salvo prazo próprio.');
    }

    const execucaoFazenda = calcularExecucaoContraFazenda({ tema, destinatario });
    if (execucaoFazenda.temPrazoProprio) {
      return {
        prazoProprio: true,
        prazoDias: execucaoFazenda.prazoDias,
        marcoLegal: execucaoFazenda.marcoLegal,
        observacoes: [...observacoes, execucaoFazenda.observacao],
        dependeConferencia
      };
    }

    if (naturezaPrazo === 'proprio_lei_especial') {
      return {
        prazoProprio: true,
        prazoDias: null,
        marcoLegal: 'Prazo próprio indicado pelo usuário (lei especial)',
        observacoes,
        dependeConferencia
      };
    }

    if (naturezaPrazo === 'nao_sei') {
      dependeConferencia = true;
      observacoes.push('Natureza do prazo marcada como “não sei”: recomenda-se conferência da lei especial aplicável.');
    }

    return {
      prazoProprio: false,
      observacoes,
      dependeConferencia
    };
  }

  // Aplica prazo em dobro apenas para sujeitos com prerrogativa, em prazo processual e sem prazo próprio legal.
  function aplicarPrazoEmDobroSeCabivel({ prazoDias, destinatario, naturezaPrazo, prazoProprio, tema }) {
    if (destinatario === 'defensor_dativo') {
      return {
        prazoDiasFinal: prazoDias,
        regimePrazo: 'simples',
        aviso: 'Defensor dativo não possui prazo em dobro.'
      };
    }

    if (prazoProprio || naturezaPrazo !== 'comum') {
      return {
        prazoDiasFinal: prazoDias,
        regimePrazo: prazoProprio ? 'proprio' : 'simples',
        aviso: prazoProprio ? 'Prazo próprio de lei especial.' : ''
      };
    }

    if (tema === 'registros_publicos' || tema === 'recuperacao_judicial' || tema === 'falencia' || tema === 'busca_apreensao_fiduciaria') {
      return {
        prazoDiasFinal: prazoDias,
        regimePrazo: 'simples',
        aviso: 'Depende de conferência: tema com possível prazo especial.'
      };
    }

    if (DESTINATARIOS_DOBRO.has(destinatario)) {
      return {
        prazoDiasFinal: prazoDias * 2,
        regimePrazo: 'dobro',
        aviso: 'Prazo em dobro aplicado.'
      };
    }

    return {
      prazoDiasFinal: prazoDias,
      regimePrazo: 'simples',
      aviso: ''
    };
  }

  function calcularDiasDecorridosAteHoje(dataInicio, hojeRef) {
    if (!dataInicio) return 0;
    let dias = 0;
    let cursor = new Date(dataInicio);
    const hoje = new Date(hojeRef);
    hoje.setHours(0, 0, 0, 0);

    while (cursor <= hoje) {
      if (isDiaUtil(cursor)) dias += 1;
      cursor = proximoDiaUtil(cursor);
    }

    return dias;
  }

  function montarResumoResultado({ fluxoComunicacao, prazoInfo, verificacaoTema }) {
    const observacoes = [...(fluxoComunicacao.observacoes || []), ...(verificacaoTema.observacoes || [])].filter(Boolean);
    if (prazoInfo.aviso) observacoes.unshift(prazoInfo.aviso);

    return {
      statusCiencia: fluxoComunicacao.statusCiencia,
      marcoLegal: verificacaoTema.prazoProprio && verificacaoTema.marcoLegal
        ? `${fluxoComunicacao.marcoLegal}; ${verificacaoTema.marcoLegal}`
        : fluxoComunicacao.marcoLegal,
      regimePrazo: prazoInfo.regimePrazo,
      dataInicio: fluxoComunicacao.inicioPrazo,
      dataFinal: fluxoComunicacao.dataFinal,
      observacoes,
      dependeConferencia: fluxoComunicacao.bloqueado || verificacaoTema.dependeConferencia,
      bloqueado: Boolean(fluxoComunicacao.bloqueado)
    };
  }

  function validarCamposObrigatorios(entrada) {
    const obrigatorios = [
      ['canal', 'Selecione o canal de comunicação.'],
      ['tipoAto', 'Selecione o tipo do ato.'],
      ['destinatario', 'Selecione o destinatário.'],
      ['tema', 'Selecione o tema do procedimento.'],
      ['naturezaPrazo', 'Selecione a natureza do prazo.'],
      ['dataBase', 'Informe a data-base.']
    ];

    for (const [campo, mensagem] of obrigatorios) {
      if (!entrada[campo]) {
        return { ok: false, erro: mensagem };
      }
    }

    const prazoConcedido = Number.parseInt(entrada.prazoConcedido, 10);
    if (!Number.isInteger(prazoConcedido) || prazoConcedido <= 0) {
      return { ok: false, erro: 'Informe um prazo concedido válido (inteiro maior que zero).' };
    }

    if (entrada.canal === 'djen_envio') {
      const dataEnvio = parseDateTimeFromInput(entrada.dataBase);
      if (!dataEnvio) return { ok: false, erro: 'Data/hora de envio inválida. Use o formato do campo.' };
      return { ok: true, prazoConcedido, dataEnvio };
    }

    const dataBase = parseDateFromInput(entrada.dataBase);
    if (!dataBase) return { ok: false, erro: 'Data-base inválida. Use o formato de data do campo.' };

    return { ok: true, prazoConcedido, dataBase };
  }

  function calcularPrazoDetalhado(entrada, hojeRef = new Date()) {
    const validacao = validarCamposObrigatorios(entrada);
    if (!validacao.ok) return validacao;

    const { prazoConcedido, dataBase, dataEnvio } = validacao;

    let fluxoComunicacao;
    if (entrada.canal === 'djen') {
      fluxoComunicacao = calcularDJEN({ dataBase, prazoDias: prazoConcedido });
    } else if (entrada.canal === 'djen_envio') {
      fluxoComunicacao = calcularDJENEstimado({ dataEnvio, prazoDias: prazoConcedido });
    } else if (entrada.canal === 'domicilio') {
      fluxoComunicacao = entrada.tipoAto === 'citacao_eletronica'
        ? calcularDomicilioCitacao({ dataBase, situacaoCiencia: entrada.situacaoCiencia, destinatario: entrada.destinatario })
        : calcularDomicilioIntimacao({ dataBase, situacaoCiencia: entrada.situacaoCiencia });
    } else {
      fluxoComunicacao = {
        statusCiencia: 'confirmada',
        marcoLegal: 'CPC, arts. 219 e 224 (regra geral de prazo processual)',
        inicioPrazo: proximoDiaUtil(dataBase),
        observacoes: []
      };
    }

    const verificacaoTema = verificarPrazoProprio({
      tema: entrada.tema,
      naturezaPrazo: entrada.naturezaPrazo,
      destinatario: entrada.destinatario
    });

    let prazoBase = prazoConcedido;
    if (verificacaoTema.prazoProprio && Number.isInteger(verificacaoTema.prazoDias)) {
      prazoBase = verificacaoTema.prazoDias;
    }

    const prazoInfo = aplicarPrazoEmDobroSeCabivel({
      prazoDias: prazoBase,
      destinatario: entrada.destinatario,
      naturezaPrazo: entrada.naturezaPrazo,
      prazoProprio: verificacaoTema.prazoProprio,
      tema: entrada.tema
    });

    if (fluxoComunicacao.inicioPrazo && !fluxoComunicacao.dataFinal && !fluxoComunicacao.bloqueado) {
      fluxoComunicacao.dataFinal = contarPrazoDiasUteis(fluxoComunicacao.inicioPrazo, prazoInfo.prazoDiasFinal);
    }

    const resumo = montarResumoResultado({ fluxoComunicacao, prazoInfo, verificacaoTema });

    const marcoTemporal = {
      inicioPrazo: resumo.dataInicio ? formatDatePtBr(resumo.dataInicio) : '—',
      prazoConcedido: `${prazoConcedido} dia(s) útil(eis)`,
      regimePrazo: resumo.regimePrazo,
      prazoEfetivo: fluxoComunicacao.bloqueado ? '—' : `${prazoInfo.prazoDiasFinal} dia(s) útil(eis)`,
      vencimento: resumo.dataFinal ? formatDatePtBr(resumo.dataFinal) : '—'
    };

    if (fluxoComunicacao.disponibilizacao) marcoTemporal.disponibilizacao = formatDatePtBr(fluxoComunicacao.disponibilizacao);
    if (fluxoComunicacao.disponibilizacaoEstimada) marcoTemporal.disponibilizacaoEstimada = formatDatePtBr(fluxoComunicacao.disponibilizacaoEstimada);
    if (fluxoComunicacao.envio) marcoTemporal.envio = fluxoComunicacao.envio.toLocaleString('pt-BR');
    if (fluxoComunicacao.cienciaConfirmada) marcoTemporal.cienciaConfirmada = formatDatePtBr(fluxoComunicacao.cienciaConfirmada);
    if (fluxoComunicacao.cienciaAutomatica) marcoTemporal.cienciaAutomatica = formatDatePtBr(fluxoComunicacao.cienciaAutomatica);
    if (fluxoComunicacao.citacaoConfirmada) marcoTemporal.citacaoConfirmada = formatDatePtBr(fluxoComunicacao.citacaoConfirmada);
    if (fluxoComunicacao.citacaoAutomatica) marcoTemporal.citacaoAutomatica = formatDatePtBr(fluxoComunicacao.citacaoAutomatica);
    if (fluxoComunicacao.publicacao) {
      const chavePublicacao = fluxoComunicacao.statusCiencia === 'estimado' ? 'publicacaoEstimada' : 'publicacao';
      marcoTemporal[chavePublicacao] = formatDatePtBr(fluxoComunicacao.publicacao);
    }
    if ((entrada.canal === 'sistema' || entrada.canal === 'sistema_mp') && dataBase) {
      marcoTemporal.cienciaConfirmada = formatDatePtBr(dataBase);
    }

    return {
      ok: true,
      status: resumo.bloqueado
        ? 'Bloqueado / depende de conferência'
        : (resumo.statusCiencia === 'confirmada'
          ? 'Confirmado'
          : ((resumo.statusCiencia === 'estimativa' || resumo.statusCiencia === 'estimado') ? 'Estimado' : resumo.statusCiencia)),
      marcoLegal: resumo.marcoLegal,
      regimePrazo: resumo.regimePrazo,
      aviso: resumo.dependeConferencia || fluxoComunicacao.exigeAvisoConferencia ? 'Depende de conferência' : '',
      observacoes: resumo.observacoes,
      marcoTemporal,
      dataInicio: resumo.dataInicio,
      dataFinal: resumo.dataFinal,
      dataFinalFormatada: resumo.dataFinal ? formatDatePtBr(resumo.dataFinal) : '—',
      diasDecorridos: calcularDiasDecorridosAteHoje(resumo.dataInicio, hojeRef)
    };
  }

  const api = {
    feriados,
    isDiaUtil,
    proximoDiaUtil,
    somarDiasUteis,
    calcularPublicacaoDJEN,
    calcularInicioPrazo,
    contarPrazoDiasUteis,
    estimarDisponibilizacaoPorEnvio,
    calcularDJEN,
    calcularDJENEstimado,
    calcularDomicilioIntimacao,
    calcularDomicilioCitacao,
    aplicarPrazoEmDobroSeCabivel,
    verificarPrazoProprio,
    calcularExecucaoContraFazenda,
    montarResumoResultado,
    calcularPrazoDetalhado,
    parseDateFromInput,
    formatDateKey,

    // aliases de compatibilidade
    ehDiaUtil: isDiaUtil,
    obterProximoDiaUtil: proximoDiaUtil,
    contarPrazoDiasUteis: contarPrazoDiasUteis
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  global.PrazoUtils = api;
})(typeof window !== 'undefined' ? window : globalThis);
