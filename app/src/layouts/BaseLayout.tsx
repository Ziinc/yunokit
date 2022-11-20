import { Col, Row, Spin } from "antd";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import Sidebar from "../components/Sidebar";
import { useAppContext, useCurrentProject } from "../utils";
import { Cog } from "lucide-react";

const BaseLayout: React.FC = () => {
  const project = useCurrentProject();
  const app = useAppContext();
  const navigate = useNavigate();
  useEffect(() => {
    if (!app.isLoadingProjects && !project) {
      navigate("/");
    }
  }, []);

  if (!project) {
    return (
      <div>
        <Spin size="large" indicator={<Cog />} />
      </div>
    );
  }

  return (
    <Row>
      <Col flex={1}>
        <Sidebar />
      </Col>
      <Col flex={12}>
        <Outlet />
      </Col>
    </Row>
  );
};

export default BaseLayout;
