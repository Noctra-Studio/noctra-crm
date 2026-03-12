import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { assertSameOrigin } from '@/lib/request-security';
import { requireAdminUser } from '@/lib/admin-auth';

const ALLOWED_REVALIDATE_PATHS = [
  '/',
  '/work',
];

export async function POST(req: NextRequest) {
  if (!assertSameOrigin(req)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  try {
    await requireAdminUser();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path') || '/';
  const isAllowedPath =
    ALLOWED_REVALIDATE_PATHS.includes(path) || path.startsWith('/work/');

  if (!isAllowedPath) {
    return NextResponse.json({ error: 'Path not allowed' }, { status: 400 });
  }

  revalidatePath(path);
  return NextResponse.json({ revalidated: true, path });
}
