import { useCallback, useState, type FormEvent } from 'react'
import { consultasApi, medicosApi, pacientesApi } from '../api/recursos'
import type { Consulta, StatusConsulta } from '../api/types'
import { Button, Card, ErrorAlert, Field, Input, Select, StatusBadge, Tabela, Vazio } from '../components/ui'
import { useDados } from '../hooks/useDados'

const formatarData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export function ConsultasPage() {
  const { dados: pacientes } = useDados(pacientesApi.listar)
  const { dados: medicos } = useDados(medicosApi.listar)

  const [filtroStatus, setFiltroStatus] = useState<StatusConsulta | ''>('')
  const [filtroMedico, setFiltroMedico] = useState('')
  const buscarConsultas = useCallback(
    () => consultasApi.listar({ status: filtroStatus || undefined, medicoId: filtroMedico }),
    [filtroStatus, filtroMedico],
  )
  const { dados: consultas, erro: erroLista, carregando, recarregar } = useDados(buscarConsultas)

  const [pacienteId, setPacienteId] = useState('')
  const [medicoId, setMedicoId] = useState('')
  const [dataHora, setDataHora] = useState('')
  const [erro, setErro] = useState<unknown>(null)
  const [salvando, setSalvando] = useState(false)

  async function agendar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    try {
      // <input type="datetime-local"> não tem fuso; convertemos para ISO (UTC) como a API espera
      await consultasApi.agendar({ pacienteId, medicoId, dataHora: new Date(dataHora).toISOString() })
      setDataHora('')
      setErro(null)
      await recarregar()
    } catch (err) {
      setErro(err)
    } finally {
      setSalvando(false)
    }
  }

  async function executar(acao: (id: string) => Promise<Consulta>, c: Consulta) {
    try {
      await acao(c.id)
      setErro(null)
      await recarregar()
    } catch (err) {
      setErro(err)
    }
  }

  const semCadastros = pacientes?.length === 0 || medicos?.length === 0

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <Card titulo="Agendar consulta">
        <ErrorAlert erro={erro} />
        {semCadastros ? (
          <Vazio>Cadastre ao menos um paciente e um médico para agendar.</Vazio>
        ) : (
          <form onSubmit={agendar} className="flex flex-col gap-3">
            <Field label="Paciente">
              <Select value={pacienteId} onChange={(e) => setPacienteId(e.target.value)} required>
                <option value="">Selecione...</option>
                {pacientes?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Médico">
              <Select value={medicoId} onChange={(e) => setMedicoId(e.target.value)} required>
                <option value="">Selecione...</option>
                {medicos?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome} — {m.especialidade}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Data e hora">
              <Input type="datetime-local" value={dataHora} onChange={(e) => setDataHora(e.target.value)} required />
            </Field>
            <Button type="submit" disabled={salvando}>
              {salvando ? 'Agendando...' : 'Agendar'}
            </Button>
          </form>
        )}
        <ul className="mt-5 list-inside list-disc space-y-1 text-xs text-slate-500">
          <li>Consultas do mesmo médico precisam de 30 min de intervalo</li>
          <li>Não é possível agendar no passado</li>
          <li>Cancelamento só com 24h de antecedência</li>
        </ul>
      </Card>

      <Card
        titulo="Consultas"
        acoes={
          <div className="flex gap-2">
            <Select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as StatusConsulta | '')}
              aria-label="Filtrar por status"
            >
              <option value="">Todos os status</option>
              <option value="AGENDADA">Agendada</option>
              <option value="CANCELADA">Cancelada</option>
              <option value="CONCLUIDA">Concluída</option>
            </Select>
            <Select value={filtroMedico} onChange={(e) => setFiltroMedico(e.target.value)} aria-label="Filtrar por médico">
              <option value="">Todos os médicos</option>
              {medicos?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </Select>
          </div>
        }
      >
        <ErrorAlert erro={erroLista} />
        {carregando && !consultas ? (
          <Vazio>Carregando...</Vazio>
        ) : !consultas?.length ? (
          <Vazio>Nenhuma consulta encontrada.</Vazio>
        ) : (
          <Tabela cabecalho={['Data/hora', 'Paciente', 'Médico', 'Status', '']}>
            {consultas.map((c) => (
              <tr key={c.id}>
                <td className="px-3 py-2 whitespace-nowrap">{formatarData.format(new Date(c.dataHora))}</td>
                <td className="px-3 py-2 font-medium text-slate-800">{c.paciente.nome}</td>
                <td className="px-3 py-2">
                  {c.medico.nome}
                  <span className="block text-xs text-slate-500">{c.medico.especialidade}</span>
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-3 py-2">
                  {c.status === 'AGENDADA' && (
                    <div className="flex justify-end gap-2">
                      <Button variante="secundario" onClick={() => executar(consultasApi.concluir, c)}>
                        Concluir
                      </Button>
                      <Button variante="perigo" onClick={() => executar(consultasApi.cancelar, c)}>
                        Cancelar
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </Tabela>
        )}
      </Card>
    </div>
  )
}
