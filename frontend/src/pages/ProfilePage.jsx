import { useEffect, useState } from "react";
import api from "../api/client";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get("/auth/profile");
        setProfile(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load profile.");
      }
    };

    loadProfile();
  }, []);

  if (error) {
    return <p className="rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p>;
  }

  if (!profile) {
    return <p className="text-sm text-slate-500">Loading profile...</p>;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-2xl font-black text-slate-900">Your Profile</h2>
      <dl className="space-y-4 text-sm">
        <div className="rounded-xl border border-slate-200 p-4">
          <dt className="text-slate-500">Name</dt>
          <dd className="mt-1 text-base font-medium text-slate-900">{profile.name}</dd>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <dt className="text-slate-500">Email</dt>
          <dd className="mt-1 text-base font-medium text-slate-900">{profile.email}</dd>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <dt className="text-slate-500">Default Currency</dt>
          <dd className="mt-1 text-base font-medium text-slate-900">{profile.baseCurrency}</dd>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <dt className="text-slate-500">Wallet Balances</dt>
          <dd className="mt-3 grid gap-3 sm:grid-cols-2">
            {profile.wallet?.map((entry) => (
              <div key={entry.currency} className="rounded-lg bg-slate-50 px-3 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">{entry.currency}</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{Number(entry.balance).toFixed(4)}</p>
              </div>
            ))}
          </dd>
        </div>
      </dl>
    </div>
  );
};

export default ProfilePage;
