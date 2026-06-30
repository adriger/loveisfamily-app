import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import type { RootStackParams } from './index';

export const navigationRef = createNavigationContainerRef<RootStackParams>();

export function navigateToMatches() {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.navigate({
      name: 'Main',
      params: {
        screen: 'Home',
        params: { screen: 'Matches' },
      },
    }),
  );
}
