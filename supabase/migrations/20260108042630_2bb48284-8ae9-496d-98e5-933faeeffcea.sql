
-- 1. Inserir OSCs fictícias
INSERT INTO public.oscs (id, cnpj, razao_social, status_cnd, validade_cnd) VALUES
('a1111111-1111-1111-1111-111111111111', '12.345.678/0001-90', 'Instituto Vida Nova', 'regular', '2025-06-30'),
('a2222222-2222-2222-2222-222222222222', '98.765.432/0001-10', 'Associação Esperança', 'regular', '2025-08-15'),
('a3333333-3333-3333-3333-333333333333', '11.222.333/0001-44', 'ONG Futuro Brilhante', 'vencida', '2024-12-01'),
('a4444444-4444-4444-4444-444444444444', '55.666.777/0001-88', 'Fundação Amor ao Próximo', 'regular', '2025-09-20'),
('a5555555-5555-5555-5555-555555555555', '99.888.777/0001-66', 'Centro Social Renovar', 'irregular', '2025-03-10');

-- 2. Inserir Chamamentos/Editais
INSERT INTO public.public_calls (id, numero_edital, objeto, status, data_inicio, data_fim, valor_total) VALUES
('b1111111-1111-1111-1111-111111111111', 'EDITAL 001/2025', 'Programa de Assistência Social à Família', 'aberto', '2025-01-15', '2025-02-28', 500000),
('b2222222-2222-2222-2222-222222222222', 'EDITAL 002/2025', 'Capacitação Profissional de Jovens', 'em_analise', '2025-01-10', '2025-02-15', 750000),
('b3333333-3333-3333-3333-333333333333', 'EDITAL 003/2025', 'Proteção ao Meio Ambiente Urbano', 'homologado', '2024-11-01', '2024-12-20', 300000),
('b4444444-4444-4444-4444-444444444444', 'EDITAL 004/2025', 'Atenção à Saúde Mental Comunitária', 'aberto', '2025-01-20', '2025-03-15', 1200000);

-- 3. Inserir Emendas Parlamentares
INSERT INTO public.amendments (id, numero, autor, valor, ano, tipo, tipo_indicacao, status, descricao, prazo_legal, osc_beneficiaria_id) VALUES
('c1111111-1111-1111-1111-111111111111', 'EMD-2025-001', 'Vereador João Silva', 250000, 2025, 'Impositiva', 'Direta', 'Pendente', 'Recursos para assistência social no bairro Centro', '2025-06-30', 'a1111111-1111-1111-1111-111111111111'),
('c2222222-2222-2222-2222-222222222222', 'EMD-2025-002', 'Vereadora Maria Santos', 180000, 2025, 'Impositiva', 'Indireta', 'Vinculada', 'Apoio a programas de educação infantil', '2025-08-15', 'a2222222-2222-2222-2222-222222222222'),
('c3333333-3333-3333-3333-333333333333', 'EMD-2025-003', 'Vereador Pedro Oliveira', 320000, 2025, 'Ordinária', 'Direta', 'Executada', 'Capacitação profissional para mulheres', '2025-04-30', 'a3333333-3333-3333-3333-333333333333'),
('c4444444-4444-4444-4444-444444444444', 'EMD-2024-015', 'Vereadora Ana Costa', 150000, 2024, 'Impositiva', 'Direta', 'Pendente', 'Ações de combate à fome', '2025-03-31', NULL),
('c5555555-5555-5555-5555-555555555555', 'EMD-2025-005', 'Vereador Carlos Lima', 400000, 2025, 'Ordinária', 'Indireta', 'Vinculada', 'Reforma de centro comunitário', '2025-09-30', 'a4444444-4444-4444-4444-444444444444');

-- 4. Inserir PMIS
INSERT INTO public.pmis (id, protocolo, titulo, descricao, osc_proponente_id, area_atuacao, objetivo, publico_alvo, justificativa, status, parecer) VALUES
('d1111111-1111-1111-1111-111111111111', 'PMIS-2025-001', 'Hortas Comunitárias Urbanas', 'Implantação de hortas comunitárias em 10 bairros', 'a1111111-1111-1111-1111-111111111111', 'Meio Ambiente', 'Promover segurança alimentar e educação ambiental', 'Famílias em vulnerabilidade social', 'A insegurança alimentar afeta 30% das famílias do município', 'em_analise', NULL),
('d2222222-2222-2222-2222-222222222222', 'PMIS-2025-002', 'Escola de Música Popular', 'Curso de instrumentos musicais para jovens', 'a2222222-2222-2222-2222-222222222222', 'Cultura', 'Democratizar acesso à educação musical', 'Jovens de 12 a 18 anos', 'Falta de acesso a atividades culturais na periferia', 'recebido', NULL),
('d3333333-3333-3333-3333-333333333333', 'PMIS-2024-045', 'Proteção Animal', 'Centro de acolhimento para animais abandonados', 'a3333333-3333-3333-3333-333333333333', 'Proteção Animal', 'Reduzir abandono de animais nas ruas', 'Animais em situação de rua', 'Aumento de 40% nos casos de abandono', 'deferido', 'Proposta aprovada. Alinhada com políticas públicas municipais.'),
('d4444444-4444-4444-4444-444444444444', 'PMIS-2025-003', 'Inclusão Digital Sênior', 'Cursos de informática para idosos', 'a4444444-4444-4444-4444-444444444444', 'Assistência Social', 'Capacitar idosos no uso de tecnologia', 'Idosos acima de 60 anos', 'Exclusão digital afeta autonomia dos idosos', 'em_analise', NULL);

