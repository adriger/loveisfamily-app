import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';
import type { RootStackParams } from './index';

export const navigationRef = createNavigationContainerRef<RootStackParams>();

function navigate(params: Parameters<typeof navigationRef.dispatch>[0]) {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(params);
}

export function navigateToMatches() {
  navigate(CommonActions.navigate({ name: 'Main', params: { screen: 'Home', params: { screen: 'Matches' } } }));
}

export function navigateToChat(conversationId: string, participantId: string, participantName: string, participantPhotoURL?: string) {
  navigate(CommonActions.navigate({
    name: 'Main',
    params: {
      screen: 'ChatTab',
      params: { screen: 'Chat', params: { conversationId, participantId, participantName, participantPhotoURL } },
    },
  }));
}

export function navigateToReservations() {
  navigate(CommonActions.navigate({
    name: 'Main',
    params: { screen: 'Explore', params: { screen: 'MyReservations' } },
  }));
}

export function navigateFromPushData(data: Record<string, string>) {
  if (!data?.type) return;
  switch (data.type) {
    case 'new_message':
      if (data.conversationId && data.participantId)
        navigateToChat(data.conversationId, data.participantId, data.participantName || 'Chat', data.participantPhotoURL);
      break;
    case 'new_match':
    case 'mutual_match':
      navigateToMatches();
      break;
    case 'reservation':
      navigateToReservations();
      break;
  }
}
