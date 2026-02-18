import { sql } from '@vercel/postgres'

export { sql }

// Helper to execute queries with error handling
export async function query<T = any>(
  sqlString: TemplateStringsArray,
  ...values: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  try {
    const result = await sql.query(sqlString.join(''), values)
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Generate unique proposal number
export function generateProposalNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `P-${year}${month}-${random}`
}