-- 5. Inserir Parcerias
INSERT INTO public.partnerships (id, numero_termo, osc_id, public_call_id, tipo_origem, status, valor_repassado, vigencia_inicio, vigencia_fim) VALUES
('e1111111-1111-1111-1111-111111111111', 'TF-2025-001', 'a1111111-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333', 'chamamento', 'execucao', 450000, '2025-01-01', '2025-12-31'),
('e2222222-2222-2222-2222-222222222222', 'TC-2024-015', 'a2222222-2222-2222-2222-222222222222', NULL, 'emenda', 'monitoramento', 280000, '2024-06-01', '2025-05-31'),
('e3333333-3333-3333-3333-333333333333', 'AC-2025-002', 'a3333333-3333-3333-3333-333333333333', NULL, 'chamamento', 'celebracao', 0, '2025-02-01', '2026-01-31'),
('e4444444-4444-4444-4444-444444444444', 'TF-2024-020', 'a4444444-4444-4444-4444-444444444444', 'b3333333-3333-3333-3333-333333333333', 'chamamento', 'prestacao_contas', 620000, '2024-01-01', '2024-12-31'),
('e5555555-5555-5555-5555-555555555555', 'TC-2025-003', 'a5555555-5555-5555-5555-555555555555', 'b2222222-2222-2222-2222-222222222222', 'emenda', 'planejamento', 180000, '2025-03-01', '2025-08-31');

