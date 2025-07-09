import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

type Group = {
  name: string;
  code: string;
  balance: number;
  members: string[];
};

const GroupDetails = () => {
  const { groupId } = useParams() as { groupId?: string };
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) {
        setError("Invalid group URL. Missing group ID.");
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "groups", groupId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setGroup(docSnap.data() as Group);
        } else {
          setError("Group not found.");
        }
      } catch (err) {
        console.error("Error fetching group:", err);
        setError("Failed to fetch group data.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  if (loading) return <div className="p-6 text-gray-600">Loading group details...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!group) return <div className="p-6 text-gray-600">Group data not available.</div>;

  return (
    <div className="min-h-screen bg-white font-sans text-[#111518]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 px-10 py-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-black rounded-full" />
          <h1 className="text-lg font-bold">SplitEase</h1>
        </div>
        <div className="flex items-center gap-8">
          <nav className="flex gap-6 text-sm font-medium">
            <a href="#" className="hover:text-blue-600">Dashboard</a>
            <a href="#" className="hover:text-blue-600">Groups</a>
            <a href="#" className="hover:text-blue-600">Expenses</a>
          </nav>
          <div className="rounded-full h-10 w-10 bg-cover bg-center" style={{ backgroundImage: `url(https://i.pravatar.cc/300)` }} />
        </div>
      </header>

      {/* Group content */}
      <div className="px-10 py-6 max-w-5xl mx-auto">
        {/* Group name and creator */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold">{group.name}</h2>
            <p className="text-sm text-gray-500">Code: <span className="font-mono">{group.code}</span></p>
          </div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Add an expense</button>
        </div>

        {/* Group balance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="border rounded-lg p-4">
            <p className="text-gray-500 text-sm">Total balance</p>
            <p className={`text-2xl font-bold ${group.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₹{Math.abs(group.balance).toFixed(2)} {group.balance >= 0 ? "owed to you" : "you owe"}
            </p>
          </div>
        </div>

        {/* Members */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Members</h3>
          <div className="space-y-2">
            {group.members.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="rounded-full h-12 w-12 bg-gray-300 bg-center bg-cover" style={{ backgroundImage: `url(https://i.pravatar.cc/15${index})` }} />
                  <div>
                    <p className="font-medium">{member}</p>
                    <p className="text-sm text-gray-500">Friend</p>
                  </div>
                </div>
                <p className="font-medium">₹0.00</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;
