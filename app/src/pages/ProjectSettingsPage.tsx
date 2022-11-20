import { Button } from "antd";
import { useNavigate } from "react-router";
import { useAppContext } from "../utils";
import { client, useCurrentProject } from "../utils";

const ProjectSettingsPage = () => {
  const navigate = useNavigate();
  const { refreshProjects } = useAppContext();
  const project = useCurrentProject();
  return (
    <Button
      danger
      onClick={async () => {
        await client.from("projects").delete().eq("id", project.id);
        await refreshProjects();
        navigate("/");
      }}
    >
      Disconnect Project
    </Button>
  );
};

export default ProjectSettingsPage;
