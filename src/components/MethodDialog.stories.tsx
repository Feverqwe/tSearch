import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, waitFor, within} from 'storybook/test';

import MethodDialog from './MethodDialog';

import '../assets/css/magic.less';

const meta = {
  title: 'Editors/Transformations',
  component: MethodDialog,
  args: {fieldTitle: 'Title', steps: [], onClose: fn(), onSubmit: fn()},
} satisfies Meta<typeof MethodDialog>;
export default meta;

export const Empty: StoryObj<typeof meta> = {};
export const InvalidArgument: StoryObj<typeof meta> = {
  globals: {theme: 'dark'},
  args: {steps: [{name: 'replaceRe', args: ['[', '']}]},
  play: async ({args, canvasElement}) => {
    const dialog = within(canvasElement.ownerDocument.body).getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', {name: 'Save'}));
    await expect(
      await within(dialog).findByText(
        'Enter a valid regular expression without surrounding slashes.',
      ),
    ).toBeVisible();
    await expect(within(dialog).getByLabelText('Pattern')).toHaveAttribute('aria-invalid', 'true');
    await expect(within(dialog).getByLabelText('Pattern')).toHaveFocus();
    await expect(args.onSubmit).not.toHaveBeenCalled();
  },
};

export const LongChainAndHelp: StoryObj<typeof meta> = {
  args: {
    steps: [
      {name: 'getText'},
      {name: 'trim'},
      {name: 'replace', args: ['A long tracker label that wraps in narrow panels', 'Short']},
      {name: 'replaceRe', args: ['\\s+', ' ']},
      {name: 'trim'},
      {name: 'replace', args: ['Short', 'Release']},
      {name: 'trim'},
    ],
  },
  play: async ({args, canvasElement}) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = body.getByRole('dialog', {name: /Transformations.*Title/i});
    const form = within(dialog);
    const pattern = form.getAllByLabelText('Pattern')[0];
    await userEvent.clear(pattern);
    await userEvent.type(pattern, 'Draft label');
    const opener = form.getByRole('button', {name: 'Transformation help'});
    await userEvent.click(opener);
    const help = body.getByRole('dialog', {name: 'Transformation help'}) as HTMLDialogElement;
    await expect(help).toBeVisible();
    help.requestClose();
    await waitFor(() => expect(opener).toHaveFocus());
    await expect(pattern).toHaveValue('Draft label');
    const regexHelp = form.getAllByRole('button', {name: /^Help — Pattern$/})[1];
    await userEvent.click(regexHelp);
    const argumentHelp = body.getByRole('dialog', {
      name: /^Pattern$/,
    }) as HTMLDialogElement;
    await expect(argumentHelp).toHaveAccessibleDescription(/regular expression/);
    await expect(within(argumentHelp).getByRole('heading', {name: 'Example'})).toBeVisible();
    argumentHelp.requestClose();
    await waitFor(() => expect(regexHelp).toHaveFocus());
    await userEvent.click(form.getAllByRole('button', {name: /move.*up|move.*earlier/i})[2]);
    await userEvent.click(form.getByRole('button', {name: 'Save'}));
    await expect(args.onSubmit).toHaveBeenCalledWith([
      args.steps[0],
      {name: 'replace', args: ['Draft label', 'Short']},
      ...args.steps.slice(1, 2),
      ...args.steps.slice(3),
    ]);
  },
};
