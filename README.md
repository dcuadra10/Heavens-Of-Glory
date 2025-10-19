# Heavens of Glory - Web Page Real-Time

Página web para mostrar estadísticas **en tiempo real** del servidor Discord con bot integrado.

## ✨ Nuevas Características Real-Time

- **Actualizaciones instantáneas** cuando alguien se une/sale del servidor
- **Estado online/offline en tiempo real** de los miembros
- **Conexión WebSocket** para actualizaciones inmediatas
- **Indicadores visuales** cuando se actualizan las estadísticas
- **Estado de conexión** en tiempo real
- **Fallback automático** si la conexión WebSocket falla

## 🚀 Cómo Funciona el Sistema Real-Time

1. **Bot de Discord** escucha eventos en tiempo real:
   - Nuevos miembros uniéndose
   - Miembros saliendo del servidor
   - Cambios de estado (online/offline/idle/dnd)
   - Actualizaciones de miembros

2. **WebSocket** transmite actualizaciones instantáneas a la página web

3. **Indicadores visuales** muestran cuando ocurren actualizaciones

## 📋 Setup Local

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Crea un archivo `.env`:
```env
DISCORD_TOKEN=tu_token_del_bot_aqui
GUILD_ID=tu_server_id_de_discord_aqui
VOICE_CHANNEL_ID=tu_voice_channel_id_aqui
BOT_API_URL=https://overseas-mimi-heavens-295a972c.koyeb.app/api/guild-info
PORT=3000
```

### 3. Configurar Bot de Discord

1. **Crear Aplicación Discord**:
   - Ve a https://discord.com/developers/applications
   - Crea una nueva aplicación y bot

2. **Permisos Requeridos**:
   - View Channels
   - Read Message History  
   - View Server Members

3. **Habilitar Intents Privilegiados**:
   - Ve a la configuración de tu bot
   - Habilita "Server Members Intent" ✅
   - Habilita "Presence Intent" ✅ (para tracking de estado online)

4. **Agregar Bot al Servidor**:
   - Usa el generador de URL OAuth2
   - Selecciona scope "bot" y permisos requeridos
   - Agrega el bot a tu servidor de Discord

### 4. Obtener IDs Necesarios
- **Server ID**: Habilita Developer Mode en Discord, click derecho en el nombre del servidor → "Copy Server ID"
- **Voice Channel ID**: Click derecho en el canal de voz que contiene el contador de miembros → "Copy Channel ID"
- Usa estos IDs en tu archivo `.env` como `GUILD_ID` y `VOICE_CHANNEL_ID`

### 5. Iniciar Servidor
```bash
npm start
```

El servidor iniciará en `http://localhost:3000`.

## 🌐 Deploy en Vercel

1. Conecta este repositorio a Vercel
2. Configura las variables de entorno:
   - `DISCORD_TOKEN`: Tu token del bot de Discord
   - `GUILD_ID`: ID de tu servidor de Discord
   - `VOICE_CHANNEL_ID`: ID del canal de voz con contador de miembros
   - `BOT_API_URL`: https://overseas-mimi-heavens-295a972c.koyeb.app/api/guild-info

3. Deploy automático

## Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DISCORD_TOKEN` | Token del bot de Discord | `tu_token_aqui` |
| `GUILD_ID` | ID del servidor de Discord | `1234567890123456789` |
| `VOICE_CHANNEL_ID` | ID del canal de voz con contador de miembros | `9876543210987654321` |
| `BOT_API_URL` | URL del API del bot (fallback) | `https://overseas-mimi-heavens-295a972c.koyeb.app/api/guild-info` |
| `PORT` | Puerto del servidor (opcional) | `3000` |

## 🔄 Actualizaciones Real-Time

El sistema detecta automáticamente:
- ✅ **Nuevos miembros** uniéndose al servidor
- ✅ **Miembros saliendo** del servidor  
- ✅ **Cambios de estado** (online/offline/idle/dnd)
- ✅ **Actualizaciones de miembros**

Y actualiza la página web **instantáneamente** sin necesidad de recargar.

## 🎤 Integración con Canal de Voz

El bot puede leer datos directamente del canal de voz configurado:

- **Extrae el número de miembros** del nombre del canal de voz (ej: "👥 Miembros: 230")
- **Cuenta miembros en línea** que están actualmente en el canal de voz
- **Fallback automático** a datos del servidor si el canal de voz no está disponible
- **Actualizaciones en tiempo real** cuando cambia el nombre del canal de voz

### Formato del Canal de Voz
El canal de voz debe tener un número en su nombre para que el bot pueda extraer el conteo:
- ✅ "👥 Miembros: 230"
- ✅ "📊 Server Stats: 150"
- ✅ "👥 230 miembros"
- ❌ "Canal de voz" (sin números)

## 🛠️ Tecnologías Utilizadas

- **Express.js** - Servidor web
- **Socket.IO** - Comunicación WebSocket en tiempo real
- **Discord.js** - Integración con Discord API
- **Node.js** - Runtime del servidor

## 📱 Uso

1. Visita la página web
2. La página se conecta automáticamente al bot via WebSocket
3. Las estadísticas se actualizan en tiempo real cuando ocurren eventos en Discord
4. Los indicadores de conexión muestran el estado del WebSocket
5. Las animaciones verdes indican cuando se actualizan las estadísticas

## 🔧 Troubleshooting

### Bot No Responde
- Verifica que `DISCORD_TOKEN` sea correcto
- Asegúrate de que el bot tenga permisos en tu servidor
- Habilita "Server Members Intent" en la configuración del bot

### Problemas de Conexión WebSocket
- Revisa la consola del navegador por errores de conexión
- Verifica que el servidor esté ejecutándose
- La página hará fallback a polling de API si WebSocket falla

### Estadísticas No Se Actualizan
- Revisa los logs del servidor por errores de Discord API
- Verifica que `GUILD_ID` sea correcto
- Asegúrate de que el bot esté en el servidor con permisos adecuados
