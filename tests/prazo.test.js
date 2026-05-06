const assert = require('node:assert/strict');
const {
  ehDiaUtil,
  obterProximoDiaUtil,
  calcularPublicacaoDJEN,
  calcularInicioPrazo,
  contarPrazoDiasUteis,
  estimarDisponibilizacaoPorEnvio,
  calcularPrazoDetalhado,
  formatDateKey
} = require('../prazo.js');

function run() {
  assert.equal(ehDiaUtil(new Date('2025-04-21T00:00:00')), false, 'Tiradentes (feriado) deve ser não útil');
  assert.equal(ehDiaUtil(new Date('2025-04-19T00:00:00')), false, 'Sábado deve ser não útil');
  assert.equal(ehDiaUtil(new Date('2025-04-22T00:00:00')), true, 'Terça-feira comum deve ser útil');

  const proximoUtil = obterProximoDiaUtil(new Date('2025-04-17T00:00:00'));
  assert.equal(formatDateKey(proximoUtil), '2025-04-22', 'Próximo dia útil após 17/04/2025 deve pular feriado e fim de semana');

  const publicacao = calcularPublicacaoDJEN(new Date('2025-04-16T00:00:00'));
  assert.equal(formatDateKey(publicacao), '2025-04-22', 'Publicação DJEN é no próximo dia útil');

  const inicio = calcularInicioPrazo(new Date('2025-04-22T00:00:00'));
  assert.equal(formatDateKey(inicio), '2025-04-23', 'Início do prazo é no próximo dia útil após publicação');

  const vencimento = contarPrazoDiasUteis(new Date('2025-04-23T00:00:00'), 3);
  assert.equal(formatDateKey(vencimento), '2025-04-25', 'Contagem em dias úteis deve considerar o dia de início como primeiro dia');

  const estimativaSemCorteHorario = estimarDisponibilizacaoPorEnvio(new Date('2025-04-16T18:00:00'));
  assert.equal(formatDateKey(estimativaSemCorteHorario.dataDisponibilizacao), '2025-04-22');

  const djenConfirmado = calcularPrazoDetalhado('2025-04-16', '2', 'djen_confirmado', new Date('2025-04-23T00:00:00'));
  assert.equal(djenConfirmado.ok, true);
  assert.equal(djenConfirmado.status, 'Confirmado');
  assert.equal(formatDateKey(djenConfirmado.dataFinal), '2025-04-24');

  const djenEstimado = calcularPrazoDetalhado('2025-04-16', '2', 'djen_estimativa', new Date('2025-04-24T00:00:00'));
  assert.equal(djenEstimado.ok, true);
  assert.equal(djenEstimado.status, 'Estimado');
  assert.equal(djenEstimado.aviso.length > 0, true);
  assert.equal(djenEstimado.marcoTemporal.publicacao, '23/04/2025');

  const djenEstimadoMarco2026 = calcularPrazoDetalhado('2026-02-22', '15', 'djen_estimativa', new Date('2026-03-24T00:00:00'));
  assert.equal(djenEstimadoMarco2026.ok, true);
  assert.equal(formatDateKey(djenEstimadoMarco2026.dataFinal), '2026-03-17', 'Estimativa DJEN deve considerar publicação e início em dias úteis subsequentes');

  const djenEstimadoComDataHora = calcularPrazoDetalhado('2026-02-22T21:00:00.000Z', '15', 'djen_estimativa', new Date('2026-03-24T00:00:00'));
  assert.equal(djenEstimadoComDataHora.ok, true);
  assert.equal(formatDateKey(djenEstimadoComDataHora.dataFinal), '2026-03-17', 'Data com horário deve usar apenas o dia informado para evitar deslocamento de fuso');

  const djeIntimacaoConfirmada = calcularPrazoDetalhado('2025-04-16', '2', 'dje_intimacao_confirmada', new Date('2025-04-23T00:00:00'));
  assert.equal(djeIntimacaoConfirmada.ok, true);
  assert.equal(djeIntimacaoConfirmada.status, 'Confirmado');
  assert.equal(djeIntimacaoConfirmada.marcoTemporal.ciencia, '16/04/2025');
  assert.equal(formatDateKey(djeIntimacaoConfirmada.dataFinal), '2025-04-23', 'DJE intimação confirmada deve iniciar no próximo dia útil e contar dias úteis');

  const djeIntimacaoEstimativa = calcularPrazoDetalhado('2025-04-16', '2', 'dje_intimacao_estimativa', new Date('2025-05-05T00:00:00'));
  assert.equal(djeIntimacaoEstimativa.ok, true);
  assert.equal(djeIntimacaoEstimativa.status, 'Estimado');
  assert.equal(djeIntimacaoEstimativa.marcoTemporal.envio, '16/04/2025');
  assert.equal(djeIntimacaoEstimativa.marcoTemporal.cienciaAutomatica, '26/04/2025');
  assert.equal(formatDateKey(djeIntimacaoEstimativa.dataFinal), '2025-04-29', 'Estimativa DJE intimação deve usar 10 dias corridos + próximo útil');

  const dpMpAutarquiaConfirmadaComum = calcularPrazoDetalhado(
    '2025-04-16',
    '2',
    'dje_intimacao_dp_mp_autarquia_confirmada',
    new Date('2025-04-24T00:00:00'),
    { tipoPrazo: 'comum' }
  );
  assert.equal(dpMpAutarquiaConfirmadaComum.ok, true);
  assert.equal(dpMpAutarquiaConfirmadaComum.marcoTemporal.prazoEfetivo, '2 dia(s) útil(eis)');
  assert.equal(formatDateKey(dpMpAutarquiaConfirmadaComum.dataFinal), '2025-04-23');

  const dpMpAutarquiaConfirmadaDobro = calcularPrazoDetalhado(
    '2025-04-16',
    '2',
    'dje_intimacao_dp_mp_autarquia_confirmada',
    new Date('2025-04-28T00:00:00'),
    { tipoPrazo: 'dobro' }
  );
  assert.equal(dpMpAutarquiaConfirmadaDobro.ok, true);
  assert.equal(dpMpAutarquiaConfirmadaDobro.marcoTemporal.prazoEfetivo, '4 dia(s) útil(eis)');
  assert.equal(formatDateKey(dpMpAutarquiaConfirmadaDobro.dataFinal), '2025-04-25');

  const dpMpAutarquiaEstimativaDobro = calcularPrazoDetalhado(
    '2025-04-16',
    '2',
    'dje_intimacao_dp_mp_autarquia_estimativa',
    new Date('2025-05-06T00:00:00'),
    { tipoPrazo: 'dobro' }
  );
  assert.equal(dpMpAutarquiaEstimativaDobro.ok, true);
  assert.equal(dpMpAutarquiaEstimativaDobro.status, 'Estimado');
  assert.equal(dpMpAutarquiaEstimativaDobro.marcoTemporal.cienciaAutomatica, '26/04/2025');
  assert.equal(dpMpAutarquiaEstimativaDobro.marcoTemporal.prazoEfetivo, '4 dia(s) útil(eis)');
  assert.equal(formatDateKey(dpMpAutarquiaEstimativaDobro.dataFinal), '2025-05-05');

  const calculoSimples = calcularPrazoDetalhado('2025-04-16', '3', 'calculo_simples', new Date('2025-04-23T00:00:00'), { tipoContagemSimples: 'uteis' });
  assert.equal(calculoSimples.ok, true);
  assert.equal(calculoSimples.status, 'Confirmado');
  assert.equal(calculoSimples.marcoTemporal.dataBase, '16/04/2025');
  assert.equal(calculoSimples.marcoTemporal.inicioPrazo, '22/04/2025');
  assert.equal(calculoSimples.marcoTemporal.tipoContagem, 'Dias úteis');
  assert.equal(formatDateKey(calculoSimples.dataFinal), '2025-04-24', 'Cálculo simples deve começar no próximo dia útil da data base e contar dias úteis');

  const calculoSimplesCorridos = calcularPrazoDetalhado('2025-04-16', '6', 'calculo_simples', new Date('2025-04-23T00:00:00'), { tipoContagemSimples: 'corridos' });
  assert.equal(calculoSimplesCorridos.ok, true);
  assert.equal(calculoSimplesCorridos.marcoTemporal.tipoContagem, 'Dias corridos');
  assert.equal(formatDateKey(calculoSimplesCorridos.dataFinal), '2025-04-27', 'No cálculo simples corrido, o 1º dia é o próximo útil e depois segue em calendário corrido');

  const semData = calcularPrazoDetalhado('', '5', 'djen_confirmado');
  assert.equal(semData.ok, false);

  const prazoInvalido = calcularPrazoDetalhado('2025-04-17', '0', 'djen_confirmado');
  assert.equal(prazoInvalido.ok, false);

  const meioInvalido = calcularPrazoDetalhado('2025-04-17', '5', 'email');
  assert.equal(meioInvalido.ok, false);

  console.log('Todos os testes passaram.');
}

run();
