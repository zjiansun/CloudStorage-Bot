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
		),

	async execute(interaction) {
		interaction.deferReply();
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
			if (((file.size)*0.000001).toFixed(0) > 8){
					//CHECKS IF FILE IS TOO LARGE
					const oversizeFile = new EmbedBuilder()
					.setTitle("File Too Large!")
					.setDescription("The file you are trying to upload is too large! (Max 8MB)")
					.addFields(
						{ name: "Limit Size", value: "8MB", inline: true },
						{ name: "File Size", value: ((file.size)*0.000001).toFixed(0) + "MB", inline: true },
					)
					.setFooter({ text: "Premium feature coming soon (Limit 25MB)" })
					.setColor('Red')
					.setTimestamp()
					interaction.editReply({ embeds: [oversizeFile] })

				}else if(isValidURL(body) == false){
					//CHECKS IF FILE IS NOT A VALID URL
					const invalidFile = new EmbedBuilder()
					.setTitle("Invalid File!")
					.setDescription("The file you are trying to upload is not an accepted file!")
					.setColor('Orange')
					.addFields(
						{ name: "File Name", value: `${file.name}`, inline: true },
						{ name: "File Type", value: `${file.contentType}`, inline: true },
						{ name: "Disallowed File Types", value: '```' + 'application/x-dosexec\n application/x-executable\n application/x-sharedlib\n application/x-hdf5\n application/java-archive\n application/vnd.android.package-archive' + '```'},
					)
					.setTimestamp()
					interaction.editReply({ embeds: [invalidFile] })

				}else{
					//SUCCESSIVELY UPLOADS THE FILE TO CLOUD STORAGE
				const successEmbed = new EmbedBuilder()
				.setTitle("File Uploaded!")
				.setDescription("Your attachment has been successfully uploaded to Cloud Storage!")
				.setColor('Green')
				.addFields(
				{ name: ":page_facing_up: File", value: `[${file.name}](${body})`, inline: true },
				{ name: ":file_folder: File Type", value: file.contentType, inline: true },
				{ name: ":file_cabinet: File Size", value: ((file.size)*0.000001).toFixed(2) + "MB", inline: true },
				{ name: ":link: Sharing Link:", value: body, inline: true}
				)
				.setTimestamp()
				.setFooter({ text: "Cloud Storage" });
				interaction.editReply({ embeds: [successEmbed] }).catch((err) => {
					console.log(err);
					interaction.followUp({ content: "There was an error uploading your file!" })
				});
				}

		});
	},
};

function isValidURL(str) {
	try {
	  new URL(str);
	  return true;
	} catch (_) {
	  return false;
	}
  }
  