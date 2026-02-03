import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AdminCoaches = () => {
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);


  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/admin/coach-requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCoaches(res.data.data || []);
    } catch (err) {
      console.error("Fetch coaches error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, []);

  const approveCoach = async (id: number) => {
    const token = localStorage.getItem("token");
    await axios.post(
      `http://localhost:5000/api/admin/coach-requests/${id}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchCoaches();
  };

  const rejectCoach = async (id: number) => {
    const token = localStorage.getItem("token");
    await axios.post(
      `http://localhost:5000/api/admin/coach-requests/${id}/reject`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchCoaches();
  };


  return (
    <>
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Coaches</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading coaches...</p>
          ) : coaches.length === 0 ? (
            <p className="text-muted-foreground">No coaches added yet</p>
          ) : (
            <div className="space-y-3">
              {coaches.map((c) => (
                <div
                  key={c.id}
                  className="border rounded-xl p-6 shadow-sm bg-white hover:shadow-md transition"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {c.first_name} {c.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {c.specialization} • {c.experience_years} years experience
                      </p>
                      
                    </div>

                    {c.status === "pending" && (
                      <Badge className="bg-orange-500 text-white">Pending</Badge>
                    )}

                    {c.status === "approved" && (
                      <Badge className="bg-green-600 text-white">Approved</Badge>
                    )}

                    {c.status === "rejected" && (
                      <Badge className="bg-red-600 text-white">Rejected</Badge>
                    )}

                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Email:</span>
                      <p className="text-muted-foreground">{c.email}</p>
                    </div>

                    <div>
                      <span className="font-medium">Monthly Fee:</span>
                      <p className="text-muted-foreground">
                        {c.hourly_rate ? `₹${c.hourly_rate}` : "Not specified"}
                      </p>
                    </div>

                    <div>
                      <span className="font-medium">Phone:</span>
                      <p className="text-muted-foreground">{c.phone}</p>
                    </div>

                    <div>
                      <span className="font-medium">Gender:</span>
                      <p className="text-muted-foreground">{c.gender}</p>
                    </div>

                    <div>
                      <span className="font-medium">Age:</span>
                      <p className="text-muted-foreground">{c.age}</p>
                    </div>

                    <div>
                      <span className="font-medium">Country:</span>
                      <p className="text-muted-foreground">{c.country}</p>
                    </div>

                    <div>
                      <span className="font-medium">Location:</span>
                      <p className="text-muted-foreground">{c.preferred_location}</p>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mt-4">
                    <p className="font-medium mb-1">Bio</p>
                    <p className="text-sm text-muted-foreground">{c.bio}</p>
                  </div>

                  {/* Achievements */}
                  <div className="mt-4">
                    <p className="font-medium mb-1">Achievements</p>
                    <p className="text-sm text-muted-foreground">{c.achievements}</p>
                  </div>
                  {/* Profile Image (visible on card) */}
                  {c.profile_image && (
                    <div className="mt-4">
                      <p className="font-medium mb-1">Profile Image</p>

                      <img
                        src={`http://localhost:5000${c.profile_image}`}
                        alt="Coach"
                        className="w-24 h-24 rounded-lg object-cover border cursor-pointer"
                        onClick={() =>
                          setPreviewImage(`http://localhost:5000${c.profile_image}`)
                        }
                      />
                    </div>
                  )}
                  {/* Certificate */}
                  {c.certificate_url && (
                    <div className="mt-4">
                      <p className="font-medium mb-1">Certificate</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPreviewImage(`http://localhost:5000${c.certificate_url}`)
                        }
                      >
                        View Certificate
                      </Button>
                    </div>
                  )}
                  {/* ACTIONS */}
                  <div className="mt-4">
                    {c.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveCoach(c.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectCoach(c.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}

                    {c.status === "approved" && (
                      <p className="text-green-600 font-semibold">
                        ✅ Approved – Congratulations 🎉
                      </p>
                    )}

                    {c.status === "rejected" && (
                      <p className="text-red-600 font-semibold">
                        ❌ Rejected – User has been notified
                      </p>
                    )}
                  </div>
                </div>
              ))}

            </div>
          )}
        </CardContent>
      </Card>
    {/* FULL SCREEN PREVIEW MODAL */}
    {previewImage && (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="relative bg-white rounded-lg p-3 max-w-[90vw] max-h-[90vh]">
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute -top-3 -right-3 bg-white text-black rounded-full px-2 py-1 shadow"
          >
            ✕
          </button>

          {previewImage.endsWith(".pdf") ? (
            <iframe
              src={previewImage}
              className="w-[80vw] h-[80vh]"
            />
          ) : (
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-[80vw] max-h-[80vh] object-contain rounded"
            />
          )}
        </div>
      </div>
    )}
  </>
  );
};

export default AdminCoaches;
