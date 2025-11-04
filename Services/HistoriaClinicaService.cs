using System.Data;
using Microsoft.Data.SqlClient;
using System.Text.Json;

namespace WhatsAppChatbotSystem.Services;

public class HistoriaClinicaService
{
    private readonly string _connectionString;
    private readonly ILogger<HistoriaClinicaService> _logger;
    private readonly PdfService _pdfService;
    private readonly WhatsAppService _whatsAppService;

    public HistoriaClinicaService(
        IConfiguration configuration, 
        ILogger<HistoriaClinicaService> logger,
        PdfService pdfService,
        WhatsAppService whatsAppService)
    {
        _connectionString = configuration.GetConnectionString("TelemedicineDB") 
            ?? "Server=localhost;Database=TelemedicinaBD;User Id=sa;Password=ms2022*;TrustServerCertificate=True;MultipleActiveResultSets=true";
        _logger = logger;
        _pdfService = pdfService;
        _whatsAppService = whatsAppService;
    }

    public async Task<HistoriaClinicaResponse> CrearHistoriaClinica(HistoriaClinicaCompleta historia)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // Serializar campos complejos a JSON
            var antecedentesJson = JsonSerializer.Serialize(historia.Antecedentes);
            var examenFisicoJson = JsonSerializer.Serialize(historia.ExamenFisico);
            var diagnosticosJson = JsonSerializer.Serialize(historia.Diagnosticos);
            var planJson = JsonSerializer.Serialize(historia.Plan);

            using var command = new SqlCommand("sp_CrearHistoriaClinica", connection);
            command.CommandType = CommandType.StoredProcedure;

            // Parámetros
            command.Parameters.AddWithValue("@NoIdentificacion", historia.NoIdentificacion);
            command.Parameters.AddWithValue("@NombrePaciente", historia.NombrePaciente);
            command.Parameters.AddWithValue("@Edad", historia.Edad);
            command.Parameters.AddWithValue("@Sexo", historia.Sexo);
            command.Parameters.AddWithValue("@Telefono", historia.Telefono);
            command.Parameters.AddWithValue("@MotivoConsulta", historia.MotivoConsulta);
            command.Parameters.AddWithValue("@EnfermedadActual", historia.EnfermedadActual);
            command.Parameters.AddWithValue("@MedicoNombre", historia.MedicoNombre);
            command.Parameters.AddWithValue("@MedicoRegistro", historia.MedicoRegistro);
            command.Parameters.AddWithValue("@AntecedentesJson", (object?)antecedentesJson ?? DBNull.Value);
            command.Parameters.AddWithValue("@ExamenFisicoJson", (object?)examenFisicoJson ?? DBNull.Value);
            command.Parameters.AddWithValue("@DiagnosticosJson", (object?)diagnosticosJson ?? DBNull.Value);
            command.Parameters.AddWithValue("@PlanJson", (object?)planJson ?? DBNull.Value);

            using var reader = await command.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                var noHistoria = reader.GetString(0);
                var noCaso = reader.GetString(1);

                historia.NoHistoria = noHistoria;
                historia.NoCaso = noCaso;

                _logger.LogInformation($"✅ Historia clínica creada: {noHistoria}");

                // Generar PDF
                var pdfPath = await _pdfService.GenerarPdfHistoriaClinica(historia);

                // Enviar PDF por WhatsApp si hay teléfono
                if (!string.IsNullOrEmpty(historia.Telefono) && !string.IsNullOrEmpty(pdfPath))
                {
                    await _whatsAppService.SendDocumentMessage(
                        historia.Telefono, 
                        pdfPath, 
                        $"Historia_Clinica_{noHistoria}.pdf",
                        $"✅ Historia Clínica #{noHistoria} generada exitosamente"
                    );
                }

                return new HistoriaClinicaResponse
                {
                    NoHistoria = noHistoria,
                    NoCaso = noCaso,
                    PdfUrl = pdfPath
                };
            }

            throw new Exception("No se pudo crear la historia clínica");
        }
        catch (Exception ex)
        {
            _logger.LogError($"❌ Error creando historia clínica: {ex.Message}");
            throw;
        }
    }

    public async Task<HistoriaClinicaCompleta?> ObtenerHistoriaClinica(string noHistoria)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"
                SELECT NoHistoria, NoCaso, NoAdmision, NoIdentificacion, NombrePaciente, 
                       Edad, Sexo, Direccion, Ciudad, Telefono, Ocupacion, EstadoCivil, 
                       FechaNacimiento, FechaIngreso, HoraIngreso, NombreAcompanante, Parentesco,
                       MotivoConsulta, EnfermedadActual, AntecedentesJson, ExamenFisicoJson,
                       DiagnosticosJson, Evolucion, PlanJson, MedicoNombre, MedicoRegistro,
                       MedicoEspecialidad, PdfUrl
                FROM HistoriaClinica
                WHERE NoHistoria = @NoHistoria AND Estado = 'ACTIVA'";

            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@NoHistoria", noHistoria);

            using var reader = await command.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                var historia = new HistoriaClinicaCompleta
                {
                    NoHistoria = reader.GetString(0),
                    NoCaso = reader.IsDBNull(1) ? "" : reader.GetString(1),
                    NoAdmision = reader.IsDBNull(2) ? "" : reader.GetString(2),
                    NoIdentificacion = reader.GetString(3),
                    NombrePaciente = reader.GetString(4),
                    Edad = reader.GetInt32(5),
                    Sexo = reader.GetString(6),
                    Direccion = reader.IsDBNull(7) ? "" : reader.GetString(7),
                    Ciudad = reader.IsDBNull(8) ? "" : reader.GetString(8),
                    Telefono = reader.IsDBNull(9) ? "" : reader.GetString(9),
                    Ocupacion = reader.IsDBNull(10) ? "" : reader.GetString(10),
                    EstadoCivil = reader.IsDBNull(11) ? "" : reader.GetString(11),
                    MotivoConsulta = reader.GetString(17),
                    EnfermedadActual = reader.GetString(18),
                    MedicoNombre = reader.IsDBNull(24) ? "" : reader.GetString(24),
                    MedicoRegistro = reader.IsDBNull(25) ? "" : reader.GetString(25),
                    MedicoEspecialidad = reader.IsDBNull(26) ? "" : reader.GetString(26)
                };

                // Deserializar JSON
                if (!reader.IsDBNull(19))
                {
                    var antecedentesJson = reader.GetString(19);
                    historia.Antecedentes = JsonSerializer.Deserialize<Dictionary<string, string>>(antecedentesJson) ?? new();
                }

                if (!reader.IsDBNull(20))
                {
                    var examenFisicoJson = reader.GetString(20);
                    historia.ExamenFisico = JsonSerializer.Deserialize<ExamenFisico>(examenFisicoJson) ?? new();
                }

                if (!reader.IsDBNull(21))
                {
                    var diagnosticosJson = reader.GetString(21);
                    historia.Diagnosticos = JsonSerializer.Deserialize<List<string>>(diagnosticosJson) ?? new();
                }

                if (!reader.IsDBNull(23))
                {
                    var planJson = reader.GetString(23);
                    historia.Plan = JsonSerializer.Deserialize<List<string>>(planJson) ?? new();
                }

                return historia;
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError($"❌ Error obteniendo historia clínica: {ex.Message}");
            return null;
        }
    }
}
