using Microsoft.AspNetCore.Mvc;
using WhatsAppChatbotSystem.Services;
using WhatsAppChatbotSystem.Models;

namespace WhatsAppChatbotSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HistoriaClinicaController : ControllerBase
{
    private readonly HistoriaClinicaService _historiaService;
    private readonly ILogger<HistoriaClinicaController> _logger;

    public HistoriaClinicaController(
        HistoriaClinicaService historiaService, 
        ILogger<HistoriaClinicaController> logger)
    {
        _historiaService = historiaService;
        _logger = logger;
    }

    [HttpPost("crear")]
    public async Task<IActionResult> CrearHistoriaClinica([FromBody] HistoriaClinicaCompleta historia)
    {
        try
        {
            if (string.IsNullOrEmpty(historia.NoIdentificacion) || 
                string.IsNullOrEmpty(historia.NombrePaciente))
            {
                return BadRequest(new { success = false, message = "Datos incompletos" });
            }

            var result = await _historiaService.CrearHistoriaClinica(historia);

            return Ok(new { 
                success = true, 
                message = "Historia clínica creada exitosamente",
                data = result
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error creando historia clínica: {ex.Message}");
            return StatusCode(500, new { 
                success = false, 
                message = "Error creando historia clínica",
                error = ex.Message
            });
        }
    }

    [HttpGet("{noHistoria}")]
    public async Task<IActionResult> ObtenerHistoriaClinica(string noHistoria)
    {
        try
        {
            var historia = await _historiaService.ObtenerHistoriaClinica(noHistoria);

            if (historia == null)
            {
                return NotFound(new { success = false, message = "Historia clínica no encontrada" });
            }

            return Ok(new { success = true, data = historia });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error obteniendo historia clínica: {ex.Message}");
            return StatusCode(500, new { 
                success = false, 
                message = "Error obteniendo historia clínica",
                error = ex.Message
            });
        }
    }
}
