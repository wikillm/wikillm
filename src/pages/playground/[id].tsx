// @ts-nocheck
/* eslint-disable */
import { useStore } from '@wikillm/api/Store';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import { Project } from '../../components/Project';

const PlaygroundPage = (props) => {
  const router = useRouter();

  const { id: projectId } = router.query;
  const { projects } = useStore({ projectId });

  useEffect(() => {
    if (!projects.some((project) => project.id === Number(projectId))) {
      router.push('/projects/1');
    }
  }, [projects, projectId]);

  return (
    <Project
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

export default PlaygroundPage;
