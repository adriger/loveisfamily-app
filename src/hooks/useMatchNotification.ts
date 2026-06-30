import { useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface MatchNotif {
  type: 'new_request' | 'mutual_match';
  matchId: string;
  otherUserId: string;
}

export function useMatchNotification(uid: string | null, onNotif: (n: MatchNotif) => void) {
  const seen = useRef<Set<string>>(new Set());
  const onNotifRef = useRef(onNotif);
  onNotifRef.current = onNotif;

  useEffect(() => {
    if (!uid) return;

    // Incoming requests (I'm user2, status pending)
    let pendingReady = false;
    const unsubPending = onSnapshot(
      query(collection(db, 'matches'), where('user2_id', '==', uid), where('status', '==', 'pending')),
      snap => {
        if (!pendingReady) {
          pendingReady = true;
          snap.docs.forEach(d => seen.current.add(d.id));
          return;
        }
        snap.docChanges().forEach(c => {
          if (c.type === 'added' && !seen.current.has(c.doc.id)) {
            seen.current.add(c.doc.id);
            onNotifRef.current({ type: 'new_request', matchId: c.doc.id, otherUserId: c.doc.data().user1_id });
          }
        });
      },
      () => {},
    );

    // Mutual matches where I'm user1 (I sent the request, other accepted)
    let mutual1Ready = false;
    const unsubMutual1 = onSnapshot(
      query(collection(db, 'matches'), where('user1_id', '==', uid), where('status', '==', 'mutual_match')),
      snap => {
        if (!mutual1Ready) {
          mutual1Ready = true;
          snap.docs.forEach(d => seen.current.add(d.id));
          return;
        }
        snap.docChanges().forEach(c => {
          if (!seen.current.has(c.doc.id)) {
            seen.current.add(c.doc.id);
            onNotifRef.current({ type: 'mutual_match', matchId: c.doc.id, otherUserId: c.doc.data().user2_id });
          }
        });
      },
      () => {},
    );

    // Mutual matches where I'm user2 (I accepted)
    let mutual2Ready = false;
    const unsubMutual2 = onSnapshot(
      query(collection(db, 'matches'), where('user2_id', '==', uid), where('status', '==', 'mutual_match')),
      snap => {
        if (!mutual2Ready) {
          mutual2Ready = true;
          snap.docs.forEach(d => seen.current.add(d.id));
          return;
        }
        snap.docChanges().forEach(c => {
          if (!seen.current.has(c.doc.id)) {
            seen.current.add(c.doc.id);
            onNotifRef.current({ type: 'mutual_match', matchId: c.doc.id, otherUserId: c.doc.data().user1_id });
          }
        });
      },
      () => {},
    );

    return () => { unsubPending(); unsubMutual1(); unsubMutual2(); };
  }, [uid]);
}
