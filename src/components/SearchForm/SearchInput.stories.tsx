import {useState} from 'react';

import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn} from 'storybook/test';

import SearchInput, {type SearchInputProps} from './SearchInput';

const meta = {
  component: SearchInput,
  title: 'Search/Search input',
  args: {
    query: '',
    suggestions: [],
    onChange: fn(),
    onSubmit: fn(),
    onRequestSuggestions: fn(),
    onClearSuggestions: fn(),
  },
  render: (args) => <SearchFixture {...args} />,
} satisfies Meta<typeof SearchInput>;
export default meta;

type Story = StoryObj<typeof meta>;

function SearchFixture(args: SearchInputProps) {
  const [query, setQuery] = useState(args.query);
  return (
    <SearchInput
      {...args}
      query={query}
      onChange={(value) => {
        setQuery(value);
        args.onChange(value);
      }}
    />
  );
}

export const Empty: Story = {};

export const WithHistory: Story = {
  args: {suggestions: ['Big Buck Bunny', 'Sintel', 'Tears of Steel']},
  play: async ({canvas, userEvent}) => {
    await userEvent.click(canvas.getByRole('combobox'));
  },
};

export const KeyboardSelection: Story = {
  args: {query: 'Sin', suggestions: ['Sintel', 'Sintel soundtrack']},
  play: async ({args, canvas, userEvent}) => {
    const search = canvas.getByRole('combobox');
    await userEvent.click(search);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await expect(args.onSubmit).toHaveBeenCalledTimes(1);
    await expect(args.onSubmit).toHaveBeenCalledWith('Sintel soundtrack');

    await userEvent.click(search);
    await userEvent.keyboard('{ArrowDown}{Escape}');
    await expect(search).toHaveValue('Sintel soundtrack');
    await expect(search).toHaveAttribute('aria-expanded', 'false');
  },
};
