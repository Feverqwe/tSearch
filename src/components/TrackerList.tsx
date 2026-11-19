import {ResizableBox} from 'react-resizable';
import type {ReactNode} from 'react';

interface TrackerListProps {
  height: number;
  onResize: (height: number) => void;
  children: ReactNode;
}

export default function TrackerList({height, onResize, children}: TrackerListProps) {
  return (
    <ResizableBox
      onResizeStop={(_event, {size}) => onResize(size.height)}
      width={Infinity}
      height={height}
      axis="y"
      minConstraints={[0, 56]}
    >
      <div className="tracker__list">{children}</div>
    </ResizableBox>
  );
}
