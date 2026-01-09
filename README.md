# Prontuário Eletrônico - Baby Bubbles

Sistema de gestão de pacientes e atendimentos médicos desenvolvido em Next.js com Supabase.

## Visão Geral

O **Prontuário Eletrônico** é uma aplicação web completa para gerenciamento de registros médicos de pacientes, incluindo histórico de atendimentos, anexos de arquivos e exportação de dados. O sistema foi inicialmente desenvolvido no Vercel V0 e migrado para desenvolvimento local com VSCode e Claude Code.

## Tecnologias Utilizadas

### Frontend
- **Next.js 15.5.9** - Framework React com App Router
- **React 19.2.0** - Biblioteca UI
- **TypeScript 5** - Tipagem estática
- **Tailwind CSS 3.4** - Framework de estilos
- **shadcn/ui** - Componentes UI baseados em Radix UI
- **Lucide React** - Ícones
- **React Hook Form + Zod** - Gerenciamento e validação de formulários
- **date-fns** - Manipulação de datas
- **Recharts** - Gráficos e visualizações

### Backend & Banco de Dados
- **Supabase** - BaaS (Backend as a Service)
  - PostgreSQL para banco de dados
  - Storage para arquivos médicos
  - Row Level Security (RLS) habilitado
- **@supabase/supabase-js 2.90.0** - Cliente Supabase

### Autenticação & Segurança
- **jose** - JWT encryption/decryption para sessões
- **Next.js Middleware** - Proteção de rotas
- **httpOnly Cookies** - Armazenamento seguro de sessões
- **Server Actions** - Autenticação server-side

### Ferramentas de Desenvolvimento
- **pnpm** - Gerenciador de pacotes
- **ESLint** - Linter
- **PostCSS & Autoprefixer** - Processamento CSS

## Estrutura do Projeto

```
.
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions
│   │   └── auth.ts               # Ações de login/logout
│   ├── api/                      # API Routes
│   │   ├── appointments/         # Endpoints de atendimentos
│   │   ├── cron/                 # Endpoints de cron jobs
│   │   ├── files/                # Endpoints de arquivos
│   │   ├── patients/             # Endpoints de pacientes
│   │   └── share/                # Endpoints de compartilhamento
│   ├── diagnostics/              # Página de diagnóstico do sistema
│   ├── login/                    # Página de login
│   ├── share/                    # Páginas de compartilhamento
│   ├── layout.tsx                # Layout raiz
│   ├── page.tsx                  # Página inicial (lista de pacientes)
│   └── globals.css               # Estilos globais
├── components/                   # Componentes React
│   ├── ui/                       # Componentes UI base (shadcn)
│   ├── appointment-form.tsx      # Formulário de atendimento
│   ├── appointment-edit-form.tsx # Edição de atendimento
│   ├── patient-form.tsx          # Formulário de paciente
│   ├── patient-edit-form.tsx     # Edição de paciente
│   ├── patient-details.tsx       # Detalhes do paciente
│   ├── file-upload.tsx           # Upload de arquivos
│   ├── file-list.tsx             # Lista de arquivos
│   └── database-status.tsx       # Status da conexão
├── lib/                          # Utilitários e serviços
│   ├── api-client.ts             # Cliente HTTP para API
│   ├── auth.ts                   # Autenticação e sessões JWT
│   ├── database-service.ts       # Serviço de banco de dados
│   ├── supabase-client.ts        # Cliente Supabase
│   ├── file-storage.ts           # Serviço de armazenamento
│   ├── data-migration.ts         # Migração de dados
│   ├── date-utils.ts             # Utilitários de data
│   ├── file-utils.ts             # Utilitários de arquivo
│   └── share-service.ts          # Serviço de compartilhamento
├── scripts/                      # Scripts SQL
│   ├── 001-create-tables.sql     # Criação de tabelas
│   ├── 002-create-storage-bucket.sql # Criação do bucket
│   └── 003-create-heartbeat-table.sql # Tabela de heartbeat logs
├── middleware.ts                 # Middleware de autenticação (raiz)
├── public/                       # Arquivos estáticos
├── styles/                       # Estilos adicionais
└── utils/                        # Utilitários gerais
```

## Modelo de Dados

