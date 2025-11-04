using System;
using System.Collections.Generic;

// ============================================
// MODELOS PARA HISTORIA CLÍNICA
// ============================================

public class HistoriaClinicaCompleta
{
    public string NoHistoria { get; set; } = "";
    public string NoCaso { get; set; } = "";
    public string NoAdmision { get; set; } = "";
    
    // Datos del Paciente
    public string NoIdentificacion { get; set; } = "";
    public string NombrePaciente { get; set; } = "";
    public int Edad { get; set; }
    public string Sexo { get; set; } = "";
    public string Direccion { get; set; } = "";
    public string Ciudad { get; set; } = "";
    public string Telefono { get; set; } = "";
    public string Ocupacion { get; set; } = "";
    public string EstadoCivil { get; set; } = "";
    public DateTime FechaNacimiento { get; set; }
    public DateTime FechaIngreso { get; set; }
    public string HoraIngreso { get; set; } = "";
    
    // Acompañante
    public string NombreAcompanante { get; set; } = "";
    public string Parentesco { get; set; } = "";
    
    // Motivo de Consulta
    public string MotivoConsulta { get; set; } = "";
    
    // Enfermedad Actual
    public string EnfermedadActual { get; set; } = "";
    
    // Antecedentes
    public Dictionary<string, string> Antecedentes { get; set; } = new();
    
    // Examen Físico
    public ExamenFisico ExamenFisico { get; set; } = new();
    
    // Diagnósticos
    public List<string> Diagnosticos { get; set; } = new();
    
    // Evolución
    public string Evolucion { get; set; } = "";
    
    // Plan/Conducta
    public List<string> Plan { get; set; } = new();
    
    // Médico
    public string MedicoNombre { get; set; } = "";
    public string MedicoRegistro { get; set; } = "";
    public string MedicoEspecialidad { get; set; } = "";
    
    public DateTime FechaCreacion { get; set; } = DateTime.Now;
}

public class ExamenFisico
{
    public int FC { get; set; }
    public int FR { get; set; }
    public string TA { get; set; } = "";
    public decimal Temperatura { get; set; }
    public decimal Peso { get; set; }
    public decimal Talla { get; set; }
    
    public string Glasgow { get; set; } = "";
    public string AspectoGeneral { get; set; } = "";  // ✅ CORREGIDO: era AspectÐ¾General
    public string CabezaCara { get; set; } = "";
    public string Cuello { get; set; } = "";
    public string Torax { get; set; } = "";
    public string Abdomen { get; set; } = "";
    public string Genitourinario { get; set; } = "";
    public string Pelvis { get; set; } = "";
    public string DorsoExtremidades { get; set; } = "";
    public string SNC { get; set; } = "";
    public string Valor { get; set; } = "";
}

// ============================================
// MODELOS PARA ORDEN DE MEDICAMENTOS
// ============================================

public class OrdenMedicamentos
{
    public string NoOrden { get; set; } = "";
    public string ConsecutivoOrden { get; set; } = "";
    public string PacienteAlergico { get; set; } = "";
    public List<string> Alergias { get; set; } = new();
    
    // Datos de la Orden
    public DateTime FechaOrden { get; set; }
    public string HoraOrden { get; set; } = "";
    public string MedicoDiligenciaOrden { get; set; } = "";
    public string NoRadicado { get; set; } = "";
    
    // Relación con Historia Clínica
    public string NoHistoriaClinica { get; set; } = "";
    
    // Medicamentos
    public List<MedicamentoOrden> Medicamentos { get; set; } = new();
    
    // Médico
    public string MedicoNombre { get; set; } = "";
    public string MedicoRegistro { get; set; } = "";
    public string MedicoEspecialidad { get; set; } = "";
    
    // Paciente
    public string NoCaso { get; set; } = "";
    public string NoIdentificacion { get; set; } = "";
    public string NombrePaciente { get; set; } = "";
    public int Edad { get; set; }
    public string Sexo { get; set; } = "";
    
