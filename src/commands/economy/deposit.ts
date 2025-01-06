import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { depositMoney, getOrCreateProfile } from '../../utils/profileHandler';
import { formatCurrency } from '../../utils/formatters';

const deposit: Command = {
    data: new SlashCommandBuilder()
        .setName('deposit')
        .setDescription('Deposit money into your bank account')
        .addStringOption(option =>
            option
                .setName('amount')
                .setDescription('Amount to deposit (use "all" to deposit everything)')
                .setRequired(true)
        ) as SlashCommandBuilder,

    async execute(interaction) {
        try {
            const profile = await getOrCreateProfile(interaction.user.id, interaction.user.username);
            const amountInput = interaction.options.getString('amount', true);
            
            let amount: number;
            if (amountInput.toLowerCase() === 'all') {
                amount = profile.economy.wallet_balance;
            } else {
                amount = parseInt(amountInput);
                if (isNaN(amount)) {
                    const embed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('❌ Invalid Amount')
                        .setDescription('Please enter a valid number or "all"')
                        .setFooter({ text: 'MollyBot Economy System' });

                    await interaction.reply({ 
                        embeds: [embed], 
                        flags: MessageFlags.Ephemeral 
                    });
                    return;
                }
            }

            const result = await depositMoney(interaction.user.id, amount);

            if (!result.success) {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Deposit Failed')
                    .setDescription(result.error!)
                    .setFooter({ text: 'MollyBot Economy System' });

                await interaction.reply({ 
                    embeds: [embed], 
                    flags: MessageFlags.Ephemeral 
                });
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('💰 Deposit Successful!')
                .setDescription(`Successfully deposited ${formatCurrency(amount)}`)
                .addFields(
                    { name: '💳 Wallet Balance', value: formatCurrency(result.newWalletBalance!), inline: true },
                    { name: '🏦 Bank Balance', value: formatCurrency(result.newBankBalance!), inline: true }
                )
                .setFooter({ text: 'MollyBot Economy System' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in deposit command:', error);
            await interaction.reply({
                content: 'There was an error processing your deposit.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

export default deposit;
