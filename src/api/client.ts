// URL da API definida no build (VITE_API_URL); padrão: backend local
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

type DetalheErro = { campo: string; mensagem: string }

// Erro no formato do errorHandler do backend: { erro, detalhes? }
export class ApiError extends Error {
  status: number
  detalhes: DetalheErro[]

  constructor(status: number, mensagem: string, detalhes: DetalheErro[] = []) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
    this.detalhes = detalhes
  }
}

export async function request<T>(caminho: string, init: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${caminho}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init.headers },
    })
  } catch {
    throw new ApiError(0, `Não foi possível conectar à API em ${API_URL}`)
  }

  if (res.status === 204) return undefined as T

  const corpo = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(res.status, corpo?.erro ?? `Erro ${res.status}`, corpo?.detalhes)
  }
  return corpo as T
}

export const api = {
  get: <T>(caminho: string) => request<T>(caminho),
  post: <T>(caminho: string, dados?: unknown) =>
    request<T>(caminho, { method: 'POST', body: JSON.stringify(dados) }),
  put: <T>(caminho: string, dados: unknown) =>
    request<T>(caminho, { method: 'PUT', body: JSON.stringify(dados) }),
  patch: <T>(caminho: string) => request<T>(caminho, { method: 'PATCH' }),
  delete: (caminho: string) => request<void>(caminho, { method: 'DELETE' }),
}
