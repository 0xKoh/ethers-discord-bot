const path = require('node:path');
const { SlashCommandBuilder, CommandInteraction } = require('discord.js');
const { ethers } = require('ethers');
const { JsonRpc } = require(path.relative('./src/commands', './config.json'));
const tokenlist = require(path.relative('./src/commands', './tokenlist.json'));

const abi = [
	"function balanceOf(address owner) view returns (uint256)",
	"function decimals() view returns (uint8)",
	"function symbol() view returns (string)"
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('トークンアドレスとウォレットアドレスからトークンの残高を取得します')
		.addStringOption(option =>
			option.setName('wallet')
				.setDescription('Wallet Addressを入力してください')
				.setMaxLength(42)
				.setMinLength(5)
				.setRequired(true)
		).addStringOption(option =>
			option.setName('token')
				.setDescription('Token Addressを入力してください')
				.setMaxLength(42)
				.setMinLength(3)
				.setRequired(true)
		).addStringOption(option => 
            option.setName('network')
                .setDescription('Networkを選択してください')
                .setRequired(true)
                .addChoices(
                    { name: 'Ethereum', value: '0x1' },
					{ name: 'Goerli', value: '0x5' },
                    { name: 'Polygon', value: '0x89' },
                    { name: 'Astar', value: '0x250' }
        )),

	async execute(interaction = new CommandInteraction()) {
		await interaction.deferReply();
		const token = interaction.options.getString('token');
		const walletAdrs = interaction.options.getString('wallet');
		const network = interaction.options.getString('network');
		const provider = new ethers.providers.JsonRpcProvider(JsonRpc[network]);

		const getBalanceData = async (tokenAddrs) => {
			if(tokenAddrs == '0x00') {
				try {
					const balance = await provider.getBalance(walletAdrs);
					await interaction.editReply(`${parseFloat(ethers.utils.formatEther(balance)).toFixed(4).toLocaleString()} ${token.toUpperCase()}`);
					await interaction.followUp(`残高を取得したアドレスの情報\n**Wallet**: ${walletAdrs}\n**Token**: ${token.toUpperCase()}`);
				} catch (error) {
					await interaction.editReply('アドレスがネットワーク上に存在しません。(error: the wallet is not found)');
				}
			} else {
				try {
					const erc20 = new ethers.Contract(tokenAddrs, abi, provider);
					const symbol = await erc20.symbol();
					const balance = await erc20.balanceOf(walletAdrs);
					await interaction.editReply(`${parseFloat(balance).toLocaleString()} ${symbol}`);
					await interaction.followUp(`残高を取得したアドレスの情報\n**Wallet**: ${walletAdrs}\n**Token**: ${symbol}\n**Chain**: ${network}`);
				}catch(error) {
					await interaction.editReply('そのアドレスのトークンまたはウォレットがネットワーク上に存在しません。(error: wallet or token is not found)');
				}
			}
		}

		if(token.toUpperCase() in tokenlist[network]){
			const tokenAddrs = tokenlist[network][token.toUpperCase()];
			getBalanceData(tokenAddrs);
		} else if(token.length === 42) {
			getBalanceData(token);
		} else {
			await interaction.followUp({ content: '入力されたトークン名またはトークンアドレスが存在しません。' });
		}
	}
};