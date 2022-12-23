const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { JsonDB, Config } = require('node-json-db');
const fs = require('fs');
const request = require('request');
var db = new JsonDB(new Config("database", true, false, '/'));

module.exports = {
	// The data needed to register slash commands to Discord.

	data: new SlashCommandBuilder()
		.setName("view")
		.setDescription(
			"View details about a file"
		)
        .addStringOption(option => option.setName('code').setDescription('The code of the file you want to view').setRequired(true)),

	async execute(interaction) {
		await interaction.deferReply();
        var code = interaction.options.getString('code');
        try {
            var data = await getDataFromDB(`${interaction.user.id}/${code}`);
            let fileLink = data.fileLink;
            let fileName = data.fileName;
            let fileSize = data.fileSize;
            //send the file details as an embed
            const fileDetails = new EmbedBuilder()
            .setTitle("File Details")
            .setDescription("Here are the details of the file you requested!")
            .setColor('Green')
            .addFields(
                { name: "File Name", value: `${fileName}`, inline: true },
                { name: "File Size", value: `${fileSize}` + " MB", inline: true },
                { name: "File Link", value: fileLink }
            )
            .setFooter({ text: "Use /usage to view all your files and their code!"})
            .setTimestamp()
            interaction.editReply({ embeds: [fileDetails] })

        } catch(error) {
            // The error will tell you where the DataPath stopped. In this case test1
            // Since /test1/test does't exist.
            const noFiles = new EmbedBuilder()
            .setTitle("File does not exist!")
            .setDescription("You have no files associated with the code you provided!")
            .addFields(
                { name: "Code Provided", value: '`'+code+'`' }
            )
            .setFooter({ text: "Use /usage to view all your files and their code!"})
            .setColor('Red')
            .setTimestamp()
            interaction.editReply({ embeds: [noFiles] })
            console.error("FILE NOT FOUND");
        };

	},
};

//write an async function that pushes the file info to the userDB
async function writeToDB(userID, fileName, fileLink, fileSize, timestamp){
	await db.push(`/${userID}/${generateCode()}`, {fileName: fileName, fileLink: fileLink, fileSize: fileSize, timestamp: timestamp}, true);
}

async function getDataFromDB(userID){
	return await db.getData(`/${userID}`);
}