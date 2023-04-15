const path = require('node:path');
const { EmbedBuilder, SlashCommandBuilder, CommandInteraction } = require('discord.js');
const { ipAddr } = require(path.relative('./src/commands', 'config.json'));
const axios = require('axios');
const express = require('express');
const app = express();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deploy-erc20')
		.setDescription('This command allows you to deploy a new token.')
		.setDescriptionLocalizations({
			ja: 'トークンを新たにデプロイすることができるコマンドです',
		})
		.addStringOption(option =>
			option.setName('name')
				.setDescription('Please enter a name for the token')
				.setDescriptionLocalizations({
					ja: 'トークンの名前を入力してください',
				})
				.setRequired(true)
		).addStringOption(option =>
			option.setName('symbol')
				.setDescription('Please enter the token symbol')
				.setDescriptionLocalizations({
					ja: 'トークンのシンボルを入力してください',
				})
				.setRequired(true)
		).addIntegerOption(option =>
			option.setName('totalsupply')
				.setDescription('Please enter the amount of the token.')
				.setDescriptionLocalizations({
					ja: 'トークンの発行枚数を入力してください',
				})
				.setRequired(true)
		).addStringOption(option => 
            option.setName('network')
                .setDescription('Please select the Network where you would like to deploy the token.')
				.setDescriptionLocalizations({
					ja: 'トークンをデプロイするネットワークを選択してください',
				})
                .setRequired(true)
                .addChoices(
                    { name: 'Ethereum', value: '0x1' },
					{ name: 'Goerli', value: '0x5' },
                    { name: 'Polygon', value: '0x89' },
                    { name: 'Astar', value: '0x250' },
					{ name: 'Mumbai', value: '0x13881' },
        )),

	async execute(interaction = new CommandInteraction()) {
		await interaction.deferReply();
		const tokenName = interaction.options.getString('name');
		const tokenSymbol = interaction.options.getString('symbol');
		const tokenSupply = interaction.options.getInteger('totalsupply').toString()

		const startServer = async (data) => {
			const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Deploy ERC20')
			.setURL(`${ipAddr}:443/${data.path}`)
			.setDescription('こちらのサイトでトークンをデプロイすることができます\n`※スマホを使用している方はMetaMaskアプリからこのリンクを開いてください`');
			await interaction.editReply({ content: '下記のリンクへアクセスしてMetamaskへ接続してください', embeds: [embed] });
			
			app.use(express.json());
			app.use(express.urlencoded({ extended: true }));
			app.post(`/${data.path}/request`, async (req, res) => {
				await interaction.followUp({ 
					content: `デプロイされたトークンの情報\n**Name**: ${tokenName} **TotalSupply**: ${tokenSupply}${tokenSymbol} \n**Address**: ${req.body.address}\n**TxHash**: ${req.body.hash}` 
				});
				res.send('completed');
			});
		}

		await axios.post(`${ipAddr}:443/rise`, {
				method: "deployERC20",
				name: tokenName,
				symbol: tokenSymbol,
				supply: tokenSupply,
				network: interaction.options.getString('network') })
			.then(response => startServer(JSON.parse(JSON.stringify(response.data))))
			.catch((error) => console.log(error));
	}
}

app.listen("3001", () => {
	console.log('deploy-ERC20 command Started.');
});