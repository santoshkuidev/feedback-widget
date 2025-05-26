import 'styled-components';
import { WidgetTheme } from './types';

declare module 'styled-components' {
  export interface DefaultTheme extends WidgetTheme {
    position: string;
  }
}
