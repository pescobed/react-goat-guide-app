import { useEffect, useState } from "react";
import { Link } from "react-router";

export default function AdminSelect() {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    fetch("/api/resources")
      .then((res) => res.json())
      .then((data) => setResources(data));
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Select a Resource to Edit</h1>
      <div className="grid gap-4">
        {resources.map((r: any) => (
          <Link 
            key={r.id} 
            to={`/admin/edit/${r.id}`}
            className="p-4 bg-white border rounded-lg hover:border-blue-500 flex justify-between items-center shadow-sm"
          >
            <span className="font-medium">{r.resource_name}</span>
            <span className="text-blue-600 text-sm">Edit →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}