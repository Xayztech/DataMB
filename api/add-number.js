// Mengimpor library yang dibutuhkan
const { Octokit } = require("@octokit/rest");
const { Buffer } = require("buffer");

// Inisialisasi Octokit dengan token dari Environment Variable
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Detail repository kamu
const owner = 'NAMA_USER_GITHUB_ANDA'; // <-- Ganti dengan username GitHub kamu
const repo = 'database-project';      // <-- Ganti dengan nama repository kamu
const path = 'database.json';

// Fungsi utama yang akan dijalankan Vercel
module.exports = async (req, res) => {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { number } = req.body;

    // 1. Ambil konten file yang ada saat ini dari GitHub
    const { data: fileData } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    // 2. Decode konten file (dari Base64 ke string) dan parse menjadi JSON
    const content = Buffer.from(fileData.content, 'base64').toString('utf8');
    const database = JSON.parse(content);

    // 3. Tambahkan nomor baru ke dalam array
    const newEntry = { number: number, status: "active" };
    database.push(newEntry);

    // 4. Ubah kembali array menjadi string JSON dan encode ke Base64
    const updatedContent = Buffer.from(JSON.stringify(database, null, 2)).toString('base64');

    // 5. Update file di GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Feat: Add number ${number}`, // Pesan commit
      content: updatedContent,
      sha: fileData.sha, // SHA dari file lama, wajib untuk update
    });

    res.status(200).json({ message: 'Nomor berhasil ditambahkan!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan.', error: error.message });
  }
};
