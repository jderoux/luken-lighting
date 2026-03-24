export default function AdminDocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-light tracking-widest uppercase mb-2">
          Documents
        </h1>
        <p className="text-gray-600">
          Manage product documents and assets
        </p>
      </div>

      <div className="bg-white border border-gray-200 p-8">
        <div className="space-y-4">
          <p className="text-gray-600">
            This section will allow you to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Upload product images</li>
            <li>Upload technical datasheets (PDF)</li>
            <li>Upload photometric files (IES/LDT)</li>
            <li>Upload installation manuals</li>
            <li>Upload CAD/3D files</li>
            <li>Associate documents with specific products</li>
          </ul>
          <p className="text-sm text-gray-500 mt-6">
            To implement: Create upload form that stores files in Supabase Storage 
            and creates records in the product_assets table.
          </p>
        </div>
      </div>
    </div>
  );
}

