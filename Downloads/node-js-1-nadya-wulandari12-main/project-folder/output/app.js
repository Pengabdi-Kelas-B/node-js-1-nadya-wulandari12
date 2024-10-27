const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const app = {};

// Membuat Folder Baru
app.makeFolder = () => {
  rl.question("Masukan Nama Folder : ", (folderName) => {
    fs.mkdir(path.join(__dirname, folderName), (err) => {
      if (err) {
        console.error("failed to create folder:", err);
      } else {
        console.log("success created new folder");
      }
      rl.close();
    });
  });
};

// Membuat File Baru
app.makeFile = () => {
  rl.question("Masukan Nama File : ", (fileName) => {
    rl.question("Masukan Konten File: ", (fileContent) => {
      fs.writeFile(path.join(__dirname, fileName), fileContent, (err) => {
        if (err) {
          console.error("Failed to create file:", err);
        } else {
          console.log("success created new file");
        }
        rl.close();
      });
    });
  });
};

// Merapikan File Berdasarkan Ekstensi
app.extSorter = () => {
  const sourceFolder = path.join(__dirname, "unorganize_folder");
  fs.readdir(sourceFolder, (err, files) => {
    if (err) {
      console.error("Failed to read folder:", err);
      rl.close();
      return;
    }
    files.forEach(file => {
      const ext = path.extname(file).slice(1);
      const destFolder = path.join(__dirname, ext);
      if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder);
      fs.rename(path.join(sourceFolder, file), path.join(destFolder, file), (err) => {
        if (err) console.error("Failed to move file:", err);
      });
    });
    console.log("Files have been organized by extension");
    rl.close();
  });
};

// Membaca Isi Folder dan Menampilkan Detail
app.readFolder = () => {
  rl.question("Masukan Path Folder: ", (folderPath) => {
    fs.readdir(folderPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        console.error("Failed to read folder:", err);
        rl.close();
        return;
      }
      const details = files
        .filter(file => file.isFile()) // Mengecek apakah entry adalah file
        .map(file => {
          const filePath = path.join(folderPath, file.name);
          const stats = fs.statSync(filePath);
          return {
            namaFile: file.name,
            extensi: path.extname(file.name).slice(1),
            jenisFile: getFileType(path.extname(file.name).slice(1)),
            tanggalDibuat: stats.birthtime.toISOString().split("T")[0],
            ukuranFile: (stats.size / 1024).toFixed(1) + "kb"
          };
        })
        .sort((a, b) => new Date(a.tanggalDibuat) - new Date(b.tanggalDibuat));
      
      console.log(`berhasil menampilkan isi dari folder ${folderPath}:`, details);
      rl.close();
    });
  });
};

// Membaca Isi File Teks
app.readFile = () => {
  rl.question("Masukan Nama File: ", (fileName) => {
    fs.readFile(path.join(__dirname, fileName), "utf8", (err, data) => {
      if (err) {
        console.error("Failed to read file:", err.message);
      } else {
        console.log(`Isi dari file ${fileName}:\n\n${data}`);
      }
      rl.close();
    });
  });
};

// Dibuat untuk menentukan jenis file berdasarkan ekstensi
function getFileType(extension) {
  const imageExt = ["jpg", "png", "gif"];
  const textExt = ["txt", "md"];
  if (imageExt.includes(extension)) return "gambar";
  if (textExt.includes(extension)) return "text";
  return "lainnya";
}



module.exports = app;
