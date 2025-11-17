-- ICARUS v5.0 - Políticas de Segurança em Nível de Linha (RLS)
-- Migration: 20250117000001_politicas_rls.sql
-- Idioma: PT-BR

-- Habilitar RLS em todas as tabelas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cirurgias ENABLE ROW LEVEL SECURITY;
ALTER TABLE cirurgias_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_receber ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE icarus_previsoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE icarus_registros ENABLE ROW LEVEL SECURITY;

-- ============ FUNÇÕES AUXILIARES ============

-- Obter empresa_id do usuário atual
CREATE OR REPLACE FUNCTION auth.obter_empresa_usuario()
RETURNS UUID AS $$
  SELECT empresa_id FROM usuarios WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION auth.obter_empresa_usuario() IS 'Retorna o ID da empresa do usuário autenticado';

-- Verificar se usuário tem papel específico
CREATE OR REPLACE FUNCTION auth.usuario_tem_papel(papel_requerido papel_usuario)
RETURNS BOOLEAN AS $$
  SELECT papel = papel_requerido FROM usuarios WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION auth.usuario_tem_papel(papel_usuario) IS 'Verifica se o usuário tem um papel específico';

-- Verificar se usuário é admin
CREATE OR REPLACE FUNCTION auth.eh_admin()
RETURNS BOOLEAN AS $$
  SELECT papel = 'admin' FROM usuarios WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION auth.eh_admin() IS 'Verifica se o usuário é administrador';

-- Verificar se usuário é admin ou gerente
CREATE OR REPLACE FUNCTION auth.eh_admin_ou_gerente()
RETURNS BOOLEAN AS $$
  SELECT papel IN ('admin', 'gerente') FROM usuarios WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION auth.eh_admin_ou_gerente() IS 'Verifica se o usuário é administrador ou gerente';

-- ============ POLÍTICAS PARA EMPRESAS ============

-- Empresas: Usuários podem ver apenas sua própria empresa
CREATE POLICY "Usuários podem visualizar sua própria empresa"
  ON empresas FOR SELECT
  USING (id = auth.obter_empresa_usuario());

-- Empresas: Apenas admins podem atualizar
CREATE POLICY "Admins podem atualizar empresa"
  ON empresas FOR UPDATE
  USING (id = auth.obter_empresa_usuario() AND auth.eh_admin());

-- ============ POLÍTICAS PARA USUÁRIOS ============

-- Usuários: Podem ver usuários da mesma empresa
CREATE POLICY "Usuários podem visualizar usuários da mesma empresa"
  ON usuarios FOR SELECT
  USING (empresa_id = auth.obter_empresa_usuario());

-- Usuários: Admins e gerentes podem inserir usuários
CREATE POLICY "Admins e gerentes podem inserir usuários"
  ON usuarios FOR INSERT
  WITH CHECK (
    empresa_id = auth.obter_empresa_usuario() AND
    auth.eh_admin_ou_gerente()
  );

-- Usuários: Admins podem atualizar usuários
CREATE POLICY "Admins podem atualizar usuários"
  ON usuarios FOR UPDATE
  USING (empresa_id = auth.obter_empresa_usuario() AND auth.eh_admin());

-- Usuários: Admins podem deletar usuários
CREATE POLICY "Admins podem deletar usuários"
  ON usuarios FOR DELETE
  USING (empresa_id = auth.obter_empresa_usuario() AND auth.eh_admin());

-- ============ POLÍTICAS PARA PRODUTOS ============

-- Produtos: Todos podem visualizar
CREATE POLICY "Usuários podem visualizar produtos"
  ON produtos FOR SELECT
  USING (empresa_id = auth.obter_empresa_usuario());

-- Produtos: Admins e gerentes podem inserir
CREATE POLICY "Admins e gerentes podem inserir produtos"
  ON produtos FOR INSERT
  WITH CHECK (
    empresa_id = auth.obter_empresa_usuario() AND
    auth.eh_admin_ou_gerente()
  );

