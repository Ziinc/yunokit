import { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router";
import { supacontent, useCurrentProject } from "../utils";
import ContentTypesMenu from "./home/ContentTypesMenu";

const ContentTypesPage = () => {
  const [data, setData] = useState(null);
  const params = useParams();
  const navigate = useNavigate();
  const project = useCurrentProject()

  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    const { data } = await supacontent(project).from("content_types").select("*");
    setData(data);
  };

  useEffect(() => {
    if (data && data[0]) {
      // take the first collection, else take first single
      const first = data.find((ct) => ct.type === "collection") || data[0];
      navigate(`/projects/${params.project_id}/content-types/${first.id}`);
    }
  }, [data]);

  return (
    <section className="flex flex-row h-full">
      <section
        id="section-menu"
        className="flex flex-col border-r-2 border-grey-500 h-full"
      >
        <div className=" p-4">
          <h1 className="text-2xl font-bold">Content Types</h1>
        </div>

        <ContentTypesMenu
          showNewButton={true}
          contentTypes={data || []}
          buildLink={(type) =>
            `/projects/${params.project_id}/content-types/${type.id}`
          }
        />
      </section>
      <Outlet context={{ refreshContentTypes: fetchData }} />
    </section>
  );
};

export default ContentTypesPage;
