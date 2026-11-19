import type {ReactNode} from 'react';
import {Group, Panel, Separator} from 'react-resizable-panels';
import './verticalSplit.less';

interface VerticalSplitProps {
  top: ReactNode;
  bottom: ReactNode;
  initialTopPercent: number;
  separatorLabel: string;
  onResize: (topPercent: number) => void;
  orientation?: 'vertical' | 'horizontal';
  minSize?: number | string;
  collapsed?: boolean;
}

export default function VerticalSplit({
  top,
  bottom,
  initialTopPercent,
  separatorLabel,
  onResize,
  orientation = 'vertical',
  minSize = '22%',
  collapsed = false,
}: VerticalSplitProps) {
  const second = 'preview-' + orientation;
  return (
    <Group
      className="ts-vertical-split"
      orientation={orientation}
      defaultLayout={
        collapsed ? {top: 100} : {top: initialTopPercent, [second]: 100 - initialTopPercent}
      }
      onLayoutChanged={(layout, {isUserInteraction, requestedLayout}) => {
        if (!collapsed && isUserInteraction) onResize((requestedLayout ?? layout).top);
      }}
    >
      <Panel id="top" minSize={minSize} className="ts-vertical-split__pane">
        {top}
      </Panel>
      {!collapsed && (
        <Separator aria-label={separatorLabel} className="ts-vertical-split__separator" />
      )}
      {!collapsed && (
        <Panel id={second} key={second} minSize={minSize} className="ts-vertical-split__pane">
          {bottom}
        </Panel>
      )}
    </Group>
  );
}
