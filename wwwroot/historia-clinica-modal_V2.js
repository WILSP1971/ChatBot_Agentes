// historia-clinica-modal.js
// Modal interactivo mejorado para diligenciar historia clínica con diagnósticos en grid

(function() {
    'use strict';

    // Variables globales para diagnósticos
    let diagnosticosAgregados = [];
    let diagnosticosDisponibles = [];
    let tiposIdentificacion = [];
    let departamentos = [];

    // Cargar datos de listas desde el backend
    async function cargarDatosListas() {
        try {
            // Cargar tipos de identificación
            const respTiposId = await fetch('/api/HistoriaClinica/tipos-identificacion');
            tiposIdentificacion = await respTiposId.json();

            // Cargar departamentos
            const respDepartamentos = await fetch('/api/HistoriaClinica/departamentos');
            departamentos = await respDepartamentos.json();

            // Cargar diagnósticos para autocompletar
            const respDiagnosticos = await fetch('/api/HistoriaClinica/diagnosticos');
            diagnosticosDisponibles = await respDiagnosticos.json();

            // Popular los selects
            popularSelectTipoIdentificacion();
            popularSelectDepartamento();
            inicializarAutocompleteDiagnostico();
        } catch (error) {
            console.error('Error al cargar datos de listas:', error);
        }
    }

    function popularSelectTipoIdentificacion() {
        const select = document.getElementById('tipoIdentificacion');
        if (select && tiposIdentificacion.length > 0) {
            select.innerHTML = '<option value="">Seleccione...</option>' + 
                tiposIdentificacion.map(tipo => 
                    `<option value="${tipo.codigo}">${tipo.descripcion}</option>`
                ).join('');
        }
    }

    function popularSelectDepartamento() {
        const select = document.getElementById('departamento');
        if (select && departamentos.length > 0) {
            select.innerHTML = '<option value="">Seleccione...</option>' + 
                departamentos.map(dept => 
                    `<option value="${dept.codigo}">${dept.nombre}</option>`
                ).join('');
        }
    }

    function inicializarAutocompleteDiagnostico() {
        const input = document.getElementById('codigoDiagnostico');
        const datalist = document.getElementById('diagnosticosList');
        
        if (input && datalist && diagnosticosDisponibles.length > 0) {
            datalist.innerHTML = diagnosticosDisponibles.map(diag => 
                `<option value="${diag.codigo}" data-descripcion="${diag.descripcion}">${diag.codigo} - ${diag.descripcion}</option>`
            ).join('');

            input.addEventListener('input', function() {
                const codigo = this.value;
                const diagnostico = diagnosticosDisponibles.find(d => d.codigo === codigo);
                
                if (diagnostico) {
                    document.getElementById('descripcionDiagnostico').value = diagnostico.descripcion;
                } else {
                    document.getElementById('descripcionDiagnostico').value = '';
                }
            });
        }
    }

    // Agregar estilos CSS mejorados para el modal
    const styles = `
        <style>
            @keyframes modalFadeIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -48%) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }

            @keyframes overlayFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes shimmer {
                0% { background-position: -1000px 0; }
                100% { background-position: 1000px 0; }
            }

            #historiaClinicaModal {
                display: none;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 95%;
                max-width: 1100px;
                max-height: 92vh;
                background: white;
                border-radius: 20px;
                box-shadow: 0 25px 70px rgba(0,0,0,0.4);
                z-index: 10000;
                overflow: hidden;
            }
            
            #historiaClinicaModal.show {
                display: block;
                animation: modalFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .hc-modal-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(5px);
                z-index: 9999;
            }
            
            .hc-modal-overlay.show {
                display: block;
                animation: overlayFadeIn 0.3s ease;
            }
            
            .hc-modal-header {
                background: linear-gradient(135deg, #075E54 0%, #128C7E 100%);
                color: white;
                padding: 1.5rem 2rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                position: relative;
                overflow: hidden;
            }

            .hc-modal-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                animation: shimmer 3s infinite;
            }

            .hc-modal-header h5 {
                margin: 0;
                font-size: 1.4rem;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                position: relative;
                z-index: 1;
            }

            .hc-modal-header h5 i {
                font-size: 1.8rem;
            }

            .hc-close-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                z-index: 1;
            }

            .hc-close-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: rotate(90deg) scale(1.1);
            }

            .hc-close-btn i {
                color: white;
                font-size: 1.5rem;
            }
            
            .hc-modal-body {
                padding: 2rem;
                max-height: calc(92vh - 200px);
                overflow-y: auto;
                background: linear-gradient(to bottom, #ffffff, #f9fafb);
            }

            .hc-modal-body::-webkit-scrollbar {
                width: 10px;
            }

            .hc-modal-body::-webkit-scrollbar-track {
                background: #F5F5F5;
                border-radius: 10px;
            }

            .hc-modal-body::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, #25D366, #128C7E);
                border-radius: 10px;
            }
            
            .hc-tabs {
                display: flex;
                border-bottom: 3px solid #e5e7eb;
                margin-bottom: 2rem;
                gap: 0.5rem;
                flex-wrap: wrap;
            }
            
            .hc-tab {
                padding: 1rem 1.75rem;
                cursor: pointer;
                border-bottom: 4px solid transparent;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                font-weight: 600;
                color: #6B7280;
                border-radius: 8px 8px 0 0;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                position: relative;
                overflow: hidden;
            }

            .hc-tab::before {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 0;
                background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
                transition: height 0.3s;
                z-index: 0;
            }

            .hc-tab:hover::before {
                height: 100%;
            }

            .hc-tab span {
                position: relative;
                z-index: 1;
            }
            
            .hc-tab:hover {
                background: linear-gradient(135deg, rgba(37, 211, 102, 0.1), rgba(18, 140, 126, 0.1));
                color: #075E54;
                transform: translateY(-2px);
            }
            
            .hc-tab.active {
                color: #075E54;
                border-bottom-color: #075E54;
                background: linear-gradient(135deg, rgba(37, 211, 102, 0.15), rgba(18, 140, 126, 0.15));
                box-shadow: 0 -2px 8px rgba(7, 94, 84, 0.1);
            }

            .hc-tab i {
                font-size: 1.2rem;
            }
            
            .hc-tab-content {
                display: none;
                animation: slideDown 0.4s ease;
            }
            
            .hc-tab-content.active {
                display: block;
            }
            
            .hc-form-group {
                margin-bottom: 1.5rem;
                animation: slideDown 0.3s ease;
            }
            
            .hc-form-group label {
                display: block;
                font-weight: 700;
                margin-bottom: 0.75rem;
                color: #1F2937;
                font-size: 0.95rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .hc-form-group label i {
                color: #128C7E;
                font-size: 1.1rem;
            }

            .hc-required {
                color: #EF4444;
                font-weight: bold;
            }
            
            .hc-input, .hc-select, .hc-textarea {
                width: 100%;
                padding: 0.875rem 1rem;
                border: 2px solid #E5E7EB;
                border-radius: 12px;
                font-size: 0.95rem;
                transition: all 0.3s ease;
                background: white;
                font-family: 'Segoe UI', sans-serif;
            }

            .hc-input:focus, .hc-select:focus, .hc-textarea:focus {
                outline: none;
                border-color: #128C7E;
                box-shadow: 0 0 0 4px rgba(18, 140, 126, 0.1);
                background: #FAFAFA;
            }

            .hc-input:read-only {
                background: #F3F4F6;
                cursor: not-allowed;
            }

            .hc-textarea {
                min-height: 120px;
                resize: vertical;
                font-family: 'Segoe UI', sans-serif;
            }

            .hc-section-title {
                font-size: 1.2rem;
                font-weight: 700;
                color: #075E54;
                margin: 2rem 0 1.5rem 0;
                padding-bottom: 0.75rem;
                border-bottom: 3px solid #E8F5E9;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .hc-section-title i {
                font-size: 1.5rem;
                color: #25D366;
            }

            .hc-row {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 1.5rem;
                margin-bottom: 1.5rem;
            }

            .hc-checkbox-group {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 1rem;
                margin-top: 1rem;
            }

            .hc-checkbox-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem;
                background: #F9FAFB;
                border-radius: 8px;
                transition: all 0.3s ease;
                cursor: pointer;
            }

            .hc-checkbox-item:hover {
                background: #E8F5E9;
                transform: translateX(5px);
            }

            .hc-checkbox-item input[type="checkbox"] {
                width: 20px;
                height: 20px;
                cursor: pointer;
                accent-color: #25D366;
            }

            .hc-checkbox-item label {
                margin: 0 !important;
                cursor: pointer;
                font-weight: 600 !important;
            }

            .hc-modal-footer {
                padding: 1.5rem 2rem;
                border-top: 2px solid #E5E7EB;
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
                background: #FAFAFA;
            }

            .hc-btn {
                padding: 0.875rem 2rem;
                border: none;
                border-radius: 25px;
                font-weight: 700;
                font-size: 0.95rem;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                align-items: center;
                gap: 0.75rem;
                position: relative;
                overflow: hidden;
            }

            .hc-btn::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: translate(-50%, -50%);
                transition: width 0.4s, height 0.4s;
            }

            .hc-btn:hover::before {
                width: 300%;
                height: 300%;
            }

            .hc-btn span, .hc-btn i {
                position: relative;
                z-index: 1;
            }

            .hc-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
            }

            .hc-btn:active {
                transform: translateY(-1px);
            }

            .hc-btn-primary {
                background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
            }

            .hc-btn-secondary {
                background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
            }

            .hc-btn i {
                font-size: 1.2rem;
            }

            .hc-help-text {
                font-size: 0.85rem;
                color: #6B7280;
                margin-top: 0.5rem;
                font-style: italic;
            }

            /* Estilos para el grid de diagnósticos */
            .diagnostico-form-container {
                background: #F9FAFB;
                border: 2px solid #E5E7EB;
                border-radius: 12px;
                padding: 1.5rem;
                margin-bottom: 1.5rem;
            }

            .diagnostico-add-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 20px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-top: 1rem;
            }

            .diagnostico-add-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
            }

            .diagnosticos-grid {
                margin-top: 1.5rem;
                border: 2px solid #E5E7EB;
                border-radius: 12px;
                overflow: hidden;
                background: white;
            }

            .diagnosticos-grid table {
                width: 100%;
                border-collapse: collapse;
            }

            .diagnosticos-grid thead {
                background: linear-gradient(135deg, #075E54 0%, #128C7E 100%);
                color: white;
            }

            .diagnosticos-grid th {
                padding: 1rem;
                text-align: left;
                font-weight: 700;
                font-size: 0.9rem;
            }

            .diagnosticos-grid tbody tr {
                border-bottom: 1px solid #E5E7EB;
                transition: background 0.3s ease;
            }

            .diagnosticos-grid tbody tr:hover {
                background: #F9FAFB;
            }

            .diagnosticos-grid td {
                padding: 1rem;
                font-size: 0.9rem;
            }

            .diagnosticos-grid .delete-btn {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 15px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: 600;
            }

            .diagnosticos-grid .delete-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
            }

            .empty-diagnosticos {
                padding: 2rem;
                text-align: center;
                color: #6B7280;
                font-style: italic;
            }
        </style>
    `;

    // HTML del modal
    const modalHTML = `
        <div class="hc-modal-overlay" id="hcModalOverlay"></div>
        
        <div id="historiaClinicaModal">
            <div class="hc-modal-header">
                <h5>
                    <i class="fas fa-file-medical-alt"></i>
                    Historia Clínica del Paciente
                </h5>
                <button class="hc-close-btn" onclick="cerrarHistoriaClinicaModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="hc-modal-body">
                <form id="historiaClinicaForm">
                    <!-- TABS -->
                    <div class="hc-tabs">
                        <div class="hc-tab active" data-tab="paciente">
                            <i class="fas fa-user"></i>
                            <span>Datos del Paciente</span>
                        </div>
                        <div class="hc-tab" data-tab="antecedentes">
                            <i class="fas fa-history"></i>
                            <span>Antecedentes</span>
                        </div>
                        <div class="hc-tab" data-tab="examen">
                            <i class="fas fa-heartbeat"></i>
                            <span>Examen Físico</span>
                        </div>
                        <div class="hc-tab" data-tab="diagnostico">
                            <i class="fas fa-stethoscope"></i>
                            <span>Diagnóstico y Plan</span>
                        </div>
                    </div>

                    <!-- TAB CONTENT: Datos del Paciente -->
                    <div class="hc-tab-content active" data-tab="paciente">
                        <div class="hc-section-title">
                            <i class="fas fa-address-card"></i>
                            Información Personal
                        </div>

                        <div class="hc-row">
                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-id-card"></i>
                                    Tipo de Identificación <span class="hc-required">*</span>
                                </label>
                                <select name="tipoIdentificacion" id="tipoIdentificacion" class="hc-select" required>
                                    <option value="">Seleccione...</option>
                                </select>
                            </div>

                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-hashtag"></i>
                                    No. Identificación <span class="hc-required">*</span>
                                </label>
                                <input type="text" name="noIdentificacion" class="hc-input" 
                                       placeholder="Ej: 1234567890" required>
                            </div>

                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-user"></i>
                                    Nombre Completo <span class="hc-required">*</span>
                                </label>
                                <input type="text" name="nombrePaciente" class="hc-input" 
                                       placeholder="Nombre completo del paciente" required>
                            </div>
                        </div>

                        <div class="hc-row">
                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-calendar"></i>
                                    Edad <span class="hc-required">*</span>
                                </label>
                                <input type="number" name="edad" class="hc-input" placeholder="Edad" required>
                            </div>

                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-venus-mars"></i>
                                    Sexo <span class="hc-required">*</span>
                                </label>
                                <select name="sexo" class="hc-select" required>
                                    <option value="">Seleccione...</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </select>
                            </div>

                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-ring"></i>
                                    Estado Civil
                                </label>
                                <select name="estadoCivil" class="hc-select">
                                    <option value="">Seleccione...</option>
                                    <option value="SOLTERO">Soltero(a)</option>
                                    <option value="CASADO">Casado(a)</option>
                                    <option value="UNION_LIBRE">Unión Libre</option>
                                    <option value="DIVORCIADO">Divorciado(a)</option>
                                    <option value="VIUDO">Viudo(a)</option>
                                </select>
                            </div>
                        </div>

                        <div class="hc-section-title">
                            <i class="fas fa-map-marker-alt"></i>
                            Información de Contacto
                        </div>

                        <div class="hc-row">
                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-phone"></i>
                                    Teléfono <span class="hc-required">*</span>
                                </label>
                                <input type="tel" name="telefono" class="hc-input" 
                                       placeholder="Número de teléfono" required>
                            </div>

                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-home"></i>
                                    Dirección
                                </label>
                                <input type="text" name="direccion" class="hc-input" 
                                       placeholder="Dirección completa">
                            </div>
                        </div>

                        <div class="hc-row">
                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-map"></i>
                                    Departamento
                                </label>
                                <select name="departamento" id="departamento" class="hc-select">
                                    <option value="">Seleccione...</option>
                                </select>
                            </div>

                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-city"></i>
                                    Ciudad
                                </label>
                                <input type="text" name="ciudad" class="hc-input" placeholder="Ciudad">
                            </div>

                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-briefcase"></i>
                                    Ocupación
                                </label>
                                <input type="text" name="ocupacion" class="hc-input" placeholder="Ocupación">
                            </div>
                        </div>
                    </div>

                    <!-- TAB CONTENT: Antecedentes -->
                    <div class="hc-tab-content" data-tab="antecedentes">
                        <div class="hc-section-title">
                            <i class="fas fa-notes-medical"></i>
                            Motivo de Consulta y Enfermedad Actual
                        </div>

                        <div class="hc-form-group">
                            <label>
                                <i class="fas fa-comment-medical"></i>
                                Motivo de Consulta <span class="hc-required">*</span>
                            </label>
                            <textarea name="motivoConsulta" class="hc-textarea" 
                                      placeholder="Describa el motivo de la consulta" required></textarea>
                        </div>

                        <div class="hc-form-group">
                            <label>
                                <i class="fas fa-file-medical"></i>
                                Enfermedad Actual
                            </label>
                            <textarea name="enfermedadActual" class="hc-textarea" 
                                      placeholder="Describa la enfermedad actual"></textarea>
                        </div>

                        <div class="hc-section-title">
                            <i class="fas fa-history"></i>
                            Antecedentes Médicos
                        </div>

                        <div class="hc-checkbox-group">
                            <div class="hc-checkbox-item">
                                <input type="checkbox" id="ant_hipertension" name="antecedentes" value="HIPERTENSION">
                                <label for="ant_hipertension">Hipertensión</label>
                            </div>
                            <div class="hc-checkbox-item">
                                <input type="checkbox" id="ant_diabetes" name="antecedentes" value="DIABETES">
                                <label for="ant_diabetes">Diabetes</label>
                            </div>
                            <div class="hc-checkbox-item">
                                <input type="checkbox" id="ant_asma" name="antecedentes" value="ASMA">
                                <label for="ant_asma">Asma</label>
                            </div>
                            <div class="hc-checkbox-item">
                                <input type="checkbox" id="ant_epilepsia" name="antecedentes" value="EPILEPSIA">
                                <label for="ant_epilepsia">Epilepsia</label>
                            </div>
                            <div class="hc-checkbox-item">
                                <input type="checkbox" id="ant_cardiopatia" name="antecedentes" value="CARDIOPATIA">
                                <label for="ant_cardiopatia">Cardiopatía</label>
                            </div>
                            <div class="hc-checkbox-item">
                                <input type="checkbox" id="ant_cancer" name="antecedentes" value="CANCER">
                                <label for="ant_cancer">Cáncer</label>
                            </div>
                            <div class="hc-checkbox-item">
                                <input type="checkbox" id="ant_alergias" name="antecedentes" value="ALERGIAS">
                                <label for="ant_alergias">Alergias</label>
                            </div>
                            <div class="hc-checkbox-item">
                                <input type="checkbox" id="ant_cirugias" name="antecedentes" value="CIRUGIAS_PREVIAS">
                                <label for="ant_cirugias">Cirugías Previas</label>
                            </div>
                        </div>

                        <div class="hc-form-group">
                            <label>
                                <i class="fas fa-plus-square"></i>
                                Otros Antecedentes
                            </label>
                            <textarea name="otrosAntecedentes" class="hc-textarea" 
                                      placeholder="Especifique otros antecedentes relevantes"></textarea>
                        </div>
                    </div>

                    <!-- TAB CONTENT: Examen Físico -->
                    <div class="hc-tab-content" data-tab="examen">
                        <div class="hc-section-title">
                            <i class="fas fa-thermometer-half"></i>
                            Signos Vitales
                        </div>

                        <div class="hc-row">
                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-heartbeat"></i>
                                    FC (lpm)
                                </label>
                                <input type="number" name="fc" class="hc-input" placeholder="Frecuencia cardíaca">
                            </div>

                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-lungs"></i>
                                    FR (rpm)
                                </label>
                                <input type="number" name="fr" class="hc-input" placeholder="Frecuencia respiratoria">
                            </div>

                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-tachometer-alt"></i>
                                    TA (mmHg)
                                </label>
                                <input type="text" name="ta" class="hc-input" placeholder="Ej: 120/80">
                            </div>
                        </div>

                        <div class="hc-row">
                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-thermometer"></i>
                                    Temperatura (°C)
                                </label>
                                <input type="number" step="0.1" name="temperatura" class="hc-input" placeholder="Ej: 36.5">
                            </div>

                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-weight"></i>
                                    Peso (kg)
                                </label>
                                <input type="number" step="0.1" name="peso" class="hc-input" placeholder="Peso en kg">
                            </div>

                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-ruler-vertical"></i>
                                    Talla (cm)
                                </label>
                                <input type="number" step="0.1" name="talla" class="hc-input" placeholder="Talla en cm">
                            </div>
                        </div>

                        <div class="hc-section-title">
                            <i class="fas fa-user-md"></i>
                            Examen Físico Detallado
                        </div>

                        <div class="hc-form-group">
                            <label>
                                <i class="fas fa-brain"></i>
                                Escala de Glasgow
                            </label>
                            <input type="text" name="glasgow" class="hc-input" placeholder="Ej: 15/15">
                        </div>

                        <div class="hc-form-group">
                            <label>
                                <i class="fas fa-male"></i>
                                Aspecto General
                            </label>
                            <textarea name="aspectoGeneral" class="hc-textarea" 
                                      placeholder="Describa el aspecto general del paciente"></textarea>
                        </div>

                        <div class="hc-row">
                            <div class="hc-form-group">
                                <label>Cabeza y Cara</label>
                                <textarea name="cabezaCara" class="hc-textarea" 
                                          placeholder="Hallazgos en cabeza y cara"></textarea>
                            </div>

                            <div class="hc-form-group">
                                <label>Cuello</label>
                                <textarea name="cuello" class="hc-textarea" 
                                          placeholder="Hallazgos en cuello"></textarea>
                            </div>
                        </div>

                        <div class="hc-row">
                            <div class="hc-form-group">
                                <label>Tórax</label>
                                <textarea name="torax" class="hc-textarea" 
                                          placeholder="Hallazgos en tórax"></textarea>
                            </div>

                            <div class="hc-form-group">
                                <label>Abdomen</label>
                                <textarea name="abdomen" class="hc-textarea" 
                                          placeholder="Hallazgos en abdomen"></textarea>
                            </div>
                        </div>

                        <div class="hc-row">
                            <div class="hc-form-group">
                                <label>Genitourinario</label>
                                <textarea name="genitourinario" class="hc-textarea" 
                                          placeholder="Hallazgos genitourinarios"></textarea>
                            </div>

                            <div class="hc-form-group">
                                <label>Dorso y Extremidades</label>
                                <textarea name="dorsoExtremidades" class="hc-textarea" 
                                          placeholder="Hallazgos en dorso y extremidades"></textarea>
                            </div>
                        </div>

                        <div class="hc-form-group">
                            <label>
                                <i class="fas fa-brain"></i>
                                Sistema Nervioso Central
                            </label>
                            <textarea name="snc" class="hc-textarea" 
                                      placeholder="Hallazgos del sistema nervioso central"></textarea>
                        </div>
                    </div>

                    <!-- TAB CONTENT: Diagnóstico y Plan -->
                    <div class="hc-tab-content" data-tab="diagnostico">
                        <div class="hc-section-title">
                            <i class="fas fa-stethoscope"></i>
                            Diagnósticos
                        </div>

                        <div class="diagnostico-form-container">
                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-code"></i>
                                    Código Diagnóstico (CIE-10) <span class="hc-required">*</span>
                                </label>
                                <input type="text" id="codigoDiagnostico" class="hc-input" 
                                       list="diagnosticosList" placeholder="Buscar diagnóstico por código...">
                                <datalist id="diagnosticosList"></datalist>
                                <p class="hc-help-text">Escriba para buscar diagnósticos por código o descripción</p>
                            </div>

                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-file-medical-alt"></i>
                                    Descripción
                                </label>
                                <input type="text" id="descripcionDiagnostico" class="hc-input" 
                                       placeholder="Descripción del diagnóstico" readonly>
                            </div>

                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-comment"></i>
                                    Observación
                                </label>
                                <textarea id="observacionDiagnostico" class="hc-textarea" 
                                          placeholder="Observaciones adicionales sobre el diagnóstico"></textarea>
                            </div>

                            <button type="button" class="diagnostico-add-btn" onclick="agregarDiagnostico()">
                                <i class="fas fa-plus-circle"></i>
                                Agregar Diagnóstico
                            </button>
                        </div>

                        <div class="diagnosticos-grid" id="diagnosticosGrid">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Descripción</th>
                                        <th>Observación</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody id="diagnosticosTableBody">
                                    <tr>
                                        <td colspan="4" class="empty-diagnosticos">
                                            No hay diagnósticos agregados
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="hc-section-title">
                            <i class="fas fa-clipboard-list"></i>
                            Plan de Tratamiento
                        </div>

                        <div class="hc-form-group">
                            <label>
                                <i class="fas fa-notes-medical"></i>
                                Evolución
                            </label>
                            <textarea name="evolucion" class="hc-textarea" 
                                      placeholder="Describa la evolución del paciente"></textarea>
                        </div>

                        <div class="hc-form-group">
                            <label>
                                <i class="fas fa-tasks"></i>
                                Plan de Tratamiento (uno por línea)
                            </label>
                            <textarea name="plan" class="hc-textarea" 
                                      placeholder="Ejemplo:
1. Paracetamol 500mg cada 8 horas por 3 días
2. Control en 7 días
3. Exámenes de laboratorio"></textarea>
                            <p class="hc-help-text">Ingrese cada ítem del plan en una línea separada</p>
                        </div>

                        <div class="hc-section-title">
                            <i class="fas fa-user-md"></i>
                            Información del Médico
                        </div>

                        <div class="hc-row">
                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-user-md"></i>
                                    Nombre del Médico <span class="hc-required">*</span>
                                </label>
                                <input type="text" name="medicoNombre" class="hc-input" 
                                       placeholder="Nombre completo del médico" required>
                            </div>

                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-id-card"></i>
                                    Registro Médico <span class="hc-required">*</span>
                                </label>
                                <input type="text" name="medicoRegistro" class="hc-input" 
                                       placeholder="Número de registro médico" required>
                            </div>

                            <div class="hc-form-group">
                                <label>
                                    <i class="fas fa-graduation-cap"></i>
                                    Especialidad
                                </label>
                                <input type="text" name="medicoEspecialidad" class="hc-input" 
                                       placeholder="Especialidad médica">
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <div class="hc-modal-footer">
                <button type="button" class="hc-btn hc-btn-secondary" onclick="cerrarHistoriaClinicaModal()">
                    <i class="fas fa-times"></i>
                    <span>Cancelar</span>
                </button>
                <button type="button" class="hc-btn hc-btn-primary" onclick="guardarHistoriaClinica()">
                    <i class="fas fa-save"></i>
                    <span>Guardar Historia Clínica</span>
                </button>
            </div>
        </div>
    `;

    // Inyectar estilos y HTML
    document.head.insertAdjacentHTML('beforeend', styles);
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Cargar datos de listas al iniciar
    cargarDatosListas();

    // Funcionalidad de tabs
    document.querySelectorAll('.hc-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Desactivar todos los tabs
            document.querySelectorAll('.hc-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.hc-tab-content').forEach(t => t.classList.remove('active'));
            
            // Activar el tab clickeado
            this.classList.add('active');
            document.querySelector(`.hc-tab-content[data-tab="${tabName}"]`).classList.add('active');
        });
    });

    // Función para agregar diagnóstico al grid
    window.agregarDiagnostico = function() {
        const codigo = document.getElementById('codigoDiagnostico').value.trim();
        const descripcion = document.getElementById('descripcionDiagnostico').value.trim();
        const observacion = document.getElementById('observacionDiagnostico').value.trim();

        if (!codigo || !descripcion) {
            alert('Por favor seleccione un diagnóstico válido');
            return;
        }

        // Agregar al array
        diagnosticosAgregados.push({
            codigo: codigo,
            descripcion: descripcion,
            observacion: observacion
        });

        // Actualizar grid
        actualizarGridDiagnosticos();

        // Limpiar campos
        document.getElementById('codigoDiagnostico').value = '';
        document.getElementById('descripcionDiagnostico').value = '';
        document.getElementById('observacionDiagnostico').value = '';
    };

    function actualizarGridDiagnosticos() {
        const tbody = document.getElementById('diagnosticosTableBody');
        
        if (diagnosticosAgregados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-diagnosticos">
                        No hay diagnósticos agregados
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = diagnosticosAgregados.map((diag, index) => `
            <tr>
                <td><strong>${diag.codigo}</strong></td>
                <td>${diag.descripcion}</td>
                <td>${diag.observacion || '-'}</td>
                <td>
                    <button type="button" class="delete-btn" onclick="eliminarDiagnostico(${index})">
                        <i class="fas fa-trash"></i>
                        Eliminar
                    </button>
                </td>
            </tr>
        `).join('');
    }

    window.eliminarDiagnostico = function(index) {
        if (confirm('¿Está seguro de eliminar este diagnóstico?')) {
            diagnosticosAgregados.splice(index, 1);
            actualizarGridDiagnosticos();
        }
    };

    // Función global para abrir el modal
    window.abrirHistoriaClinicaModal = function(conversationId) {
        const modal = document.getElementById('historiaClinicaModal');
        const overlay = document.getElementById('hcModalOverlay');
        
        // Guardar el conversationId en el formulario
        document.getElementById('historiaClinicaForm').dataset.conversationId = conversationId;
        
        // Pre-llenar datos si están disponibles
        const conversation = window.currentConversation;
        if (conversation) {
            document.querySelector('[name="telefono"]').value = conversation.phoneNumber || '';
            document.querySelector('[name="nombrePaciente"]').value = conversation.customerName || '';
        }
        
        modal.classList.add('show');
        overlay.classList.add('show');
    };

    // Función global para cerrar el modal
    window.cerrarHistoriaClinicaModal = function() {
        const modal = document.getElementById('historiaClinicaModal');
        const overlay = document.getElementById('hcModalOverlay');
        
        modal.classList.remove('show');
        overlay.classList.remove('show');

        // Limpiar diagnósticos agregados
        diagnosticosAgregados = [];
        actualizarGridDiagnosticos();
    };

    // Función global para guardar la historia clínica
    window.guardarHistoriaClinica = async function() {
        const form = document.getElementById('historiaClinicaForm');
        const formData = new FormData(form);
        
        // Validar campos requeridos
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#ef4444';
                field.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
                isValid = false;
            } else {
                field.style.borderColor = '';
                field.style.boxShadow = '';
            }
        });

        // Validar que haya al menos un diagnóstico
        if (diagnosticosAgregados.length === 0) {
            alert('Debe agregar al menos un diagnóstico');
            // Cambiar a la pestaña de diagnóstico
            document.querySelector('.hc-tab[data-tab="diagnostico"]').click();
            return;
        }
        
        if (!isValid) {
            alert('Por favor complete todos los campos obligatorios (marcados con *)');
            return;
        }
        
        // Construir objeto de historia clínica
        const antecedentes = {};
        form.querySelectorAll('input[name="antecedentes"]:checked').forEach(checkbox => {
            antecedentes[checkbox.value] = 'SI';
        });
        
        // Agregar otros antecedentes si existen
        const otrosAntecedentes = formData.get('otrosAntecedentes');
        if (otrosAntecedentes) {
            antecedentes['OTROS'] = otrosAntecedentes;
        }
        
        // Construir plan (separados por línea)
        const plan = formData.get('plan')
            .split('\n')
            .filter(p => p.trim())
            .map(p => p.trim());
        
        const historiaClinica = {
            tipoIdentificacion: formData.get('tipoIdentificacion'),
            noIdentificacion: formData.get('noIdentificacion'),
            nombrePaciente: formData.get('nombrePaciente'),
            edad: parseInt(formData.get('edad')),
            sexo: formData.get('sexo'),
            direccion: formData.get('direccion') || '',
            departamento: formData.get('departamento') || '',
            ciudad: formData.get('ciudad') || '',
            telefono: formData.get('telefono'),
            ocupacion: formData.get('ocupacion') || '',
            estadoCivil: formData.get('estadoCivil') || '',
            fechaNacimiento: formData.get('fechaNacimiento') || new Date().toISOString(),
            fechaIngreso: new Date().toISOString(),
            horaIngreso: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
            nombreAcompanante: '',
            parentesco: '',
            motivoConsulta: formData.get('motivoConsulta'),
            enfermedadActual: formData.get('enfermedadActual'),
            antecedentes: antecedentes,
            examenFisico: {
                fc: parseInt(formData.get('fc')) || 0,
                fr: parseInt(formData.get('fr')) || 0,
                ta: formData.get('ta') || '',
                temperatura: parseFloat(formData.get('temperatura')) || 0,
                peso: parseFloat(formData.get('peso')) || 0,
                talla: parseFloat(formData.get('talla')) || 0,
                glasgow: formData.get('glasgow') || '',
                aspectoGeneral: formData.get('aspectoGeneral') || '',
                cabezaCara: formData.get('cabezaCara') || '',
                cuello: formData.get('cuello') || '',
                torax: formData.get('torax') || '',
                abdomen: formData.get('abdomen') || '',
                genitourinario: formData.get('genitourinario') || '',
                pelvis: '',
                dorsoExtremidades: formData.get('dorsoExtremidades') || '',
                snc: formData.get('snc') || '',
                valor: ''
            },
            diagnosticos: diagnosticosAgregados.map(d => ({
                codigo: d.codigo,
                descripcion: d.descripcion,
                observacion: d.observacion
            })),
            evolucion: formData.get('evolucion') || '',
            plan: plan,
            medicoNombre: formData.get('medicoNombre'),
            medicoRegistro: formData.get('medicoRegistro'),
            medicoEspecialidad: formData.get('medicoEspecialidad') || ''
        };
        
        try {
            // Mostrar indicador de carga
            const saveBtn = event.target;
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Guardando...</span>';
            saveBtn.disabled = true;
            
            const response = await fetch('/api/HistoriaClinica/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(historiaClinica)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(`✅ Historia Clínica creada exitosamente!\nNúmero: ${result.data.noHistoria}\nEl PDF ha sido enviado al paciente por WhatsApp.`);
                cerrarHistoriaClinicaModal();
                form.reset();
                diagnosticosAgregados = [];
                actualizarGridDiagnosticos();
            } else {
                alert('❌ Error al crear la historia clínica: ' + result.message);
            }
            
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error al guardar la historia clínica. Por favor intente nuevamente.');
            event.target.innerHTML = originalText;
            event.target.disabled = false;
        }
    };

    // Cerrar modal al hacer clic en el overlay
    document.getElementById('hcModalOverlay').addEventListener('click', cerrarHistoriaClinicaModal);

    // Cerrar con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('historiaClinicaModal');
            if (modal.classList.contains('show')) {
                cerrarHistoriaClinicaModal();
            }
        }
    });

    console.log('✅ Modal de Historia Clínica mejorado cargado correctamente');
})();
