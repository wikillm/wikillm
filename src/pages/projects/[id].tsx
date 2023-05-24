// @ts-nocheck
/* eslint-disable */
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { Project } from '../../components/Project';
import UserContext from '../../contexts/UserContext';

console.log(UserContext);
const ProjectsPage = (props) => {
  const router = useRouter();
  // const { user, authLoaded, signOut } = useContext(UserContext);

  // const { id: projectId } = router.query;
  // const { layers, projects } = useStore({ projectId });

  useEffect(() => {
    // if (!projects.some((project) => project.id === Number(projectId))) {
    router.push('/projects/1');
    // }
  }, []);

  return <Project />;

  // // Render the projects and layers
  // return (
  //   <Layout projects={projects} activeProjectId={projectId}>
  //     {/* <Project /> */}
  //   </Layout>
  // )
};

export default ProjectsPage;
