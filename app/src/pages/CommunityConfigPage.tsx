import React, { useEffect, useState } from 'react';
import { getConfig, updateConfig } from '@/lib/api/CommunityConfigApi';

const CommunityConfigPage: React.FC = () => {
  const [config, setConfig] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      const { data } = await getConfig();
      setConfig(data || []);
    };
    load();
  }, []);

  const handleSave = async () => {
    await updateConfig({ key: 'example', value: { enabled: true } });
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Community Configuration</h1>
      <button onClick={handleSave}>Save</button>
      <pre>{JSON.stringify(config, null, 2)}</pre>
    </div>
  );
};

export default CommunityConfigPage;
