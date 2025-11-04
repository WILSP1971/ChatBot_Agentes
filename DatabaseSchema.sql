-- ============================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS
-- Sistema de Chatbot WhatsApp con Funcionalidades Médicas
-- ============================================

-- ============================================
-- TABLA: ChatRegistro
-- Descripción: Almacena todos los mensajes del chat entre usuarios, bot y operadores
-- ============================================
CREATE TABLE ChatRegistro (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ConversationId VARCHAR(50) NOT NULL,
    PhoneNumber VARCHAR(20) NOT NULL,
    CustomerName VARCHAR(200),
    MessageId VARCHAR(100) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    MessageType VARCHAR(20) NOT NULL, -- Customer, Operator, Bot, System
    Sender VARCHAR(200),
    Timestamp DATETIME NOT NULL,
    MediaUrl VARCHAR(500),
    MediaType VARCHAR(50),
    CreatedAt DATETIME DEFAULT GETDATE(),
    INDEX IX_ChatRegistro_ConversationId (ConversationId),
    INDEX IX_ChatRegistro_PhoneNumber (PhoneNumber),
    INDEX IX_ChatRegistro_Timestamp (Timestamp)
);

-- ============================================
-- TABLA: HistoriaClinica
-- Descripción: Almacena las historias clínicas generadas
-- ============================================
CREATE TABLE HistoriaClinica (
    Id INT PRIMARY KEY IDENTITY(1,1),
    NoHistoria VARCHAR(20) UNIQUE NOT NULL,
    NoCaso VARCHAR(20),
    NoAdmision VARCHAR(20),
    
    -- Datos del Paciente
    NoIdentificacion VARCHAR(20) NOT NULL,
    NombrePaciente VARCHAR(200) NOT NULL,
    Edad INT,
    Sexo VARCHAR(10),
    Direccion VARCHAR(300),
    Ciudad VARCHAR(100),
    Telefono VARCHAR(20),
    Ocupacion VARCHAR(100),
    EstadoCivil VARCHAR(20),
    FechaNacimiento DATE,
    FechaIngreso DATETIME,
    HoraIngreso VARCHAR(10),
    
    -- Acompañante
    NombreAcompanante VARCHAR(200),
    Parentesco VARCHAR(50),
    
    -- Motivo y Enfermedad
    MotivoConsulta NVARCHAR(MAX),
    EnfermedadActual NVARCHAR(MAX),
    
    -- Antecedentes (JSON)
    AntecedentesJson NVARCHAR(MAX),
    
    -- Examen Físico (JSON)
    ExamenFisicoJson NVARCHAR(MAX),
    
    -- Diagnósticos (JSON Array)
    DiagnosticosJson NVARCHAR(MAX),
    
    -- Evolución y Plan
    Evolucion NVARCHAR(MAX),
    PlanJson NVARCHAR(MAX), -- JSON Array
    
    -- Médico
    MedicoNombre VARCHAR(200),
    MedicoRegistro VARCHAR(50),
    MedicoEspecialidad VARCHAR(100),
    
    -- Control
    FechaCreacion DATETIME DEFAULT GETDATE(),
    UsuarioCreacion VARCHAR(100),
    PdfUrl VARCHAR(500),
    Estado VARCHAR(20) DEFAULT 'ACTIVA',
    
    INDEX IX_HistoriaClinica_NoIdentificacion (NoIdentificacion),
    INDEX IX_HistoriaClinica_FechaCreacion (FechaCreacion)
);

