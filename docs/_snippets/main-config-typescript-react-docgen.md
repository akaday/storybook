```ts filename=".storybook/main.ts" renderer="react" language="ts"
// Replace your-framework with the framework you are using (e.g., react-webpack5, react-vite)
import type { StorybookConfig } from '@storybook/your-framework';

const config: StorybookConfig = {
  framework: '@storybook/your-framework',
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  typescript: {
    reactDocgen: 'react-docgen',
  },
};

export default config;
```
