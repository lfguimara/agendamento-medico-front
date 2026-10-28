import { useState } from 'react'
import { API_URL } from './api/client'
import { ConsultasPage } from './pages/ConsultasPage'
import { MedicosPage } from './pages/MedicosPage'
import { PacientesPage } from './pages/PacientesPage'

const abas = {
  consultas: { titulo: 'Consultas', Pagina: ConsultasPage },
  pacientes: { titulo: 'Pacientes', Pagina: PacientesPage },
  medicos: { titulo: 'Médicos', Pagina: MedicosPage },
}

type Aba = keyof typeof abas

function App() {
  const [aba, setAba] = useState<Aba>('consultas')
  const { Pagina } = abas[aba]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <h1 className="text-xl font-bold text-teal-700">🏥 Agendamento Médico</h1>
          <nav className="flex gap-1">
            {(Object.keys(abas) as Aba[]).map((chave) => (
              <button
                key={chave}
                onClick={() => setAba(chave)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  aba === chave ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {abas[chave].titulo}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Pagina />
      </main>

      <footer className="pb-6 text-center text-xs text-slate-400">API: {API_URL}</footer>
    </div>
  )
}

export default App
