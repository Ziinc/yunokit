import { useNavigate, useOutletContext, useParams } from "react-router";
import { Link, useSearchParams } from "react-router-dom";
import { supacontent, useCurrentProject } from "../utils";

const NewContentType = () => {
  const navigate = useNavigate();
  const params = useParams();
  const basePath = `/projects/${params.project_id}`;
  const [searchParams] = useSearchParams();
  const { refreshContentTypes }: any = useOutletContext();
  const project = useCurrentProject();
  return (
    <>
      <form
        className="mx-auto container my-auto max-w-md flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const { data } = await supacontent(project)
            .from("content_types")
            .insert({
              name: (e.target as any).name.value,
              type: (e.target as any).type.value,
              project_id: Number(params.project_id),
              fields: [] as any,
            })
            .select();
          await refreshContentTypes();
          navigate(`${basePath}/content-types/${data[0].id}`);
        }}
      >
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text  text-xl">
              What is this content type called?
            </span>
          </label>
          <input
            name="name"
            type="text"
            placeholder="My Text Field"
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text  text-xl">
              Will it be a single piece of content or multiple pieces of
              content?
            </span>
          </label>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Single</span>
              <input
                type="radio"
                name="type"
                value="single"
                className="radio checked:bg-blue-500"
                defaultChecked={searchParams.get("type") === "single"}
              />
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Collection</span>
              <input
                type="radio"
                name="type"
                value="collection"
                className="radio checked:bg-blue-500"
                defaultChecked={searchParams.get("type") === "collection"}
              />
            </label>
          </div>
        </div>

        <div className="flex flex-row justify-between w-full">
          <Link to={basePath + "/content-types"} className="btn btn-ghost">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </div>
      </form>
    </>
  );
};

export default NewContentType;