-- ============================================
-- TABLA: OrdenMedicamentos
-- Descripción: Almacena las órdenes de medicamentos
-- ============================================
CREATE TABLE OrdenMedicamentos (
    Id INT PRIMARY KEY IDENTITY(1,1),
    NoOrden VARCHAR(20) UNIQUE NOT NULL,
    ConsecutivoOrden VARCHAR(20) UNIQUE NOT NULL,
    
    -- Datos del Paciente
    NoCaso VARCHAR(20),
    NoIdentificacion VARCHAR(20) NOT NULL,
    NombrePaciente VARCHAR(200) NOT NULL,
    Edad INT,
    Sexo VARCHAR(10),
    
    -- Relación con Historia Clínica
    NoHistoriaClinica VARCHAR(20), -- ⭐ NUEVO - Relación con historia clínica
    
    -- Alergias
    PacienteAlergico VARCHAR(10), -- SI/NO/NIEGA
    AlergiasJson NVARCHAR(MAX), -- JSON Array
    
    -- Datos de la Orden
    FechaOrden DATETIME NOT NULL,
    HoraOrden VARCHAR(10),
    MedicoDiligenciaOrden VARCHAR(200),
    NoRadicado VARCHAR(30),
    
    -- Medicamentos (JSON Array)
    MedicamentosJson NVARCHAR(MAX),
    
    -- Médico
    MedicoNombre VARCHAR(200),
    MedicoRegistro VARCHAR(50),
    MedicoEspecialidad VARCHAR(100),
    
    -- Control
    FechaCreacion DATETIME DEFAULT GETDATE(),
    UsuarioCreacion VARCHAR(100),
    PdfUrl VARCHAR(500),
    Estado VARCHAR(20) DEFAULT 'ACTIVA',
    
    INDEX IX_OrdenMedicamentos_NoIdentificacion (NoIdentificacion),
    INDEX IX_OrdenMedicamentos_FechaOrden (FechaOrden),
    INDEX IX_OrdenMedicamentos_NoHistoriaClinica (NoHistoriaClinica) -- ⭐ NUEVO
);

-- ============================================
-- TABLA: OrdenParaclinicos
-- Descripción: Almacena las órdenes de exámenes paraclínicos
-- ============================================
CREATE TABLE OrdenParaclinicos (
    Id INT PRIMARY KEY IDENTITY(1,1),
    NoOrden VARCHAR(20) UNIQUE NOT NULL,
    ConsecutivoOrden VARCHAR(20) UNIQUE NOT NULL,
    
    -- Datos del Paciente
    NoCaso VARCHAR(20),
    NoIdentificacion VARCHAR(20) NOT NULL,
    NombrePaciente VARCHAR(200) NOT NULL,
    Edad INT,
    Sexo VARCHAR(10),
    
    -- Relación con Historia Clínica
    NoHistoriaClinica VARCHAR(20), -- ⭐ NUEVO - Relación con historia clínica
    
    -- Datos de la Orden
    FechaOrden DATETIME NOT NULL,
    HoraOrden VARCHAR(10),
    MedicoDiligenciaOrden VARCHAR(200),
    NoRadicado VARCHAR(30),
    DependenciaSolicita VARCHAR(100),
    
    -- Paraclinicos (JSON Array)
    ParaclinicosJson NVARCHAR(MAX),
    
    -- Sustentación
    Sustentacion NVARCHAR(MAX),
    
    -- Médico
    MedicoNombre VARCHAR(200),
    MedicoRegistro VARCHAR(50),
    MedicoEspecialidad VARCHAR(100),
    
    -- Control
    FechaCreacion DATETIME DEFAULT GETDATE(),
    UsuarioCreacion VARCHAR(100),
    PdfUrl VARCHAR(500),
    Estado VARCHAR(20) DEFAULT 'ACTIVA',
    
    INDEX IX_OrdenParaclinicos_NoIdentificacion (NoIdentificacion),
    INDEX IX_OrdenParaclinicos_FechaOrden (FechaOrden),
    INDEX IX_OrdenParaclinicos_NoHistoriaClinica (NoHistoriaClinica) -- ⭐ NUEVO
);

-- ============================================
-- TABLAS AUXILIARES (CATÁLOGOS)
-- ============================================

