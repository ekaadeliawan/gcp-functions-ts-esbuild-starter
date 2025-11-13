const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Fungsi untuk membuat direktori jika belum ada
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// Fungsi untuk menyalin file dengan transformasi JSON jika diperlukan
function copyFile(src, dest, transform = null) {
  try {
    if (!fs.existsSync(src)) {
      console.error(`❌ File sumber tidak ditemukan: ${src}`)
      return false
    }

    const content = fs.readFileSync(src, 'utf8')
    const destContent = transform ? transform(content) : content
    fs.writeFileSync(dest, destContent)
    console.log(`✅ File disalin: ${src} -> ${dest}`)

    // Validasi apakah file berhasil disalin
    if (fs.existsSync(dest)) {
      const stats = fs.statSync(dest)
      console.log(
        `✓ Validasi berhasil: File ${dest} berukuran ${stats.size} bytes`
      )

      // Untuk .env file, tampilkan beberapa baris pertama
      if (dest.endsWith('.env')) {
        const content = fs.readFileSync(dest, 'utf8')
        const firstLines = content.split('\n').slice(0, 3).join('\n')
        console.log(`📄 Isi awal file .env: \n${firstLines}\n...`)
      }

      return true
    } else {
      console.error(
        `❌ Validasi gagal: File ${dest} tidak ditemukan setelah penyalinan`
      )
      return false
    }
  } catch (error) {
    console.error(
      `❌ Error saat menyalin file ${src} -> ${dest}:`,
      error
    )
    return false
  }
}

// Fungsi untuk menyalin file-file yang dibutuhkan untuk deployment
function copyFilesForDeployment(functionName) {
  const distDir = path.resolve(process.cwd(), `dist/${functionName}`)
  ensureDir(distDir)

  // Salin package.json dengan transformasi
  const packageSrc = path.resolve(process.cwd(), 'package.json') // Baca package.json utama
  const packageDest = path.resolve(distDir, 'package.json')

  copyFile(packageSrc, packageDest, content => {
    const mainPackageJson = JSON.parse(content)
    const deployPackageJson = {
      name: `${mainPackageJson.name}-${functionName}`, // Tambahkan suffix nama module
      version: mainPackageJson.version,
      engines: mainPackageJson.engines,
      dependencies: mainPackageJson.dependencies,
      main: 'index.js',
      types: 'index.d.ts',
    }
    return JSON.stringify(deployPackageJson, null, 2)
  })

  // Salin file-file lain yang dibutuhkan
  const filesToCopy = [
    { src: '.env.prod', dest: '.env' },
    { src: '.npmrc', dest: '.npmrc' },
    { src: '.gcloudignore', dest: '.gcloudignore' },
  ]

  filesToCopy.forEach(({ src, dest }) => {
    const srcPath = path.resolve(process.cwd(), src)
    const destPath = path.resolve(distDir, dest)

    if (fs.existsSync(srcPath)) {
      copyFile(srcPath, destPath)
    } else {
      console.warn(`⚠️ File tidak ditemukan: ${srcPath}`)
    }
  })
}

// Eksekusi berdasarkan argumen
const args = process.argv.slice(2)
const functionName = args[0]

if (!functionName) {
  console.error(
    '❌ Harap tentukan nama function (ticket, seller, agent atau team)'
  )
  process.exit(1)
}

console.log(`🚀 Menyalin file-file untuk deployment: ${functionName}`)
copyFilesForDeployment(functionName)
// Validasi shared folder
// validateSharedFolder(functionName)
console.log('✨ Selesai menyalin file-file!')
