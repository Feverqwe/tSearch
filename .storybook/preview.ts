import type {Preview} from '@storybook/react-vite';

import {setDocumentTheme} from '../src/ui/theme';

import messages from '../src/_locales/en/messages.json';

import '../src/assets/css/index.less';

const labels: Record<string, {message: string}> = messages;

Object.defineProperty((window.chrome ??= {} as typeof chrome), 'i18n', {
  value: {
    getMessage: (name: string, values: string[] = []) =>
      (labels[name]?.message ?? '').replace(
        /\$(\d+)/g,
        (_, index) => values[Number(index) - 1] ?? '',
      ),
    getUILanguage: () => 'en',
  },
  configurable: true,
});

const preview: Preview = {
  parameters: {layout: 'centered'},
  globalTypes: {
    theme: {
      description: 'tSearch appearance',
      toolbar: {icon: 'mirror', items: ['light', 'dark'], dynamicTitle: true},
    },
  },
  initialGlobals: {theme: 'light'},
  decorators: [
    (Story, context) => {
      setDocumentTheme(context.globals.theme === 'dark' ? 'dark' : 'light');
      return Story();
    },
  ],
};

export default preview;
