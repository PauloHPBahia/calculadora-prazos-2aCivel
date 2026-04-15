(function (global) {
  const feriados = [
    "2024-01-01", "2024-02-12", "2024-02-13", "2024-02-14", "2024-03-28", "2024-03-29", "2024-04-21", "2024-05-01", "2024-05-30", "2024-05-31", "2024-08-15", "2024-08-16", "2024-09-07", "2024-10-12", "2024-10-14", "2024-10-15", "2024-10-16", "2024-10-28", "2024-11-02", "2024-11-15", "2024-11-20", "2024-12-08", "2024-12-20", "2024-12-21", "2024-12-22", "2024-12-23", "2024-12-24", "2024-12-25", "2024-12-26", "2024-12-27", "2024-12-28", "2024-12-29", "2024-12-30", "2024-12-31", "2025-01-01", "2025-01-02", "2025-01-03", "2025-01-04", "2025-01-05", "2025-01-06", "2025-01-07", "2025-01-08", "2025-01-09", "2025-01-10", "2025-01-11", "2025-01-12", "2025-01-13", "2025-01-14", "2025-01-15", "2025-01-16", "2025-01-17", "2025-01-18", "2025-01-19", "2025-01-20", "2025-03-03", "2025-03-04", "2025-03-05", "2025-04-17", "2025-04-18", "2025-04-21", "2025-05-01", "2025-05-02", "2025-06-19", "2025-06-20", "2025-08-15", "2025-09-07", "2025-10-12", "2025-10-13", "2025-10-27", "2025-10-28", "2025-11-02", "2025-11-15", "2025-11-20", "2025-11-21", "2025-12-08", "2025-12-20", "2025-12-21", "2025-12-22", "2025-12-23", "2025-12-24", "2025-12-25", "2025-12-26", "2025-12-27", "2025-12-28", "2025-12-29", "2025-12-30", "2025-12-31", "2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04", "2026-01-05", "2026-01-06", "2026-01-07", "2026-01-08", "2026-01-09", "2026-01-10", "2026-01-11", "2026-01-12", "2026-01-13", "2026-01-14", "2026-01-15", "2026-01-16", "2026-01-17", "2026-01-18", "2026-01-19", "2026-01-20", "2026-02-16", "2026-02-17", "2026-02-18", "2026-04-02", "2026-04-03", "2026-04-20", "2026-04-21", "2026-05-01", "2026-06-04", "2026-06-05", "2026-09-07", "2026-10-12", "2026-10-26", "2026-10-30", "2026-11-02", "2026-11-20", "2026-12-07", "2026-12-08", "2026-12-20", "2026-12-21", "2026-12-22", "2026-12-23", "2026-12-24", "2026-12-25", "2026-12-26", "2026-12-27", "2026-12-28", "2026-12-29", "2026-12-30", "2026-12-31", "2027-01-01", "2027-01-02", "2027-01-03", "2027-01-04", "2027-01-05", "2027-01-06", "2027-01-07", "2027-01-08", "2027-01-09", "2027-01-10", "2027-01-11", "2027-01-12", "2027-01-13", "2027-01-14", "2027-01-15", "2027-01-16", "2027-01-17", "2027-01-18", "2027-01-19", "2027-01-20"
  ];

  const MODOS_VALIDOS = [
    'djen_confirmado',
    'djen_estimativa'
  ];

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
    const somenteData = String(value).trim().slice(0, 10);
    const partes = somenteData.split('-').map((item) => Number.parseInt(item, 10));
    if (partes.length !== 3 || partes.some((item) => !Number.isInteger(item))) {
      return null;
    }

    const [ano, mes, dia] = partes;
    const parsed = new Date(ano, mes - 1, dia);
    if (
      parsed.getFullYear() !== ano
      || parsed.getMonth() !== mes - 1
      || parsed.getDate() !== dia
    ) {
      return null;
    }

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function addDays(data, quantidade) {
    const copia = new Date(data);
    copia.setDate(copia.getDate() + quantidade);
    return copia;
  }

  function ehDiaUtil(data) {
    const diaSemana = data.getDay();
    const dataFormatada = formatDateKey(data);
    return diaSemana !== 0 && diaSemana !== 6 && !feriados.includes(dataFormatada);
  }

  function obterProximoDiaUtil(dataBase) {
    let cursor = addDays(dataBase, 1);
    while (!ehDiaUtil(cursor)) {
      cursor = addDays(cursor, 1);
    }
    return cursor;
  }

  function calcularPublicacaoDJEN(dataDisponibilizacao) {
    return obterProximoDiaUtil(dataDisponibilizacao);
  }

  function calcularInicioPrazo(dataPublicacao) {
    return obterProximoDiaUtil(dataPublicacao);
  }

  function contarPrazoDiasUteis(dataInicio, quantidadeDiasUteis) {
    let restantes = quantidadeDiasUteis;
    let cursor = new Date(dataInicio);

    while (restantes > 1) {
      cursor = obterProximoDiaUtil(cursor);
      restantes -= 1;
    }

    return cursor;
  }

  function estimarDisponibilizacaoPorEnvio(dataEnvio) {
    const diaEnvio = new Date(dataEnvio);
    diaEnvio.setHours(0, 0, 0, 0);
    return {
      dataDisponibilizacao: obterProximoDiaUtil(diaEnvio)
    };
  }

  function calcularDiasDecorridosAteHoje(dataInicio, hojeRef) {
    let dias = 0;
    let cursor = new Date(dataInicio);
    const hoje = new Date(hojeRef);
    hoje.setHours(0, 0, 0, 0);

    while (cursor <= hoje) {
      if (ehDiaUtil(cursor)) dias += 1;
      cursor = obterProximoDiaUtil(cursor);
    }

    return dias;
  }


  function validarEntradasComuns(valorPrazo, meio) {
    const prazoConcedido = Number.parseInt(valorPrazo, 10);
    if (!Number.isInteger(prazoConcedido) || prazoConcedido <= 0) {
      return { ok: false, erro: 'Informe um prazo concedido válido (inteiro maior que zero).' };
    }

    if (!MODOS_VALIDOS.includes(meio)) {
      return { ok: false, erro: 'Modalidade inválida.' };
    }

    return { ok: true, prazoConcedido };
  }

  function calcularPrazoDetalhado(dataValor, prazoValor, meio, hojeRef = new Date()) {
    const validacao = validarEntradasComuns(prazoValor, meio);
    if (!validacao.ok) return validacao;

    const { prazoConcedido } = validacao;

    if (meio === 'djen_estimativa') {
      const dataEnvio = parseDateFromInput(dataValor);
      if (!dataEnvio) {
        return { ok: false, erro: 'Informe a data de envio para estimativa.' };
      }

      const estimativa = estimarDisponibilizacaoPorEnvio(dataEnvio);
      const publicacao = calcularPublicacaoDJEN(estimativa.dataDisponibilizacao);
      const inicioPrazo = calcularInicioPrazo(publicacao);
      const vencimento = contarPrazoDiasUteis(inicioPrazo, prazoConcedido);

      return {
        ok: true,
        meio,
        status: 'Estimado',
        aviso: 'Este cálculo é uma estimativa prévia. Confira a data de disponibilização no DJEN/CNJ assim que a publicação constar no sistema.',
        marcoTemporal: {
          envio: formatDatePtBr(dataEnvio),
          disponibilizacao: formatDatePtBr(estimativa.dataDisponibilizacao),
          publicacao: formatDatePtBr(publicacao),
          inicioPrazo: formatDatePtBr(inicioPrazo),
          prazoConcedido: `${prazoConcedido} dia(s) útil(eis)`,
          vencimento: formatDatePtBr(vencimento)
        },
        dataFinal: vencimento,
        dataFinalFormatada: formatDatePtBr(vencimento),
        diasDecorridos: calcularDiasDecorridosAteHoje(inicioPrazo, hojeRef)
      };
    }

    const dataBase = parseDateFromInput(dataValor);
    if (!dataBase) {
      const mensagemData = meio === 'djen_confirmado'
        ? 'Informe a data de disponibilização.'
        : 'Informe a data de ciência/intimação.';
      return { ok: false, erro: mensagemData };
    }

    if (meio === 'djen_confirmado') {
      const publicacao = calcularPublicacaoDJEN(dataBase);
      const inicioPrazo = calcularInicioPrazo(publicacao);
      const vencimento = contarPrazoDiasUteis(inicioPrazo, prazoConcedido);

      return {
        ok: true,
        meio,
        status: 'Confirmado',
        aviso: '',
        marcoTemporal: {
          disponibilizacao: formatDatePtBr(dataBase),
          publicacao: formatDatePtBr(publicacao),
          inicioPrazo: formatDatePtBr(inicioPrazo),
          prazoConcedido: `${prazoConcedido} dia(s) útil(eis)`,
          vencimento: formatDatePtBr(vencimento)
        },
        dataFinal: vencimento,
        dataFinalFormatada: formatDatePtBr(vencimento),
        diasDecorridos: calcularDiasDecorridosAteHoje(inicioPrazo, hojeRef)
      };
    }

    return { ok: false, erro: 'Modalidade inválida.' };
  }

  const api = {
    feriados,
    ehDiaUtil,
    obterProximoDiaUtil,
    calcularPublicacaoDJEN,
    calcularInicioPrazo,
    contarPrazoDiasUteis,
    estimarDisponibilizacaoPorEnvio,
    calcularPrazoDetalhado,
    parseDateFromInput,
    formatDateKey
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  global.PrazoUtils = api;
})(typeof window !== 'undefined' ? window : globalThis);
