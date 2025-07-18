import React, { useEffect, useState } from 'react';
import { listForums, createForum } from '@/lib/api/ForumsApi';

const ForumManagementPage: React.FC = () => {
  const [forums, setForums] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      const { data } = await listForums();
      setForums(data || []);
    };
    load();
  }, []);

  const handleCreate = async () => {
    await createForum({ name: 'New Forum' });
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Forum Management</h1>
      <button onClick={handleCreate}>Add Forum</button>
      <ul>
        {forums.map((f) => (
          <li key={f.id}>{f.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default ForumManagementPage;
