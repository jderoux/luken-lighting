'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { deleteVariant } from '@/app/(admin)/admin/variants/actions';

interface Props {
  variantId: string;
  variantName: string;
}

export function DeleteVariantButton({ variantId, variantName }: Props) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Delete "${variantName}"? This will also remove all associated files. This cannot be undone.`)) {
      return;
    }

    const result = await deleteVariant(variantId);
    if (result.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
      title="Delete"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
