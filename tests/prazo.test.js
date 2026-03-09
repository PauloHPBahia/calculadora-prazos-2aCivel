const assert = require('node:assert/strict');
const {
  ehDiaUtil,
  calcularPrazoDetalhado,
  formatDateKey
} = require('../prazo.js');

function run() {
  assert.equal(ehDiaUtil(new Date('2025-04-21T00:00:00')), false, 'Tiradentes (feriado) deve ser não útil');
  assert.equal(ehDiaUtil(new Date('2025-04-19T00:00:00')), false, 'Sábado deve ser não útil');
  assert.equal(ehDiaUtil(new Date('2025-04-22T00:00:00')), true, 'Terça-feira comum deve ser útil');

  const sistemaUmDia = calcularPrazoDetalhado('2026-01-05', '1', 'sistema', new Date('2026-01-05T00:00:00'));
  assert.equal(sistemaUmDia.ok, true);
  assert.equal(formatDateKey(sistemaUmDia.dataFinal), '2026-01-06', 'Prazo de 1 dia útil não pode avançar +1 indevido');

  const sistemaAutarquia = calcularPrazoDetalhado('2026-01-05', '2', 'sistema_autarquia', new Date('2026-01-05T00:00:00'));
  assert.equal(sistemaAutarquia.ok, true);
  assert.equal(formatDateKey(sistemaAutarquia.dataFinal), '2026-01-09', 'Autarquia deve dobrar o prazo');

  const dje = calcularPrazoDetalhado('2026-01-05', '1', 'dje', new Date('2026-01-05T00:00:00'));
  assert.equal(dje.ok, true);
  assert.equal(formatDateKey(dje.dataFinal), '2026-01-07', 'DJE deve adicionar 1 dia útil ao prazo concedido');

  const comFeriado = calcularPrazoDetalhado('2025-04-17', '1', 'sistema', new Date('2025-04-17T00:00:00'));
  assert.equal(comFeriado.ok, true);
  assert.equal(formatDateKey(comFeriado.dataFinal), '2025-04-22', 'Deve pular feriado e fim de semana');

  const semData = calcularPrazoDetalhado('', '5', 'sistema');
  assert.equal(semData.ok, false);

  const prazoInvalido = calcularPrazoDetalhado('2025-04-17', '0', 'sistema');
  assert.equal(prazoInvalido.ok, false);

  const meioInvalido = calcularPrazoDetalhado('2025-04-17', '5', 'email');
  assert.equal(meioInvalido.ok, false);

  console.log('Todos os testes passaram.');
}

run();
