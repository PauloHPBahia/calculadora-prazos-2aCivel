(function (global) {
  const feriados = [
    "2024-01-01", "2024-02-12", "2024-02-13", "2024-02-14", "2024-03-28", "2024-03-29", "2024-04-21", "2024-05-01", "2024-05-30", "2024-05-31", "2024-08-15", "2024-08-16", "2024-09-07", "2024-10-12", "2024-10-14", "2024-10-28", "2024-11-02", "2024-11-15", "2024-11-20", "2024-12-08", "2024-10-15", "2024-10-16", "2024-12-20", "2024-12-21", "2024-12-22", "2024-12-23", "2024-12-24", "2024-12-25", "2024-12-26", "2024-12-27", "2024-12-28", "2024-12-29", "2024-12-30", "2024-12-31", "2025-01-01", "2025-01-02", "2025-01-03", "2025-01-04", "2025-01-05", "2025-01-06", "2025-01-07", "2025-01-08", "2025-01-09", "2025-01-10", "2025-01-11", "2025-01-12", "2025-01-13", "2025-01-14", "2025-01-15", "2025-01-16", "2025-01-17", "2025-01-18", "2025-01-19", "2025-01-20", "2025-03-03", "2025-03-04", "2025-03-05", "2025-04-17", "2025-04-18", "2025-04-21", "2025-05-01", "2025-05-02", "2025-06-19", "2025-06-20", "2025-08-15", "2025-09-07", "2025-10-12", "2025-10-13", "2025-10-27", "2025-10-28", "2025-11-02", "2025-11-15", "2025-11-20", "2025-11-21", "2025-12-08"
  ];

  function formatDateKey(data) {
    const y = data.getFullYear();
    const m = String(data.getMonth() + 1).padStart(2, '0');
    const d = String(data.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function parseDateFromInput(value) {
    if (!value) return null;
    const parsed = new Date(`${value}T00:00:00`);
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

  function calcularDataFinal(dataIntimacao, prazoEfetivo) {
    let dataCursor = addDays(dataIntimacao, 1);

    while (prazoEfetivo > 0) {
      if (ehDiaUtil(dataCursor)) {
        prazoEfetivo -= 1;
        if (prazoEfetivo === 0) {
          return dataCursor;
        }
      }
      dataCursor = addDays(dataCursor, 1);
    }

    return dataCursor;
  }

  function calcularDiasDecorridos(dataIntimacao, hoje, meio) {
    let diasDecorridos = 0;
    let dataContagem = addDays(dataIntimacao, 1);

    while (dataContagem <= hoje) {
      if (ehDiaUtil(dataContagem)) {
        diasDecorridos += 1;
      }
      dataContagem = addDays(dataContagem, 1);
    }

    if (meio === 'dje') {
      diasDecorridos = Math.max(0, diasDecorridos - 1);
    }

    return diasDecorridos;
  }

  function calcularPrazoDetalhado(dataIntimacaoValor, prazoConcedidoValor, meio, hojeRef = new Date()) {
    const dataIntimacao = parseDateFromInput(dataIntimacaoValor);
    const prazoConcedido = Number.parseInt(prazoConcedidoValor, 10);

    if (!dataIntimacao) {
      return { ok: false, erro: 'Informe uma data de intimação válida.' };
    }

    if (!Number.isInteger(prazoConcedido) || prazoConcedido <= 0) {
      return { ok: false, erro: 'Informe um prazo concedido válido (inteiro maior que zero).' };
    }

    if (!["sistema", "dje", "sistema_autarquia"].includes(meio)) {
      return { ok: false, erro: 'Meio de intimação inválido.' };
    }

    let prazoEfetivo = prazoConcedido;
    if (meio === 'sistema_autarquia') prazoEfetivo *= 2;
    if (meio === 'dje') prazoEfetivo += 1;

    const dataFinal = calcularDataFinal(dataIntimacao, prazoEfetivo);
    const diasDecorridos = calcularDiasDecorridos(dataIntimacao, hojeRef, meio);

    return {
      ok: true,
      dataFinal,
      diasDecorridos,
      dataFinalFormatada: dataFinal.toLocaleDateString('pt-BR')
    };
  }

  const api = {
    feriados,
    ehDiaUtil,
    calcularPrazoDetalhado,
    parseDateFromInput,
    formatDateKey
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  global.PrazoUtils = api;
})(typeof window !== 'undefined' ? window : globalThis);