-- 6. Inserir Propostas
INSERT INTO public.proposals (id, titulo, descricao, public_call_id, osc_id, valor_solicitado, status, pontuacao_tecnica, pontuacao_total, ranking, data_inscricao) VALUES
('f1111111-1111-1111-1111-111111111111', 'Projeto Família Unida', 'Atendimento psicossocial a famílias vulneráveis', 'b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 480000, 'inscrita', NULL, NULL, NULL, '2025-01-16'),
('f2222222-2222-2222-2222-222222222222', 'Jovem Profissional', 'Capacitação em TI para jovens de periferia', 'b2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 720000, 'avaliada', 85, 85, 1, '2025-01-12'),
('f3333333-3333-3333-3333-333333333333', 'Verde Cidade', 'Arborização e conscientização ambiental', 'b3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 290000, 'classificada', 78, 78, 2, '2024-11-15'),
('f4444444-4444-4444-4444-444444444444', 'Mente Sã', 'Atendimento em saúde mental comunitária', 'b4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 1100000, 'inscrita', NULL, NULL, NULL, '2025-01-22'),
('f5555555-5555-5555-5555-555555555555', 'Emprego e Renda', 'Oficinas de empreendedorismo', 'b2222222-2222-2222-2222-222222222222', 'a5555555-5555-5555-5555-555555555555', 680000, 'avaliada', 72, 72, 3, '2025-01-11'),
('f6666666-6666-6666-6666-666666666666', 'Comunidade Ativa', 'Centro de convivência para idosos', 'b1111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', 450000, 'em_recurso', 65, 65, NULL, '2025-01-18');

-- 7. Inserir Aditivos e Apostilamentos
INSERT INTO public.additives (id, partnership_id, tipo, numero, motivo, justificativa, valor_anterior, valor_novo, prazo_anterior, prazo_novo, status) VALUES
('a0f11111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'aditivo', 'ADT-001/2025', 'Prorrogação de prazo', 'Necessidade de mais tempo para conclusão das metas devido a atrasos climáticos', 450000, 450000, '2025-12-31', '2026-06-30', 'pendente'),
('a0f22222-2222-2222-2222-222222222222', 'e2222222-2222-2222-2222-222222222222', 'aditivo', 'ADT-002/2025', 'Aumento de valor', 'Inflação de custos dos insumos acima do previsto', 280000, 350000, '2025-05-31', '2025-05-31', 'aprovado'),
('a0f33333-3333-3333-3333-333333333333', 'e4444444-4444-4444-4444-444444444444', 'apostilamento', 'APT-001/2025', 'Ajuste de cronograma', 'Reorganização das atividades sem alteração de valor ou prazo', 620000, 620000, '2024-12-31', '2024-12-31', 'aprovado'),
('a0f44444-4444-4444-4444-444444444444', 'e1111111-1111-1111-1111-111111111111', 'apostilamento', 'APT-002/2025', 'Correção de dados cadastrais', 'Atualização do endereço da sede da OSC', 450000, 450000, '2025-12-31', '2025-12-31', 'pendente'),
('a0f55555-5555-5555-5555-555555555555', 'e2222222-2222-2222-2222-222222222222', 'aditivo', 'ADT-003/2025', 'Supressão de meta', 'Redução de escopo por inviabilidade técnica', 280000, 230000, '2025-05-31', '2025-05-31', 'rejeitado');

-- 8. Inserir Transações Financeiras
INSERT INTO public.transactions (id, partnership_id, data_transacao, valor, tipo, categoria, fornecedor, status_conciliacao, url_comprovante) VALUES
('b0a11111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', '2025-01-10', 25000, 'despesa', 'Material de Consumo', 'Papelaria Central LTDA', 'conciliado', 'https://exemplo.com/nota1.pdf'),
('b0a22222-2222-2222-2222-222222222222', 'e1111111-1111-1111-1111-111111111111', '2025-01-15', 45000, 'despesa', 'Serviços de Terceiros', 'Consultoria Educa ME', 'pendente', 'https://exemplo.com/nota2.pdf'),
('b0a33333-3333-3333-3333-333333333333', 'e2222222-2222-2222-2222-222222222222', '2024-12-20', 18500, 'despesa', 'Equipamentos', 'Tech Solutions SA', 'conciliado', 'https://exemplo.com/nota3.pdf'),
('b0a44444-4444-4444-4444-444444444444', 'e2222222-2222-2222-2222-222222222222', '2025-01-05', 32000, 'despesa', 'Recursos Humanos', 'Folha de Pagamento', 'glosado', 'https://exemplo.com/nota4.pdf'),
('b0a55555-5555-5555-5555-555555555555', 'e4444444-4444-4444-4444-444444444444', '2024-11-28', 75000, 'despesa', 'Obras e Reformas', 'Construtora Beta LTDA', 'conciliado', 'https://exemplo.com/nota5.pdf'),
('b0a66666-6666-6666-6666-666666666666', 'e4444444-4444-4444-4444-444444444444', '2024-12-10', 12500, 'despesa', 'Material de Consumo', 'Mercado Atacadão', 'pendente', 'https://exemplo.com/nota6.pdf'),
('b0a77777-7777-7777-7777-777777777777', 'e1111111-1111-1111-1111-111111111111', '2025-01-20', 150000, 'receita', 'Repasse 1ª Parcela', 'Prefeitura Municipal', 'conciliado', 'https://exemplo.com/repasse1.pdf'),
('b0a88888-8888-8888-8888-888888888888', 'e2222222-2222-2222-2222-222222222222', '2024-08-15', 140000, 'receita', 'Repasse 2ª Parcela', 'Prefeitura Municipal', 'conciliado', 'https://exemplo.com/repasse2.pdf');

-- 9. Inserir Base de Conhecimento
INSERT INTO public.knowledge_base (id, titulo, conteudo, categoria, tags, ativo, visualizacoes) VALUES
('c0b11111-1111-1111-1111-111111111111', 'Como cadastrar uma nova OSC', 'Para cadastrar uma nova OSC, acesse o menu Cadastro de OSCs e clique em Nova Inscrição. Preencha todos os campos obrigatórios incluindo CNPJ, Razão Social e documentos.', 'Cadastros', ARRAY['osc', 'cadastro', 'cnpj'], true, 245),
('c0b22222-2222-2222-2222-222222222222', 'Tipos de Parcerias MROSC', 'O MROSC prevê três tipos de parcerias: Termo de Fomento (iniciativa da OSC), Termo de Colaboração (iniciativa da administração) e Acordo de Cooperação (sem repasse de recursos).', 'Parcerias', ARRAY['mrosc', 'fomento', 'colaboração'], true, 512);

-- 10. Inserir Eventos de Capacitação
INSERT INTO public.training_events (id, titulo, descricao, tipo, data_inicio, data_fim, vagas, inscritos, link_inscricao, ativo) VALUES
('d0c11111-1111-1111-1111-111111111111', 'Webinar: Prestação de Contas MROSC', 'Aprenda como realizar a prestação de contas corretamente', 'webinar', '2025-02-15 14:00:00', '2025-02-15 16:00:00', 100, 67, 'https://exemplo.com/inscricao1', true),
('d0c22222-2222-2222-2222-222222222222', 'Curso: Elaboração de Plano de Trabalho', 'Capacitação completa sobre planos de trabalho', 'curso', '2025-03-01 09:00:00', '2025-03-05 17:00:00', 30, 28, 'https://exemplo.com/inscricao2', true);

-- 11. Inserir Legislação
INSERT INTO public.legislation (id, titulo, tipo, numero, ementa, data_publicacao, ativo) VALUES
('e0d11111-1111-1111-1111-111111111111', 'Lei Federal nº 13.019/2014', 'lei', '13.019/2014', 'Estabelece o regime jurídico das parcerias entre a administração pública e as organizações da sociedade civil', '2014-07-31', true),
('e0d22222-2222-2222-2222-222222222222', 'Decreto Municipal nº 1.234/2023', 'decreto', '1.234/2023', 'Regulamenta a Lei Federal nº 13.019/2014 no âmbito municipal', '2023-06-15', true);
