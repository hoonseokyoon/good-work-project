import "server-only"
import { createClient } from "@supabase/supabase-js"
import { institutions, products, news, events } from "@/data/mock-data"

type TableMap = {
  institutions: typeof institutions
  products: typeof products
  news: typeof news
  events: typeof events
}

type TableName = keyof TableMap

type BuilderResult<T> = Promise<{ data: T | null; error: null }>

class MockQueryBuilder<T> {
  private rows: T[]

  constructor(private readonly table: TableName) {
    this.rows = [...(mockTables[table] as T[])]
  }

  select(_: string = "*") {
    return this
  }

  order(column: keyof T & string, options?: { ascending?: boolean }) {
    const ascending = options?.ascending ?? true
    this.rows = [...this.rows].sort((a: any, b: any) => {
      if (a[column] === b[column]) return 0
      return (a[column] > b[column] ? 1 : -1) * (ascending ? 1 : -1)
    })
    return this
  }

  eq(column: keyof T & string, value: any) {
    this.rows = this.rows.filter((item: any) => item[column] === value)
    return this
  }

  limit(count: number) {
    this.rows = this.rows.slice(0, count)
    return this
  }

  range(from: number, to: number) {
    this.rows = this.rows.slice(from, to + 1)
    return this
  }

  single(): BuilderResult<T> {
    const data = this.rows.length ? (this.rows[0] as T) : null
    return Promise.resolve({ data, error: null })
  }

  maybeSingle(): BuilderResult<T> {
    return this.single()
  }

  then<TResult1 = { data: T[]; error: null }, TResult2 = never>(
    onfulfilled?: ((value: { data: T[]; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    const value = { data: this.rows as T[], error: null }
    return Promise.resolve(value).then(onfulfilled, onrejected)
  }
}

const mockTables: TableMap = {
  institutions,
  products,
  news,
  events
}

const mockClient = {
  from<T extends TableName>(table: T) {
    return new MockQueryBuilder<TableMap[T][number]>(table)
  }
}

export function sb() {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    })
  }

  return mockClient
}
