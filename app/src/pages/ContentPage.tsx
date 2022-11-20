import { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router";
import { ContentType } from "../types";
import { supacontent, useCurrentProject } from "../utils";
import ContentTypesMenu from "./home/ContentTypesMenu";

const ContentPage: React.FC = () => {
  const [contentTypes, setContentTypes] = useState<ContentType[]>(null);
  const navigate = useNavigate();
  const params = useParams();
  useEffect(() => {
    refreshAll();
  }, [params.content_type_id]);
  const project = useCurrentProject()

  const refreshAll = async () => {
    const { data } = await supacontent(project).from("content_types").select("*");
    if (data && data[0] && !params.content_type_id) {
      // take the first collection, else take first single
      const first = data.find((ct) => ct.type === "collection") || data[0];
      navigate(`/projects/${params.project_id}/content/type/${first.id}`);
    }
    setContentTypes(data);
  };
  const handleCreate = async (type: "collection" | "single") => {
    const { data, error } = await supacontent(project).from("content_types").insert({
      name: "Untitled",
      type: "collection",
      project_id: Number(params.project_id),
      fields: [],
    }).select();
    navigate(`/projects/${params.project_id}/content-types/${data[0].id}`);
  };

  return (
    <div className="flex h-full">
      {contentTypes && contentTypes.length > 0 ? (
        <>
          <section
            id="section-menu"
            className="flex flex-col border-r-2 border-grey-500 h-full"
          >
            <div className="border-b-2 border-grey-500 p-4">
              <h1 className="text-2xl font-bold">Content</h1>
            </div>

            <ContentTypesMenu
              showNewButton={false}
              contentTypes={contentTypes}
              buildLink={(type: ContentType) =>
                `/projects/${params.project_id}/content/type/${type.id}`
              }
            />
          </section>
          <Outlet />
        </>
      ) : (
        <div className="flex flex-col items-center mx-auto my-auto prose max-w-lg">
          <h3>Lets get started!</h3>
          <p>You'll need to add a Content Type first to create new content.</p>
          <div className="flex flex-row justify-around gap-8 w-full">
            <button
              className="btn btn-primary"
              onClick={() => handleCreate("collection")}
            >
              New collection
            </button>
            <button
              className="btn btn-primary"
              onClick={() => handleCreate("single")}
            >
              New single
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentPage;