-- Tabla de Medicamentos
CREATE TABLE Medicamentos (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Codigo VARCHAR(20) UNIQUE NOT NULL,
    Nombre VARCHAR(300) NOT NULL,
    PrincipioActivo VARCHAR(200),
    Concentracion VARCHAR(100),
    FormaFarmaceutica VARCHAR(100),
    Estado VARCHAR(20) DEFAULT 'ACTIVO',
    INDEX IX_Medicamentos_Nombre (Nombre),
    INDEX IX_Medicamentos_Codigo (Codigo)
);

-- Tabla de Dependencias (Laboratorio, Imagenología, etc.)
CREATE TABLE Dependencias (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Codigo VARCHAR(20) UNIQUE NOT NULL,
    Nombre VARCHAR(200) NOT NULL,
    Descripcion VARCHAR(500),
    Estado VARCHAR(20) DEFAULT 'ACTIVO',
    INDEX IX_Dependencias_Codigo (Codigo)
);

-- Tabla de Exámenes Paraclínicos
CREATE TABLE ExamenesParaclinicos (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Codigo VARCHAR(20) UNIQUE NOT NULL,
    Nombre VARCHAR(300) NOT NULL,
    Tipo VARCHAR(100), -- Laboratorio, Imagen, etc.
    CodigoDependencia VARCHAR(20),
    NombreDependencia VARCHAR(200),
    Estado VARCHAR(20) DEFAULT 'ACTIVO',
    FOREIGN KEY (CodigoDependencia) REFERENCES Dependencias(Codigo),
    INDEX IX_ExamenesParaclinicos_Nombre (Nombre),
    INDEX IX_ExamenesParaclinicos_Codigo (Codigo)
);

-- ============================================
-- STORED PROCEDURES SUGERIDOS
-- ============================================

-- SP para guardar mensaje de chat
GO
CREATE PROCEDURE sp_GuardarMensajeChat
    @ConversationId VARCHAR(50),
    @PhoneNumber VARCHAR(20),
    @CustomerName VARCHAR(200),
    @MessageId VARCHAR(100),
    @Content NVARCHAR(MAX),
    @MessageType VARCHAR(20),
    @Sender VARCHAR(200),
    @Timestamp DATETIME,
    @MediaUrl VARCHAR(500) = NULL,
    @MediaType VARCHAR(50) = NULL
AS
BEGIN
    INSERT INTO ChatRegistro (
        ConversationId, PhoneNumber, CustomerName, MessageId, 
        Content, MessageType, Sender, Timestamp, MediaUrl, MediaType
    )
    VALUES (
        @ConversationId, @PhoneNumber, @CustomerName, @MessageId,
        @Content, @MessageType, @Sender, @Timestamp, @MediaUrl, @MediaType
    );
    
    SELECT SCOPE_IDENTITY() AS Id;
END;
GO

-- SP para crear historia clínica
GO
CREATE PROCEDURE sp_CrearHistoriaClinica
    @NoIdentificacion VARCHAR(20),
    @NombrePaciente VARCHAR(200),
    @Edad INT,
    @Sexo VARCHAR(10),
    @Telefono VARCHAR(20),
    @MotivoConsulta NVARCHAR(MAX),
    @EnfermedadActual NVARCHAR(MAX),
    @MedicoNombre VARCHAR(200),
    @MedicoRegistro VARCHAR(50),
    @AntecedentesJson NVARCHAR(MAX) = NULL,
    @ExamenFisicoJson NVARCHAR(MAX) = NULL,
    @DiagnosticosJson NVARCHAR(MAX) = NULL,
    @PlanJson NVARCHAR(MAX) = NULL
