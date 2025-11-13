// esbuild.dts.js
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

/**
 * Fungsi untuk menghasilkan file .d.ts menggunakan tsc
 * @param {string} functionName - Nama function (ticket atau seller)
 */
function generateDts(functionName) {
  try {
    console.log(
      `🔍 Menghasilkan type definitions untuk ${functionName}...`
    )

    // Buat tsconfig temporary untuk function ini
    const tsConfigPath = path.resolve(
      process.cwd(),
      `tsconfig.${functionName}.temp.json`
    )
    const tsConfigContent = {
      extends: './tsconfig.json',
      compilerOptions: {
        rootDir: './src',
        outDir: path.resolve(process.cwd(), `dist/${functionName}`),
        declaration: true,
        emitDeclarationOnly: true,
        paths: {
          '~/*': ['./src/*'],
          '~config/*': ['./src/shared/config/*'],
          '~utils/*': ['./src/shared/utils/*'],
        },
      },
      include: [`src/${functionName}/**/*`, 'src/shared/**/*'],
    }

    // Tulis tsconfig temporary
    fs.writeFileSync(
      tsConfigPath,
      JSON.stringify(tsConfigContent, null, 2)
    )

    // Jalankan tsc untuk menghasilkan .d.ts
    // Gunakan path relatif ke node_modules/.bin/tsc
    const tscPath = path.resolve(
      process.cwd(),
      'node_modules',
      '.bin',
      'tsc'
    )
    execSync(`${tscPath} -p ${tsConfigPath}`, { stdio: 'inherit' })

    // Hapus tsconfig temporary
    fs.unlinkSync(tsConfigPath)

    console.log(
      `✅ Type definitions untuk ${functionName} berhasil dihasilkan`
    )
  } catch (error) {
    console.error(
      `❌ Gagal menghasilkan type definitions untuk ${functionName}:`,
      error
    )
    process.exit(1)
  }
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

generateDts(functionName)
