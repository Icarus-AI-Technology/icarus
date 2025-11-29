-- migrate:up

-- Contas bancárias
ALTER TABLE contas_bancarias
  RENAME COLUMN pluggy_account_id TO pluggy_conta_id;

ALTER TABLE contas_bancarias
  RENAME COLUMN pluggy_connector_id TO pluggy_conector_id;

ALTER TABLE contas_bancarias
  RENAME COLUMN pluggy_connector_name TO pluggy_conector_nome;

ALTER TABLE contas_bancarias
  RENAME COLUMN pluggy_status TO pluggy_situacao;

ALTER TABLE contas_bancarias
  RENAME COLUMN pluggy_last_sync TO pluggy_ultima_sincronizacao;

ALTER TABLE contas_bancarias
  RENAME COLUMN pluggy_error TO pluggy_erro;

-- Transações bancárias
ALTER TABLE transacoes_bancarias
  RENAME COLUMN pluggy_transaction_id TO pluggy_transacao_id;

ALTER TABLE transacoes_bancarias
  RENAME COLUMN pluggy_metadata TO pluggy_dados_extras;

-- Boletos DDA
ALTER TABLE dda_boletos
  RENAME COLUMN pluggy_bill_id TO pluggy_boleto_id;

-- migrate:down

ALTER TABLE dda_boletos
  RENAME COLUMN pluggy_boleto_id TO pluggy_bill_id;

ALTER TABLE transacoes_bancarias
  RENAME COLUMN pluggy_dados_extras TO pluggy_metadata;

ALTER TABLE transacoes_bancarias
  RENAME COLUMN pluggy_transacao_id TO pluggy_transaction_id;

ALTER TABLE contas_bancarias
  RENAME COLUMN pluggy_erro TO pluggy_error;

ALTER TABLE contas_bancarias
  RENAME COLUMN pluggy_ultima_sincronizacao TO pluggy_last_sync;

ALTER TABLE contas_bancarias
  RENAME COLUMN pluggy_situacao TO pluggy_status;

ALTER TABLE contas_bancarias
  RENAME COLUMN pluggy_conector_nome TO pluggy_connector_name;

ALTER TABLE contas_bancarias
  RENAME COLUMN pluggy_conector_id TO pluggy_connector_id;

ALTER TABLE contas_bancarias
  RENAME COLUMN pluggy_conta_id TO pluggy_account_id;

