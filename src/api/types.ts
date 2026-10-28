// Espelham as respostas da API (agendamento-medico)

export type Paciente = {
  id: string
  nome: string
  cpf: string
  email: string
  telefone: string
}

export type Medico = {
  id: string
  nome: string
  crm: string
  especialidade: string
}

export type StatusConsulta = 'AGENDADA' | 'CANCELADA' | 'CONCLUIDA'

export type Consulta = {
  id: string
  dataHora: string
  status: StatusConsulta
  pacienteId: string
  medicoId: string
  paciente: Pick<Paciente, 'id' | 'nome'>
  medico: Pick<Medico, 'id' | 'nome' | 'especialidade'>
}

export type PacienteInput = Omit<Paciente, 'id'>
export type MedicoInput = Omit<Medico, 'id'>
export type ConsultaInput = { pacienteId: string; medicoId: string; dataHora: string }
