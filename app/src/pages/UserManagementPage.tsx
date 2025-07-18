import React, { useEffect, useState } from 'react';
import { listBans, banUser } from '@/lib/api/ModerationApi';

const UserManagementPage: React.FC = () => {
  const [bans, setBans] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await listBans();
      setBans(data || []);
    };
    load();
  }, []);

  const handleBan = async () => {
    await banUser({ user_id: '1' });
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">User Management</h1>
      <button onClick={handleBan}>Ban User</button>
      <ul>
        {bans.map((b) => (
          <li key={b.id}>{b.user_id}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserManagementPage;