    public DateTime FechaCreacion { get; set; } = DateTime.Now;
}

public class MedicamentoOrden
{
    public string Codigo { get; set; } = "";
    public string NombreMedicamento { get; set; } = "";
    public string Dosis { get; set; } = "";
    public string Unidad { get; set; } = "";
    public string Frecuencia { get; set; } = "";
    public string ViaAplicacion { get; set; } = "";
    public string TiempoAplicacion { get; set; } = "";
    public int DuracionValor { get; set; }
    public string Observacion { get; set; } = "";
    public int Cantidad { get; set; }
}

public class Medicamento
{
    public string Codigo { get; set; } = "";
    public string Nombre { get; set; } = "";
    public string PrincipioActivo { get; set; } = "";
    public string Concentracion { get; set; } = "";
    public string FormaFarmaceutica { get; set; } = "";
}

// ============================================
// MODELOS PARA ORDEN DE PARACLINICOS
// ============================================

public class OrdenParaclinicos
{
    public string NoOrden { get; set; } = "";
    public string ConsecutivoOrden { get; set; } = "";
    
    // Datos de la Orden
    public DateTime FechaOrden { get; set; }
    public string HoraOrden { get; set; } = "";
    public string MedicoDiligenciaOrden { get; set; } = "";
    public string NoRadicado { get; set; } = "";
    
    // Relación con Historia Clínica
    public string NoHistoriaClinica { get; set; } = "";
    
    // Dependencia donde se solicita
    public string DependenciaSolicita { get; set; } = "";
    
    // Exámenes/Servicios
    public List<ParaclinicoOrden> Paraclinicos { get; set; } = new();
    
    // Médico
    public string MedicoNombre { get; set; } = "";
    public string MedicoRegistro { get; set; } = "";
    public string MedicoEspecialidad { get; set; } = "";
    
    // Paciente
    public string NoCaso { get; set; } = "";
    public string NoIdentificacion { get; set; } = "";
    public string NombrePaciente { get; set; } = "";
    public int Edad { get; set; }
    public string Sexo { get; set; } = "";
    
    // Sustentación
    public string Sustentacion { get; set; } = "";
    
    public DateTime FechaCreacion { get; set; } = DateTime.Now;
}

public class ParaclinicoOrden
{
    public string Codigo { get; set; } = "";
    public string NombreExamen { get; set; } = "";
    public string Observacion { get; set; } = "";
    public string NombreDependencia { get; set; } = "";
}

public class Dependencia
{
    public string Codigo { get; set; } = "";
    public string Nombre { get; set; } = "";
    public string Descripcion { get; set; } = "";
}

public class ExamenParaclinico
{
    public string Codigo { get; set; } = "";
    public string Nombre { get; set; } = "";
    public string Tipo { get; set; } = "";
    public string CodigoDependencia { get; set; } = "";
    public string NombreDependencia { get; set; } = "";
}

// ============================================
// MODELOS PARA REGISTRO DE CHAT
// ============================================

public class ChatRegistro
{
    public int Id { get; set; }
    public string ConversationId { get; set; } = "";
    public string PhoneNumber { get; set; } = "";
    public string CustomerName { get; set; } = "";
    public string MessageId { get; set; } = "";
    public string Content { get; set; } = "";
    public string MessageType { get; set; } = "";
    public string Sender { get; set; } = "";
    public DateTime Timestamp { get; set; }
    public string? MediaUrl { get; set; }
    public string? MediaType { get; set; }
}

// ============================================
// MODELOS PARA RESPUESTAS DE API
// ============================================

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = "";
    public T? Data { get; set; }
    public List<string> Errors { get; set; } = new();
}

public class HistoriaClinicaResponse
{
    public string NoHistoria { get; set; } = "";
    public string NoCaso { get; set; } = "";
    public string PdfUrl { get; set; } = "";
}

public class OrdenResponse
{
    public string NoOrden { get; set; } = "";
    public string ConsecutivoOrden { get; set; } = "";
    public string PdfUrl { get; set; } = "";
}