-- Produtos: Admins e gerentes podem atualizar
CREATE POLICY "Admins e gerentes podem atualizar produtos"
  ON produtos FOR UPDATE
  USING (
    empresa_id = auth.obter_empresa_usuario() AND
    auth.eh_admin_ou_gerente()
  );

-- Produtos: Admins podem deletar
CREATE POLICY "Admins podem deletar produtos"
  ON produtos FOR DELETE
  USING (empresa_id = auth.obter_empresa_usuario() AND auth.eh_admin());

-- ============ POLÍTICAS PARA CATEGORIAS ============

CREATE POLICY "Usuários podem visualizar categorias"
  ON categorias FOR SELECT
  USING (empresa_id = auth.obter_empresa_usuario());

CREATE POLICY "Admins e gerentes podem gerenciar categorias"
  ON categorias FOR ALL
  USING (
    empresa_id = auth.obter_empresa_usuario() AND
    auth.eh_admin_ou_gerente()
  );

-- ============ POLÍTICAS PARA FORNECEDORES ============

CREATE POLICY "Usuários podem visualizar fornecedores"
  ON fornecedores FOR SELECT
  USING (empresa_id = auth.obter_empresa_usuario());

CREATE POLICY "Admins e gerentes podem gerenciar fornecedores"
  ON fornecedores FOR ALL
  USING (
    empresa_id = auth.obter_empresa_usuario() AND
    auth.eh_admin_ou_gerente()
  );

-- ============ POLÍTICAS PARA CLIENTES ============

CREATE POLICY "Usuários podem visualizar clientes"
  ON clientes FOR SELECT
  USING (empresa_id = auth.obter_empresa_usuario());

CREATE POLICY "Usuários podem inserir clientes"
  ON clientes FOR INSERT
  WITH CHECK (empresa_id = auth.obter_empresa_usuario());

CREATE POLICY "Usuários podem atualizar clientes"
  ON clientes FOR UPDATE
  USING (empresa_id = auth.obter_empresa_usuario());

CREATE POLICY "Admins podem deletar clientes"
  ON clientes FOR DELETE
  USING (empresa_id = auth.obter_empresa_usuario() AND auth.eh_admin());

-- ============ POLÍTICAS PARA CIRURGIAS ============

CREATE POLICY "Usuários podem visualizar cirurgias"
  ON cirurgias FOR SELECT
  USING (empresa_id = auth.obter_empresa_usuario());

CREATE POLICY "Usuários podem inserir cirurgias"
  ON cirurgias FOR INSERT
  WITH CHECK (empresa_id = auth.obter_empresa_usuario());

CREATE POLICY "Usuários podem atualizar cirurgias"
  ON cirurgias FOR UPDATE
  USING (empresa_id = auth.obter_empresa_usuario());

CREATE POLICY "Admins podem deletar cirurgias"
  ON cirurgias FOR DELETE
  USING (empresa_id = auth.obter_empresa_usuario() AND auth.eh_admin());

-- ============ POLÍTICAS PARA CIRURGIAS_PRODUTOS ============

CREATE POLICY "Usuários podem visualizar produtos de cirurgias"
  ON cirurgias_produtos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM cirurgias
    WHERE cirurgias.id = cirurgias_produtos.cirurgia_id
    AND cirurgias.empresa_id = auth.obter_empresa_usuario()
  ));

CREATE POLICY "Usuários podem gerenciar produtos de cirurgias"
  ON cirurgias_produtos FOR ALL
  USING (EXISTS (
    SELECT 1 FROM cirurgias
    WHERE cirurgias.id = cirurgias_produtos.cirurgia_id
    AND cirurgias.empresa_id = auth.obter_empresa_usuario()
  ));

-- ============ POLÍTICAS PARA CONTAS A RECEBER ============

