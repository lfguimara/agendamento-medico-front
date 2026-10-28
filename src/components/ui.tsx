import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { ApiError } from '../api/client'
import type { StatusConsulta } from '../api/types'

const variantes = {
  primario: 'bg-teal-600 text-white hover:bg-teal-700 disabled:bg-teal-300',
  secundario: 'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50',
  perigo: 'bg-white text-red-600 ring-1 ring-red-200 hover:bg-red-50',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variante?: keyof typeof variantes }

export function Button({ variante = 'primario', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variantes[variante]} ${className}`}
      {...props}
    />
  )
}

const campoBase =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none'

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={campoBase} {...props} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={campoBase} {...props} />
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  )
}

export function Card({ titulo, children, acoes }: { titulo: string; children: ReactNode; acoes?: ReactNode }) {
  return (
    <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-800">{titulo}</h2>
        {acoes}
      </div>
      {children}
    </section>
  )
}

// Mostra a mensagem da API e, em erros de validação, os campos inválidos
export function ErrorAlert({ erro }: { erro: unknown }) {
  if (!erro) return null
  const mensagem = erro instanceof Error ? erro.message : 'Erro inesperado'
  const detalhes = erro instanceof ApiError ? erro.detalhes : []

  return (
    <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <p className="font-medium">{mensagem}</p>
      {detalhes.length > 0 && (
        <ul className="mt-1 list-inside list-disc">
          {detalhes.map((d) => (
            <li key={d.campo + d.mensagem}>
              <strong>{d.campo}</strong>: {d.mensagem}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function Vazio({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-slate-500">{children}</p>
}

const coresStatus: Record<StatusConsulta, string> = {
  AGENDADA: 'bg-blue-50 text-blue-700 ring-blue-200',
  CANCELADA: 'bg-slate-100 text-slate-600 ring-slate-200',
  CONCLUIDA: 'bg-green-50 text-green-700 ring-green-200',
}

export function StatusBadge({ status }: { status: StatusConsulta }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${coresStatus[status]}`}>
      {status}
    </span>
  )
}

export function Tabela({ cabecalho, children }: { cabecalho: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-xs text-slate-500 uppercase">
          <tr>
            {cabecalho.map((c) => (
              <th key={c} className="px-3 py-2 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  )
}
