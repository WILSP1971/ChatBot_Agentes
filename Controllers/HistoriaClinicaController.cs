using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace WhatsAppChatbot.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HistoriaClinicaController : ControllerBase
    {
        private readonly string _connectionString;
        private readonly ILogger<HistoriaClinicaController> _logger;

        public HistoriaClinicaController(IConfiguration configuration, ILogger<HistoriaClinicaController> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _logger = logger;
        }

        /// <summary>
        /// Obtiene la lista de tipos de identificación
        /// </summary>
        [HttpGet("tipos-identificacion")]
        public async Task<IActionResult> GetTiposIdentificacion()
        {
            try
            {
                var tiposIdentificacion = new List<TipoIdentificacionDto>();

                using (var connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    
                    var query = @"
                        SELECT 
                            TipoIdentificacionId AS Codigo,
                            Descripcion
                        FROM TiposIdentificacion
                        WHERE Activo = 1
                        ORDER BY Orden, Descripcion";

                    using (var command = new SqlCommand(query, connection))
                    {
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                tiposIdentificacion.Add(new TipoIdentificacionDto
                                {
                                    Codigo = reader.GetString(0),
                                    Descripcion = reader.GetString(1)
                                });
                            }
                        }
                    }
                }

                return Ok(tiposIdentificacion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener tipos de identificación");
                return StatusCode(500, new { message = "Error al obtener tipos de identificación" });
            }
        }

        /// <summary>
        /// Obtiene la lista de departamentos
        /// </summary>
        [HttpGet("departamentos")]
        public async Task<IActionResult> GetDepartamentos()
        {
            try
            {
                var departamentos = new List<DepartamentoDto>();

                using (var connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    
                    var query = @"
                        SELECT 
                            DepartamentoId AS Codigo,
                            Nombre
                        FROM Departamentos
                        WHERE Activo = 1
                        ORDER BY Nombre";

                    using (var command = new SqlCommand(query, connection))
                    {
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                departamentos.Add(new DepartamentoDto
                                {
                                    Codigo = reader.GetString(0),
                                    Nombre = reader.GetString(1)
                                });
                            }
                        }
                    }
                }

                return Ok(departamentos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener departamentos");
                return StatusCode(500, new { message = "Error al obtener departamentos" });
            }
        }

        /// <summary>
        /// Obtiene la lista de diagnósticos CIE-10
        /// </summary>
        [HttpGet("diagnosticos")]
        public async Task<IActionResult> GetDiagnosticos()
        {
            try
            {
                var diagnosticos = new List<DiagnosticoDto>();

                using (var connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    
                    var query = @"
                        SELECT TOP 1000
                            Codigo,
                            Descripcion
                        FROM DiagnosticosCIE10
                        WHERE Activo = 1
                        ORDER BY Codigo";

                    using (var command = new SqlCommand(query, connection))
                    {
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            while (await reader.ReadAsync())
                            {
                                diagnosticos.Add(new DiagnosticoDto
                                {
                                    Codigo = reader.GetString(0),
                                    Descripcion = reader.GetString(1)
                                });
                            }
                        }
                    }
                }

                return Ok(diagnosticos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener diagnósticos");
                return StatusCode(500, new { message = "Error al obtener diagnósticos" });
            }
        }

        /// <summary>
        /// Crea una nueva historia clínica
        /// </summary>
        [HttpPost("crear")]
        public async Task<IActionResult> CrearHistoriaClinica([FromBody] HistoriaClinicaDto historiaClinica)
        {
            try
            {
                if (historiaClinica == null)
                {
                    return BadRequest(new { success = false, message = "Datos inválidos" });
                }

                // Validar que tenga al menos un diagnóstico
                if (historiaClinica.Diagnosticos == null || !historiaClinica.Diagnosticos.Any())
                {
                    return BadRequest(new { success = false, message = "Debe agregar al menos un diagnóstico" });
                }

                string noHistoria = string.Empty;

                using (var connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    using (var transaction = connection.BeginTransaction())
                    {
                        try
                        {
                            // Generar número de historia clínica
                            noHistoria = await GenerarNumeroHistoriaClinica(connection, transaction);

                            // Insertar historia clínica principal
                            var insertHistoriaQuery = @"
                                INSERT INTO HistoriasClinicas (
                                    NoHistoria,
                                    TipoIdentificacion,
                                    NoIdentificacion,
                                    NombrePaciente,
                                    Edad,
                                    Sexo,
                                    Direccion,
                                    Departamento,
                                    Ciudad,
                                    Telefono,
                                    Ocupacion,
                                    EstadoCivil,
                                    FechaNacimiento,
                                    FechaIngreso,
                                    HoraIngreso,
                                    MotivoConsulta,
                                    EnfermedadActual,
                                    Evolucion,
                                    MedicoNombre,
                                    MedicoRegistro,
                                    MedicoEspecialidad,
                                    FechaCreacion
                                ) VALUES (
                                    @NoHistoria,
                                    @TipoIdentificacion,
                                    @NoIdentificacion,
                                    @NombrePaciente,
                                    @Edad,
                                    @Sexo,
                                    @Direccion,
                                    @Departamento,
                                    @Ciudad,
                                    @Telefono,
                                    @Ocupacion,
                                    @EstadoCivil,
                                    @FechaNacimiento,
                                    @FechaIngreso,
                                    @HoraIngreso,
                                    @MotivoConsulta,
                                    @EnfermedadActual,
                                    @Evolucion,
                                    @MedicoNombre,
                                    @MedicoRegistro,
                                    @MedicoEspecialidad,
                                    @FechaCreacion
                                );
                                SELECT CAST(SCOPE_IDENTITY() AS INT);";

                            int historiaId;
                            using (var command = new SqlCommand(insertHistoriaQuery, connection, transaction))
                            {
                                command.Parameters.AddWithValue("@NoHistoria", noHistoria);
                                command.Parameters.AddWithValue("@TipoIdentificacion", historiaClinica.TipoIdentificacion ?? (object)DBNull.Value);
                                command.Parameters.AddWithValue("@NoIdentificacion", historiaClinica.NoIdentificacion);
                                command.Parameters.AddWithValue("@NombrePaciente", historiaClinica.NombrePaciente);
                                command.Parameters.AddWithValue("@Edad", historiaClinica.Edad);
                                command.Parameters.AddWithValue("@Sexo", historiaClinica.Sexo);
                                command.Parameters.AddWithValue("@Direccion", historiaClinica.Direccion ?? (object)DBNull.Value);
                                command.Parameters.AddWithValue("@Departamento", historiaClinica.Departamento ?? (object)DBNull.Value);
                                command.Parameters.AddWithValue("@Ciudad", historiaClinica.Ciudad ?? (object)DBNull.Value);
                                command.Parameters.AddWithValue("@Telefono", historiaClinica.Telefono);
                                command.Parameters.AddWithValue("@Ocupacion", historiaClinica.Ocupacion ?? (object)DBNull.Value);
                                command.Parameters.AddWithValue("@EstadoCivil", historiaClinica.EstadoCivil ?? (object)DBNull.Value);
                                command.Parameters.AddWithValue("@FechaNacimiento", DateTime.Parse(historiaClinica.FechaNacimiento));
                                command.Parameters.AddWithValue("@FechaIngreso", DateTime.Parse(historiaClinica.FechaIngreso));
                                command.Parameters.AddWithValue("@HoraIngreso", historiaClinica.HoraIngreso);
                                command.Parameters.AddWithValue("@MotivoConsulta", historiaClinica.MotivoConsulta);
                                command.Parameters.AddWithValue("@EnfermedadActual", historiaClinica.EnfermedadActual ?? (object)DBNull.Value);
                                command.Parameters.AddWithValue("@Evolucion", historiaClinica.Evolucion ?? (object)DBNull.Value);
                                command.Parameters.AddWithValue("@MedicoNombre", historiaClinica.MedicoNombre);
                                command.Parameters.AddWithValue("@MedicoRegistro", historiaClinica.MedicoRegistro);
                                command.Parameters.AddWithValue("@MedicoEspecialidad", historiaClinica.MedicoEspecialidad ?? (object)DBNull.Value);
                                command.Parameters.AddWithValue("@FechaCreacion", DateTime.Now);

                                historiaId = (int)await command.ExecuteScalarAsync();
                            }

                            // Insertar antecedentes
                            if (historiaClinica.Antecedentes != null && historiaClinica.Antecedentes.Any())
                            {
                                foreach (var antecedente in historiaClinica.Antecedentes)
                                {
                                    var insertAntecedenteQuery = @"
                                        INSERT INTO HistoriaClinicaAntecedentes (
                                            HistoriaClinicaId,
                                            TipoAntecedente,
                                            Valor
                                        ) VALUES (
                                            @HistoriaClinicaId,
                                            @TipoAntecedente,
                                            @Valor
                                        )";

                                    using (var command = new SqlCommand(insertAntecedenteQuery, connection, transaction))
                                    {
                                        command.Parameters.AddWithValue("@HistoriaClinicaId", historiaId);
                                        command.Parameters.AddWithValue("@TipoAntecedente", antecedente.Key);
                                        command.Parameters.AddWithValue("@Valor", antecedente.Value);
                                        await command.ExecuteNonQueryAsync();
                                    }
                                }
                            }

                            // Insertar examen físico
                            if (historiaClinica.ExamenFisico != null)
                            {
                                var insertExamenQuery = @"
                                    INSERT INTO HistoriaClinicaExamenFisico (
                                        HistoriaClinicaId,
                                        FC,
                                        FR,
                                        TA,
                                        Temperatura,
                                        Peso,
                                        Talla,
                                        Glasgow,
                                        AspectoGeneral,
                                        CabezaCara,
                                        Cuello,
                                        Torax,
                                        Abdomen,
                                        Genitourinario,
                                        DorsoExtremidades,
                                        SNC
                                    ) VALUES (
                                        @HistoriaClinicaId,
                                        @FC,
                                        @FR,
                                        @TA,
                                        @Temperatura,
                                        @Peso,
                                        @Talla,
                                        @Glasgow,
                                        @AspectoGeneral,
                                        @CabezaCara,
                                        @Cuello,
                                        @Torax,
                                        @Abdomen,
                                        @Genitourinario,
                                        @DorsoExtremidades,
                                        @SNC
                                    )";

                                using (var command = new SqlCommand(insertExamenQuery, connection, transaction))
                                {
                                    command.Parameters.AddWithValue("@HistoriaClinicaId", historiaId);
                                    command.Parameters.AddWithValue("@FC", historiaClinica.ExamenFisico.FC);
                                    command.Parameters.AddWithValue("@FR", historiaClinica.ExamenFisico.FR);
                                    command.Parameters.AddWithValue("@TA", historiaClinica.ExamenFisico.TA ?? (object)DBNull.Value);
                                    command.Parameters.AddWithValue("@Temperatura", historiaClinica.ExamenFisico.Temperatura);
                                    command.Parameters.AddWithValue("@Peso", historiaClinica.ExamenFisico.Peso);
                                    command.Parameters.AddWithValue("@Talla", historiaClinica.ExamenFisico.Talla);
                                    command.Parameters.AddWithValue("@Glasgow", historiaClinica.ExamenFisico.Glasgow ?? (object)DBNull.Value);
                                    command.Parameters.AddWithValue("@AspectoGeneral", historiaClinica.ExamenFisico.AspectoGeneral ?? (object)DBNull.Value);
                                    command.Parameters.AddWithValue("@CabezaCara", historiaClinica.ExamenFisico.CabezaCara ?? (object)DBNull.Value);
                                    command.Parameters.AddWithValue("@Cuello", historiaClinica.ExamenFisico.Cuello ?? (object)DBNull.Value);
                                    command.Parameters.AddWithValue("@Torax", historiaClinica.ExamenFisico.Torax ?? (object)DBNull.Value);
                                    command.Parameters.AddWithValue("@Abdomen", historiaClinica.ExamenFisico.Abdomen ?? (object)DBNull.Value);
                                    command.Parameters.AddWithValue("@Genitourinario", historiaClinica.ExamenFisico.Genitourinario ?? (object)DBNull.Value);
                                    command.Parameters.AddWithValue("@DorsoExtremidades", historiaClinica.ExamenFisico.DorsoExtremidades ?? (object)DBNull.Value);
                                    command.Parameters.AddWithValue("@SNC", historiaClinica.ExamenFisico.SNC ?? (object)DBNull.Value);
                                    await command.ExecuteNonQueryAsync();
                                }
                            }

                            // Insertar diagnósticos desde el grid
                            if (historiaClinica.Diagnosticos != null && historiaClinica.Diagnosticos.Any())
                            {
                                foreach (var diagnostico in historiaClinica.Diagnosticos)
                                {
                                    var insertDiagnosticoQuery = @"
                                        INSERT INTO HistoriaClinicaDiagnosticos (
                                            HistoriaClinicaId,
                                            Codigo,
                                            Descripcion,
                                            Observacion
                                        ) VALUES (
                                            @HistoriaClinicaId,
                                            @Codigo,
                                            @Descripcion,
                                            @Observacion
                                        )";

                                    using (var command = new SqlCommand(insertDiagnosticoQuery, connection, transaction))
                                    {
                                        command.Parameters.AddWithValue("@HistoriaClinicaId", historiaId);
                                        command.Parameters.AddWithValue("@Codigo", diagnostico.Codigo);
                                        command.Parameters.AddWithValue("@Descripcion", diagnostico.Descripcion);
                                        command.Parameters.AddWithValue("@Observacion", diagnostico.Observacion ?? (object)DBNull.Value);
                                        await command.ExecuteNonQueryAsync();
                                    }
                                }
                            }

                            // Insertar plan de tratamiento
                            if (historiaClinica.Plan != null && historiaClinica.Plan.Any())
                            {
                                foreach (var item in historiaClinica.Plan)
                                {
                                    var insertPlanQuery = @"
                                        INSERT INTO HistoriaClinicaPlan (
                                            HistoriaClinicaId,
                                            Item
                                        ) VALUES (
                                            @HistoriaClinicaId,
                                            @Item
                                        )";

                                    using (var command = new SqlCommand(insertPlanQuery, connection, transaction))
                                    {
                                        command.Parameters.AddWithValue("@HistoriaClinicaId", historiaId);
                                        command.Parameters.AddWithValue("@Item", item);
                                        await command.ExecuteNonQueryAsync();
                                    }
                                }
                            }

                            await transaction.CommitAsync();
                        }
                        catch
                        {
                            await transaction.RollbackAsync();
                            throw;
                        }
                    }
                }

                // TODO: Generar PDF y enviar por WhatsApp
                // await GenerarYEnviarPDF(historiaClinica, noHistoria);

                return Ok(new
                {
                    success = true,
                    data = new { noHistoria },
                    message = "Historia clínica creada exitosamente"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear historia clínica");
                return StatusCode(500, new
                {
                    success = false,
                    message = $"Error al crear la historia clínica: {ex.Message}"
                });
            }
        }

        private async Task<string> GenerarNumeroHistoriaClinica(SqlConnection connection, SqlTransaction transaction)
        {
            var query = @"
                DECLARE @NextNumber INT;
                SELECT @NextNumber = ISNULL(MAX(CAST(SUBSTRING(NoHistoria, 4, LEN(NoHistoria)) AS INT)), 0) + 1
                FROM HistoriasClinicas
                WHERE NoHistoria LIKE 'HC-%';
                SELECT 'HC-' + RIGHT('000000' + CAST(@NextNumber AS VARCHAR), 6);";

            using (var command = new SqlCommand(query, connection, transaction))
            {
                var result = await command.ExecuteScalarAsync();
                return result?.ToString() ?? "HC-000001";
            }
        }
    }

    // DTOs
    public class TipoIdentificacionDto
    {
        public string Codigo { get; set; }
        public string Descripcion { get; set; }
    }

    public class DepartamentoDto
    {
        public string Codigo { get; set; }
        public string Nombre { get; set; }
    }

    public class DiagnosticoDto
    {
        public string Codigo { get; set; }
        public string Descripcion { get; set; }
    }

    public class DiagnosticoGridDto
    {
        public string Codigo { get; set; }
        public string Descripcion { get; set; }
        public string Observacion { get; set; }
    }

    public class HistoriaClinicaDto
    {
        public string TipoIdentificacion { get; set; }
        public string NoIdentificacion { get; set; }
        public string NombrePaciente { get; set; }
        public int Edad { get; set; }
        public string Sexo { get; set; }
        public string Direccion { get; set; }
        public string Departamento { get; set; }
        public string Ciudad { get; set; }
        public string Telefono { get; set; }
        public string Ocupacion { get; set; }
        public string EstadoCivil { get; set; }
        public string FechaNacimiento { get; set; }
        public string FechaIngreso { get; set; }
        public string HoraIngreso { get; set; }
        public string MotivoConsulta { get; set; }
        public string EnfermedadActual { get; set; }
        public Dictionary<string, string> Antecedentes { get; set; }
        public ExamenFisicoDto ExamenFisico { get; set; }
        public List<DiagnosticoGridDto> Diagnosticos { get; set; }
        public string Evolucion { get; set; }
        public List<string> Plan { get; set; }
        public string MedicoNombre { get; set; }
        public string MedicoRegistro { get; set; }
        public string MedicoEspecialidad { get; set; }
    }

    public class ExamenFisicoDto
    {
        public int FC { get; set; }
        public int FR { get; set; }
        public string TA { get; set; }
        public decimal Temperatura { get; set; }
        public decimal Peso { get; set; }
        public decimal Talla { get; set; }
        public string Glasgow { get; set; }
        public string AspectoGeneral { get; set; }
        public string CabezaCara { get; set; }
        public string Cuello { get; set; }
        public string Torax { get; set; }
        public string Abdomen { get; set; }
        public string Genitourinario { get; set; }
        public string DorsoExtremidades { get; set; }
        public string SNC { get; set; }
    }
}
