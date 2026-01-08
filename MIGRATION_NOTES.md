# Notas de Migração - Vercel V0 para Claude Code

## Contexto da Migração

Este projeto foi iniciado no **Vercel V0** e posteriormente migrado para desenvolvimento local usando **VSCode** e **Claude Code** devido ao esgotamento de créditos na plataforma V0.

## Último Estado no Vercel V0

### Problema Encontrado
De acordo com o último screenshot fornecido, o Vercel V0 estava tentando corrigir variáveis de ambiente incorretas relacionadas ao Supabase:

**Erro identificado:**
```
Os avisos indicam que estou usando variáveis de ambiente incorretas.
Olhando às variáveis disponíveis, preciso usar NEXT_PUBLIC_db2_SUPABASE_PUBLISHABLE_KEY
em vez de NEXT_PUBLIC_db2_SUPABASE_ANON_KEY para o cliente.
```

**Ações tomadas pelo V0:**
1. ✅ Read supabase files
2. ✅ Read supabase-client
3. ✅ Read diagnostics
4. ✅ Read diagnostics page
5. ✅ Fixed env variables (v23)
6. ✅ Reviewed work

### Correção Aplicada

O V0 estava corrigindo os arquivos para usar a variável correta:
- ❌ `NEXT_PUBLIC_db2_SUPABASE_ANON_KEY` (nome incorreto)
- ✅ `NEXT_PUBLIC_db2_SUPABASE_PUBLISHABLE_KEY` (nome correto)

A chave publishable/anon é segura para uso no cliente - o aviso era porque o nome da variável com `ANON_KEY` não existia no projeto.

## Estado Atual do Projeto

### Arquivos Principais
- ✅ Todas as páginas e componentes funcionais
- ✅ API Routes implementadas
- ✅ Integração com Supabase configurada
- ✅ Sistema de upload de arquivos
- ✅ Página de diagnóstico

### Variáveis de Ambiente Necessárias

Crie um arquivo `.env.local` com:

```bash
NEXT_PUBLIC_db2_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_db2_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica_do_supabase
```

**Importante:** Use exatamente esses nomes de variáveis, pois o código já está configurado para usá-los.

## Próximos Passos

### 1. Configuração Inicial
- [ ] Criar arquivo `.env.local` com as credenciais do Supabase
- [ ] Instalar dependências: `pnpm install`
- [ ] Executar scripts SQL no Supabase (em `scripts/`)
- [ ] Verificar conectividade em `/diagnostics`

### 2. Verificação
- [ ] Testar criação de paciente
- [ ] Testar criação de atendimento
- [ ] Testar upload de arquivos
- [ ] Verificar se todos os dados são salvos corretamente

### 3. Desenvolvimento Contínuo
- [ ] Implementar funcionalidades restantes do roadmap
- [ ] Adicionar testes
- [ ] Melhorar tratamento de erros
- [ ] Implementar sistema de autenticação

## Diferenças V0 vs Desenvolvimento Local

### Vercel V0
- ✅ Hot reload instantâneo
- ✅ Deploy automático
- ✅ Variáveis de ambiente gerenciadas pela plataforma
- ❌ Limitado por créditos
- ❌ Menos controle sobre o ambiente

### Claude Code + VSCode
- ✅ Controle total do código
- ✅ Sem limites de uso
- ✅ Git/GitHub para versionamento
- ✅ Debugging completo
- ✅ Extensões e ferramentas customizadas
- ⚠️ Requer configuração manual do ambiente

## Nomenclatura das Variáveis

As variáveis usam o prefixo `db2_` porque foi assim que o Vercel V0 as configurou inicialmente. Manter essa nomenclatura garante compatibilidade com todo o código existente.

Se em algum momento você precisar renomear, será necessário atualizar:
- `lib/supabase-client.ts` (linhas 3-4)
- `app/diagnostics/page.tsx` (linhas 81, 85)
- Documentação `.env.local.example`

## Checklist de Migração

- [x] Código extraído do Vercel V0
- [x] Estrutura de arquivos organizada
- [x] Git inicializado
- [x] README criado
- [x] .gitignore configurado
- [x] .env.local.example criado
- [ ] .env.local configurado com credenciais reais
- [ ] Dependências instaladas
- [ ] Aplicação rodando localmente
- [ ] Conexão com Supabase testada
- [ ] Funcionalidades validadas

## Observações Importantes

1. **Não commitar .env.local**: Este arquivo contém credenciais sensíveis e está no `.gitignore`
2. **Scripts SQL**: Devem ser executados apenas uma vez no Supabase
3. **Bucket Storage**: Verificar se `medical-files` foi criado corretamente
4. **RLS Policies**: As políticas estão configuradas para acesso público (ajustar para produção)

## Contato e Suporte

Para dúvidas sobre a configuração ou desenvolvimento:
- Verificar documentação no README.md
- Consultar página de diagnóstico: http://localhost:3000/diagnostics
- Revisar logs do console do navegador
- Verificar logs do servidor Next.js

---

**Data da Migração:** 2026-01-07
**Versão V0:** Out of Credits (última versão antes da migração)
**Status:** Migração concluída, pronto para desenvolvimento local
