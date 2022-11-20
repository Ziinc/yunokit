import { useNavigate } from "react-router-dom";
import { useAppContext } from "../utils";
import { Button, Form, Input, Row, Typography } from "antd";
import { createProject } from "../api";
const NewProjectPage = () => {
  const appContext = useAppContext();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const handleSubmit = async (params) => {
    const { data } = await createProject({
      ...params,
      user_id: appContext.user.id,
    });
    appContext.refreshProjects();
    navigate(`/projects/${data[0].id}`);
  };
  return (
    <div className="mx-auto container">
      <Typography.Title level={2}>Add a New Project</Typography.Title>
      <Form
        labelAlign="left"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 16 }}
        form={form}
        name="control-hooks"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="Project Name"
          rules={[{ required: true }]}
        >
          <Input placeholder="My Awesome Project" />
        </Form.Item>
        <Form.Item
          name="api_url"
          label="Project API URL"
          rules={[{ required: true }]}
        >
          <Input placeholder="https://myprojectref.supabase.co" />
        </Form.Item>
        <Form.Item
          name="service_role_key"
          label="Service Role Key"
          rules={[{ required: true }]}
        >
          <Input type="password" />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <Row justify="end">
            <Button type="primary" htmlType="submit">
              Add
            </Button>
          </Row>
        </Form.Item>
      </Form>
    </div>
  );
};

export default NewProjectPage;
