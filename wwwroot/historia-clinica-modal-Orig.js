// historia-clinica-modal.js
// Modal interactivo mejorado para diligenciar historia clínica

(function() {
    'use strict';

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
                max-width: 1000px;
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
                color: #075E54;
            }

            .hc-form-group label .required {
                color: #ef4444;
                font-weight: 700;
            }
            
            .hc-form-group input,
            .hc-form-group select,
            .hc-form-group textarea {
                width: 100%;
                padding: 0.75rem 1rem;
                border: 2px solid #e5e7eb;
                border-radius: 10px;
                font-size: 0.95rem;
                transition: all 0.3s;
                background: white;
            }

            .hc-form-group input:focus,
            .hc-form-group select:focus,
            .hc-form-group textarea:focus {
                outline: none;
                border-color: #25D366;
                box-shadow: 0 0 0 4px rgba(37, 211, 102, 0.1);
                background: #FAFFFE;
            }

            .hc-form-group input:hover,
            .hc-form-group select:hover,
            .hc-form-group textarea:hover {
                border-color: #128C7E;
            }
            
            .hc-form-group textarea {
                min-height: 100px;
                resize: vertical;
                font-family: inherit;
            }
            
            .hc-form-row {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
            }
            
            .hc-modal-footer {
                padding: 1.5rem 2rem;
                background: linear-gradient(to top, #f9fafb, white);
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
                border-top: 2px solid #e5e7eb;
                box-shadow: 0 -4px 12px rgba(0,0,0,0.05);
            }
            
            .hc-btn {
                padding: 0.75rem 2rem;
                border-radius: 10px;
                font-weight: 700;
                cursor: pointer;
                border: none;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 1rem;
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
                transition: width 0.6s, height 0.6s;
            }

            .hc-btn:hover::before {
                width: 300px;
                height: 300px;
            }

            .hc-btn span {
                position: relative;
                z-index: 1;
            }

            .hc-btn i {
                font-size: 1.2rem;
                position: relative;
                z-index: 1;
            }
            
            .hc-btn-primary {
                background: linear-gradient(135deg, #075E54 0%, #128C7E 100%);
                color: white;
                box-shadow: 0 4px 12px rgba(7, 94, 84, 0.3);
            }
            
            .hc-btn-primary:hover {
                transform: translateY(-2px) scale(1.02);
                box-shadow: 0 8px 20px rgba(7, 94, 84, 0.4);
            }

            .hc-btn-primary:active {
                transform: translateY(0) scale(0.98);
            }
            
            .hc-btn-secondary {
                background: linear-gradient(135deg, #e5e7eb, #d1d5db);
                color: #1F2937;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .hc-btn-secondary:hover {
                background: linear-gradient(135deg, #d1d5db, #9ca3af);
                transform: translateY(-2px) scale(1.02);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
            }
            
            .hc-close-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                font-size: 1.8rem;
                cursor: pointer;
                padding: 0.5rem;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s;
                position: relative;
                z-index: 1;
            }

            .hc-close-btn:hover {
                background: rgba(239, 68, 68, 0.9);
                transform: rotate(90deg) scale(1.1);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
            
            .hc-antecedentes-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
            }
            
            .hc-checkbox-group {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem;
                border-radius: 10px;
                transition: all 0.3s;
                cursor: pointer;
                border: 2px solid transparent;
            }

            .hc-checkbox-group:hover {
                background: rgba(37, 211, 102, 0.05);
                border-color: #25D366;
            }
            
            .hc-checkbox-group input[type="checkbox"] {
                width: 20px;
                height: 20px;
                cursor: pointer;
                accent-color: #075E54;
            }

            .hc-checkbox-group label {
                margin: 0;
                cursor: pointer;
                font-weight: 500;
            }

            .hc-section-header {
                font-size: 1.1rem;
                font-weight: 700;
                color: #075E54;
                margin: 2rem 0 1rem;
                padding-bottom: 0.75rem;
                border-bottom: 3px solid #E8F5E9;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .hc-section-header i {
                font-size: 1.3rem;
            }

            .hc-input-icon {
                position: relative;
            }

            .hc-input-icon i {
                position: absolute;
                left: 1rem;
                top: 50%;
                transform: translateY(-50%);
                color: #6B7280;
            }

            .hc-input-icon input {
                padding-left: 3rem;
            }

            @media (max-width: 768px) {
                #historiaClinicaModal {
                    width: 98%;
                    max-height: 95vh;
                }

                .hc-modal-body {
                    padding: 1rem;
                }

                .hc-form-row {
                    grid-template-columns: 1fr;
                }

                .hc-tabs {
                    overflow-x: auto;
                    flex-wrap: nowrap;
                    -webkit-overflow-scrolling: touch;
                }

                .hc-tab {
                    flex-shrink: 0;
                }

                .hc-modal-footer {
                    flex-direction: column;
                }

                .hc-btn {
                    width: 100%;
                    justify-content: center;
                }
            }
        </style>
    `;

    // Agregar el HTML mejorado del modal
    const modalHTML = `
        <div class="hc-modal-overlay" id="hcModalOverlay"></div>
        <div id="historiaClinicaModal">
            <div class="hc-modal-header">
                <h5><i class="fas fa-file-medical"></i> Historia Clínica del Paciente</h5>
                <button class="hc-close-btn" onclick="cerrarHistoriaClinicaModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="hc-modal-body">
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
                        <i class="fas fa-stethoscope"></i>
                        <span>Examen Físico</span>
                    </div>
                    <div class="hc-tab" data-tab="diagnostico">
                        <i class="fas fa-clipboard-check"></i>
                        <span>Diagnóstico y Plan</span>
                    </div>
                </div>
                
                <form id="historiaClinicaForm">
                    <!-- Tab 1: Datos del Paciente -->
                    <div class="hc-tab-content active" data-tab="paciente">
                        <div class="hc-section-header">
                            <i class="fas fa-id-card"></i>
                            Información Personal
                        </div>
                        
                        <div class="hc-form-row">
                            <div class="hc-form-group">
                                <label><i class="fas fa-fingerprint"></i> No. Identificación <span class="required">*</span></label>
                                <input type="text" name="noIdentificacion" required placeholder="Ej: 1234567890">
                            </div>
                            <div class="hc-form-group">
                                <label><i class="fas fa-user"></i> Nombre Completo <span class="required">*</span></label>
                                <input type="text" name="nombrePaciente" required placeholder="Nombre completo del paciente">
                            </div>
                            <div class="hc-form-group">
                                <label><i class="fas fa-calendar"></i> Edad <span class="required">*</span></label>
                                <input type="number" name="edad" required min="0" max="150" placeholder="Edad">
                            </div>
                        </div>
                        
                        <div class="hc-form-row">
                            <div class="hc-form-group">
                                <label><i class="fas fa-venus-mars"></i> Sexo <span class="required">*</span></label>
                                <select name="sexo" required>
                                    <option value="">Seleccione...</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                    <option value="O">Otro</option>
                                </select>
                            </div>
                            <div class="hc-form-group">
                                <label><i class="fas fa-birthday-cake"></i> Fecha de Nacimiento</label>
                                <input type="date" name="fechaNacimiento">
                            </div>
                            <div class="hc-form-group">
                                <label><i class="fas fa-heart"></i> Estado Civil</label>
                                <select name="estadoCivil">
                                    <option value="">Seleccione...</option>
                                    <option value="Soltero">Soltero(a)</option>
                                    <option value="Casado">Casado(a)</option>
                                    <option value="Viudo">Viudo(a)</option>
                                    <option value="Divorciado">Divorciado(a)</option>
                                    <option value="Union Libre">Unión Libre</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="hc-section-header">
                            <i class="fas fa-map-marker-alt"></i>
                            Información de Contacto
                        </div>
                        
                        <div class="hc-form-row">
                            <div class="hc-form-group">
                                <label><i class="fas fa-phone"></i> Teléfono <span class="required">*</span></label>
                                <input type="tel" name="telefono" required placeholder="Número de teléfono">
                            </div>
                            <div class="hc-form-group">
                                <label><i class="fas fa-home"></i> Dirección</label>
                                <input type="text" name="direccion" placeholder="Dirección completa">
                            </div>
                            <div class="hc-form-group">
                                <label><i class="fas fa-city"></i> Ciudad</label>
                                <input type="text" name="ciudad" placeholder="Ciudad">
                            </div>
                        </div>
                        
                        <div class="hc-form-row">
                            <div class="hc-form-group">
                                <label><i class="fas fa-briefcase"></i> Ocupación</label>
                                <input type="text" name="ocupacion" placeholder="Ocupación">
                            </div>
                        </div>
                        
                        <div class="hc-section-header">
                            <i class="fas fa-notes-medical"></i>
                            Motivo de Consulta
                        </div>
                        
                        <div class="hc-form-group">
                            <label><i class="fas fa-comment-medical"></i> Motivo de Consulta <span class="required">*</span></label>
                            <textarea name="motivoConsulta" rows="3" required placeholder="Describa el motivo de la consulta..."></textarea>
                        </div>
                        
                        <div class="hc-form-group">
                            <label><i class="fas fa-clipboard-list"></i> Enfermedad Actual <span class="required">*</span></label>
                            <textarea name="enfermedadActual" rows="4" required placeholder="Describa la enfermedad actual..."></textarea>
                        </div>
                    </div>
                    
                    <!-- Tab 2: Antecedentes -->
                    <div class="hc-tab-content" data-tab="antecedentes">
                        <div class="hc-section-header">
                            <i class="fas fa-history"></i>
                            Antecedentes Médicos
                        </div>
                        
                        <div class="hc-antecedentes-grid">
                            <div class="hc-checkbox-group">
                                <input type="checkbox" id="hipertension" name="antecedentes" value="HIPERTENSION">
                                <label for="hipertension">Hipertensión</label>
                            </div>
                            <div class="hc-checkbox-group">
                                <input type="checkbox" id="diabetes" name="antecedentes" value="DIABETES">
                                <label for="diabetes">Diabetes</label>
                            </div>
                            <div class="hc-checkbox-group">
                                <input type="checkbox" id="asma" name="antecedentes" value="ASMA">
                                <label for="asma">Asma</label>
                            </div>
                            <div class="hc-checkbox-group">
                                <input type="checkbox" id="cancer" name="antecedentes" value="CANCER">
                                <label for="cancer">Cáncer</label>
                            </div>
                            <div class="hc-checkbox-group">
                                <input type="checkbox" id="cardiopatia" name="antecedentes" value="CARDIOPATIA">
                                <label for="cardiopatia">Cardiopatía</label>
                            </div>
                            <div class="hc-checkbox-group">
                                <input type="checkbox" id="epilepsia" name="antecedentes" value="EPILEPSIA">
                                <label for="epilepsia">Epilepsia</label>
                            </div>
                            <div class="hc-checkbox-group">
                                <input type="checkbox" id="tuberculosis" name="antecedentes" value="TUBERCULOSIS">
                                <label for="tuberculosis">Tuberculosis</label>
                            </div>
                            <div class="hc-checkbox-group">
                                <input type="checkbox" id="hepatitis" name="antecedentes" value="HEPATITIS">
                                <label for="hepatitis">Hepatitis</label>
                            </div>
                            <div class="hc-checkbox-group">
                                <input type="checkbox" id="cirugias" name="antecedentes" value="CIRUGIAS">
                                <label for="cirugias">Cirugías Previas</label>
                            </div>
                            <div class="hc-checkbox-group">
                                <input type="checkbox" id="alergias" name="antecedentes" value="ALERGIAS">
                                <label for="alergias">Alergias</label>
                            </div>
                        </div>
                        
                        <div class="hc-form-group" style="margin-top: 2rem;">
                            <label><i class="fas fa-plus-circle"></i> Otros Antecedentes</label>
                            <textarea name="otrosAntecedentes" rows="4" placeholder="Describa otros antecedentes relevantes..."></textarea>
                        </div>
                    </div>
                    
                    <!-- Tab 3: Examen Físico -->
                    <div class="hc-tab-content" data-tab="examen">
                        <div class="hc-section-header">
                            <i class="fas fa-heartbeat"></i>
                            Signos Vitales
                        </div>
                        
                        <div class="hc-form-row">
                            <div class="hc-form-group">
                                <label><i class="fas fa-heart"></i> FC (Frec. Cardíaca)</label>
                                <input type="number" name="fc" placeholder="lpm">
                            </div>
                            <div class="hc-form-group">
                                <label><i class="fas fa-lungs"></i> FR (Frec. Respiratoria)</label>
                                <input type="number" name="fr" placeholder="rpm">
                            </div>
                            <div class="hc-form-group">
                                <label><i class="fas fa-tachometer-alt"></i> TA (Tensión Arterial)</label>
                                <input type="text" name="ta" placeholder="120/80 mmHg">
                            </div>
                        </div>
                        
                        <div class="hc-form-row">
                            <div class="hc-form-group">
                                <label><i class="fas fa-thermometer-half"></i> Temperatura</label>
                                <input type="number" step="0.1" name="temperatura" placeholder="°C">
                            </div>
                            <div class="hc-form-group">
                                <label><i class="fas fa-weight"></i> Peso</label>
                                <input type="number" step="0.1" name="peso" placeholder="kg">
                            </div>
                            <div class="hc-form-group">
                                <label><i class="fas fa-ruler-vertical"></i> Talla</label>
                                <input type="number" step="0.01" name="talla" placeholder="cm">
                            </div>
                        </div>
                        
                        <div class="hc-form-group">
                            <label><i class="fas fa-brain"></i> Glasgow</label>
                            <input type="text" name="glasgow" placeholder="Escala de Glasgow">
                        </div>
                        
                        <div class="hc-section-header">
                            <i class="fas fa-user-md"></i>
                            Examen por Sistemas
                        </div>
                        
                        <div class="hc-form-group">
                            <label><i class="fas fa-user-check"></i> Aspecto General</label>
                            <textarea name="aspectoGeneral" rows="3" placeholder="Describa el aspecto general..."></textarea>
                        </div>
                        
                        <div class="hc-form-row">
                            <div class="hc-form-group">
                                <label><i class="fas fa-head-side-virus"></i> Cabeza y Cara</label>
                                <textarea name="cabezaCara" rows="3" placeholder="Hallazgos..."></textarea>
                            </div>
                            <div class="hc-form-group">
                                <label><i class="fas fa-neck"></i> Cuello</label>
                                <textarea name="cuello" rows="3" placeholder="Hallazgos..."></textarea>
                            </div>
                        </div>
                        
                        <div class="hc-form-row">
                            <div class="hc-form-group">
                                <label><i class="fas fa-lungs"></i> Tórax</label>
                                <textarea name="torax" rows="3" placeholder="Hallazgos..."></textarea>
                            </div>
                            <div class="hc-form-group">
                                <label><i class="fas fa-stomach"></i> Abdomen</label>
                                <textarea name="abdomen" rows="3" placeholder="Hallazgos..."></textarea>
                            </div>
                        </div>
                        
                        <div class="hc-form-row">
                            <div class="hc-form-group">
                                <label><i class="fas fa-venus"></i> Genitourinario</label>
                                <textarea name="genitourinario" rows="3" placeholder="Hallazgos..."></textarea>
                            </div>
                            <div class="hc-form-group">
                                <label><i class="fas fa-walking"></i> Dorso y Extremidades</label>
                                <textarea name="dorsoExtremidades" rows="3" placeholder="Hallazgos..."></textarea>
                            </div>
                        </div>
                        
                        <div class="hc-form-group">
                            <label><i class="fas fa-brain"></i> Sistema Nervioso Central</label>
                            <textarea name="snc" rows="3" placeholder="Hallazgos neurológicos..."></textarea>
                        </div>
                    </div>
                    
                    <!-- Tab 4: Diagnóstico y Plan -->
                    <div class="hc-tab-content" data-tab="diagnostico">
                        <div class="hc-section-header">
                            <i class="fas fa-diagnoses"></i>
                            Diagnóstico
                        </div>
                        
                        <div class="hc-form-group">
                            <label><i class="fas fa-list-ol"></i> Diagnósticos (uno por línea) <span class="required">*</span></label>
                            <textarea name="diagnosticos" rows="5" required placeholder="Ingrese cada diagnóstico en una línea separada&#10;Ejemplo:&#10;1. Hipertensión arterial esencial (I10)&#10;2. Diabetes mellitus tipo 2 (E11)"></textarea>
                        </div>
                        
                        <div class="hc-form-group">
                            <label><i class="fas fa-notes-medical"></i> Evolución y Observaciones</label>
                            <textarea name="evolucion" rows="4" placeholder="Describa la evolución del paciente..."></textarea>
                        </div>
                        
                        <div class="hc-form-group">
                            <label><i class="fas fa-tasks"></i> Plan de Tratamiento (uno por línea)</label>
                            <textarea name="plan" rows="5" placeholder="Ingrese cada ítem del plan en una línea separada&#10;Ejemplo:&#10;1. Control de signos vitales cada 8 horas&#10;2. Dieta hiposódica&#10;3. Losartán 50mg VO cada 12 horas"></textarea>
                        </div>
                        
                        <div class="hc-section-header">
                            <i class="fas fa-user-md"></i>
                            Datos del Médico Tratante
                        </div>
                        
                        <div class="hc-form-row">
                            <div class="hc-form-group">
                                <label><i class="fas fa-user-md"></i> Nombre del Médico <span class="required">*</span></label>
                                <input type="text" name="medicoNombre" required placeholder="Nombre completo del médico">
                            </div>
                            <div class="hc-form-group">
                                <label><i class="fas fa-id-card-alt"></i> Registro Médico <span class="required">*</span></label>
                                <input type="text" name="medicoRegistro" required placeholder="Número de registro">
                            </div>
                            <div class="hc-form-group">
                                <label><i class="fas fa-certificate"></i> Especialidad</label>
                                <input type="text" name="medicoEspecialidad" placeholder="Especialidad médica">
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
        
        if (!isValid) {
            // Mostrar toast de error
            if (typeof showToast === 'function') {
                showToast('Por favor complete todos los campos obligatorios (marcados con *)', 'error');
            } else {
                alert('Por favor complete todos los campos obligatorios (marcados con *)');
            }
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
        
        // Construir diagnósticos (separados por línea)
        const diagnosticos = formData.get('diagnosticos')
            .split('\n')
            .filter(d => d.trim())
            .map(d => d.trim());
        
        // Construir plan (separados por línea)
        const plan = formData.get('plan')
            .split('\n')
            .filter(p => p.trim())
            .map(p => p.trim());
        
        const historiaClinica = {
            noIdentificacion: formData.get('noIdentificacion'),
            nombrePaciente: formData.get('nombrePaciente'),
            edad: parseInt(formData.get('edad')),
            sexo: formData.get('sexo'),
            direccion: formData.get('direccion') || '',
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
            diagnosticos: diagnosticos,
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
                if (typeof showToast === 'function') {
                    showToast(`Historia Clínica creada exitosamente! Número: ${result.data.noHistoria}`, 'success');
                } else {
                    alert(`✅ Historia Clínica creada exitosamente!\nNúmero: ${result.data.noHistoria}\nEl PDF ha sido enviado al paciente por WhatsApp.`);
                }
                cerrarHistoriaClinicaModal();
                form.reset();
            } else {
                if (typeof showToast === 'function') {
                    showToast('Error al crear la historia clínica: ' + result.message, 'error');
                } else {
                    alert('❌ Error al crear la historia clínica: ' + result.message);
                }
            }
            
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        } catch (error) {
            console.error('Error:', error);
            if (typeof showToast === 'function') {
                showToast('Error al guardar la historia clínica. Por favor intente nuevamente.', 'error');
            } else {
                alert('❌ Error al guardar la historia clínica. Por favor intente nuevamente.');
            }
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
