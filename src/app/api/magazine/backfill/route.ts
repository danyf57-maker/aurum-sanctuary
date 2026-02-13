import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth, db } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { logger } from '@/lib/logger/safe';

function stripImageMarkdown(content: string) {
  return content
    .replace(/!\[[^\]]*]\(([^)]+)\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateTitle(content: string) {
  const words = content.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'Entree';
  return words.slice(0, 8).join(' ') + (words.length > 8 ? '...' : '');
}

function generateExcerpt(content: string, maxLength = 170) {
  const plain = stripImageMarkdown(content);
  if (!plain) return '';
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trim()}...`;
}

export async function POST() {
  try {
    const sessionCookie = (await cookies()).get('__session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const userId = decoded.uid;

    const entriesSnap = await db
      .collection('users')
      .doc(userId)
      .collection('entries')
      .orderBy('createdAt', 'desc')
      .get();

    let processed = 0;
    const batch = db.batch();

    for (const docSnap of entriesSnap.docs) {
      const entry = docSnap.data() as {
        encryptedContent?: string;
        content?: string;
        images?: Array<{ url?: string }>;
        tags?: string[];
        mood?: string;
        sentiment?: string;
        createdAt?: Timestamp;
      };

      const isEncrypted = Boolean(entry.encryptedContent);
      const rawContent = entry.content || '';
      const title = isEncrypted ? 'Entree privee' : generateTitle(stripImageMarkdown(rawContent));
      const excerpt = isEncrypted ? 'Entree chiffree • Contenu prive' : generateExcerpt(rawContent);
      const coverImageUrl = Array.isArray(entry.images) ? entry.images[0]?.url || null : null;
      const createdAt = entry.createdAt || Timestamp.now();

      const issueRef = db
        .collection('users')
        .doc(userId)
        .collection('magazineIssues')
        .doc(docSnap.id);

      batch.set(
        issueRef,
        {
          entryId: docSnap.id,
          title,
          excerpt,
          coverImageUrl,
          tags: Array.isArray(entry.tags) ? entry.tags : [],
          mood: entry.mood || null,
          sentiment: entry.sentiment || null,
          createdAt,
          publishedAt: createdAt,
          updatedAt: Timestamp.now(),
        },
        { merge: true },
      );

      processed += 1;
    }

    await batch.commit();

    return NextResponse.json({ ok: true, processed });
  } catch (error) {
    logger.errorSafe('magazine backfill failed', error);
    return NextResponse.json({ error: 'Backfill impossible' }, { status: 500 });
  }
}
