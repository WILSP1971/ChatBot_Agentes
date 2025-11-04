# INSTRUCCIONES PARA MODIFICAR index.html

Para integrar el modal de Historia Clínica en el panel de operadores, siga estos pasos:

## Paso 1: Agregar el script del modal

Al final del archivo `wwwroot/index.html`, justo antes de la etiqueta de cierre `</body>`, agregue:

```html
<!-- Script del Modal de Historia Clínica -->
<script src="/historia-clinica-modal.js"></script>
```

## Paso 2: Agregar el botón de Historia Clínica

Busque en el archivo `index.html` la sección donde están los botones de acción del chat (cerca de la línea 800-900, donde están los botones de enviar imagen, etc.).

Agregue el siguiente botón junto a los otros botones de acción:

```html
<button class="action-btn" onclick="abrirHistoriaClinicaModal(currentConversationId)" title="Diligenciar Historia Clínica">
    <i class="bi bi-clipboard-heart"></i>
    <span class="action-btn-text">Historia Clínica</span>
</button>
```

## Paso 3: Guardar referencia a la conversación actual

En la función que carga una conversación (busque `function loadConversation` o similar), agregue al inicio:

```javascript
window.currentConversation = conversation;
window.currentConversationId = conversationId;
```

Esto permitirá que el modal acceda a los datos de la conversación actual.

## Ubicaciones exactas recomendadas:

### Para el botón (aproximadamente línea 850):
Busque esta sección en el HTML:
```html
<div class="chat-actions">
    <!-- Botones existentes como enviar imagen, etc. -->
```

Y agregue el nuevo botón ahí.

### Para el script (al final del archivo):
Justo antes de:
```html
</body>
</html>
```

Agregue:
```html
<!-- Script del Modal de Historia Clínica -->
<script src="/historia-clinica-modal.js"></script>
</body>
</html>
```

## Resultado

Una vez realizados estos cambios:

1. Al abrir una conversación, aparecerá un botón "📋 Historia Clínica"
2. Al hacer clic, se abrirá un modal flotante con pestañas
3. El operador puede seguir chateando mientras diligencia el formulario
4. Al guardar, se crea la historia clínica, se genera el PDF y se envía al paciente por WhatsApp

## Nota Importante

Si no desea modificar manualmente el index.html, puede usar la versión modificada incluida en `wwwroot/index_modificado.html` que ya tiene todos los cambios integrados. Simplemente:

1. Haga backup del index.html original
2. Renombre index_modificado.html a index.html

Sin embargo, se recomienda hacer los cambios manualmente para preservar cualquier customización que tenga en su index.html actual.
