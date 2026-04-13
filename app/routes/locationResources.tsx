import { useParams, Link } from "react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, ChevronRight } from "lucide-react";

export default function LocationResources() {
  const { locationName } = useParams();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/resources")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((r: any) => {
          if (locationName === "Off-Campus") {
            return /^\d/.test(r.location || "");
          }
          return r.location === locationName;
        });
        setResources(filtered);
        setLoading(false);
      });
  }, [locationName]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0F2E6A] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/locations" className="text-gray-300 hover:text-white flex items-center mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Locations
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MapPin className="text-[#EDB920]" />
            {locationName === "Off-Campus" ? "Off-Campus Resources" : locationName}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 -mt-6">
        {loading ? (
          <p className="text-center py-10">Loading resources...</p>
        ) : (
          <div className="grid gap-4">
            {resources.length > 0 ? (
              resources.map((res: any) => (
                <Link
                  key={res.id}
                  to={`/resource/${res.id}`}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center hover:border-[#EDB920] transition-all"
                >
                  <div>
                    <h2 className="text-xl font-bold text-[#0F2E6A]">{res.resource_name}</h2>
                    <p className="text-gray-500 mt-1">{res.description}</p>
                  </div>
                  <ChevronRight className="text-[#EDB920]" />
                </Link>
              ))
            ) : (
              <div className="bg-white p-10 rounded-xl text-center border border-dashed border-gray-300">
                <p className="text-gray-500 italic">No resources found for this location.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}