### Tabela: `patients` (Pacientes)
```sql
- id: UUID (PK)
- name: VARCHAR(255) - Nome do paciente
- cpf: VARCHAR(14) - CPF (único)
- birth_date: DATE - Data de nascimento
- phone: VARCHAR(20) - Telefone
- email: VARCHAR(255) - E-mail (opcional)
- address: TEXT - Endereço (opcional)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Tabela: `appointments` (Atendimentos)
```sql
- id: UUID (PK)
- patient_id: UUID (FK -> patients)
- date: TIMESTAMP - Data/hora do atendimento
- doctor: VARCHAR(255) - Nome do médico
- diagnosis: TEXT - Diagnóstico
- anamnesis: TEXT - Anamnese
- heart_rate: INTEGER - Frequência cardíaca
- respiratory_rate: INTEGER - Frequência respiratória
- saturation: INTEGER - Saturação (0-100%)
- temperature: DECIMAL(4,1) - Temperatura
- cardiac_auscultation: TEXT - Ausculta cardíaca
- evolution: TEXT - Evolução
- medications: TEXT - Medicamentos
- additional_guidance: TEXT - Orientações adicionais
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### Tabela: `file_attachments` (Anexos)
```sql
- id: UUID (PK)
- appointment_id: UUID (FK -> appointments)
- original_name: VARCHAR(255) - Nome original do arquivo
- file_path: VARCHAR(500) - Caminho no storage
- file_size: BIGINT - Tamanho em bytes
- file_type: VARCHAR(100) - Tipo MIME
- uploaded_at: TIMESTAMP
```

### Tabela: `heartbeat_logs` (Logs de Heartbeat)
```sql
- id: UUID (PK)
- executed_at: TIMESTAMP - Data/hora da execução
- status: VARCHAR(20) - Status (success/failure)
- response_time_ms: INTEGER - Tempo de resposta em ms
- patient_count: INTEGER - Total de pacientes (opcional)
- error_message: TEXT - Mensagem de erro (opcional)
- error_details: JSONB - Detalhes do erro (opcional)
- created_at: TIMESTAMP
```

## Funcionalidades

### Gestão de Pacientes
- ✅ Cadastro de pacientes com dados pessoais
- ✅ Listagem e busca por nome ou CPF
- ✅ Edição de dados cadastrais
- ✅ Visualização de histórico completo
- ✅ Exportação de dados em CSV

### Gestão de Atendimentos
- ✅ Registro de atendimentos médicos
- ✅ Campos completos (anamnese, diagnóstico, sinais vitais)
- ✅ Anexo de múltiplos arquivos por atendimento
- ✅ Edição de atendimentos existentes
- ✅ Ordenação por data (mais recentes primeiro)

### Arquivos e Anexos
- ✅ Upload de arquivos médicos (exames, laudos, etc.)
- ✅ Armazenamento seguro no Supabase Storage
- ✅ Download de arquivos com URLs assinadas
- ✅ Exclusão de anexos
- ✅ Validação de tipos e tamanhos

### Autenticação e Segurança
- ✅ Proteção por senha com sessões JWT
- ✅ Cookies httpOnly para segurança contra XSS
- ✅ Middleware de autenticação em todas as rotas
- ✅ Sessões de 7 dias com renovação automática
- ✅ Página de login em PT-BR

### Recursos Adicionais
- ✅ Sistema de diagnóstico para verificar conectividade
- ✅ Heartbeat diário automático (previne pausa do Supabase)
- ✅ Migração de dados do localStorage para Supabase
- ✅ Compartilhamento de atendimentos com token e senha
- ✅ Interface responsiva (mobile-first)
- ✅ Analytics com Vercel Analytics

## Configuração do Ambiente

### Pré-requisitos
- Node.js 18+ instalado
- Conta no Supabase
- pnpm instalado (ou npm/yarn)

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```bash
# Supabase Configuration
NEXT_PUBLIC_db2_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_db2_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica_do_supabase

# Authentication - Single shared password
APP_PASSWORD=sua_senha_segura_aqui

# Session encryption secret (generate with: openssl rand -base64 32)
SESSION_SECRET=sua_session_secret_aqui

# Vercel Cron Secret (generate with: openssl rand -base64 32)
CRON_SECRET=sua_cron_secret_aqui
```

**Importante:**
- As variáveis Supabase usam o prefixo `db2_` conforme configurado pelo Vercel V0
- `APP_PASSWORD`: Senha compartilhada para acessar o sistema (mínimo 12 caracteres)
- `SESSION_SECRET`: Chave para criptografar sessões JWT (gere com `openssl rand -base64 32`)
- `CRON_SECRET`: Proteção do endpoint de heartbeat (gere com `openssl rand -base64 32`)

### Configuração do Supabase

