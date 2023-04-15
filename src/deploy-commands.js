const path = require('node:path');
const fs = require('node:fs');
const { REST, Routes } = require('discord.js');
const { clientId, token } = require(path.relative('./src', './config.json'));

const commands = [];

const commandFiles = fs.readdirSync(path.join(__dirname + '/commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

process.on('exit', ({code, data}) => {
	console.log(code === 0 ? `Successfully reloaded ${data.length} application (/) commands.` : `Failed to reload application (/) commands. Exit code: ${code}.`);
});

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);
		process.exit({ 
			code: 0,
			data: data
		});
	} catch (error) {
		process.exit(error.code);
	}
})();