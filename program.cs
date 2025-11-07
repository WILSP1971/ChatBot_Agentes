using Microsoft.AspNetCore.SignalR;
using System.Text.Json;
using System.Net.Http.Headers;
using WhatsAppChatbotSystem.Models;

var builder = WebApplication.CreateBuilder(args);

// Configurar puerto dinámico para Railway
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

Console.WriteLine($"🚀 Servidor configurado en puerto: {port}");

// Configurar servicios
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddHttpClient(); // Para llamadas HTTP a API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

// Servicios personalizados
builder.Services.AddSingleton<ConversationManager>();
builder.Services.AddSingleton<WhatsAppService>();
builder.Services.AddSingleton<AIBotService>();
builder.Services.AddSingleton<ApiIntegrationService>();
builder.Services.AddSingleton<CloudinaryService>();
builder.Services.AddSingleton<JitsiService>();
builder.Services.AddScoped<WhatsAppChatbotSystem.Services.DatabaseService>();
builder.Services.AddScoped<WhatsAppChatbotSystem.Services.HistoriaClinicaService>();
builder.Services.AddScoped<WhatsAppChatbotSystem.Services.PdfService>();


var app = builder.Build();

// Configurar middleware
app.UseCors("AllowAll");
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/operatorHub");
Console.WriteLine("✅ Aplicación iniciada correctamente");
Console.WriteLine("✅ SignalR Hub disponible en: /operatorHub");

app.Run();

// ============================================
// MODELOS DE DATOS
// ============================================

