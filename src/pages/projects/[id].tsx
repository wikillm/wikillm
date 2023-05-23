import { useRouter } from "next/router";
import { useStore, addLayer } from "api/Store";
import { useContext, useEffect, useRef } from "react";
import UserContext from "components/UserContext";
import { Project } from "components/Project";

const ProjectsPage = (props) => {
  const router = useRouter();
  const { user, authLoaded, signOut } = useContext(UserContext);

  const { id: projectId } = router.query;
  const { layers, projects } = useStore({ projectId });

  useEffect(() => {
    if (!projects.some((project) => project.id === Number(projectId))) {
      router.push("/projects/1");
    }
  }, [projects, projectId]);

  return (
    <Project
      {...{ user, authLoaded, signOut }}
      project={projects.find((project) => project.id === Number(projectId))}
    />
  );

  // // Render the projects and layers
  // return (
  //   <Layout projects={projects} activeProjectId={projectId}>
  //     {/* <Project /> */}
  //   </Layout>
  // )
};

export default ProjectsPage;
