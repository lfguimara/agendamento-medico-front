import { api } from './client'
import type {
  Consulta,
  ConsultaInput,
  Medico,
  MedicoInput,
  Paciente,
  PacienteInput,
  StatusConsulta,
} from './types'

export const pacientesApi = {
  listar: () => api.get<Paciente[]>('/pacientes'),
  criar: (dados: PacienteInput) => api.post<Paciente>('/pacientes', dados),
  atualizar: (id: string, dados: PacienteInput) => api.put<Paciente>(`/pacientes/${id}`, dados),
  remover: (id: string) => api.delete(`/pacientes/${id}`),
}

export const medicosApi = {
  listar: (especialidade = '') =>
    api.get<Medico[]>(
      especialidade ? `/medicos?especialidade=${encodeURIComponent(especialidade)}` : '/medicos',
    ),
  criar: (dados: MedicoInput) => api.post<Medico>('/medicos', dados),
  atualizar: (id: string, dados: MedicoInput) => api.put<Medico>(`/medicos/${id}`, dados),
  remover: (id: string) => api.delete(`/medicos/${id}`),
}

export type FiltrosConsulta = { medicoId?: string; pacienteId?: string; status?: StatusConsulta }

export const consultasApi = {
  listar: (filtros: FiltrosConsulta = {}) => {
    const params = new URLSearchParams(
      Object.entries(filtros).filter((par): par is [string, string] => Boolean(par[1])),
    )
    const query = params.toString()
    return api.get<Consulta[]>(query ? `/consultas?${query}` : '/consultas')
  },
  agendar: (dados: ConsultaInput) => api.post<Consulta>('/consultas', dados),
  cancelar: (id: string) => api.patch<Consulta>(`/consultas/${id}/cancelar`),
  concluir: (id: string) => api.patch<Consulta>(`/consultas/${id}/concluir`),
}
