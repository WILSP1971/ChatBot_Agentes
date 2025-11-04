using System.Data;
using Microsoft.Data.SqlClient;
using System.Text.Json;

namespace WhatsAppChatbotSystem.Services;

public class DatabaseService
{
    private readonly string _connectionString;
    private readonly ILogger<DatabaseService> _logger;

    public DatabaseService(IConfiguration configuration, ILogger<DatabaseService> logger)
    {
        _connectionString = configuration.GetConnectionString("TelemedicineDB") 
            ?? "Server=localhost;Database=TelemedicinaBD;User Id=sa;Password=ms2022*;TrustServerCertificate=True;MultipleActiveResultSets=true";
        _logger = logger;
    }

    // Guardar mensaje de chat
    public async Task<int> GuardarMensajeChat(
        string conversationId,
        string phoneNumber,
        string customerName,
        string messageId,
        string content,
        string messageType,
        string sender,
        DateTime timestamp,
        string? mediaUrl = null,
        string? mediaType = null)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            using var command = new SqlCommand("sp_GuardarMensajeChat", connection);
            command.CommandType = CommandType.StoredProcedure;

            command.Parameters.AddWithValue("@ConversationId", conversationId);
            command.Parameters.AddWithValue("@PhoneNumber", phoneNumber);
            command.Parameters.AddWithValue("@CustomerName", customerName ?? "");
            command.Parameters.AddWithValue("@MessageId", messageId);
            command.Parameters.AddWithValue("@Content", content);
            command.Parameters.AddWithValue("@MessageType", messageType);
            command.Parameters.AddWithValue("@Sender", sender);
            command.Parameters.AddWithValue("@Timestamp", timestamp);
            command.Parameters.AddWithValue("@MediaUrl", (object?)mediaUrl ?? DBNull.Value);
            command.Parameters.AddWithValue("@MediaType", (object?)mediaType ?? DBNull.Value);

            var result = await command.ExecuteScalarAsync();
            _logger.LogInformation($"✅ Mensaje guardado en BD - ID: {result}");
            
            return Convert.ToInt32(result);
        }
        catch (Exception ex)
        {
            _logger.LogError($"❌ Error guardando mensaje en BD: {ex.Message}");
            return -1;
        }
    }

    // Obtener historial de chat por conversación
    public async Task<List<ChatRegistro>> ObtenerHistorialChat(string conversationId)
    {
        var mensajes = new List<ChatRegistro>();

        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var query = @"
                SELECT Id, ConversationId, PhoneNumber, CustomerName, MessageId, 
                       Content, MessageType, Sender, Timestamp, MediaUrl, MediaType, CreatedAt
                FROM ChatRegistro
                WHERE ConversationId = @ConversationId
                ORDER BY Timestamp ASC";

            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@ConversationId", conversationId);

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                mensajes.Add(new ChatRegistro
                {
                    Id = reader.GetInt32(0),
                    ConversationId = reader.GetString(1),
                    PhoneNumber = reader.GetString(2),
                    CustomerName = reader.IsDBNull(3) ? "" : reader.GetString(3),
                    MessageId = reader.GetString(4),
                    Content = reader.GetString(5),
                    MessageType = reader.GetString(6),
                    Sender = reader.IsDBNull(7) ? "" : reader.GetString(7),
                    Timestamp = reader.GetDateTime(8),
                    MediaUrl = reader.IsDBNull(9) ? null : reader.GetString(9),
                    MediaType = reader.IsDBNull(10) ? null : reader.GetString(10)
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"❌ Error obteniendo historial: {ex.Message}");
        }

        return mensajes;
    }

    // Verificar conexión
    public async Task<bool> TestConnection()
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            _logger.LogInformation("✅ Conexión a BD exitosa");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"❌ Error de conexión a BD: {ex.Message}");
            return false;
        }
    }
}

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
