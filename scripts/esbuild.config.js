// esbuild.config.js
const { build } = require('esbuild')
const { resolve } = require('path')

// Path alias sesuai dengan tsconfig
// esbuild tidak mendukung alias dengan '~', jadi kita gunakan format yang valid
const pathAliases = {
  '~': resolve(process.cwd(), 'src'),
  '~config': resolve(process.cwd(), 'src/shared/config'),
  '~utils': resolve(process.cwd(), 'src/shared/utils'),
}

// Fungsi untuk membuild satu function
async function buildFunction(entryPoint, outDir) {
  try {
    await build({
      entryPoints: [entryPoint],
      outdir: outDir,
      bundle: true,
      minify: false, // Set true untuk production
      platform: 'node',
      target: 'node22', // Node.js 22 menggunakan ES2022
      format: 'cjs',
      sourcemap: true,
      metafile: true,
      external: [
        // Paket yang tidak perlu dibundle (akan diinstall di deployment)
        '@google-cloud/*',
        'firebase-admin',
        'google-auth-library',
        'googleapis',
      ],
      alias: pathAliases,
      define: {
        'process.env.NODE_ENV': `"${process.env.NODE_ENV || 'development'}"`,
      },
    })

    console.log(`✅ Build sukses: ${entryPoint} -> ${outDir}`)
  } catch (error) {
    console.error(`❌ Build gagal untuk ${entryPoint}:`, error)
    process.exit(1)
  }
}

// Eksekusi build berdasarkan argumen
const args = process.argv.slice(2)
const buildTarget = args[0] || 'all'

;(async () => {
  console.log(`🚀 Memulai build untuk target: ${buildTarget}`)

  if (buildTarget === 'example' || buildTarget === 'all') {
    await buildFunction('src/example/index.ts', 'dist/example')
  }

  console.log('✨ Build selesai!')
})()
