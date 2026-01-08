import { supabase } from "./supabase-client"

export class DatabaseDiagnostics {
  static async runFullDiagnostic(): Promise<{
    success: boolean
    results: { test: string; status: "✅" | "❌"; message: string }[]
  }> {
    const results: { test: string; status: "✅" | "❌"; message: string }[] = []

    // Test 1: Basic connection
    try {
      const { error } = await supabase.from("patients").select("count").limit(1)
      if (error) throw error
      results.push({
        test: "Conexão básica",
        status: "✅",
        message: "Conectado ao Supabase com sucesso",
      })
    } catch (error) {
      results.push({
        test: "Conexão básica",
        status: "❌",
        message: `Erro de conexão: ${(error as Error).message}`,
      })
      return { success: false, results }
    }

    // Test 2: Tables exist
    const tables = ["patients", "appointments", "file_attachments"]
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select("*").limit(1)
        if (error) throw error
        results.push({
          test: `Tabela ${table}`,
          status: "✅",
          message: "Tabela existe e acessível",
        })
      } catch (error) {
        results.push({
          test: `Tabela ${table}`,
          status: "❌",
          message: `Tabela não encontrada: ${(error as Error).message}`,
        })
      }
    }

    // Test 3: Storage bucket
    try {
      const { data, error } = await supabase.storage.from("medical-files").list("", { limit: 1 })
      if (error) throw error
      results.push({
        test: "Storage bucket",
        status: "✅",
        message: "Bucket 'medical-files' configurado corretamente",
      })
    } catch (error) {
      results.push({
        test: "Storage bucket",
        status: "❌",
        message: `Bucket não encontrado: ${(error as Error).message}`,
      })
    }

    // Test 4: Insert/Update/Delete permissions
    try {
      // Test insert
      const { data: insertData, error: insertError } = await supabase
        .from("patients")
        .insert({
          name: "Teste Diagnóstico",
          cpf: "000.000.000-00",
          birth_date: "2000-01-01",
          phone: "(00) 00000-0000",
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Test update
      const { error: updateError } = await supabase
        .from("patients")
        .update({ name: "Teste Diagnóstico Atualizado" })
        .eq("id", insertData.id)

      if (updateError) throw updateError

      // Test delete
      const { error: deleteError } = await supabase.from("patients").delete().eq("id", insertData.id)

      if (deleteError) throw deleteError

      results.push({
        test: "Operações CRUD",
        status: "✅",
        message: "Insert, Update e Delete funcionando",
      })
    } catch (error) {
      results.push({
        test: "Operações CRUD",
        status: "❌",
        message: `Erro nas operações: ${(error as Error).message}`,
      })
    }

    const success = results.every((result) => result.status === "✅")
    return { success, results }
  }

  static async getSystemInfo(): Promise<{
    supabaseUrl: string
    hasAnonKey: boolean
    tablesCount: { [key: string]: number }
  }> {
    const info = {
      supabaseUrl: process.env.NEXT_PUBLIC_db2_SUPABASE_URL || "❌ Não configurado",
      hasAnonKey: !!process.env.NEXT_PUBLIC_db2_SUPABASE_PUBLISHABLE_KEY,
      tablesCount: {} as { [key: string]: number },
    }

    // Count records in each table
    const tables = ["patients", "appointments", "file_attachments"]
    for (const table of tables) {
      try {
        const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true })
        if (error) throw error
        info.tablesCount[table] = count || 0
      } catch {
        info.tablesCount[table] = -1 // Error
      }
    }

    return info
  }
}
