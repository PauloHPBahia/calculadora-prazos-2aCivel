const assert = require('node:assert/strict');
const {
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
  calcularPrazoDetalhado,
  formatDateKey
} = require('../prazo.js');

function run() {
  assert.equal(isDiaUtil(new Date('2025-04-21T00:00:00')), false);
  assert.equal(isDiaUtil(new Date('2025-04-22T00:00:00')), true);

  const prox = proximoDiaUtil(new Date('2025-04-17T00:00:00'));
  assert.equal(formatDateKey(prox), '2025-04-22');

  const venc = somarDiasUteis(new Date('2025-04-23T00:00:00'), 3);
  assert.equal(formatDateKey(venc), '2025-04-25');

  assert.equal(formatDateKey(calcularPublicacaoDJEN(new Date('2025-04-16T00:00:00'))), '2025-04-22');
  assert.equal(formatDateKey(calcularInicioPrazo(new Date('2025-04-22T00:00:00'))), '2025-04-23');
  assert.equal(formatDateKey(contarPrazoDiasUteis(new Date('2025-04-23T00:00:00'), 2)), '2025-04-24');

  const djen = calcularDJEN({ dataBase: new Date('2025-04-16T00:00:00'), prazoDias: 2 });
  assert.equal(formatDateKey(djen.publicacao), '2025-04-22');
  assert.equal(formatDateKey(djen.inicioPrazo), '2025-04-23');
  assert.equal(formatDateKey(djen.dataFinal), '2025-04-24');

  const estimativaEnvioUtil = estimarDisponibilizacaoPorEnvio(new Date('2026-03-10T16:00:00'));
  assert.equal(formatDateKey(estimativaEnvioUtil.disponibilizacaoEstimada), '2026-03-11');
  assert.equal(estimativaEnvioUtil.exigeAvisoConferencia, false);

  const estimativaEnvioApos17 = estimarDisponibilizacaoPorEnvio(new Date('2026-03-10T18:00:00'));
  assert.equal(formatDateKey(estimativaEnvioApos17.disponibilizacaoEstimada), '2026-03-12');
  assert.equal(estimativaEnvioApos17.exigeAvisoConferencia, true);

  const djenEstimado = calcularDJENEstimado({ dataEnvio: new Date('2026-03-10T18:00:00'), prazoDias: 2 });
  assert.equal(djenEstimado.statusCiencia, 'estimado');
  assert.equal(formatDateKey(djenEstimado.publicacao), '2026-03-13');

  const domIntConfirmada = calcularDomicilioIntimacao({
    dataBase: new Date('2026-03-10T00:00:00'),
    situacaoCiencia: 'confirmada'
  });
  assert.equal(formatDateKey(domIntConfirmada.inicioPrazo), '2026-03-11');

  const domIntAuto = calcularDomicilioIntimacao({
    dataBase: new Date('2026-03-10T00:00:00'),
    situacaoCiencia: 'sem_consulta'
  });
  assert.equal(formatDateKey(domIntAuto.cienciaAutomatica), '2026-03-20');

  const domCitConfirmada = calcularDomicilioCitacao({
    dataBase: new Date('2026-03-10T00:00:00'),
    situacaoCiencia: 'confirmada',
    destinatario: 'parte_privada'
  });
  assert.equal(formatDateKey(domCitConfirmada.inicioPrazo), '2026-03-17');

  const domCitAutoFazenda = calcularDomicilioCitacao({
    dataBase: new Date('2026-03-10T00:00:00'),
    situacaoCiencia: 'sem_consulta',
    destinatario: 'fazenda'
  });
  assert.equal(domCitAutoFazenda.statusCiencia, 'automatica');

  const domCitBloqueadaPrivado = calcularDomicilioCitacao({
    dataBase: new Date('2026-03-10T00:00:00'),
    situacaoCiencia: 'sem_consulta',
    destinatario: 'parte_privada'
  });
  assert.equal(domCitBloqueadaPrivado.bloqueado, true);

  const dobroMP = aplicarPrazoEmDobroSeCabivel({
    prazoDias: 15,
    destinatario: 'mp',
    naturezaPrazo: 'comum',
    prazoProprio: false,
    tema: 'comum'
  });
  assert.equal(dobroMP.prazoDiasFinal, 30);
  assert.equal(dobroMP.regimePrazo, 'dobro');

  const dativo = aplicarPrazoEmDobroSeCabivel({
    prazoDias: 15,
    destinatario: 'defensor_dativo',
    naturezaPrazo: 'comum',
    prazoProprio: false,
    tema: 'comum'
  });
  assert.equal(dativo.prazoDiasFinal, 15);
  assert.match(dativo.aviso, /dativo/i);

  const prazoProprioExec = calcularExecucaoContraFazenda({ tema: 'execucao_titulo', destinatario: 'fazenda' });
  assert.equal(prazoProprioExec.temPrazoProprio, true);
  assert.equal(prazoProprioExec.prazoDias, 30);

  const verificarTema = verificarPrazoProprio({
    tema: 'recuperacao_judicial',
    naturezaPrazo: 'nao_sei',
    destinatario: 'parte_privada'
  });
  assert.equal(verificarTema.dependeConferencia, true);

  const completoExecFazenda = calcularPrazoDetalhado({
    canal: 'sistema',
    tipoAto: 'comunicacao_geral',
    destinatario: 'fazenda',
    tema: 'execucao_titulo',
    naturezaPrazo: 'comum',
    prazoConcedido: '15',
    dataBase: '2025-04-22',
    situacaoCiencia: 'confirmada'
  }, new Date('2025-05-01T00:00:00'));
  assert.equal(completoExecFazenda.ok, true);
  assert.equal(completoExecFazenda.regimePrazo, 'proprio');
  assert.equal(completoExecFazenda.marcoTemporal.prazoEfetivo, '30 dia(s) útil(eis)');

  const completoDomicilioDobro = calcularPrazoDetalhado({
    canal: 'domicilio',
    tipoAto: 'intimacao_pessoal',
    destinatario: 'defensoria',
    tema: 'comum',
    naturezaPrazo: 'comum',
    prazoConcedido: '5',
    dataBase: '2026-03-10',
    situacaoCiencia: 'confirmada'
  });
  assert.equal(completoDomicilioDobro.ok, true);
  assert.equal(completoDomicilioDobro.regimePrazo, 'dobro');

  const semData = calcularPrazoDetalhado({
    canal: 'djen',
    tipoAto: 'intimacao_pessoal',
    destinatario: 'parte_privada',
    tema: 'comum',
    naturezaPrazo: 'comum',
    prazoConcedido: '5',
    dataBase: '',
    situacaoCiencia: 'confirmada'
  });
  assert.equal(semData.ok, false);

  const calculoEnvioEstimado = calcularPrazoDetalhado({
    canal: 'djen_envio',
    tipoAto: 'comunicacao_geral',
    destinatario: 'parte_privada',
    tema: 'comum',
    naturezaPrazo: 'comum',
    prazoConcedido: '5',
    dataBase: '2026-03-10T18:00',
    situacaoCiencia: 'confirmada'
  });
  assert.equal(calculoEnvioEstimado.ok, true);
  assert.equal(calculoEnvioEstimado.status, 'Estimado');

  const calculoSistemaMp = calcularPrazoDetalhado({
    canal: 'sistema_mp',
    tipoAto: 'comunicacao_geral',
    destinatario: 'mp',
    tema: 'comum',
    naturezaPrazo: 'comum',
    prazoConcedido: '5',
    dataBase: '2026-03-10',
    situacaoCiencia: 'confirmada'
  });
  assert.equal(calculoSistemaMp.ok, true);
  assert.equal(calculoSistemaMp.regimePrazo, 'dobro');

  console.log('Todos os testes passaram.');
}

run();
