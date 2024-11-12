export interface BaseEntity {
  id: string;
  createdAt: Date;
}

export interface Team extends BaseEntity {
  id: string;
  nombre: string;
  color: string;
  escudoUrl?: string;
}

export interface Player extends BaseEntity {
  nombre: string;
  numero: number;
  equipoId: string;
}

export interface SolicitudTiempo {
  equipoId: string;
  partidoId: string;
  periodo: number;
  minuto: Date;
}

export interface Tournament extends BaseEntity {
  nombre: string;
  color: string;
}

export interface TournamentPhase extends BaseEntity {
  nombre: string;
  equiposClasificadosPorGrupo: number;
  permiteEmpates: boolean;
  torneoId: string;
}

export interface Group extends BaseEntity {
  nombre: string;
  faseTorneoId: string;
}

export interface TeamGroup extends BaseEntity {
  equipoId: string;
  grupoId: string;
}

export interface Venue extends BaseEntity {
  nombre: string;
  direccion: string;
  capacidad: number;
  descripcion?: string;
}

export interface Match extends BaseEntity {
  fechaProgramacion: Date;
  horaProgramacion: Date;
  horaInicioPrimerTiempo?: Date;
  horaFinPrimerTiempo?: Date;
  horaInicioSegundoTiempo?: Date;
  horaFinSegundoTiempo?: Date;
  horaInicioTiempoExtra1?: Date;
  horaFinTiempoExtra1?: Date;
  horaInicioTiempoExtra2?: Date;
  horaFinTiempoExtra2?: Date;
  horaInicioPenales?: Date;
  horaFinPenales?: Date;
  mvpEquipoLocalId?: string;
  mvpEquipoVisitanteId?: string;
  horaFinPartido?: Date;
  equipoLocalId: string;
  equipoVisitanteId: string;
  grupoId: string;
  lugarId: string;
  lugar?: Venue;
  estadisticasPartido? : MatchStatistics[];
}

export interface MatchStatistics extends BaseEntity {
  goles: number;
  faltas: number;
  sanciones?: string;
  tarjetasAzules: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
  partidoId: string;
  jugadorId: string;
  equipoId: string;
}

export interface TimeRequest extends BaseEntity {
  periodo: number;
  minuto: Date;
  partidoId: string;
}

export interface Penalty extends BaseEntity {
  gol: boolean;
  partidoId: string;
}