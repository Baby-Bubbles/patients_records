-- Criar bucket para armazenamento de arquivos
-- Execute este script no Supabase SQL Editor

-- Inserir bucket se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-files', 'medical-files', false)
ON CONFLICT (id) DO NOTHING;

-- Política de storage para permitir upload e download
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'medical-files');

CREATE POLICY "Allow authenticated downloads" ON storage.objects
FOR SELECT USING (bucket_id = 'medical-files');

CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'medical-files');
