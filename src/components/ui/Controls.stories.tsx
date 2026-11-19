import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {expect, userEvent, waitFor, within} from 'storybook/test';

import Dialog from '../Dialog';
import Button from './Button';
import IconButton from './IconButton';
import Field from './Field';
import Tooltip from './Tooltip';

function Controls() {
  const [open, setOpen] = useState(false);
  const [actions, setActions] = useState(0);

  return (
    <div style={{display: 'grid', gap: 8, width: 'min(280px, 85vw)'}}>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <Tooltip text="Edit selected tracker">
        {(props) => (
          <Button {...props} aria-label="Edit">
            ✎
          </Button>
        )}
      </Tooltip>
      <Button aria-pressed="true">Selected</Button>
      <Button busy variant="primary" onClick={() => setActions(actions + 1)}>
        Save
      </Button>
      <IconButton busy label="Refresh" icon="refresh" onClick={() => setActions(actions + 1)} />
      <Button disabled>Save changes</Button>
      {actions > 0 && <p role="alert">A busy action was triggered</p>}
      <Field label="Name">{(props) => <input {...props} className="ts-control" />}</Field>
      <Field label="Address" error="Enter a complete URL">
        {(props) => <input {...props} className="ts-control" defaultValue="https://" />}
      </Field>
      <Field label="Profile" description="Choose which trackers to search.">
        {(props) => (
          <select {...props} className="ts-control">
            <option>Open films with a long descriptive profile name</option>
          </select>
        )}
      </Field>
      {open && (
        <Dialog aria-labelledby="dialog-title" onClose={() => setOpen(false)}>
          <h2 id="dialog-title">Edit tracker</h2>
          <Field label="Name">
            {(props) => (
              <input {...props} className="ts-control" defaultValue="Tracker" autoFocus />
            )}
          </Field>
          <div className="dialog__button_box">
            <Button variant="quiet" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Save
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

const meta = {title: 'Interface/Controls', component: Controls} satisfies Meta<typeof Controls>;
export default meta;

export const Keyboard: StoryObj<typeof meta> = {
  play: async ({canvas, canvasElement}) => {
    const opener = canvas.getByRole('button', {name: 'Open dialog'});
    await opener.focus();
    await userEvent.keyboard('{Tab}');
    await expect(canvas.getByRole('tooltip')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('tooltip')).not.toBeInTheDocument();

    await opener.focus();
    await userEvent.keyboard('{Enter}');
    const dialog = within(canvasElement.ownerDocument.body).getByRole('dialog');
    await expect(within(dialog).getByLabelText('Name')).toHaveFocus();
    (dialog as HTMLDialogElement).requestClose();
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(opener).toHaveFocus();

    const save = canvas.getByRole('button', {name: 'Save'});
    const refresh = canvas.getByRole('button', {name: 'Refresh'});
    for (const button of [save, refresh]) {
      await userEvent.click(button);
      await expect(button).toHaveFocus();
      await expect(button).toHaveAttribute('aria-busy', 'true');
      await userEvent.keyboard('{Enter}[Space]');
    }
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    await userEvent.tab();
    const field = canvas.getByLabelText('Name');
    await expect(field).toHaveFocus();
    await expect(field).toHaveStyle({outlineStyle: 'none'});

    const address = canvas.getByLabelText('Address');
    const errorBorder = getComputedStyle(address).borderTopColor;
    await userEvent.tab();
    await expect(address).toHaveFocus();
    await expect(address).toHaveStyle({borderTopColor: errorBorder, outlineWidth: '1px'});
    await userEvent.tab();
    const select = canvas.getByLabelText('Profile');
    await expect(select).toHaveFocus();
    await expect(select).toHaveStyle({outlineStyle: 'none'});
    await expect(canvas.getByLabelText('Address')).toHaveAccessibleDescription(
      'Enter a complete URL',
    );
  },
};

export const Dark: StoryObj<typeof meta> = {
  ...Keyboard,
  globals: {theme: 'dark'},
};

function BusyControls() {
  const [busy, setBusy] = useState('');
  const [help, setHelp] = useState(false);
  return (
    <div style={{display: 'grid', gap: 8, justifyItems: 'start'}}>
      <Button
        variant="primary"
        icon="folder"
        busy={busy === 'save'}
        onClick={() => setBusy('save')}
      >
        Save tracker
      </Button>
      <IconButton
        label="Refresh preview"
        icon="refresh"
        busy={busy === 'refresh'}
        onClick={() => setBusy('refresh')}
      />
      <Button busyIndicator="inline" busy={busy === 'fetch'} onClick={() => setBusy('fetch')}>
        Fetch page
      </Button>
      <Button onClick={() => setBusy('')}>Finish operation</Button>
      <Field
        label="Address"
        help={<IconButton label="Address help" icon="info" onClick={() => setHelp(true)} />}
      >
        {(props) => (
          <input {...props} className="ts-control" placeholder="https://tracker.example" />
        )}
      </Field>
      {help && (
        <Dialog aria-label="Address help" onClose={() => setHelp(false)}>
          <p>Paste the address of a page with search results.</p>
          <Button onClick={() => setHelp(false)}>Close help</Button>
        </Dialog>
      )}
    </div>
  );
}

export const StableLoading: StoryObj<typeof meta> = {
  render: () => <BusyControls />,
  play: async ({canvas, canvasElement}) => {
    for (const name of ['Save tracker', 'Refresh preview', 'Fetch page']) {
      const control = canvas.getByRole('button', {name});
      const measure = () => [control.offsetWidth, control.offsetHeight];
      const original = measure();
      await userEvent.click(control);
      await expect(control).toHaveFocus();
      await expect(control).toHaveAccessibleName(name);
      await expect(control).toHaveAttribute('aria-busy', 'true');
      await expect(measure()).toEqual(original);
      await userEvent.click(canvas.getByRole('button', {name: 'Finish operation'}));
      await expect(measure()).toEqual(original);
    }
    await expect(canvas.getByRole('textbox', {name: 'Address'})).toBeVisible();
    const help = canvas.getByRole('button', {name: 'Address help'});
    await userEvent.click(help);
    const dialog = within(canvasElement.ownerDocument.body).getByRole('dialog', {
      name: 'Address help',
    });
    await userEvent.click(within(dialog).getByText(/Paste the address/));
    await expect(dialog).toBeVisible();
    (dialog as HTMLDialogElement).requestClose();
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(help).toHaveFocus();
  },
};

export const StableLoadingDark: StoryObj<typeof meta> = {
  ...StableLoading,
  globals: {theme: 'dark'},
};