1. **Criar Projeto no Supabase**
   - Acesse [supabase.com](https://supabase.com)
   - Crie um novo projeto
   - Copie a URL e a chave anon/public

2. **Executar Scripts SQL**
   - Abra o SQL Editor no Supabase
   - Execute `scripts/001-create-tables.sql` (tabelas principais)
   - Execute `scripts/002-create-storage-bucket.sql` (bucket de arquivos)
   - Execute `scripts/003-create-heartbeat-table.sql` (logs de heartbeat)

3. **Configurar Storage**
   - Verifique se o bucket `medical-files` foi criado
   - Confirme as políticas de acesso no painel Storage

4. **Configurar Cron Job no Vercel** (Produção)
   - O arquivo `vercel.json` já está configurado
   - Heartbeat executa diariamente à meia-noite UTC
   - Previne pausa do banco Supabase por inatividade

## Instalação e Execução

```bash
# Instalar dependências
pnpm install

# Executar em modo de desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Executar em produção
pnpm start

# Linter
pnpm lint
```

O servidor de desenvolvimento estará disponível em `http://localhost:3000`

## Fluxo de Dados

### Criação de Atendimento
1. Usuário preenche formulário de atendimento
2. Sistema cria registro na tabela `appointments`
3. Arquivos são enviados para o Supabase Storage
4. Metadados dos arquivos são salvos em `file_attachments`
5. Interface é atualizada com os dados completos

### Autenticação e Segurança

#### Sistema de Autenticação
- **Senha única compartilhada**: Acesso controlado via `APP_PASSWORD`
- **Sessões JWT**: Criptografia HS256 com chave `SESSION_SECRET`
- **Cookies httpOnly**: Proteção contra ataques XSS
- **Middleware Next.js**: Proteção em todas as rotas privadas
- **Duração da sessão**: 7 dias com renovação automática
- **Server Actions**: Autenticação server-side com CSRF protection

#### Rotas Protegidas
- `/` - Dashboard principal (requer login)
- `/api/patients/*` - Gestão de pacientes (requer login)
- `/api/appointments/*` - Gestão de atendimentos (requer login)
- `/api/files/*` - Upload/download de arquivos (requer login)

#### Rotas Públicas
- `/login` - Página de autenticação
- `/diagnostics` - Status do sistema
- `/share/[token]` - Compartilhamento com token e senha própria
- `/api/cron/heartbeat` - Protegido por `CRON_SECRET`

#### Banco de Dados
- Row Level Security (RLS) habilitado em todas as tabelas
- Políticas de acesso configuradas via Supabase
- URLs de download assinadas com expiração de 1 hora

## Formato de Data

O sistema utiliza o formato brasileiro **DD/MM/YYYY** para exibição de datas, conforme especificado nos requisitos do projeto.

## Idioma

Todo o conteúdo da interface está em **Português Brasileiro (PT-BR)**, incluindo:
- Labels de formulários
- Mensagens de erro e sucesso
- Títulos e descrições
- Exportação de dados

## Problemas Conhecidos

### Variáveis de Ambiente (Vercel V0)
O projeto foi iniciado no Vercel V0, que usa variáveis com prefixo `db2_`:
- `NEXT_PUBLIC_db2_SUPABASE_URL`
- `NEXT_PUBLIC_db2_SUPABASE_PUBLISHABLE_KEY`

Esta nomenclatura foi mantida para compatibilidade. Em novos projetos, considere usar nomes mais convencionais.

## Diagnóstico do Sistema

Acesse `/diagnostics` para verificar:
- Status da conexão com Supabase
- Configuração das variáveis de ambiente
- Informações do sistema
- Dicas de resolução de problemas

## Roadmap

### Concluído ✅
- [x] Sistema de autenticação com senha única
- [x] Proteção de rotas com middleware
- [x] Sessões JWT com httpOnly cookies
- [x] Heartbeat automático para Supabase
- [x] Sistema de compartilhamento com token e senha

### Em Desenvolvimento
- [ ] Controle de acesso baseado em perfis (multi-usuário)
- [ ] Relatórios e estatísticas
- [ ] Impressão de prontuários
- [ ] Backup automático de dados

### Melhorias Futuras
- [ ] Autenticação com 2FA
- [ ] Agendamento de consultas
- [ ] Lembretes e notificações
- [ ] Histórico de versões de atendimentos
- [ ] Assinatura digital de documentos
- [ ] Integração com outros sistemas (TISS, etc.)
- [ ] Modo offline com sincronização
- [ ] Rate limiting no login

## Desenvolvimento

Este projeto está sendo desenvolvido por G. Beltrami como um projeto paralelo (_side project_) para gestão de registros médicos.

### Migração Vercel V0 → Claude Code
O projeto foi inicialmente desenvolvido no Vercel V0 e posteriormente migrado para desenvolvimento local usando:
- VSCode como IDE
- Claude Code para assistência de desenvolvimento
- Controle de versão com Git/GitHub

## Repositório

GitHub: [https://github.com/Baby-Bubbles/patients_records.git](https://github.com/Baby-Bubbles/patients_records.git)

## Licença

Este é um projeto privado/proprietário. Todos os direitos reservados.

---

**Última atualização:** 2026-01-08
**Versão:** 0.2.0
**Status:** Em desenvolvimento ativo

## Changelog

### v0.2.0 (2026-01-08)
- ✅ Implementado sistema de autenticação com senha única
- ✅ Adicionado middleware de proteção de rotas
- ✅ Sessões JWT com cookies httpOnly (7 dias)
- ✅ Página de login em PT-BR
- ✅ Heartbeat diário para prevenir pausa do Supabase
- ✅ Proteção de endpoints de API

### v0.1.0 (2026-01-07)
- ✅ Versão inicial do prontuário eletrônico
- ✅ CRUD completo de pacientes e atendimentos
- ✅ Sistema de upload de arquivos
- ✅ Compartilhamento com token e senha
- ✅ Migração do Vercel V0 para desenvolvimento local
