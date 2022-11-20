import { Link } from "react-router-dom";
import { useCurrentProject } from "../utils";
import { Button, Divider,  Typography } from "antd";
import { LayoutGrid, ExternalLink } from "lucide-react";
const Sidebar = () => {
  const project = useCurrentProject();
  const mainMenu = [
    { title: "Content Items", path: `/projects/${project.id}/content` },
    {
      title: "Content Types",
      path: `/projects/${project.id}/content-types`,
    },
    {
      title: "Export",
      path: `https://github.com/Ziinc/supacontent#exporting`,
      icon: <ExternalLink size={14} />,
    },
    {
      title: "Query",
      path: "https://github.com/Ziinc/supacontent#querying",
      icon: <ExternalLink size={14} />,
    },
  ];

  const renderMenu = (menu) => (
    <ul className="m-0 p-0">
      {menu.map((item) => (
        <li key={item.path} className="list-none">
          {item.path.includes("http") ? (
            <a href={item.path} title={item.title} target="_blank">
              <Button
                className="flex flex-row-reverse items-center gap-4"
                type="link"
                icon={item.icon}
              >
                {item.title}
              </Button>
            </a>
          ) : (
            <Link to={item.path} title={item.title}>
              <Button type="link">{item.title}</Button>
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex flex-col overflow-visible">
      {/* icon */}
      <div className="w-full flex flex-row justify-start align-center gap-2">
        <Link to={`/`}>
          <Button
            icon={<LayoutGrid size={18} />}
            size="large"
            type="text"
          ></Button>
        </Link>
        <Link to={`/projects/${project.id}`} className="block w-full">
          <Button type="ghost" className="px-1 text-left" block>
            <Typography.Text strong>{project.name}</Typography.Text>
          </Button>
        </Link>
      </div>
      <Divider className="my-2" />

      <div className="p-2 flex flex-col justify-between flex-grow">
        {renderMenu(mainMenu)}
        <Link to={`/projects/${project.id}/settings`}>
          <Button type="text">Settings</Button>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