AS
BEGIN
    DECLARE @NoHistoria VARCHAR(20);
    DECLARE @NoCaso VARCHAR(20);
    
    -- Generar número de historia clínica
    SET @NoHistoria = 'HC' + FORMAT(GETDATE(), 'yyyyMMdd') + 
                     RIGHT('000000' + CAST((SELECT ISNULL(MAX(Id), 0) + 1 FROM HistoriaClinica) AS VARCHAR), 6);
    
    -- Generar número de caso
    SET @NoCaso = 'C' + FORMAT(GETDATE(), 'yyyyMMdd') + 
                 RIGHT('0000' + CAST((SELECT ISNULL(MAX(Id), 0) + 1 FROM HistoriaClinica) AS VARCHAR), 4);
    
    INSERT INTO HistoriaClinica (
        NoHistoria, NoCaso, NoIdentificacion, NombrePaciente, Edad, Sexo, Telefono,
        MotivoConsulta, EnfermedadActual, AntecedentesJson, ExamenFisicoJson,
        DiagnosticosJson, PlanJson, MedicoNombre, MedicoRegistro, FechaIngreso
    )
    VALUES (
        @NoHistoria, @NoCaso, @NoIdentificacion, @NombrePaciente, @Edad, @Sexo, @Telefono,
        @MotivoConsulta, @EnfermedadActual, @AntecedentesJson, @ExamenFisicoJson,
        @DiagnosticosJson, @PlanJson, @MedicoNombre, @MedicoRegistro, GETDATE()
    );
    
    SELECT @NoHistoria AS NoHistoria, @NoCaso AS NoCaso;
END;
GO

-- SP para crear orden de medicamentos
GO
CREATE PROCEDURE sp_CrearOrdenMedicamentos
    @NoIdentificacion VARCHAR(20),
    @NombrePaciente VARCHAR(200),
    @Edad INT,
    @Sexo VARCHAR(10),
    @PacienteAlergico VARCHAR(10),
    @AlergiasJson NVARCHAR(MAX),
    @MedicamentosJson NVARCHAR(MAX),
    @MedicoNombre VARCHAR(200),
    @MedicoRegistro VARCHAR(50),
    @NoHistoriaClinica VARCHAR(20) = NULL -- ⭐ NUEVO
AS
BEGIN
    DECLARE @ConsecutivoOrden VARCHAR(20);
    DECLARE @NoOrden VARCHAR(20);
    DECLARE @NoCaso VARCHAR(20);
    
    -- Generar consecutivo
    SET @ConsecutivoOrden = 'OM' + FORMAT(GETDATE(), 'yyyyMMdd') + 
                          RIGHT('000000' + CAST((SELECT ISNULL(MAX(Id), 0) + 1 FROM OrdenMedicamentos) AS VARCHAR), 6);
    
    SET @NoOrden = @ConsecutivoOrden;
    
    -- Obtener NoCaso si existe NoHistoriaClinica
    IF @NoHistoriaClinica IS NOT NULL
    BEGIN
        SELECT @NoCaso = NoCaso FROM HistoriaClinica WHERE NoHistoria = @NoHistoriaClinica;
    END
    
    INSERT INTO OrdenMedicamentos (
        NoOrden, ConsecutivoOrden, NoIdentificacion, NombrePaciente, Edad, Sexo,
        PacienteAlergico, AlergiasJson, MedicamentosJson, MedicoNombre, MedicoRegistro,
        FechaOrden, HoraOrden, NoHistoriaClinica, NoCaso
    )
    VALUES (
        @NoOrden, @ConsecutivoOrden, @NoIdentificacion, @NombrePaciente, @Edad, @Sexo,
        @PacienteAlergico, @AlergiasJson, @MedicamentosJson, @MedicoNombre, @MedicoRegistro,
        GETDATE(), FORMAT(GETDATE(), 'HH:mm'), @NoHistoriaClinica, @NoCaso
    );
    
    SELECT @NoOrden AS NoOrden, @ConsecutivoOrden AS ConsecutivoOrden;
END;
GO

-- SP para crear orden de paraclínicos
GO
CREATE PROCEDURE sp_CrearOrdenParaclinicos
    @NoIdentificacion VARCHAR(20),
    @NombrePaciente VARCHAR(200),
    @Edad INT,
    @Sexo VARCHAR(10),
    @DependenciaSolicita VARCHAR(100),
    @ParaclinicosJson NVARCHAR(MAX),
    @Sustentacion NVARCHAR(MAX),
    @MedicoNombre VARCHAR(200),
    @MedicoRegistro VARCHAR(50),
    @NoHistoriaClinica VARCHAR(20) = NULL -- ⭐ NUEVO
