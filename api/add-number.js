const { Octokit } = require("@octokit/rest");
const { Buffer } = require("buffer");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = 'Xayztech';
const repo = 'DataMB';
const path = 'MainMB.json';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { number } = req.body;

    const { data: fileData } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    const content = Buffer.from(fileData.content, 'base64').toString('utf8');
    const database = JSON.parse(content);

    database.push(number);

    const updatedContent = Buffer.from(JSON.stringify(database, null, 2)).toString('base64');

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Feat: Add number ${number}`,
      content: updatedContent,
      sha: fileData.sha,
    });

    res.status(200).json({ message: 'Nomor berhasil ditambahkan!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan.', error: error.message });
  }
};
