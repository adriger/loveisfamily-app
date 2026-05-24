import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuthStore } from '../store/authStore';

export function useUnreadCount() {
  const { firebaseUser } = useAuthStore();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;
    const ref = collection(db, 'conversations');

    const q1 = query(ref, where('participant1_id', '==', uid), where('unread_count_p1', '>', 0));
    const q2 = query(ref, where('participant2_id', '==', uid), where('unread_count_p2', '>', 0));

    let c1 = 0, c2 = 0;
    const u1 = onSnapshot(q1, snap => { c1 = snap.size; setCount(c1 + c2); });
    const u2 = onSnapshot(q2, snap => { c2 = snap.size; setCount(c1 + c2); });

    return () => { u1(); u2(); };
  }, [firebaseUser]);

  return count;
}
