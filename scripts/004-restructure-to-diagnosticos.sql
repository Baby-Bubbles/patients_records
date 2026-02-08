-- Migration: Restructure from Patient -> Appointments to Patient -> Diagnosticos -> Atendimentos
-- Version: 004
-- Description: Creates new 3-level hierarchy with data migration

-- ============================================================================
-- PHASE 1: Create new tables
-- ============================================================================

-- Table: diagnosticos (Diagnósticos)
CREATE TABLE IF NOT EXISTS diagnosticos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    start_date TIMESTAMP NOT NULL,           -- Data de início (OBRIGATÓRIO)
    discharge_date TIMESTAMP,                -- Data de alta
    doctor VARCHAR(255),                     -- Pediatra/Médico
    anamnesis TEXT,                          -- Anamnese
    diagnosis TEXT,                          -- Diagnóstico
    heart_rate INTEGER,                      -- FC
    respiratory_rate INTEGER,                -- FR
    saturation INTEGER,                      -- Saturação
    temperature DECIMAL(4,1),                -- Temperatura
    cardiac_auscultation TEXT,               -- Ausculta cardíaca
    evolution TEXT,                          -- Evolução e Conduta
    medications TEXT,                        -- Medicamentos em uso
    additional_guidance TEXT,                -- Orientações adicionais
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: atendimentos (Atendimentos)
CREATE TABLE IF NOT EXISTS atendimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagnostico_id UUID NOT NULL REFERENCES diagnosticos(id) ON DELETE CASCADE,
    date TIMESTAMP NOT NULL,                 -- Data + Horário (OBRIGATÓRIO)
    heart_rate INTEGER,                      -- FC
    respiratory_rate INTEGER,                -- FR
    saturation INTEGER,                      -- Saturação
    temperature DECIMAL(4,1),                -- Temperatura
    cardiac_auscultation TEXT,               -- Ausculta cardíaca
    evolution TEXT,                          -- Evolução e Condutas
    additional_guidance TEXT,                -- Orientações adicionais
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PHASE 2: Update file_attachments for polymorphic support
-- ============================================================================

-- Add new columns for polymorphic attachments
ALTER TABLE file_attachments
ADD COLUMN IF NOT EXISTS entity_type VARCHAR(20) DEFAULT 'appointment',
ADD COLUMN IF NOT EXISTS diagnostico_id UUID REFERENCES diagnosticos(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS atendimento_id UUID REFERENCES atendimentos(id) ON DELETE CASCADE;

-- ============================================================================
-- PHASE 3: Data Migration
-- ============================================================================

-- For each patient with appointments:
-- 1. Create a Diagnostico from the first (oldest) appointment
-- 2. Create Atendimentos from all appointments linked to that Diagnostico
-- 3. Update file_attachments to point to atendimento_id

-- Step 3.1: Create diagnosticos from first appointments per patient
INSERT INTO diagnosticos (
    id,
    patient_id,
    start_date,
    doctor,
    anamnesis,
    diagnosis,
    heart_rate,
    respiratory_rate,
    saturation,
    temperature,
    cardiac_auscultation,
    evolution,
    medications,
    additional_guidance,
    created_at
)
SELECT
    gen_random_uuid(),
    patient_id,
    date as start_date,
    doctor,
    anamnesis,
    diagnosis,
    heart_rate,
    respiratory_rate,
    saturation,
    temperature,
    cardiac_auscultation,
    evolution,
    medications,
    additional_guidance,
    created_at
FROM (
    SELECT DISTINCT ON (patient_id) *
    FROM appointments
    ORDER BY patient_id, date ASC
) first_appointments;

-- Step 3.2: Create diagnosticos for patients WITHOUT appointments (empty diagnostico)
INSERT INTO diagnosticos (
    patient_id,
    start_date,
    created_at
)
SELECT
    p.id as patient_id,
    NOW() as start_date,
    NOW() as created_at
FROM patients p
WHERE NOT EXISTS (
    SELECT 1 FROM diagnosticos d WHERE d.patient_id = p.id
);

-- Step 3.3: Create atendimentos from ALL appointments
-- First, we need to create a mapping table temporarily
CREATE TEMP TABLE appointment_diagnostico_mapping AS
SELECT
    a.id as appointment_id,
    a.patient_id,
    d.id as diagnostico_id
FROM appointments a
JOIN diagnosticos d ON d.patient_id = a.patient_id;

-- Insert all appointments as atendimentos
INSERT INTO atendimentos (
    id,
    diagnostico_id,
    date,
    heart_rate,
    respiratory_rate,
    saturation,
    temperature,
    cardiac_auscultation,
    evolution,
    additional_guidance,
    created_at
)
SELECT
    a.id,  -- Keep same ID for file_attachments reference
    m.diagnostico_id,
    a.date,
    a.heart_rate,
    a.respiratory_rate,
    a.saturation,
    a.temperature,
    a.cardiac_auscultation,
    a.evolution,
    a.additional_guidance,
    a.created_at
FROM appointments a
JOIN appointment_diagnostico_mapping m ON m.appointment_id = a.id;

-- Step 3.4: Update file_attachments to point to atendimento_id
UPDATE file_attachments
SET
    entity_type = 'atendimento',
    atendimento_id = appointment_id
WHERE appointment_id IS NOT NULL;

-- Drop temp table
DROP TABLE IF EXISTS appointment_diagnostico_mapping;

-- ============================================================================
-- PHASE 4: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_diagnosticos_patient_id ON diagnosticos(patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_start_date ON diagnosticos(start_date);
CREATE INDEX IF NOT EXISTS idx_atendimentos_diagnostico_id ON atendimentos(diagnostico_id);
CREATE INDEX IF NOT EXISTS idx_atendimentos_date ON atendimentos(date);
CREATE INDEX IF NOT EXISTS idx_file_attachments_entity_type ON file_attachments(entity_type);
CREATE INDEX IF NOT EXISTS idx_file_attachments_diagnostico_id ON file_attachments(diagnostico_id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_atendimento_id ON file_attachments(atendimento_id);

-- ============================================================================
-- PHASE 5: Create updated_at trigger for new tables
-- ============================================================================

-- Create or replace the update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_diagnosticos_updated_at ON diagnosticos;
CREATE TRIGGER update_diagnosticos_updated_at
    BEFORE UPDATE ON diagnosticos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_atendimentos_updated_at ON atendimentos;
CREATE TRIGGER update_atendimentos_updated_at
    BEFORE UPDATE ON atendimentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PHASE 6: Enable RLS (Row Level Security) for new tables
-- ============================================================================

ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE atendimentos ENABLE ROW LEVEL SECURITY;

-- Create policies for diagnosticos
DROP POLICY IF EXISTS "Allow all operations on diagnosticos" ON diagnosticos;
CREATE POLICY "Allow all operations on diagnosticos" ON diagnosticos
    FOR ALL USING (true) WITH CHECK (true);

-- Create policies for atendimentos
DROP POLICY IF EXISTS "Allow all operations on atendimentos" ON atendimentos;
CREATE POLICY "Allow all operations on atendimentos" ON atendimentos
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- NOTES:
-- ============================================================================
-- After running this migration:
-- 1. The old 'appointments' table is preserved for rollback purposes
-- 2. All data has been migrated to the new structure
-- 3. File attachments have been updated to reference atendimentos
-- 4. You can optionally drop the 'appointments' table after verifying migration:
--    DROP TABLE appointments;
-- ============================================================================
