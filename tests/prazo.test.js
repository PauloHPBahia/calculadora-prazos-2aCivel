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
  assert.equal(formatDateKey(djenEstimado.dataFinal), '2025-04-25', 'Estimativa DJEN deve manter cadeia disponibilização -> publicação -> início');

  const djenEstimadoMarco2026 = calcularPrazoDetalhado('2026-02-22', '15', 'djen_estimativa', new Date('2026-03-24T00:00:00'));
  assert.equal(djenEstimadoMarco2026.ok, true);
  assert.equal(formatDateKey(djenEstimadoMarco2026.dataFinal), '2026-03-17', 'Estimativa DJEN deve considerar publicação estimada antes do início do prazo');

  const djenEstimadoComDataHora = calcularPrazoDetalhado('2026-02-22T21:00:00.000Z', '15', 'djen_estimativa', new Date('2026-03-24T00:00:00'));
  assert.equal(djenEstimadoComDataHora.ok, true);
  assert.equal(formatDateKey(djenEstimadoComDataHora.dataFinal), '2026-03-17', 'Data com horário deve usar apenas o dia informado para evitar deslocamento de fuso');

  const sistema = calcularPrazoDetalhado('2025-04-22', '1', 'sistema', new Date('2025-04-23T00:00:00'));
  assert.equal(sistema.ok, true);
  assert.equal(formatDateKey(sistema.dataFinal), '2025-04-23');

  const sistemaAutarquia = calcularPrazoDetalhado('2025-04-22', '2', 'sistema_autarquia', new Date('2025-04-25T00:00:00'));
  assert.equal(sistemaAutarquia.ok, true);
  assert.equal(sistemaAutarquia.marcoTemporal.prazoEfetivo, '4 dia(s) útil(eis)');
  assert.equal(formatDateKey(sistemaAutarquia.dataFinal), '2025-04-28');

  const semData = calcularPrazoDetalhado('', '5', 'sistema');
  assert.equal(semData.ok, false);

  const prazoInvalido = calcularPrazoDetalhado('2025-04-17', '0', 'sistema');
  assert.equal(prazoInvalido.ok, false);

  const meioInvalido = calcularPrazoDetalhado('2025-04-17', '5', 'email');
  assert.equal(meioInvalido.ok, false);

  console.log('Todos os testes passaram.');
}

run();
