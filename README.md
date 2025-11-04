# Sistema de Chatbot WhatsApp con Funcionalidades Médicas - Versión Mejorada

## 🆕 Nuevas Funcionalidades Implementadas

### 1. Almacenamiento de Mensajes de Chat en Base de Datos
- Todos los mensajes entre usuarios, bot y operadores se guardan automáticamente en la tabla `ChatRegistro`
- Incluye soporte para mensajes multimedia (imágenes, documentos, etc.)
- Rastreo completo del historial de conversaciones

### 2. Formulario de Historia Clínica en el Panel de Operadores
- Modal interactivo flotante que permite diligenciar historias clínicas
- **No interrumpe el chat**: El operador puede seguir chateando mientras diligencia el formulario
- Campos completos según el formato médico estándar
- Validación de datos en tiempo real

### 3. Generación y Almacenamiento de Historia Clínica
- Guardar historia clínica en la tabla `HistoriaClinica` con número consecutivo automático
- Generación automática de:
  - Número de Historia Clínica (formato: HC + fecha + consecutivo)
  - Número de Caso (formato: C + fecha + consecutivo)

### 4. Generación de PDF de Historia Clínica
- PDF generado con formato profesional basado en el modelo proporcionado
- Incluye todos los datos del paciente, antecedentes, examen físico, diagnósticos y plan de tratamiento
- Diseño que replica el formato oficial de Fundación Campbell

### 5. Envío de PDF por WhatsApp
- PDF se envía automáticamente al usuario después de generar la historia clínica
- Mensaje personalizado con número de historia clínica
- El PDF se sube a Cloudinary y se envía como documento por WhatsApp

## 🗄️ Estructura de Base de Datos

### Tablas Principales

#### ChatRegistro
Almacena todos los mensajes del chat

#### HistoriaClinica
Almacena las historias clínicas generadas

## 📦 Instalación

### Requisitos Previos
- .NET 8 SDK
- SQL Server con la base de datos `TelemedicinaBD`
- Cuenta de Cloudinary
- Cuenta de WhatsApp Business API

### Pasos de Instalación

1. **Restaurar paquetes NuGet:**
```bash
dotnet restore
```

2. **Configurar Base de Datos:**
   - Ejecutar el script `DatabaseSchema.sql` en SQL Server
   - Verificar conexión en `appsettings.json`

3. **Configurar credenciales en `appsettings.json`**

4. **Compilar y ejecutar:**
```bash
dotnet build
dotnet run
```

## 🚀 Uso del Panel de Operadores

1. Abrir `http://localhost:5000`
2. Ingresar nombre de operador
3. Atender conversaciones
4. Usar botón "📋 Historia Clínica" para diligenciar formulario mientras se chatea

## 📝 Archivos del Proyecto

- `Services/DatabaseService.cs`: Servicio para guardar mensajes en BD
- `Services/HistoriaClinicaService.cs`: Servicio para gestionar historias clínicas
- `Services/PdfService.cs`: Servicio para generar PDFs
- `Controllers/HistoriaClinicaController.cs`: Controlador API para historias clínicas
- `wwwroot/index.html`: Panel de operadores con modal de historia clínica

## 🔧 Configuración

Actualizar `appsettings.json` con tus credenciales:
- ConnectionString de SQL Server
- WhatsApp Access Token
- Cloudinary credentials

## 📞 Soporte

Revisar los logs de la aplicación para debugging.
