// Utilitários para formatação de datas
export function formatDateToBR(date: string | Date): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ""

  const day = d.getDate().toString().padStart(2, "0")
  const month = (d.getMonth() + 1).toString().padStart(2, "0")
  const year = d.getFullYear()

  return `${day}/${month}/${year}`
}

export function formatDateTimeToBR(date: string | Date): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ""

  const day = d.getDate().toString().padStart(2, "0")
  const month = (d.getMonth() + 1).toString().padStart(2, "0")
  const year = d.getFullYear()
  const hours = d.getHours().toString().padStart(2, "0")
  const minutes = d.getMinutes().toString().padStart(2, "0")

  return `${day}/${month}/${year} às ${hours}:${minutes}`
}

export function formatDateForInput(date: string | Date): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ""

  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, "0")
  const day = d.getDate().toString().padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function formatDateTimeForInput(date: string | Date): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ""

  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, "0")
  const day = d.getDate().toString().padStart(2, "0")
  const hours = d.getHours().toString().padStart(2, "0")
  const minutes = d.getMinutes().toString().padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}
