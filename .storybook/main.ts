import type {StorybookConfig} from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  framework: {name: '@storybook/react-vite', options: {}},
  core: {disableTelemetry: true, disableWhatsNewNotifications: true},
  features: {menuOnboardingChecklist: false, sidebarOnboardingChecklist: false},
};

export default config;
