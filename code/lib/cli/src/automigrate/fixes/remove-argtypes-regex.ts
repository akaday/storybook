import type { Fix } from '../types';
import * as fs from 'node:fs/promises';
import * as babel from '@babel/core';
import { BabelFile, NodePath } from '@babel/core';
import { babelParse } from '@storybook/csf-tools';
import dedent from 'ts-dedent';
import chalk from 'chalk';

export const removeArgtypesRegex: Fix<{ argTypesRegex: NodePath; previewConfigPath: string }> = {
  id: 'remove-argtypes-regex',
  promptOnly: true,
  async check({ previewConfigPath }) {
    if (!previewConfigPath) return null;

    const previewFile = await fs.readFile(previewConfigPath, { encoding: 'utf-8' });

    // @ts-expect-error File is not yet exposed, see https://github.com/babel/babel/issues/11350#issuecomment-644118606
    const file: BabelFile = new babel.File(
      { filename: previewConfigPath },
      { code: previewFile, ast: babelParse(previewFile) }
    );

    let argTypesRegex;

    file.path.traverse({
      Identifier: (path) => {
        if (path.node.name === 'argTypesRegex') {
          argTypesRegex = path;
        }
      },
    });

    return argTypesRegex ? { argTypesRegex, previewConfigPath } : null;
  },
  prompt({ argTypesRegex, previewConfigPath }) {
    const snippet = dedent`
      import { fn } from '@storybook/test';
      export default {
        args: { onClick: fn() }, // will log to the action panel when clicked
      };`;

    // @ts-expect-error File is not yet exposed, see https://github.com/babel/babel/issues/11350#issuecomment-644118606
    const file: BabelFile = new babel.File(
      { file: 'story.tsx' },
      { code: snippet, ast: babelParse(snippet) }
    );

    let formattedSnippet;
    file.path.traverse({
      Identifier: (path) => {
        if (path.node.name === 'fn') {
          formattedSnippet = path.buildCodeFrameError(``).message;
        }
      },
    });

    return dedent`
      ${chalk.bold('Attention')}: We've detected that you're using argTypesRegex:
      
      ${argTypesRegex.buildCodeFrameError(`${previewConfigPath}`).message}

      In Storybook 8, we recommend removing this regex, and assigning explicit spies with the ${chalk.cyan(
        'fn'
      )} function instead:      
      ${formattedSnippet}
      
      Even if you keep using the argTypesRegex, you will need to above pattern if you want to use spies in your play function.
      Implicit spies (based on a combination of argTypesRegex and docgen) is not supported anymore in Storybook 8.
      
      Use the following command to check for spy usages in your play functions:
       ${chalk.cyan(
         'npx storybook migrate find-implicit-spies --glob="**/*.stories.@(js|jsx|ts|tsx)"'
       )}
       
      Make sure to assign an explicit ${chalk.cyan('fn')} to your args for those usages. 
    `;
  },
};
