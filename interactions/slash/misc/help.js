const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const fs = require('fs');
const request = require('request');

module.exports = {
	// The data needed to register slash commands to Discord.

	data: new SlashCommandBuilder()
		.setName("upload")
		.setDescription(
			"Upload a file to Cloud Storage"
		)
		.addAttachmentOption((option) =>
			option.setName("file").setDescription("The file to upload").setRequired(true)
		)
		.addStringOption(option =>
			option.setName('randomize file name')
				.setDescription('Randomize file name?')
				.setRequired(true)
				.addChoices(
					{ name: 'Yes (recommended)', value: 'yes' },
					{ name: 'No', value: 'no' },
		)),

	async execute(interaction) {
		const file = interaction.options.getAttachment("file");
		console.log(file.contentType)
		const options = {
			method: 'POST',
			formData: {
			  url: file.url,
			  secret: ''
			},
			url: 'https://0x0.st'
		  };
		request(options, (error, response, body) => {
			if (error) {
				console.error(error);
			} else {
				//SUCCESSIVELY UPLOADS THE FILE TO CLOUD STORAGE
				const embed = new EmbedBuilder()
				.setTitle("File Uploaded!")
				.setDescription("Your attachment has been successfully uploaded to Cloud Storage!")
				.setColor('Green')
				.setURL(body)
				.addFields(
				{ name: "File", value: `[${file.name}](${body})`, inline: true },
				{ name: "File Type", value: file.contentType, inline: true },
				{ name: "File Size", value: ((file.size)*0.000001).toFixed(2) + "MB", inline: true },
				)
				.setTimestamp()
				.setFooter({ text: "Cloud Storage" });
				interaction.reply({ embeds: [embed] });
			}
		});
	},
};