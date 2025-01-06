import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { Command } from '../../interfaces/Command';
import { withdrawMoney, getOrCreateProfile } from '../../utils/profileHandler';
import { formatCurrency } from '../../utils/formatters';

const withdraw: Command = {
    data: new SlashCommandBuilder()
        .setName('withdraw')
        .setDescription('Withdraw money from your bank account')
        .addStringOption(option =>
            option
                .setName('amount')
                .setDescription('Amount to withdraw (use "all" to withdraw everything)')
                .setRequired(true)
        ) as SlashCommandBuilder,

    async execute(interaction) {
        try {
            const profile = await getOrCreateProfile(interaction.user.id, interaction.user.username);
            const amountInput = interaction.options.getString('amount', true);
            
            let amount: number;
            if (amountInput.toLowerCase() === 'all') {
                amount = profile.economy.bank_balance;
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

            const result = await withdrawMoney(interaction.user.id, amount);

            if (!result.success) {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Withdrawal Failed')
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
                .setTitle('💰 Withdrawal Successful!')
                .setDescription(`Successfully withdrew ${formatCurrency(amount)}`)
                .addFields(
                    { name: '💳 Wallet Balance', value: formatCurrency(result.newWalletBalance!), inline: true },
                    { name: '🏦 Bank Balance', value: formatCurrency(result.newBankBalance!), inline: true }
                )
                .setFooter({ text: 'MollyBot Economy System' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in withdraw command:', error);
            await interaction.reply({
                content: 'There was an error processing your withdrawal.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

export default withdraw;
