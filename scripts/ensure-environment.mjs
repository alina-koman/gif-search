import { access, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const environmentPath = join(projectRoot, 'src/environments/environment.ts');
const examplePath = join(projectRoot, 'src/environments/environment.example.ts');

try {
  await access(environmentPath);
} catch {
  const example = await readFile(examplePath, 'utf8');
  const configuredApiKey = process.env['GIPHY_API_KEY'];
  if (!configuredApiKey?.trim()) {
    throw new Error(
      'GIPHY_API_KEY is missing. Configure it in your deployment environment before building.',
    );
  }

  const apiKey = JSON.stringify(configuredApiKey);
  const environment = example.replace(
    /giphyApiKey:\s*'YOUR_GIPHY_API_KEY_HERE'/,
    `giphyApiKey: ${apiKey}`,
  );

  await writeFile(environmentPath, environment, { flag: 'wx' });
  console.info('Created local Angular environment configuration.');
}