public class WhatsAppMessage
{
    public string From { get; set; } = "";
    public string Body { get; set; } = "";
    public string MessageId { get; set; } = "";
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class Conversation
{
    public string ConversationId { get; set; } = Guid.NewGuid().ToString();
    public string PhoneNumber { get; set; } = "";
    public string CustomerName { get; set; } = "";
    public List<Message> Messages { get; set; } = new();
    public ConversationStatus Status { get; set; } = ConversationStatus.Waiting;
    public string? AssignedOperator { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastActivity { get; set; } = DateTime.UtcNow;
    public Dictionary<string, string> Context { get; set; } = new(); // Para mantener contexto del bot
}

public class Message
{
    public string MessageId { get; set; } = Guid.NewGuid().ToString();
    public string Content { get; set; } = "";
    public MessageType Type { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string Sender { get; set; } = "";
    public string? MediaUrl { get; set; } // Para imágenes/archivos
    public string? MediaType { get; set; } // image, document, etc.
}

public enum ConversationStatus
{
    Waiting,
    Active,
    BotHandling,
    Closed
}

public enum MessageType
{
    Customer,
    Operator,
    Bot,
    System
}

public class Operator
{
    public string OperatorId { get; set; } = "";
    public string Name { get; set; } = "";
    public bool IsAvailable { get; set; } = true;
    public List<string> ActiveConversations { get; set; } = new();
}

// ============================================
// MODELOS PARA MENSAJES INTERACTIVOS
// ============================================

public class ButtonOption
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
}

public class ListSection
{
    public string Title { get; set; } = "";
    public List<ListRow> Rows { get; set; } = new();
}

public class ListRow
{
    public string Id { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
}

// ============================================
// SIGNALR HUB (CORREGIDO - Nombres consistentes)
// ============================================

public class ChatHub : Hub
{
    private readonly ConversationManager _conversationManager;
    private readonly WhatsAppService _whatsAppService;
    private readonly IServiceProvider _serviceProvider;

    public ChatHub(
        ConversationManager conversationManager, 
        WhatsAppService whatsAppService,
        IServiceProvider serviceProvider)
    {
        _conversationManager = conversationManager;
        _whatsAppService = whatsAppService;
        _serviceProvider = serviceProvider;
    }

    // ✅ CORREGIDO: Método de registro de operador
    public async Task RegisterOperator(string operatorName)
    {
        var operatorId = Context.ConnectionId;
        _conversationManager.RegisterOperator(operatorId, operatorName);
        
        Console.WriteLine($"✅ Operador registrado: {operatorName} (ID: {operatorId})");
        
        // ✅ Enviar confirmación al operador
        await Clients.Caller.SendAsync("OperatorRegistered", operatorId, operatorName);
        
        // ✅ Enviar todas las conversaciones activas al operador
        var allConversations = _conversationManager.GetAllConversations();
        await Clients.Caller.SendAsync("ReceiveConversations", allConversations);
        
        Console.WriteLine($"📋 Enviadas {allConversations.Count} conversaciones al operador {operatorName}");
    }

    public async Task TakeConversation(string conversationId)
    {
        var operatorId = Context.ConnectionId;
        var success = _conversationManager.AssignOperator(conversationId, operatorId);
        
        if (success)
        {
            var conversation = _conversationManager.GetConversation(conversationId);
            Console.WriteLine($"✅ Conversación {conversationId} asignada al operador {operatorId}");
            
            // ✅ Notificar al operador que tomó la conversación
            await Clients.Caller.SendAsync("ConversationAssigned", conversation);
            
            // ✅ Notificar a los demás operadores que la conversación fue tomada
            await Clients.Others.SendAsync("ConversationTaken", conversationId);
            
            // ✅ Actualizar el estado en todos los clientes
            await Clients.All.SendAsync("ConversationStatusChanged", conversationId, conversation?.Status);
        }
    }

    // ⭐ Devolver control al bot
    public async Task ReleaseConversationToBot(string conversationId)
    {
        var success = _conversationManager.ReleaseToBot(conversationId);
        
        if (success)
        {
            var conversation = _conversationManager.GetConversation(conversationId);
            
            // Enviar mensaje al cliente
            await _whatsAppService.SendMessage(
                conversation!.PhoneNumber,
                "🤖 Un agente finalizó la conversación. Escribe 'hola' si necesitas más ayuda."
            );
            
            // Notificar a todos los operadores
            await Clients.All.SendAsync("ConversationReleasedToBot", conversationId);
            await Clients.All.SendAsync("ConversationStatusChanged", conversationId, conversation?.Status);
            
            Console.WriteLine($"✅ Conversación {conversationId} devuelta al bot");
        }
    }

    public async Task SendMessageToCustomer(string conversationId, string message)
    {
        var conversation = _conversationManager.GetConversation(conversationId);
        
        if (conversation != null)
        {
            var operatorMessage = new Message
            {
                Content = message,
                Type = MessageType.Operator,
                Sender = "Operador"
            };

            _conversationManager.AddMessage(conversationId, operatorMessage);
            
            // ⭐ Guardar mensaje del operador en BD
            using (var scope = _serviceProvider.CreateScope())
            {
                var dbService = scope.ServiceProvider.GetRequiredService<WhatsAppChatbotSystem.Services.DatabaseService>();
                await dbService.GuardarMensajeChat(
                    conversation.ConversationId,
                    conversation.PhoneNumber,
                    conversation.CustomerName,
                    operatorMessage.MessageId,
                    message,
                    "Operator",
                    "Operador",
                    DateTime.UtcNow
                );
            }
            
            // Enviar por WhatsApp
            await _whatsAppService.SendMessage(conversation.PhoneNumber, message);
            
            // ✅ CORREGIDO: Notificar usando el método correcto
            await Clients.All.SendAsync("NewMessage", operatorMessage);
        }
    }

    // ⭐ Enviar imagen al cliente
    public async Task SendImageToCustomer(string conversationId, string imageUrl, string? caption)
    {
        var conversation = _conversationManager.GetConversation(conversationId);
        
        if (conversation != null)
        {
            // Enviar imagen por WhatsApp
            var success = await _whatsAppService.SendImage(conversation.PhoneNumber, imageUrl, caption);
            
            if (success)
            {
                var imageMessage = new Message
                {
                    Content = caption ?? "Imagen",
                    Type = MessageType.Operator,
                    Sender = "Operador",
                    MediaUrl = imageUrl,
                    MediaType = "image"
                };

                _conversationManager.AddMessage(conversationId, imageMessage);
                
                // ✅ CORREGIDO: Notificar usando el método correcto
                await Clients.All.SendAsync("NewMessage", imageMessage);
            }
        }
    }

    // ⭐ Enviar documento al cliente
    public async Task SendDocumentToCustomer(string conversationId, string documentUrl, string filename, string? caption)
    {
        var conversation = _conversationManager.GetConversation(conversationId);
        
        if (conversation != null)
        {
            // Enviar documento por WhatsApp
            var success = await _whatsAppService.SendDocument(conversation.PhoneNumber, documentUrl, filename, caption);
            
            if (success)
            {
                var docMessage = new Message
                {
                    Content = caption ?? $"Documento: {filename}",
                    Type = MessageType.Operator,
                    Sender = "Operador",
                    MediaUrl = documentUrl,
                    MediaType = "document"
                };

                _conversationManager.AddMessage(conversationId, docMessage);
                
                // ✅ CORREGIDO: Notificar usando el método correcto
                await Clients.All.SendAsync("NewMessage", docMessage);
            }
        }
    }

    // ✅ CORREGIDO: Método para solicitar conversaciones en espera
    public async Task RequestWaitingConversations()
    {
        var waiting = _conversationManager.GetWaitingConversations();
        await Clients.Caller.SendAsync("ReceiveConversations", waiting);
    }

    // ✅ NUEVO: Método para obtener TODAS las conversaciones
    public async Task RequestAllConversations()
    {
        var allConversations = _conversationManager.GetAllConversations();
        await Clients.Caller.SendAsync("ReceiveConversations", allConversations);
    }

    public override async Task OnConnectedAsync()
    {
        Console.WriteLine($"✅ Cliente conectado: {Context.ConnectionId}");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Console.WriteLine($"❌ Operador desconectado: {Context.ConnectionId}");
        _conversationManager.UnregisterOperator(Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    // ✅ Enviar link de videollamada al cliente
    public async Task SendVideoCallToCustomer(string conversationId)
    {
        var conversation = _conversationManager.GetConversation(conversationId);
        
        if (conversation != null)
        {
            // Generar link de Jitsi
            var jitsiService = new JitsiService(
                Context.GetHttpContext()?.RequestServices.GetRequiredService<IConfiguration>() 
                ?? throw new InvalidOperationException("Configuration not available")
            );
            
            var videoCallUrl = jitsiService.GenerateVideoCallLink(
                conversation.PhoneNumber, 
                conversation.CustomerName
            );
            
            // Crear mensaje con el link
            var message = $"📹 *Invitación a Videollamada*\n\n" +
                        $"Haz clic en el siguiente enlace para unirte a la videollamada:\n\n" +
                        $"{videoCallUrl}\n\n" +
                        $"_La videollamada es segura y privada._";
            
            // Enviar por WhatsApp
            var success = await _whatsAppService.SendMessage(conversation.PhoneNumber, message);
            
            if (success)
            {
                var videoCallMessage = new Message
                {
                    Content = "📹 Invitación a videollamada enviada",
                    Type = MessageType.Operator,
                    Sender = "Operador",
                    MediaUrl = videoCallUrl,
                    MediaType = "video_call"
                };

                _conversationManager.AddMessage(conversationId, videoCallMessage);
                
                // ✅ CORREGIDO: Notificar usando el método correcto
                await Clients.All.SendAsync("NewMessage", videoCallMessage);
                
                Console.WriteLine($"✅ Videollamada enviada a {conversation.PhoneNumber}");
                Console.WriteLine($"   🔗 URL: {videoCallUrl}");
            }
        }
    }
}
