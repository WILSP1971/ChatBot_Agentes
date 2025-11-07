// historia-clinica-modal.js
// Modal interactivo mejorado para diligenciar historia clínica con diagnósticos en grid

// Esperar a que el DOM esté completamente cargado antes de ejecutar
document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // Variables globales para diagnósticos
    let diagnosticosAgregados = [];
    let diagnosticosDisponibles = [];
    let tiposIdentificacion = [];
    let departamentos = [];
    let datosListasCargados = false;

    // Cargar datos de listas desde el backend
    async function cargarDatosListas() {
        // Si ya se cargaron, no volver a cargar
        if (datosListasCargados) {
            return;
        }

        try {
            // Cargar tipos de identificación
            const respTiposId = await fetch('/api/HistoriaClinica/tipos-identificacion');
            if (respTiposId.ok) {
                tiposIdentificacion = await respTiposId.json();
            }

            // Cargar departamentos
            const respDepartamentos = await fetch('/api/HistoriaClinica/departamentos');
            if (respDepartamentos.ok) {
                departamentos = await respDepartamentos.json();
            }

            // Cargar diagnósticos para autocompletar
            const respDiagnosticos = await fetch('/api/HistoriaClinica/diagnosticos');
            if (respDiagnosticos.ok) {
                diagnosticosDisponibles = await respDiagnosticos.json();
            }

            // Popular los selects
            popularSelectTipoIdentificacion();
            popularSelectDepartamento();
            inicializarAutocompleteDiagnostico();

            datosListasCargados = true;
        } catch (error) {
            console.error('Error al cargar datos de listas:', error);
        }
    }

    function popularSelectTipoIdentificacion() {
        const select = document.getElementById('tipoIdentificacion');
        if (select && tiposIdentificacion.length > 0) {
            select.innerHTML = '<option value="">Seleccione...</option>' + 
                tiposIdentificacion.map(tipo => 
                    `<option value="${tipo.Codigo}">${tipo.Descripcion}</option>`
                ).join('');
        }
    }

    function popularSelectDepartamento() {
        const select = document.getElementById('departamento');
        if (select && departamentos.length > 0) {
            select.innerHTML = '<option value="">Seleccione...</option>' + 
                departamentos.map(dept => 
                    `<option value="${dept.Codigo}">${dept.Nombre}</option>`
                ).join('');
        }
    }

    function inicializarAutocompleteDiagnostico() {
        const input = document.getElementById('codigoDiagnostico');
        const datalist = document.getElementById('diagnosticosList');
        
        if (input && datalist && diagnosticosDisponibles.length > 0) {
            datalist.innerHTML = diagnosticosDisponibles.map(diag => 
                `<option value="${diag.Codigo}" data-descripcion="${diag.Descripcion}">${diag.Codigo} - ${diag.Descripcion}</option>`
            ).join('');

            // Remover listener anterior si existe
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);

            newInput.addEventListener('input', function() {
                const codigo = this.value;
                const diagnostico = diagnosticosDisponibles.find(d => d.Codigo === codigo);
                
                if (diagnostico) {
                    const descInput = document.getElementById('descripcionDiagnostico');
                    if (descInput) {
                        descInput.value = diagnostico.Descripcion;
                    }
                } else {
                    const descInput = document.getElementById('descripcionDiagnostico');
                    if (descInput) {
                        descInput.value = '';
                    }
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
                padding: 0;
                max-height: calc(92vh - 160px);
                overflow-y: auto;
                background: #f8fafc;
            }

            .hc-modal-body::-webkit-scrollbar {
                width: 10px;
            }

            .hc-modal-body::-webkit-scrollbar-track {
                background: #f1f1f1;
            }

            .hc-modal-body::-webkit-scrollbar-thumb {
                background: #128C7E;
                border-radius: 5px;
            }

            .hc-modal-body::-webkit-scrollbar-thumb:hover {
                background: #075E54;
            }
            
            .hc-tabs {
                display: flex;
                background: white;
                border-bottom: 3px solid #e5e7eb;
                padding: 0 2rem;
                position: sticky;
                top: 0;
                z-index: 100;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            
            .hc-tab {
                padding: 1rem 1.5rem;
                background: transparent;
                border: none;
                color: #64748b;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                border-bottom: 3px solid transparent;
                margin-bottom: -3px;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .hc-tab i {
                font-size: 1.2rem;
            }
            
            .hc-tab.active {
                color: #128C7E;
                border-bottom-color: #128C7E;
                background: linear-gradient(to bottom, rgba(18, 140, 126, 0.05), transparent);
            }
            
            .hc-tab:hover:not(.active) {
                color: #128C7E;
                background: rgba(18, 140, 126, 0.05);
            }
            
            .hc-tab-content {
                display: none;
                padding: 2rem;
                animation: slideDown 0.4s ease;
            }
            
            .hc-tab-content.active {
                display: block;
            }
            
            .hc-form-section {
                background: white;
                padding: 1.75rem;
                border-radius: 12px;
                margin-bottom: 1.5rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                border: 1px solid #e5e7eb;
                transition: all 0.3s ease;
            }

            .hc-form-section:hover {
                box-shadow: 0 4px 16px rgba(0,0,0,0.1);
                border-color: #128C7E;
            }
            
            .hc-form-section h6 {
                color: #128C7E;
                font-size: 1.1rem;
                font-weight: 700;
                margin-bottom: 1.25rem;
                padding-bottom: 0.75rem;
                border-bottom: 2px solid #e5e7eb;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .hc-form-section h6 i {
                font-size: 1.3rem;
            }
            
            .hc-form-row {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.25rem;
                margin-bottom: 1.25rem;
            }
            
            .hc-form-group {
                display: flex;
                flex-direction: column;
            }
            
            .hc-form-group label {
                color: #475569;
                font-weight: 600;
                margin-bottom: 0.5rem;
                font-size: 0.95rem;
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }

            .hc-form-group label.required::after {
                content: '*';
                color: #ef4444;
                margin-left: 0.25rem;
            }
            
            .hc-form-group input,
            .hc-form-group select,
            .hc-form-group textarea {
                padding: 0.75rem 1rem;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 0.95rem;
                transition: all 0.3s ease;
                background: white;
            }
            
            .hc-form-group input:focus,
            .hc-form-group select:focus,
            .hc-form-group textarea:focus {
                outline: none;
                border-color: #128C7E;
                box-shadow: 0 0 0 4px rgba(18, 140, 126, 0.1);
                transform: translateY(-2px);
            }
            
            .hc-form-group textarea {
                min-height: 120px;
                resize: vertical;
                font-family: inherit;
            }
            
            .hc-checkbox-group {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 1rem;
                margin-top: 0.75rem;
            }
            
            .hc-checkbox-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem;
                background: #f8fafc;
                border-radius: 8px;
                transition: all 0.2s ease;
                cursor: pointer;
            }

            .hc-checkbox-item:hover {
                background: rgba(18, 140, 126, 0.1);
            }
            
            .hc-checkbox-item input[type="checkbox"] {
                width: 20px;
                height: 20px;
                cursor: pointer;
                accent-color: #128C7E;
            }
            
            .hc-checkbox-item label {
                margin: 0;
                cursor: pointer;
                user-select: none;
                font-weight: 500;
                color: #475569;
            }
            
            .hc-modal-footer {
                background: white;
                padding: 1.5rem 2rem;
                border-top: 2px solid #e5e7eb;
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
                box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
            }
            
            .hc-btn {
                padding: 0.875rem 2rem;
                border: none;
                border-radius: 10px;
                font-weight: 600;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .hc-btn i {
                font-size: 1.1rem;
            }
            
            .hc-btn-primary {
                background: linear-gradient(135deg, #128C7E 0%, #075E54 100%);
                color: white;
            }
            
            .hc-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(18, 140, 126, 0.4);
            }

            .hc-btn-primary:active {
                transform: translateY(0);
            }
            
            .hc-btn-secondary {
                background: #f1f5f9;
                color: #475569;
            }
            
            .hc-btn-secondary:hover {
                background: #e2e8f0;
                transform: translateY(-2px);
            }

            /* Estilos para el grid de diagnósticos */
            .diagnosticos-grid {
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                margin-top: 1.5rem;
            }

            .diagnosticos-grid table {
                width: 100%;
                border-collapse: collapse;
            }

            .diagnosticos-grid thead {
                background: linear-gradient(135deg, #128C7E 0%, #075E54 100%);
                color: white;
            }

            .diagnosticos-grid th {
                padding: 1rem;
                text-align: left;
                font-weight: 600;
                font-size: 0.95rem;
            }

            .diagnosticos-grid td {
                padding: 1rem;
                border-bottom: 1px solid #e5e7eb;
                color: #475569;
            }

            .diagnosticos-grid tbody tr:hover {
                background: rgba(18, 140, 126, 0.05);
            }

            .diagnosticos-grid tbody tr:last-child td {
                border-bottom: none;
            }

            .add-diagnostico-btn {
                background: linear-gradient(135deg, #128C7E 0%, #075E54 100%);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-top: 1rem;
                box-shadow: 0 2px 8px rgba(18, 140, 126, 0.3);
            }

            .add-diagnostico-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(18, 140, 126, 0.4);
            }

            .delete-btn {
                background: #ef4444;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 0.35rem;
                font-size: 0.9rem;
            }

            .delete-btn:hover {
                background: #dc2626;
                transform: scale(1.05);
            }

            .empty-diagnosticos {
                text-align: center;
                padding: 3rem;
                color: #94a3b8;
            }

            .empty-diagnosticos i {
                font-size: 4rem;
                margin-bottom: 1rem;
                opacity: 0.5;
            }

            /* Responsive */
            @media (max-width: 768px) {
                #historiaClinicaModal {
                    width: 98%;
                    max-height: 95vh;
                }

                .hc-tabs {
                    overflow-x: auto;
                    padding: 0 1rem;
                }

                .hc-tab {
                    padding: 0.875rem 1rem;
                    font-size: 0.9rem;
                    white-space: nowrap;
                }

                .hc-form-row {
                    grid-template-columns: 1fr;
                }

                .hc-checkbox-group {
                    grid-template-columns: 1fr;
                }

                .hc-modal-footer {
                    flex-direction: column;
                }

                .hc-btn {
                    width: 100%;
                    justify-content: center;
                }
            }

            @media (max-width: 480px) {
                .hc-modal-header {
                    padding: 1rem;
                }

                .hc-modal-header h5 {
                    font-size: 1.1rem;
                }

                .hc-modal-body,
                .hc-tab-content {
                    padding: 1rem;
                }

                .hc-form-section {
                    padding: 1rem;
                }
            }
        </style>
    `;

    // Insertar estilos en el documento
    document.head.insertAdjacentHTML('beforeend', styles);

    // Crear el HTML del modal
    const modalHTML = `
        <div id="hcModalOverlay" class="hc-modal-overlay"></div>
        <div id="historiaClinicaModal">
            <div class="hc-modal-header">
                <h5>
                    <i class="fas fa-file-medical"></i>
                    <span>Nueva Historia Clínica</span>
                </h5>
                <button type="button" class="hc-close-btn" onclick="cerrarHistoriaClinicaModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="hc-modal-body">
                <div class="hc-tabs">
                    <button class="hc-tab active" data-tab="identificacion">
                        <i class="fas fa-id-card"></i>
                        <span>Identificación</span>
                    </button>
                    <button class="hc-tab" data-tab="motivo">
                        <i class="fas fa-notes-medical"></i>
                        <span>Motivo</span>
                    </button>
                    <button class="hc-tab" data-tab="antecedentes">
                        <i class="fas fa-history"></i>
                        <span>Antecedentes</span>
                    </button>
                    <button class="hc-tab" data-tab="examen">
                        <i class="fas fa-stethoscope"></i>
                        <span>Examen Físico</span>
                    </button>
                    <button class="hc-tab" data-tab="diagnostico">
                        <i class="fas fa-diagnosis"></i>
                        <span>Diagnóstico</span>
                    </button>
                    <button class="hc-tab" data-tab="plan">
                        <i class="fas fa-clipboard-list"></i>
                        <span>Plan</span>
                    </button>
                    <button class="hc-tab" data-tab="medico">
                        <i class="fas fa-user-md"></i>
                        <span>Médico</span>
                    </button>
                </div>

                <form id="historiaClinicaForm">
                    <!-- Tab 1: Identificación del Paciente -->
                    <div class="hc-tab-content active" data-content="identificacion">
                        <div class="hc-form-section">
                            <h6><i class="fas fa-user"></i> Datos Personales</h6>
                            <div class="hc-form-row">
                                <div class="hc-form-group">
                                    <label class="required">Tipo Identificación</label>
                                    <select name="tipoIdentificacion" id="tipoIdentificacion" required>
                                        <option value="">Seleccione...</option>
                                    </select>
                                </div>
                                <div class="hc-form-group">
                                    <label class="required">No. Identificación</label>
                                    <input type="text" name="noIdentificacion" required>
                                </div>
                                <div class="hc-form-group">
                                    <label class="required">Nombre Completo</label>
                                    <input type="text" name="nombrePaciente" required>
                                </div>
                            </div>
                            <div class="hc-form-row">
                                <div class="hc-form-group">
                                    <label class="required">Edad</label>
                                    <input type="number" name="edad" min="0" max="150" required>
                                </div>
                                <div class="hc-form-group">
                                    <label class="required">Sexo</label>
                                    <select name="sexo" required>
                                        <option value="">Seleccione...</option>
                                        <option value="M">Masculino</option>
                                        <option value="F">Femenino</option>
                                    </select>
                                </div>
                                <div class="hc-form-group">
                                    <label>Estado Civil</label>
                                    <select name="estadoCivil">
                                        <option value="">Seleccione...</option>
                                        <option value="Soltero">Soltero(a)</option>
                                        <option value="Casado">Casado(a)</option>
                                        <option value="Union Libre">Unión Libre</option>
                                        <option value="Viudo">Viudo(a)</option>
                                        <option value="Divorciado">Divorciado(a)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="hc-form-section">
                            <h6><i class="fas fa-map-marker-alt"></i> Información de Contacto</h6>
                            <div class="hc-form-row">
                                <div class="hc-form-group">
                                    <label>Dirección</label>
                                    <input type="text" name="direccion">
                                </div>
                                <div class="hc-form-group">
                                    <label>Departamento</label>
                                    <select name="departamento" id="departamento">
                                        <option value="">Seleccione...</option>
                                    </select>
                                </div>
                                <div class="hc-form-group">
                                    <label>Ciudad</label>
                                    <input type="text" name="ciudad">
                                </div>
                            </div>
                            <div class="hc-form-row">
                                <div class="hc-form-group">
                                    <label class="required">Teléfono</label>
                                    <input type="tel" name="telefono" required>
                                </div>
                                <div class="hc-form-group">
                                    <label>Ocupación</label>
                                    <input type="text" name="ocupacion">
                                </div>
                                <div class="hc-form-group">
                                    <label>Fecha de Nacimiento</label>
                                    <input type="date" name="fechaNacimiento">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tab 2: Motivo de Consulta -->
                    <div class="hc-tab-content" data-content="motivo">
                        <div class="hc-form-section">
                            <h6><i class="fas fa-comment-medical"></i> Motivo de Consulta</h6>
                            <div class="hc-form-group">
                                <label class="required">Motivo de Consulta</label>
                                <textarea name="motivoConsulta" required placeholder="Describa el motivo principal de la consulta..."></textarea>
                            </div>
                        </div>

                        <div class="hc-form-section">
                            <h6><i class="fas fa-heartbeat"></i> Enfermedad Actual</h6>
                            <div class="hc-form-group">
                                <label class="required">Enfermedad Actual</label>
                                <textarea name="enfermedadActual" required placeholder="Describa la enfermedad actual del paciente..."></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Tab 3: Antecedentes -->
                    <div class="hc-tab-content" data-content="antecedentes">
                        <div class="hc-form-section">
                            <h6><i class="fas fa-history"></i> Antecedentes Médicos</h6>
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
                                    <input type="checkbox" id="ant_alergias" name="antecedentes" value="ALERGIAS">
                                    <label for="ant_alergias">Alergias</label>
                                </div>
                                <div class="hc-checkbox-item">
                                    <input type="checkbox" id="ant_cardiacos" name="antecedentes" value="CARDIACOS">
                                    <label for="ant_cardiacos">Cardiacos</label>
                                </div>
                                <div class="hc-checkbox-item">
                                    <input type="checkbox" id="ant_renales" name="antecedentes" value="RENALES">
                                    <label for="ant_renales">Renales</label>
                                </div>
                            </div>
                            <div class="hc-form-group" style="margin-top: 1.5rem;">
                                <label>Otros Antecedentes</label>
                                <textarea name="otrosAntecedentes" placeholder="Especifique otros antecedentes relevantes..."></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Tab 4: Examen Físico -->
                    <div class="hc-tab-content" data-content="examen">
                        <div class="hc-form-section">
                            <h6><i class="fas fa-heartbeat"></i> Signos Vitales</h6>
                            <div class="hc-form-row">
                                <div class="hc-form-group">
                                    <label>FC (lpm)</label>
                                    <input type="number" name="fc" placeholder="Ej: 75">
                                </div>
                                <div class="hc-form-group">
                                    <label>FR (rpm)</label>
                                    <input type="number" name="fr" placeholder="Ej: 18">
                                </div>
                                <div class="hc-form-group">
                                    <label>TA (mmHg)</label>
                                    <input type="text" name="ta" placeholder="Ej: 120/80">
                                </div>
                            </div>
                            <div class="hc-form-row">
                                <div class="hc-form-group">
                                    <label>Temperatura (°C)</label>
                                    <input type="number" name="temperatura" step="0.1" placeholder="Ej: 36.5">
                                </div>
                                <div class="hc-form-group">
                                    <label>Peso (kg)</label>
                                    <input type="number" name="peso" step="0.1" placeholder="Ej: 70.5">
                                </div>
                                <div class="hc-form-group">
                                    <label>Talla (cm)</label>
                                    <input type="number" name="talla" step="0.1" placeholder="Ej: 165">
                                </div>
                            </div>
                            <div class="hc-form-row">
                                <div class="hc-form-group">
                                    <label>Glasgow</label>
                                    <input type="text" name="glasgow" placeholder="Ej: 15/15">
                                </div>
                            </div>
                        </div>

                        <div class="hc-form-section">
                            <h6><i class="fas fa-stethoscope"></i> Examen por Sistemas</h6>
                            <div class="hc-form-group">
                                <label>Aspecto General</label>
                                <textarea name="aspectoGeneral" placeholder="Describa el aspecto general del paciente..."></textarea>
                            </div>
                            <div class="hc-form-group">
                                <label>Cabeza y Cara</label>
                                <textarea name="cabezaCara" placeholder="Describa hallazgos en cabeza y cara..."></textarea>
                            </div>
                            <div class="hc-form-group">
                                <label>Cuello</label>
                                <textarea name="cuello" placeholder="Describa hallazgos en cuello..."></textarea>
                            </div>
                            <div class="hc-form-group">
                                <label>Tórax</label>
                                <textarea name="torax" placeholder="Describa hallazgos en tórax..."></textarea>
                            </div>
                            <div class="hc-form-group">
                                <label>Abdomen</label>
                                <textarea name="abdomen" placeholder="Describa hallazgos en abdomen..."></textarea>
                            </div>
                            <div class="hc-form-group">
                                <label>Genitourinario</label>
                                <textarea name="genitourinario" placeholder="Describa hallazgos genitourinarios..."></textarea>
                            </div>
                            <div class="hc-form-group">
                                <label>Dorso y Extremidades</label>
                                <textarea name="dorsoExtremidades" placeholder="Describa hallazgos en dorso y extremidades..."></textarea>
                            </div>
                            <div class="hc-form-group">
                                <label>Sistema Nervioso Central</label>
                                <textarea name="snc" placeholder="Describa hallazgos neurológicos..."></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Tab 5: Diagnóstico -->
                    <div class="hc-tab-content" data-content="diagnostico">
                        <div class="hc-form-section">
                            <h6><i class="fas fa-diagnosis"></i> Agregar Diagnóstico CIE-10</h6>
                            <div class="hc-form-row">
                                <div class="hc-form-group">
                                    <label>Código CIE-10</label>
                                    <input type="text" id="codigoDiagnostico" list="diagnosticosList" placeholder="Busque el código...">
                                    <datalist id="diagnosticosList"></datalist>
                                </div>
                                <div class="hc-form-group">
                                    <label>Descripción</label>
                                    <input type="text" id="descripcionDiagnostico" readonly placeholder="Se llena automáticamente">
                                </div>
                            </div>
                            <div class="hc-form-group">
                                <label>Observación</label>
                                <input type="text" id="observacionDiagnostico" placeholder="Observación adicional (opcional)">
                            </div>
                            <button type="button" class="add-diagnostico-btn" onclick="agregarDiagnostico()">
                                <i class="fas fa-plus-circle"></i>
                                <span>Agregar Diagnóstico</span>
                            </button>
                        </div>

                        <div class="hc-form-section">
                            <h6><i class="fas fa-list"></i> Diagnósticos Agregados</h6>
                            <div class="diagnosticos-grid">
                                <table>
                                    <thead>
                                        <tr>
                                            <th style="width: 120px;">Código</th>
                                            <th>Descripción</th>
                                            <th>Observación</th>
                                            <th style="width: 120px;">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody id="diagnosticosTableBody">
                                        <tr>
                                            <td colspan="4" class="empty-diagnosticos">
                                                <i class="fas fa-inbox"></i>
                                                <p>No hay diagnósticos agregados</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Tab 6: Plan de Tratamiento -->
                    <div class="hc-tab-content" data-content="plan">
                        <div class="hc-form-section">
                            <h6><i class="fas fa-pills"></i> Evolución</h6>
                            <div class="hc-form-group">
                                <label>Evolución</label>
                                <textarea name="evolucion" placeholder="Describa la evolución del paciente..."></textarea>
                            </div>
                        </div>

                        <div class="hc-form-section">
                            <h6><i class="fas fa-clipboard-list"></i> Plan de Tratamiento</h6>
                            <div class="hc-form-group">
                                <label class="required">Plan (uno por línea)</label>
                                <textarea name="plan" required placeholder="Escriba cada ítem del plan en una línea diferente...&#10;Ej:&#10;1. Acetaminofén 500mg cada 8 horas por 3 días&#10;2. Control en 48 horas&#10;3. Reposo relativo"></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Tab 7: Datos del Médico -->
                    <div class="hc-tab-content" data-content="medico">
                        <div class="hc-form-section">
                            <h6><i class="fas fa-user-md"></i> Información del Médico</h6>
                            <div class="hc-form-row">
                                <div class="hc-form-group">
                                    <label class="required">Nombre del Médico</label>
                                    <input type="text" name="medicoNombre" required>
                                </div>
                                <div class="hc-form-group">
                                    <label class="required">Registro Médico</label>
                                    <input type="text" name="medicoRegistro" required>
                                </div>
                                <div class="hc-form-group">
                                    <label>Especialidad</label>
                                    <input type="text" name="medicoEspecialidad">
                                </div>
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

    // Insertar modal en el documento
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Configurar navegación de tabs
    const tabs = document.querySelectorAll('.hc-tab');
    const tabContents = document.querySelectorAll('.hc-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            
            this.classList.add('active');
            document.querySelector(`[data-content="${targetTab}"]`).classList.add('active');
        });
    });

    // Función global para agregar diagnóstico
    window.agregarDiagnostico = function() {
        const codigo = document.getElementById('codigoDiagnostico').value.trim();
        const descripcion = document.getElementById('descripcionDiagnostico').value.trim();
        const observacion = document.getElementById('observacionDiagnostico').value.trim();

        if (!codigo || !descripcion) {
            alert('Por favor seleccione un diagnóstico válido');
            return;
        }

        // Verificar que no esté duplicado
        if (diagnosticosAgregados.some(d => d.codigo === codigo)) {
            alert('Este diagnóstico ya fue agregado');
            return;
        }

        diagnosticosAgregados.push({
            codigo: codigo,
            descripcion: descripcion,
            observacion: observacion
        });

        // Limpiar campos
        document.getElementById('codigoDiagnostico').value = '';
        document.getElementById('descripcionDiagnostico').value = '';
        document.getElementById('observacionDiagnostico').value = '';

        actualizarGridDiagnosticos();
    };

    function actualizarGridDiagnosticos() {
        const tbody = document.getElementById('diagnosticosTableBody');
        
        if (diagnosticosAgregados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-diagnosticos">
                        <i class="fas fa-inbox"></i>
                        <p>No hay diagnósticos agregados</p>
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
        
        if (!modal || !overlay) {
            console.error('Modal elements not found');
            return;
        }
        
        // Cargar datos de listas al abrir el modal por primera vez
        cargarDatosListas();
        
        // Guardar el conversationId en el formulario
        const form = document.getElementById('historiaClinicaForm');
        if (form) {
            form.dataset.conversationId = conversationId;
        }
        
        // Pre-llenar datos si están disponibles
        const conversation = window.currentConversation;
        if (conversation) {
            const telInput = document.querySelector('[name="telefono"]');
            const nombreInput = document.querySelector('[name="nombrePaciente"]');
            if (telInput) telInput.value = conversation.phoneNumber || '';
            if (nombreInput) nombreInput.value = conversation.customerName || '';
        }
        
        modal.classList.add('show');
        overlay.classList.add('show');
    };

    // Función global para cerrar el modal
    window.cerrarHistoriaClinicaModal = function() {
        const modal = document.getElementById('historiaClinicaModal');
        const overlay = document.getElementById('hcModalOverlay');
        
        if (!modal || !overlay) return;
        
        modal.classList.remove('show');
        overlay.classList.remove('show');

        // Limpiar diagnósticos agregados
        diagnosticosAgregados = [];
        actualizarGridDiagnosticos();
    };

    // Función global para guardar la historia clínica
    window.guardarHistoriaClinica = async function() {
        const form = document.getElementById('historiaClinicaForm');
        if (!form) return;
        
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
            const diagTab = document.querySelector('.hc-tab[data-tab="diagnostico"]');
            if (diagTab) diagTab.click();
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
                dorsoExtremidades: formData.get('dorsoExtremidades') || '',
                snc: formData.get('snc') || ''
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
            if (event && event.target) {
                event.target.innerHTML = originalText;
                event.target.disabled = false;
            }
        }
    };

    // Cerrar modal al hacer clic en el overlay
    const overlay = document.getElementById('hcModalOverlay');
    if (overlay) {
        overlay.addEventListener('click', cerrarHistoriaClinicaModal);
    }

    // Cerrar con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('historiaClinicaModal');
            if (modal && modal.classList.contains('show')) {
                cerrarHistoriaClinicaModal();
            }
        }
    });

    console.log('✅ Modal de Historia Clínica cargado correctamente');
});