CREATE POLICY "Usuários podem visualizar contas a receber"
  ON contas_receber FOR SELECT
  USING (empresa_id = auth.obter_empresa_usuario());

CREATE POLICY "Usuários podem inserir contas a receber"
  ON contas_receber FOR INSERT
  WITH CHECK (empresa_id = auth.obter_empresa_usuario());

CREATE POLICY "Usuários podem atualizar contas a receber"
  ON contas_receber FOR UPDATE
  USING (empresa_id = auth.obter_empresa_usuario());

CREATE POLICY "Admins podem deletar contas a receber"
  ON contas_receber FOR DELETE
  USING (empresa_id = auth.obter_empresa_usuario() AND auth.eh_admin());

-- ============ POLÍTICAS PARA CONTAS A PAGAR ============

CREATE POLICY "Usuários podem visualizar contas a pagar"
  ON contas_pagar FOR SELECT
  USING (empresa_id = auth.obter_empresa_usuario());

CREATE POLICY "Admins e gerentes podem gerenciar contas a pagar"
  ON contas_pagar FOR ALL
  USING (
    empresa_id = auth.obter_empresa_usuario() AND
    auth.eh_admin_ou_gerente()
  );

-- ============ POLÍTICAS PARA MOVIMENTAÇÕES DE ESTOQUE ============

CREATE POLICY "Usuários podem visualizar movimentações de estoque"
  ON movimentacoes_estoque FOR SELECT
  USING (empresa_id = auth.obter_empresa_usuario());

CREATE POLICY "Usuários podem inserir movimentações de estoque"
  ON movimentacoes_estoque FOR INSERT
  WITH CHECK (empresa_id = auth.obter_empresa_usuario());

-- Impedir atualizações e exclusões de movimentações (trilha de auditoria)
CREATE POLICY "Ninguém pode atualizar movimentações de estoque"
  ON movimentacoes_estoque FOR UPDATE
  USING (false);

CREATE POLICY "Ninguém pode deletar movimentações de estoque"
  ON movimentacoes_estoque FOR DELETE
  USING (false);

-- ============ POLÍTICAS PARA PREVISÕES ICARUS ============

CREATE POLICY "Usuários podem visualizar previsões"
  ON icarus_previsoes FOR SELECT
  USING (empresa_id = auth.obter_empresa_usuario());

CREATE POLICY "Sistema pode inserir previsões"
  ON icarus_previsoes FOR INSERT
  WITH CHECK (empresa_id = auth.obter_empresa_usuario());

CREATE POLICY "Admins podem atualizar previsões"
  ON icarus_previsoes FOR UPDATE
  USING (empresa_id = auth.obter_empresa_usuario() AND auth.eh_admin());

-- ============ POLÍTICAS PARA REGISTROS DE AUDITORIA ============

CREATE POLICY "Admins podem visualizar registros de auditoria"
  ON icarus_registros FOR SELECT
  USING (empresa_id = auth.obter_empresa_usuario() AND auth.eh_admin());

CREATE POLICY "Sistema pode inserir registros de auditoria"
  ON icarus_registros FOR INSERT
  WITH CHECK (empresa_id = auth.obter_empresa_usuario());

-- Impedir atualizações e exclusões de logs (trilha de auditoria)
CREATE POLICY "Ninguém pode atualizar registros de auditoria"
  ON icarus_registros FOR UPDATE
  USING (false);

CREATE POLICY "Ninguém pode deletar registros de auditoria"
  ON icarus_registros FOR DELETE
  USING (false);

-- ============ FUNÇÃO DE AUDITORIA AUTOMÁTICA ============

CREATE OR REPLACE FUNCTION registrar_auditoria()
RETURNS TRIGGER AS $$
DECLARE
  id_empresa UUID;
  id_usuario UUID;
  acao_tipo TEXT;
