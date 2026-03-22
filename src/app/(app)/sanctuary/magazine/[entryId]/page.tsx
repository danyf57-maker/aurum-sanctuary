import { redirect } from 'next/navigation';

export default function MagazineEntryPage({
  params,
}: {
  params: { entryId: string };
}) {
  redirect(`/sanctuary/entry/${params.entryId}`);
}
