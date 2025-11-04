using System;
using System.Collections.Generic;

namespace WhatsAppChatbotSystem.Models;

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
    public DateTime FechaIngreso { get; set; } = DateTime.Now;
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
    public string AspectoGeneral { get; set; } = "";
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
