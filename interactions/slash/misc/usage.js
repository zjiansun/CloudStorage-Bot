const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { JsonDB, Config } = require('node-json-db');
const fs = require('fs');
const request = require('request');
var db = new JsonDB(new Config("database", true, false, '/'));

module.exports = {
	// The data needed to register slash commands to Discord.

	data: new SlashCommandBuilder()
		.setName("usage")
		.setDescription(
			"View your file usage"
		),

	async execute(interaction) {
		await interaction.deferReply();
        const data = await getDataFromDB(interaction.user.id);
        if (data == undefined){
            const noFiles = new EmbedBuilder()
            .setTitle("No Files!")
            .setDescription("You have no files uploaded!")
            .setColor('Red')
            .setTimestamp()
            interaction.editReply({ embeds: [noFiles] })
        }else{
            var totalFileSize = 0;
            let fileString = "";
			for (var i = 0; i < Object.keys(data).length; i++){
				totalFileSize += parseFloat(data[Object.keys(data)[i]].fileSize);
                fileString += `\nName: ${data[Object.keys(data)[i]].fileName} | Code: ${Object.keys(data)[i]} | Size: ${data[Object.keys(data)[i]].fileSize} MB`
			}
            const files = new EmbedBuilder()
            .setTitle("Storage Usage")
            .setDescription("Here is your storage usage! No limit is being enforced at the moment, but don't abuse it!")
            .setColor('Green')
            .addFields(
                { name: "Total Files", value: `${Object.keys(data).length}`, inline: true },
                { name: "Total File Size", value: `${totalFileSize}` + " MB", inline: true },
                { name: "Files", value: '```' + fileString + '```' }
            )
            .setTimestamp()
            await interaction.editReply({ embeds: [files] })
        }
	},
};

//write an async function that pushes the file info to the userDB
async function writeToDB(userID, fileName, fileLink, fileSize, timestamp){
	await db.push(`/${userID}/${generateCode()}`, {fileName: fileName, fileLink: fileLink, fileSize: fileSize, timestamp: timestamp}, true);
}

async function getDataFromDB(userID){
	return await db.getData(`/${userID}`);
}