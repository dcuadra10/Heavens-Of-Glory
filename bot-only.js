const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

// Discord Bot Setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ],
});

// Bot Events
client.once("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
  
  // Set up real-time Discord event listeners
  setupDiscordEventListeners();
});

// Real-time Discord Event Listeners
function setupDiscordEventListeners() {
  const guildId = process.env.GUILD_ID;
  
  // Listen for member joins
  client.on('guildMemberAdd', async (member) => {
    if (member.guild.id === guildId) {
      console.log(`[Discord Event] Member joined: ${member.user.tag}`);
      // Aquí puedes agregar lógica adicional
    }
  });

  // Listen for member leaves
  client.on('guildMemberRemove', async (member) => {
    if (member.guild.id === guildId) {
      console.log(`[Discord Event] Member left: ${member.user.tag}`);
      // Aquí puedes agregar lógica adicional
    }
  });

  // Listen for presence updates
  client.on('presenceUpdate', async (oldPresence, newPresence) => {
    if (newPresence && newPresence.guildId === guildId) {
      console.log(`[Discord Event] Presence updated for: ${newPresence.user.tag}`);
      // Aquí puedes agregar lógica adicional
    }
  });
}

// Login
client.login(process.env.DISCORD_TOKEN).catch(console.error);

// Keep the bot running
process.on('SIGINT', () => {
  console.log('Bot shutting down...');
  client.destroy();
  process.exit(0);
});
