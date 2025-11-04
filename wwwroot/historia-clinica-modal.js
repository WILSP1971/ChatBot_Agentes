// historia-clinica-modal.js
// Modal interactivo para diligenciar historia clínica sin interrumpir el chat

(function() {
    'use strict';

    // Agregar estilos CSS para el modal
    const styles = `
        <style>
            #historiaClinicaModal {
                display: none;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90%;
                max-width: 900px;
                max-height: 90vh;
                background: white;
                border-radius: 15px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                z-index: 10000;
                overflow: hidden;
            }
            
            #historiaClinicaModal.show {
                display: block;
            }
            
            .hc-modal-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 9999;
            }
            
            .hc-modal-overlay.show {
                display: block;
            }
            
            .hc-modal-header {
                background: linear-gradient(135deg, #075E54 0%, #128C7E 100%);
                color: white;
                padding: 1rem 1.5rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .hc-modal-body {
                padding: 1.5rem;
                max-height: calc(90vh - 150px);
                overflow-y: auto;
            }
            
            .hc-tabs {
                display: flex;
                border-bottom: 2px solid #e5e7eb;
                margin-bottom: 1.5rem;
            }
            
            .hc-tab {
                padding: 0.75rem 1.5rem;
                cursor: pointer;
                border-bottom: 3px solid transparent;
                transition: all 0.3s;
                font-weight: 500;
            }
            
            .hc-tab:hover {
                background: #f3f4f6;
            }
            
            .hc-tab.active {
                color: #075E54;
                border-bottom-color: #075E54;
            }
            
            .hc-tab-content {
                display: none;
            }
            
            .hc-tab-content.active {
                display: block;
            }
            
            .hc-form-group {
                margin-bottom: 1rem;
            }
            
            .hc-form-group label {
                display: block;
                font-weight: 600;
                margin-bottom: 0.5rem;
                color: #1F2937;
            }
            
            .hc-form-group input,
            .hc-form-group select,
            .hc-form-group textarea {
                width: 100%;
                padding: 0.5rem;
                border: 1px solid #d1d5db;
                border-radius: 5px;
                font-size: 0.875rem;
            }
            
            .hc-form-group textarea {
                min-height: 80px;
                resize: vertical;
            }
            
            .hc-form-row {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
            }
            
            .hc-modal-footer {
                padding: 1rem 1.5rem;
                background: #f9fafb;
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
                border-top: 1px solid #e5e7eb;
            }
            
            .hc-btn {
                padding: 0.5rem 1.5rem;
                border-radius: 5px;
                font-weight: 600;
                cursor: pointer;
                border: none;
                transition: all 0.3s;
            }
            
            .hc-btn-primary {
                background: #075E54;
                color: white;
            }
            
            .hc-btn-primary:hover {
                background: #064e46;
            }
            
            .hc-btn-secondary {
                background: #e5e7eb;
                color: #1F2937;
            }
            
            .hc-btn-secondary:hover {
                background: #d1d5db;
            }
            
            .hc-close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .hc-antecedentes-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 0.75rem;
            }
            
            .hc-checkbox-group {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .hc-checkbox-group input[type="checkbox"] {
                width: auto;
            }
        </style>
    `;

    // Agregar el HTML del modal
    const modalHTML = `
        <div class="hc-modal-overlay" id="hcModalOverlay"></div>
        <div id="historiaClinicaModal">
            <div class="hc-modal-header">
                <h5 style="margin: 0; font-size: 1.25rem;">📋 Historia Clínica</h5>
                <button class="hc-close-btn" onclick="cerrarHistoriaClinicaModal()">&times;</button>
            </div>
            
            <div class="hc-modal-body">
                <div class="hc-tabs">
                    <div class="hc-tab active" data-tab="paciente">Datos del Paciente</div>
                    <div class="hc-tab" data-tab="antecedentes">Antecedentes</div>
                    <div class="hc-tab" data-tab="examen">Examen Físico</div>
                    <div class="hc-tab" data-tab="diagnostico">Diagnóstico y Plan</div>
                </div>
                
                <form id="historiaClinicaForm">
                    <!-- Tab 1: Datos del Paciente -->
                    <div class="hc-tab-content active" data-tab="paciente">
                        <div class="hc-form-row">
                            <div class="hc-form-group">
                                <label>No. Identificación *</label>
                                <input type="text" name="noIdentificacion" required>
                            </div>
                            <div class="hc-form-group">
                                <label>Nombre Completo *</label>
                                <input type="text" name="nombrePaciente" required>
                            </div>
                            <div class="hc-form-group">
                                <label>Edad *</label>
                                <input type="number" name="edad" required>
                            </div>
                            <div class="hc-form-group">
                                <label>Sexo *</label>
                                <select name="sexo" required>
                                    <option value="">Seleccione...</option>
                                    <option value="MASCULINO">Masculino</option>
                                    <option value="FEMENINO">Femenino</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="hc-form-row">
                            <div class="hc-form-group">
                                <label>Dirección</label>
                                <input type="text" name="direccion">
                            </div>
                            <div class="hc-form-group">
                                <label>Ciudad</label>
                                <input type="text" name="ciudad">
                            </div>
                            <div class="hc-form-group">
                                <label>Teléfono *</label>
                                <input type="text" name="telefono" required>
                            </div>
                        </div>
                        
                        <div class="hc-form-row">
                            <div class="hc-form-group">
                                <label>Ocupación</label>
                                <input type="text" name="ocupacion">
                            </div>
                            <div class="hc-form-group">
                                <label>Estado Civil</label>
                                <select name="estadoCivil">
                                    <option value="">Seleccione...</option>
                                    <option value="SOLTERO">Soltero/a</option>
                                    <option value="CASADO">Casado/a</option>
                                    <option value="UNION_LIBRE">Unión Libre</option>
                                    <option value="VIUDO">Viudo/a</option>
                                    <option value="SEPARADO">Separado/a</option>
                                </select>
                            </div>
                            <div class="hc-form-group">
                                <label>Fecha Nacimiento</label>
                                <input type="date" name="fechaNacimiento">
                            </div>
                        </div>
                        
                        <div class="hc-form-group">
                            <label>Motivo de Consulta *</label>
                            <textarea name="motivoConsulta" required></textarea>
                        </div>
                        
                        <div class="hc-form-group">
                            <label>Enfermedad Actual *</label>
                            <textarea name="enfermedadActual" required></textarea>
                        </div>
                    </div>
                    
                    <!-- Tab 2: Antecedentes -->
                    <div class="hc-tab-content" data-tab="antecedentes">
                        <div class="hc-antecedentes-grid">
                            <div class="hc-checkbox-group">
                                <input type="checkbox" id="diabetes" name="antecedentes" value="DIABETES">
                                <label for="diabetes">Diabetes</label>
                            </div>
                            <div class="hc-checkbox-group">
                                <input type="checkbox" id="hipertension" name="antecedentes" value="HIPERTENSION_ARTERIAL">
                                <label for="hipertension">Hipertensión Arterial</label>
                            </div>
                            <div class="hc-checkbox-group">
                                <input type="checkbox" id="tabaquismo" name="antecedentes" value="TABAQUISMO">
                                <label for="tabaquismo">Tabaquismo</label>
                            </div>
                            <div class="hc-checkbox-group">
                                <input type="checkbox" id="asma" name="antecedentes" value="ASMA">
                                <label for="asma">Asma</label>
                            </div>
                            <div class="hc-checkbox-group">
                                <input type="checkbox" id="epoc" name="antecedentes" value="EPOC">
                                <label for="epoc">EPOC</label>
                            </div>
                            <div class="hc-checkbox-group">
                                <input type="checkbox" id="obesidad" name="antecedentes" value="OBESIDAD">
                                <label for="obesidad">Obesidad</label>
                            </div>
                            <div class="hc-checkbox-group">
                                <input type="checkbox" id="alergicos" name="antecedentes" value="ALERGICOS">
                                <label for="alergicos">Alérgicos</label>
                            </div>
                        </div>
                        
                        <div class="hc-form-group" style="margin-top: 1.5rem;">
                            <label>Otros Antecedentes</label>
                            <textarea name="otrosAntecedentes" placeholder="Describa otros antecedentes relevantes"></textarea>
                        </div>
                    </div>
                    
                    <!-- Tab 3: Examen Físico -->
                    <div class="hc-tab-content" data-tab="examen">
                        <h6 style="margin-bottom: 1rem; color: #075E54;">Signos Vitales</h6>
                        <div class="hc-form-row">
                            <div class="hc-form-group">
                                <label>FC (Frecuencia Cardíaca)</label>
                                <input type="number" name="fc">
                            </div>
                            <div class="hc-form-group">
                                <label>FR (Frecuencia Respiratoria)</label>
                                <input type="number" name="fr">
                            </div>
                            <div class="hc-form-group">
                                <label>T/A (Tensión Arterial)</label>
                                <input type="text" name="ta" placeholder="120/80">
                            </div>
                            <div class="hc-form-group">
                                <label>Temperatura (°C)</label>
                                <input type="number" name="temperatura" step="0.1">
                            </div>
                            <div class="hc-form-group">
                                <label>Peso (Kg)</label>
                                <input type="number" name="peso" step="0.1">
                            </div>
                            <div class="hc-form-group">
                                <label>Talla (m)</label>
                                <input type="number" name="talla" step="0.01">
                            </div>
                        </div>
                        
                        <div class="hc-form-group">
                            <label>Glasgow</label>
                            <input type="text" name="glasgow">
                        </div>
                        
                        <h6 style="margin: 1.5rem 0 1rem; color: #075E54;">Exploración Física</h6>
                        <div class="hc-form-group">
                            <label>Aspecto General</label>
                            <textarea name="aspectoGeneral"></textarea>
                        </div>
                        <div class="hc-form-group">
                            <label>Cabeza, Cara, Órganos de los Sentidos</label>
                            <textarea name="cabezaCara"></textarea>
                        </div>
                        <div class="hc-form-group">
                            <label>Cuello</label>
                            <textarea name="cuello"></textarea>
                        </div>
                        <div class="hc-form-group">
                            <label>Tórax</label>
                            <textarea name="torax"></textarea>
                        </div>
                        <div class="hc-form-group">
                            <label>Abdomen</label>
                            <textarea name="abdomen"></textarea>
                        </div>
                        <div class="hc-form-group">
                            <label>Genitourinario</label>
                            <textarea name="genitourinario"></textarea>
                        </div>
                        <div class="hc-form-group">
                            <label>Dorso y Extremidades</label>
                            <textarea name="dorsoExtremidades"></textarea>
                        </div>
                        <div class="hc-form-group">
                            <label>S.N.C. (Sistema Nervioso Central)</label>
                            <textarea name="snc"></textarea>
                        </div>
                    </div>
                    
                    <!-- Tab 4: Diagnóstico y Plan -->
                    <div class="hc-tab-content" data-tab="diagnostico">
                        <div class="hc-form-group">
                            <label>Diagnósticos (uno por línea)</label>
                            <textarea name="diagnosticos" rows="5" placeholder="Ingrese cada diagnóstico en una línea separada"></textarea>
                        </div>
                        
                        <div class="hc-form-group">
                            <label>Evolución</label>
                            <textarea name="evolucion" rows="4"></textarea>
                        </div>
                        
                        <div class="hc-form-group">
                            <label>Plan de Tratamiento (uno por línea)</label>
                            <textarea name="plan" rows="5" placeholder="Ingrese cada ítem del plan en una línea separada"></textarea>
                        </div>
                        
                        <h6 style="margin: 1.5rem 0 1rem; color: #075E54;">Datos del Médico</h6>
                        <div class="hc-form-row">
                            <div class="hc-form-group">
                                <label>Nombre del Médico *</label>
                                <input type="text" name="medicoNombre" required>
                            </div>
                            <div class="hc-form-group">
                                <label>Registro Médico *</label>
                                <input type="text" name="medicoRegistro" required>
                            </div>
                            <div class="hc-form-group">
                                <label>Especialidad</label>
                                <input type="text" name="medicoEspecialidad">
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            
            <div class="hc-modal-footer">
                <button type="button" class="hc-btn hc-btn-secondary" onclick="cerrarHistoriaClinicaModal()">Cancelar</button>
                <button type="button" class="hc-btn hc-btn-primary" onclick="guardarHistoriaClinica()">💾 Guardar Historia Clínica</button>
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
                field.style.borderColor = 'red';
                isValid = false;
            } else {
                field.style.borderColor = '';
            }
        });
        
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
            saveBtn.innerHTML = '⏳ Guardando...';
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

    console.log('✅ Modal de Historia Clínica cargado correctamente');
})();
