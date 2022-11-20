import { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { supacontent, useCurrentProject } from "../../utils";

const ContentTypesOnboarding = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [isCheckDone, setIsCheckDone] = useState(false);
  const project = useCurrentProject();

  const check = async () => {
    const { data } = await supacontent(project)
      .from("content_types")
      .select("*");

    if (data && data[0]) {
      // take the first collection, else take first single
      const first = data.find((ct) => ct.type === "collection") || data[0];
      navigate(`/projects/${params.project_id}/content-types/${first.id}`);
    }
    setIsCheckDone(true);
  };

  useEffect(() => {
    check();
  }, []);

  if (!isCheckDone) return null;

  return (
    <>
      <div className="flex flex-col items-center mx-auto my-auto prose">
        <h3>Let's get started!</h3>
        <p>You'll need to add a Content Type first to create new content.</p>
        <Link to={`/projects/${params.project_id}/content-types/new`}>
          <button className="btn btn-primary">Add a new content type</button>
        </Link>
      </div>
    </>
  );
};

export default ContentTypesOnboarding;
