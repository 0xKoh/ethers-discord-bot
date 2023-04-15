const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token, JsonRpc } = require(path.relative('./src', './config.json'));
const { ethers } = require('ethers');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const network = '0x1';

client.on('ready', () => { 
    console.log(`Logged in as ${client.user.tag}!`);
});

// Get the gas price from the provider.
client.on('ready', () => {
    setInterval(async () => {
      // Provider is set to Ethereum Mainnet.
      const provider = new ethers.providers.JsonRpcProvider(JsonRpc[network]);
      const wei = await provider.getGasPrice();
      client.user.setPresence({
        activities: [{ name:  `GAS fees: ${parseFloat(ethers.utils.formatUnits(wei, "gwei")).toFixed(4)}Gwai`, type: 3 }],
        status: 'online'
      });
    }, 8000);
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on(Events.InteractionCreate, interaction => {
	if (!interaction.isChatInputCommand()) return;
	console.log(interaction);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return;
  
    const command = client.commands.get(interaction.commandName);
  
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
    }
});

client.login(token);

