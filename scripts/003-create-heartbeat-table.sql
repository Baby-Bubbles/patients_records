-- Criar tabela de logs de heartbeat
-- Execute este script no Supabase SQL Editor após executar 001 e 002

-- Tabela de logs de heartbeat para monitoramento
CREATE TABLE IF NOT EXISTS heartbeat_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failure')),
    response_time_ms INTEGER NOT NULL,
    patient_count INTEGER,
    error_message TEXT,
    error_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultas de monitoramento
CREATE INDEX IF NOT EXISTS idx_heartbeat_logs_executed_at ON heartbeat_logs(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_heartbeat_logs_status ON heartbeat_logs(status);
CREATE INDEX IF NOT EXISTS idx_heartbeat_logs_status_executed_at ON heartbeat_logs(status, executed_at DESC);

-- RLS (Row Level Security) policies
ALTER TABLE heartbeat_logs ENABLE ROW LEVEL SECURITY;

-- Permitir operações de leitura para monitoramento
CREATE POLICY "Allow read operations on heartbeat_logs" ON heartbeat_logs
FOR SELECT USING (true);

-- Permitir inserções da API (será restrito pela secret do cron na camada de aplicação)
CREATE POLICY "Allow insert operations on heartbeat_logs" ON heartbeat_logs
FOR INSERT WITH CHECK (true);

-- Comentários para documentação
COMMENT ON TABLE heartbeat_logs IS 'Armazena resultados das verificações diárias de heartbeat do banco de dados para monitoramento e alertas';
COMMENT ON COLUMN heartbeat_logs.status IS 'Status da execução: success ou failure';
COMMENT ON COLUMN heartbeat_logs.response_time_ms IS 'Tempo de resposta da query em milissegundos';
COMMENT ON COLUMN heartbeat_logs.patient_count IS 'Total de pacientes (null se a query falhou)';
COMMENT ON COLUMN heartbeat_logs.error_message IS 'Mensagem de erro legível se status for failure';
COMMENT ON COLUMN heartbeat_logs.error_details IS 'Informações detalhadas de erro em formato JSON';
