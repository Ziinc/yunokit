export interface DemoProps<K extends React.FC<unknown>> {
  Component: K;
  props?: React.ComponentProps<K>;
}
