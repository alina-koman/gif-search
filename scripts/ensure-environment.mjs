import { access, copyFile, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const environmentPath = join(projectRoot, 'src/environments/environment.ts');
const examplePath = join(projectRoot, 'src/environments/environment.example.ts');

try {
  await access(environmentPath);
} catch {
  const example = await readFile(examplePath, 'utf8');
  const apiKey = JSON.stringify(process.env['GIPHY_API_KEY'] ?? '');
  const environment = example.replace(
    /giphyApiKey:\s*'YOUR_GIPHY_API_KEY_HERE'/,
    `giphyApiKey: ${apiKey}`,
  );

  await writeFile(environmentPath, environment, { flag: 'wx' });
  console.info('Created local Angular environment configuration.');
}