AS
BEGIN
    DECLARE @ConsecutivoOrden VARCHAR(20);
    DECLARE @NoOrden VARCHAR(20);
    DECLARE @NoCaso VARCHAR(20);
    
    -- Generar consecutivo
    SET @ConsecutivoOrden = 'OP' + FORMAT(GETDATE(), 'yyyyMMdd') + 
                          RIGHT('000000' + CAST((SELECT ISNULL(MAX(Id), 0) + 1 FROM OrdenParaclinicos) AS VARCHAR), 6);
    
    SET @NoOrden = @ConsecutivoOrden;
    
    -- Obtener NoCaso si existe NoHistoriaClinica
    IF @NoHistoriaClinica IS NOT NULL
    BEGIN
        SELECT @NoCaso = NoCaso FROM HistoriaClinica WHERE NoHistoria = @NoHistoriaClinica;
    END
    
    INSERT INTO OrdenParaclinicos (
        NoOrden, ConsecutivoOrden, NoIdentificacion, NombrePaciente, Edad, Sexo,
        DependenciaSolicita, ParaclinicosJson, Sustentacion, MedicoNombre, MedicoRegistro,
        FechaOrden, HoraOrden, NoHistoriaClinica, NoCaso
    )
    VALUES (
        @NoOrden, @ConsecutivoOrden, @NoIdentificacion, @NombrePaciente, @Edad, @Sexo,
        @DependenciaSolicita, @ParaclinicosJson, @Sustentacion, @MedicoNombre, @MedicoRegistro,
        GETDATE(), FORMAT(GETDATE(), 'HH:mm'), @NoHistoriaClinica, @NoCaso
    );
    
    SELECT @NoOrden AS NoOrden, @ConsecutivoOrden AS ConsecutivoOrden;
END;
GO

-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ============================================

-- Insertar medicamentos de ejemplo
INSERT INTO Medicamentos (Codigo, Nombre, PrincipioActivo, Concentracion, FormaFarmaceutica)
VALUES 
    ('0011', 'ACETAMINOFEN 500 mg TAB', 'Acetaminofen', '500 mg', 'Tableta'),
    ('1210', 'CEFALEXINA 500 mg TAB', 'Cefalexina', '500 mg', 'Tableta'),
    ('0025', 'IBUPROFENO 400 mg TAB', 'Ibuprofeno', '400 mg', 'Tableta'),
    ('0078', 'AMOXICILINA 500 mg CAP', 'Amoxicilina', '500 mg', 'Cápsula');

-- Insertar dependencias de ejemplo
INSERT INTO Dependencias (Codigo, Nombre, Descripcion)
VALUES 
    ('LAB01', 'LABORATORIO CLINICO', 'Laboratorio de análisis clínicos'),
    ('IMG01', 'IMAGENOLOGIA', 'Departamento de imágenes diagnósticas'),
    ('CARD01', 'CARDIOLOGIA', 'Departamento de cardiología');

-- Insertar exámenes paraclínicos de ejemplo
INSERT INTO ExamenesParaclinicos (Codigo, Nombre, Tipo, CodigoDependencia, NombreDependencia)
VALUES 
    ('902210', 'HEMOGRAMA IV', 'Laboratorio', 'LAB01', 'LABORATORIO CLINICO'),
    ('902204', 'ERITROSEDIMENTACIÓN', 'Laboratorio', 'LAB01', 'LABORATORIO CLINICO'),
    ('906913', 'PROTEÍNA C REACTIVA', 'Laboratorio', 'LAB01', 'LABORATORIO CLINICO'),
    ('RX001', 'RADIOGRAFIA DE TORAX', 'Imagen', 'IMG01', 'IMAGENOLOGIA');
