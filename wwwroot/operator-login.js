// operator-login.js
// Sistema de autenticación de operadores para el panel

(function() {
    'use strict';

    const OPERATOR_NAME_KEY = 'operatorName';
    
    // Función para obtener el nombre del operador guardado
    function getOperatorName() {
        return localStorage.getItem(OPERATOR_NAME_KEY);
    }
    
    // Función para guardar el nombre del operador
    function setOperatorName(name) {
        localStorage.setItem(OPERATOR_NAME_KEY, name);
    }
    
    // Función para eliminar el nombre del operador (logout)
    function clearOperatorName() {
        localStorage.removeItem(OPERATOR_NAME_KEY);
    }
    
    // Crear modal de login
    function createLoginModal() {
        const styles = `
            <style>
                #operatorLoginModal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(10px);
                    z-index: 99999;
                    justify-content: center;
                    align-items: center;
                }
                
                #operatorLoginModal.show {
                    display: flex;
                }
                
                .login-container {
                    background: white;
                    border-radius: 20px;
                    padding: 3rem;
                    box-shadow: 0 25px 70px rgba(0,0,0,0.4);
                    max-width: 450px;
                    width: 90%;
                    animation: modalSlideIn 0.4s ease;
                }
                
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .login-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                
                .login-header i {
                    font-size: 4rem;
                    color: #075E54;
                    margin-bottom: 1rem;
                }
                
                .login-header h2 {
                    color: #1F2937;
                    font-size: 1.75rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }
                
                .login-header p {
                    color: #6B7280;
                    font-size: 0.95rem;
                }
                
                .login-form {
                    margin-top: 2rem;
                }
                
                .form-group {
                    margin-bottom: 1.5rem;
                }
                
                .form-group label {
                    display: block;
                    color: #374151;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    font-size: 0.95rem;
                }
                
                .form-group input {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    border: 2px solid #E5E7EB;
                    border-radius: 10px;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }
                
                .form-group input:focus {
                    outline: none;
                    border-color: #075E54;
                    box-shadow: 0 0 0 4px rgba(7, 94, 84, 0.1);
                }
                
                .login-btn {
                    width: 100%;
                    padding: 1rem;
                    background: linear-gradient(135deg, #128C7E 0%, #075E54 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }
                
                .login-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(7, 94, 84, 0.4);
                }
                
                .login-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }
                
                .login-error {
                    background: #FEE2E2;
                    color: #DC2626;
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    margin-top: 1rem;
                    font-size: 0.9rem;
                    display: none;
                }
                
                .login-error.show {
                    display: block;
                }

                .operator-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .logout-btn {
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 0.4rem 0.8rem;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-left: 0.5rem;
                }

                .logout-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            </style>
        `;
        
        const modalHTML = `
            <div id="operatorLoginModal" class="show">
                <div class="login-container">
                    <div class="login-header">
                        <i class="fas fa-user-circle"></i>
                        <h2>Panel de Operadores</h2>
                        <p>Ingresa tu nombre para comenzar a atender conversaciones</p>
                    </div>
                    
                    <form id="operatorLoginForm" class="login-form">
                        <div class="form-group">
                            <label for="operatorNameInput">Nombre del Operador</label>
                            <input 
                                type="text" 
                                id="operatorNameInput" 
                                placeholder="Ej: Juan Pérez"
                                required
                                autocomplete="name"
                                autofocus
                            >
                        </div>
                        
                        <button type="submit" class="login-btn" id="loginBtn">
                            <i class="fas fa-sign-in-alt"></i>
                            <span>Iniciar Sesión</span>
                        </button>
                        
                        <div id="loginError" class="login-error"></div>
                    </form>
                </div>
            </div>
        `;
        
        // Insertar estilos y modal
        document.head.insertAdjacentHTML('beforeend', styles);
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    // Mostrar modal de login
    function showLoginModal() {
        const modal = document.getElementById('operatorLoginModal');
        if (modal) {
            modal.classList.add('show');
        }
    }
    
    // Ocultar modal de login
    function hideLoginModal() {
        const modal = document.getElementById('operatorLoginModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }
    
    // Mostrar error en el modal
    function showLoginError(message) {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add('show');
        }
    }
    
    // Ocultar error
    function hideLoginError() {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.classList.remove('show');
        }
    }
    
    // Actualizar UI con el nombre del operador
    function updateOperatorUI(name) {
        const operatorNameSpan = document.getElementById('operatorName');
        if (operatorNameSpan) {
            operatorNameSpan.textContent = name;
            
            // Agregar botón de logout si no existe
            if (!document.getElementById('logoutBtn')) {
                const logoutBtn = document.createElement('button');
                logoutBtn.id = 'logoutBtn';
                logoutBtn.className = 'logout-btn';
                logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Salir';
                logoutBtn.onclick = handleLogout;
                operatorNameSpan.parentElement.appendChild(logoutBtn);
            }
        }
    }
    
    // Manejar login
    function handleLogin(e) {
        e.preventDefault();
        hideLoginError();
        
        const input = document.getElementById('operatorNameInput');
        const btn = document.getElementById('loginBtn');
        
        if (!input || !btn) return;
        
        const name = input.value.trim();
        
        if (!name) {
            showLoginError('Por favor ingresa tu nombre');
            return;
        }
        
        if (name.length < 2) {
            showLoginError('El nombre debe tener al menos 2 caracteres');
            return;
        }
        
        // Deshabilitar botón mientras procesa
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Conectando...</span>';
        
        // Guardar nombre
        setOperatorName(name);
        
        // Actualizar UI
        updateOperatorUI(name);
        
        // Ocultar modal
        hideLoginModal();
        
        // Exponer el nombre globalmente para que SignalR lo use
        window.currentOperatorName = name;
        
        // Iniciar SignalR si ya está definido
        if (typeof window.initSignalR === 'function') {
            console.log('✅ Operador autenticado:', name);
            window.initSignalR();
        } else {
            console.log('⏳ Esperando inicialización de SignalR...');
        }
        
        // Resetear botón
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>Iniciar Sesión</span>';
        }, 1000);
    }
    
    // Manejar logout
    function handleLogout() {
        if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
            clearOperatorName();
            window.currentOperatorName = null;
            
            // Recargar página para reiniciar todo
            window.location.reload();
        }
    }
    
    // Inicializar sistema de login
    function initLoginSystem() {
        // Crear modal
        createLoginModal();
        
        // Verificar si ya hay un operador logueado
        const savedName = getOperatorName();
        
        if (savedName) {
            // Ya está logueado
            console.log('✅ Operador ya autenticado:', savedName);
            window.currentOperatorName = savedName;
            updateOperatorUI(savedName);
            hideLoginModal();
        } else {
            // Mostrar modal de login
            console.log('⏳ Esperando autenticación de operador...');
            showLoginModal();
        }
        
        // Configurar event listener del formulario
        const loginForm = document.getElementById('operatorLoginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        // Prevenir que Enter cierre el modal sin validar
        const input = document.getElementById('operatorNameInput');
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    loginForm.dispatchEvent(new Event('submit'));
                }
            });
        }
    }
    
    // Exponer funciones globalmente para que SignalR pueda acceder
    window.getOperatorName = getOperatorName;
    window.setOperatorName = setOperatorName;
    window.clearOperatorName = clearOperatorName;
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLoginSystem);
    } else {
        initLoginSystem();
    }
    
    console.log('✅ Sistema de autenticación de operadores cargado');
})();
