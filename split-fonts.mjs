import { fontSplit, StaticWasm } from 'cn-font-split/dist/wasm/index.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const RAW_DIR = './rawfonts';
const OUT_DIR = './fonts';

if (!fs.existsSync(RAW_DIR)) {
  fs.mkdirSync(RAW_DIR);
  console.log('找不到 rawfonts 文件夹');
  process.exit(1);
}

async function processAllFonts() {
  console.log('开始字体切割任务\n');

  const wasmPath = path.join(
    __dirname,
    'node_modules',
    'cn-font-split',
    'dist',
    'libffi-wasm32-wasip1.wasm',
  );
  if (!fs.existsSync(wasmPath)) {
    console.error('找不到 wasm 文件');
    process.exit(1);
  }

  const wasmBuffer = fs.readFileSync(wasmPath);
  const wasm = new StaticWasm(wasmBuffer);

  const roles = fs
    .readdirSync(RAW_DIR)
    .filter((file) => fs.statSync(path.join(RAW_DIR, file)).isDirectory());
  let globalCssImports = '/* 自动生成的字体入口文件 */\n\n';

  for (const role of roles) {
    const roleDir = path.join(RAW_DIR, role);
    const fontFiles = fs.readdirSync(roleDir).filter((f) => /\.(ttf|otf|woff2?)$/i.test(f));

    for (const fontFile of fontFiles) {
      const fontName = path.parse(fontFile).name;
      const inputPath = path.join(roleDir, fontFile);
      const outputPath = path.join(OUT_DIR, role, fontName);

      console.log(`正在处理 [${role}] 的字体: ${fontName} ...`);
      const buffer = new Uint8Array(fs.readFileSync(inputPath).buffer);

      const resultFiles = await fontSplit(
        {
          input: buffer,
          outDir: outputPath,
          css: { fontFamily: fontName, fontDisplay: 'swap' },
          autoSubset: true,
          testHtml: false,
          reporter: false,
          silent: true,
        },
        wasm.WasiHandle,
      );

      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }

      for (const file of resultFiles) {
        const finalPath = path.join(outputPath, file.name);
        fs.writeFileSync(finalPath, file.data);
      }

      globalCssImports += `@import url('./${role}/${fontName}/result.css');\n`;
    }
    console.log(`角色 [${role}] 处理完成！\n`);
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'index.css'), globalCssImports);
  console.log('所有字体切割完成！');
}

processAllFonts();
