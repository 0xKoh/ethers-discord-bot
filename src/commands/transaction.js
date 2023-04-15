const path = require('node:path');
const { EmbedBuilder, SlashCommandBuilder, CommandInteraction } = require('discord.js');
const axios = require('axios');
const express = require('express');
const { ipAddr } = require(path.relative('./src/commands', './config.json'));
const tokenlist = require(path.relative('./src/commands', './tokenlist.json'));
const app = express();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('transaction')
		.setDescription('The Command to send a token.')
		.setDescriptionLocalizations({
			ja: 'トークンの送金を実行できるコマンドです',
		})
		.addStringOption(option =>
			option.setName('to')
				.setDescription('Please enter the destination address.')
				.setDescriptionLocalizations({
					ja: '送り先のアドレスを入力してください',
				})
				.setMaxLength(42)
				.setMinLength(5)
				.setRequired(true)
		).addStringOption(option =>
			option.setName('token')
				.setDescription('Please enter the address of the token.')
				.setDescriptionLocalizations({
					ja: 'トークンのアドレスを入力してください',
				})
				.setMaxLength(42)
				.setMinLength(3)
				.setRequired(true)
		).addStringOption(option =>
			option.setName('amount')
				.setDescription('Please enter an amount to be transferred.')
				.setDescriptionLocalizations({
					ja: '送金する数量を入力してください',
				})
				.setRequired(true)
		).addStringOption(option => 
            option.setName('network')
                .setDescription('Please select a network to run.')
				.setDescriptionLocalizations({
					ja: '実行するネットワークを選択してください',
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
			const token = interaction.options.getString('token');
			const walletAddrs = interaction.options.getString('to');
			const amount = interaction.options.getString('amount');
			const network = interaction.options.getString('network');
	
			await interaction.deferReply();
	
			const catchData = async (data) => {
				const embed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle('Transaction')
				.setURL(`${ipAddr}:443/${data.path}`)
				.setDescription('こちらのサイトでトランザクションを実行することができます\n`※スマホを使用している方はMetaMaskアプリからこのリンクを開いてください`');
				await interaction.editReply({ content: '下記のリンクへアクセスして**Metamask**へ接続してください', embeds: [embed] });
				
				app.use(express.json());
				app.use(express.urlencoded({ extended: true }));
				app.post(`/${data.path}/request`, async (req, res) => {
					if(req.body.symbol === "ETH"){
						await interaction.followUp({ content: `実行されたトランザクション情報\n**name**: ETH **amount**: ${amount}\n**toAddress**: ${walletAddrs}\n**TxHash**: ${req.body.hash}` });
					} else {
						await interaction.followUp({ content: `実行されたトランザクション情報\n**name**: ${req.body.symbol} **amount**: ${amount}\n**toAddress**: ${walletAddrs}\n**TxHash**: ${req.body.hash}` });
					}
					res.send('completed');
				});
			}
	
			const fetchServer = async (tokenAddrs) => {
				await axios.post(`${ipAddr}:443/rise`, {
					method: "transaction",
					tokenAddrs: tokenAddrs,
					walletAddrs: walletAddrs,
					amount: amount,
					network: network,
				}).then(response => catchData(JSON.parse(JSON.stringify(response.data))))
				.catch((error) => console.log(error));
			}
	
			if(token.toUpperCase() in tokenlist[network]){
				const tokenAddrs = tokenlist[network][token.toUpperCase()];
				fetchServer(tokenAddrs);
			} else if(token.length === 42) {
				fetchServer(token);
			} else {
				await interaction.followUp({ content: '入力されたトークン名またはトークンアドレスが存在しません。' });
			}
		}
	}

app.listen("3002", () => {
	console.log('Transaction command Started.');
});