BEGIN
  -- Determinar tipo de ação
  IF TG_OP = 'INSERT' THEN
    acao_tipo = 'criar';
    id_empresa = NEW.empresa_id;
  ELSIF TG_OP = 'UPDATE' THEN
    acao_tipo = 'atualizar';
    id_empresa = NEW.empresa_id;
  ELSIF TG_OP = 'DELETE' THEN
    acao_tipo = 'deletar';
    id_empresa = OLD.empresa_id;
  END IF;

  -- Obter ID do usuário autenticado
  id_usuario = auth.uid();

  -- Inserir registro de auditoria
  INSERT INTO icarus_registros (
    empresa_id,
    usuario_id,
    acao,
    tipo_entidade,
    entidade_id,
    detalhes
  ) VALUES (
    id_empresa,
    id_usuario,
    acao_tipo,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'operacao', TG_OP,
      'tabela', TG_TABLE_NAME,
      'timestamp', NOW()
    )
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION registrar_auditoria() IS 'Registra automaticamente ações de auditoria nas tabelas';

-- Criar triggers de auditoria para tabelas principais
CREATE TRIGGER trigger_auditoria_produtos
  AFTER INSERT OR UPDATE OR DELETE ON produtos
  FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_clientes
  AFTER INSERT OR UPDATE OR DELETE ON clientes
  FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_cirurgias
  AFTER INSERT OR UPDATE OR DELETE ON cirurgias
  FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_contas_receber
  AFTER INSERT OR UPDATE OR DELETE ON contas_receber
  FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

CREATE TRIGGER trigger_auditoria_contas_pagar
  AFTER INSERT OR UPDATE OR DELETE ON contas_pagar
  FOR EACH ROW EXECUTE FUNCTION registrar_auditoria();

-- ============ VIEWS ÚTEIS ============

-- View de produtos com estoque baixo
CREATE OR REPLACE VIEW produtos_estoque_baixo AS
SELECT
  p.id,
  p.empresa_id,
  p.codigo,
  p.nome,
  p.estoque_atual,
  p.estoque_minimo,
  p.estoque_minimo - p.estoque_atual AS deficit,
  c.nome AS categoria
FROM produtos p
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE p.estoque_atual <= p.estoque_minimo
AND p.ativo = true;

COMMENT ON VIEW produtos_estoque_baixo IS 'Produtos com estoque abaixo do mínimo';

-- View de contas vencidas
CREATE OR REPLACE VIEW contas_receber_vencidas AS
SELECT
  cr.id,
  cr.empresa_id,
  cr.numero,
  cr.cliente_id,
  cl.nome AS cliente_nome,
  cr.valor,
  cr.valor_pago,
  cr.valor - cr.valor_pago AS saldo_devedor,
  cr.data_vencimento,
  CURRENT_DATE - cr.data_vencimento AS dias_vencido
FROM contas_receber cr
INNER JOIN clientes cl ON cr.cliente_id = cl.id
WHERE cr.status IN ('pendente', 'vencido')
AND cr.data_vencimento < CURRENT_DATE
AND cr.valor > cr.valor_pago;

COMMENT ON VIEW contas_receber_vencidas IS 'Contas a receber vencidas com saldo devedor';

-- View de cirurgias agendadas
CREATE OR REPLACE VIEW cirurgias_proximas AS
SELECT
  c.id,
  c.empresa_id,
  c.numero,
  c.paciente_nome,
  c.tipo_cirurgia,
  c.data_cirurgia,
  h.nome AS hospital,
  m.nome AS medico,
  c.valor_total,
  c.status
FROM cirurgias c
INNER JOIN clientes h ON c.hospital_id = h.id
INNER JOIN clientes m ON c.medico_id = m.id
WHERE c.status IN ('agendada', 'confirmada')
AND c.data_cirurgia >= CURRENT_DATE
ORDER BY c.data_cirurgia;

COMMENT ON VIEW cirurgias_proximas IS 'Cirurgias agendadas e confirmadas (futuras)';
