export default function AdminPricesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-light tracking-widest uppercase mb-2">
          Price Lists
        </h1>
        <p className="text-gray-600">
          Manage pricing for different markets and customer types
        </p>
      </div>

      <div className="bg-white border border-gray-200 p-8">
        <div className="space-y-4">
          <p className="text-gray-600">
            This section will allow you to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Create multiple price lists (e.g., Retail, Trade, Regional)</li>
            <li>Set prices per product for each list</li>
            <li>Define currency and validity periods</li>
            <li>Manage bulk price updates</li>
          </ul>
          <p className="text-sm text-gray-500 mt-6">
            To implement: Create interfaces for managing price_lists and product_prices tables.
          </p>
        </div>
      </div>
    </div>
  );
}

