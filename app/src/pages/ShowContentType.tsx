import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import FeatherIcon from "../components/Icon";
import ToggleEdit from "../components/ToggleEdit";
import ContentTypeFieldForm from "../interfaces/ContentTypes/ContentTypeFieldForm";
import { ContentType } from "../types";
import { supacontent, useCurrentProject } from "../utils";

const ContentTypesPage = () => {
  const { refreshContentTypes }: any = useOutletContext();
  const params = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<ContentType>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const { content_type_id } = useParams();
  const project = useCurrentProject();
  useEffect(() => {
    fetchData();
  }, [params.content_type_id]);
  const fetchData = async () => {
    const { data } = await supacontent(project)
      .from("content_types")
      .select("*")
      .filter("id", "eq", content_type_id)
      .single();
    setData(data);
  };
  return (
    <section className="flex flex-col p-4 w-full gap-4">
      <div className="flex flex-row justify-between w-full">
        <div className="prose">
          <ToggleEdit
            onSave={async (name) => {
              const { data: result } = await supacontent(project)
                .from("content_types")
                .update({
                  name,
                })
                .match({ id: data.id });
              setData(result[0]);
            }}
            tag="h3"
            tagClassName="m-0"
            value={data?.name}
          />
        </div>
        <button
          type="button"
          className="btn btn-warning  w-64"
          onClick={async () => {
            await supacontent(project)
              .from("content_types")
              .delete()
              .eq("id", data.id);
            await refreshContentTypes();
            navigate(`/projects/${params.project_id}/content-types`);
          }}
        >
          Delete Content Type
        </button>
      </div>
      {!data && <div>Loading...</div>}
      {data &&
        data.fields?.map((field) => (
          <div className="card w-full p-0 bg-base-200 text-secondary shadow-xl border-2 border-secondary">
            <div className="card-body p-2 w-full  flex flex-row items-center justify-between">
              <div className=" flex flex-row items-center justify-start">
                <h4 className="card-title w-64 truncate">{field.name}</h4>
                <span className="capitalize">
                  {field.type.split("-").join(" ")}
                </span>
              </div>
              <div className="card-actions justify-end">
                <button
                  className="btn btn-error btn-outline btn-square"
                  onClick={async () => {
                    const newFields = data.fields.filter(
                      (oldField) => oldField !== field
                    );
                    const { data: result } = await supacontent(project)
                      .from("content_types")
                      .update({
                        fields: newFields,
                      })
                      .match({ id: data.id });
                    setData(result[0]);
                  }}
                  title="Delete"
                >
                  <FeatherIcon variant="trash" />
                </button>
              </div>
            </div>
          </div>
        ))}
      {data && showNewForm ? (
        <ContentTypeFieldForm
          onCancel={() => setShowNewForm(false)}
          onSubmit={async (params) => {
            const { data: result } = await supacontent(project)
              .from("content_types")
              .update({
                fields: [...data.fields, params],
              })
              .match({ id: data.id });
            setData(result[0]);
            setShowNewForm(false);
          }}
        />
      ) : (
        <button
          type="button"
          className="btn btn-secondary btn-outline w-64"
          onClick={() => setShowNewForm(true)}
        >
          Add a field
        </button>
      )}
    </section>
  );
};

export default ContentTypesPage;
