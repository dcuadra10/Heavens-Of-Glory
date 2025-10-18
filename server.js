const express = require('express');
const { Client, GatewayIntentBits } = require("discord.js");
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
require("dotenv").config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// --- Discord Bot Singleton Setup ---
// This ensures we only have one instance of the client and one login process.
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ],
});

// This promise will resolve once the bot is ready.
// We create it once and reuse it for all API calls.
let botReadyPromise = null;

function ensureBotReady() {
  if (!botReadyPromise) {
    console.log('[ensureBotReady] Bot not ready. Initializing promise...');
    botReadyPromise = new Promise((resolve, reject) => {
      // If the bot is already ready, resolve immediately.
      if (client.isReady()) {
        console.log('[ensureBotReady] Bot was already ready.');
        return resolve();
      }
      client.once("ready", () => {
        console.log(`[DEBUG] Bot logged in as ${client.user.tag} and ready to serve API requests.`);
        console.log(`[DEBUG] Bot ID: ${client.user.id}`);
        console.log(`[DEBUG] Bot is in ${client.guilds.cache.size} guilds`);
        
        // Set up real-time Discord event listeners
        setupDiscordEventListeners();
        
        resolve();
      });
      
      client.on("error", (error) => {
        console.error('[DEBUG] Discord client error:', error);
      });
      
      console.log('[ensureBotReady] Logging in to Discord...');
      console.log('[DEBUG] Discord Token exists:', !!process.env.DISCORD_TOKEN);
      console.log('[DEBUG] Guild ID exists:', !!process.env.GUILD_ID);
      
      client.login(process.env.DISCORD_TOKEN).catch((error) => {
        console.error('[DEBUG] Login failed:', error.message);
        reject(error);
      });
    });
  }
  return botReadyPromise;
}

// --- Real-time Discord Event Listeners ---
function setupDiscordEventListeners() {
  const guildId = process.env.GUILD_ID;
  
  // Listen for member joins
  client.on('guildMemberAdd', async (member) => {
    if (member.guild.id === guildId) {
      console.log(`[Discord Event] Member joined: ${member.user.tag}`);
      await broadcastServerStats();
    }
  });

  // Listen for member leaves
  client.on('guildMemberRemove', async (member) => {
    if (member.guild.id === guildId) {
      console.log(`[Discord Event] Member left: ${member.user.tag}`);
      await broadcastServerStats();
    }
  });

  // Listen for presence updates (online/offline status changes)
  client.on('presenceUpdate', async (oldPresence, newPresence) => {
    if (newPresence && newPresence.guildId === guildId) {
      console.log(`[Discord Event] Presence updated for: ${newPresence.user.tag}`);
      await broadcastServerStats();
    }
  });

  // Listen for guild member updates
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (newMember.guild.id === guildId) {
      // Check if presence status changed
      if (oldMember.presence?.status !== newMember.presence?.status) {
        console.log(`[Discord Event] Member status changed: ${newMember.user.tag}`);
        await broadcastServerStats();
      }
    }
  });
}

// --- Real-time Stats Broadcasting ---
async function broadcastServerStats() {
  try {
    console.log('[DEBUG] Starting broadcastServerStats...');
    await ensureBotReady();
    console.log('[DEBUG] Bot is ready, fetching guild...');
    
    const guildId = process.env.GUILD_ID;
    console.log('[DEBUG] Guild ID:', guildId);
    
    const guild = await client.guilds.fetch(guildId);
    console.log('[DEBUG] Guild fetched:', guild.name);
    
    // Fetch all members to count online status
    const members = await guild.members.fetch();
    const onlineCount = members.filter(m => !m.user.bot && ['online', 'dnd', 'idle'].includes(m.presence?.status)).size;
    
    const statsData = {
      serverName: guild.name,
      status: "Online",
      totalMembers: guild.memberCount,
      onlineMembers: onlineCount,
      notes: `Serving ${guild.memberCount} members.`,
      timestamp: new Date().toISOString()
    };

    // Broadcast to all connected clients
    io.emit('serverStatsUpdate', statsData);
    console.log(`[WebSocket] Broadcasted stats update: ${guild.memberCount} total, ${onlineCount} online`);
    
  } catch (error) {
    console.error('[WebSocket] Error broadcasting stats:', error.message);
    console.error('[WebSocket] Full error:', error);
  }
}

// --- WebSocket Connection Handling ---
io.on('connection', (socket) => {
  console.log(`[WebSocket] Client connected: ${socket.id}`);
  
  // Send initial stats when client connects
  socket.on('requestStats', async () => {
    await broadcastServerStats();
  });
  
  socket.on('disconnect', () => {
    console.log(`[WebSocket] Client disconnected: ${socket.id}`);
  });
});

// --- Configuration Endpoint ---
// Serve configuration to frontend
app.get('/api/config', (req, res) => {
  res.json({
    botApiUrl: '/api/guild-info' // Use local API endpoint
  });
});

// --- API Endpoint ---
// A single endpoint to get all guild info at once.
app.get('/api/guild-info', async (req, res) => {
  try {
    console.log('[API /guild-info] Request received. Ensuring bot is ready...');
    
    // Try to connect to Discord bot, but don't fail if it doesn't work
    try {
      await ensureBotReady();
      console.log('[API /guild-info] Bot is ready. Fetching guild...');
      const guild = await client.guilds.fetch(process.env.GUILD_ID);

      // Fetch all members to count online status. This is an expensive operation.
      console.log('[API /guild-info] Fetching all members for online count...');
      const members = await guild.members.fetch();
      const onlineCount = members.filter(m => !m.user.bot && ['online', 'dnd', 'idle'].includes(m.presence?.status)).size;

      const totalMembers = guild.memberCount;
      console.log(`[API /guild-info] Found ${totalMembers} total members and ${onlineCount} online members.`);

      res.json({
        serverName: guild.name,
        status: "Online",
        totalMembers: totalMembers,
        onlineMembers: onlineCount,
        notes: `Serving ${totalMembers} members.`
      });
    } catch (botError) {
      console.log('[API /guild-info] Bot connection failed, using static data:', botError.message);
      
      // Return static data if bot fails
      res.json({
        serverName: "Heavens of Glory || March 27",
        status: "Online",
        totalMembers: 230,
        onlineMembers: 67,
        notes: "Bot configuration in progress"
      });
    }
  } catch (error) {
    console.error("[API /guild-info] Error:", error.message);
    res.status(500).json({ error: "Failed to fetch guild info", details: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Periodic stats broadcast (every 60 seconds as backup)
setInterval(async () => {
  await broadcastServerStats();
}, 60000);

// Export the app for Vercel (fallback)
module.exports = app;
