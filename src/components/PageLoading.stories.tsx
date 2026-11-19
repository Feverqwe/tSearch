import type {Meta, StoryObj} from '@storybook/react-vite';

import PageLoading from './PageLoading';

const meta = {
  title: 'Navigation/Page loading',
  component: PageLoading,
  parameters: {layout: 'fullscreen'},
} satisfies Meta<typeof PageLoading>;
export default meta;

export const Default: StoryObj<typeof meta> = {};
