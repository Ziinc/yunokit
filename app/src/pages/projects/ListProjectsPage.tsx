import { Link } from "react-router-dom";
import { useAppContext } from "../../utils";
import { Button, Card, Spin } from "antd";

import { Typography } from "antd";
const ListProjectsPage = () => {
  const { projects } = useAppContext();

  return (
    <div className="mx-auto container">
      {projects === null && <Spin size="large" />}
      {projects && projects.length === 0 && (
        <>
          <Typography.Title level={3}>
            Connect your first Supabase project
          </Typography.Title>
          <Link to="/projects/new">
            <Button type="primary">Connect</Button>
          </Link>
        </>
      )}
      {projects && projects.length > 0 && (
        <>
          <div className="flex flex-row  gap-8 justify-start items-baseline">
            <Typography.Title level={3}>
              Select a Supabase project or connect to a new app
            </Typography.Title>
            <Link to="/projects/new">
              <Button type="primary">Connect</Button>
            </Link>
          </div>

          <ul className="flex flex-row flex-wrap gap-4 pl-0">
            {projects.map((p) => (
              <li key={p.id} className="list-none w-72 hover:shadow">
                <Link to={`/projects/${p.id}`} className="no-underline">
                  <Card bordered>
                    <Typography.Text strong>{p.name}</Typography.Text>
                    <span className="truncate w-48 block">{p.api_url}</span>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default ListProjectsPage;
