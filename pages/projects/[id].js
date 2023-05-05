import Layout from '~/components/Layout'
import Layer from '~/components/Layer'
import LayerInput from '~/components/LayerInput'
import { useRouter } from 'next/router'
import { useStore, addLayer } from '~/lib/Store'
import { useContext, useEffect, useRef } from 'react'
import UserContext from '~/lib/UserContext'
import Project from '../../components/Project'
import { App } from '../../components/App'

const ProjectsPage = (props) => {
  const router = useRouter()
  const { user, authLoaded, signOut } = useContext(UserContext)
  const layersEndRef = useRef(null)

  // Else load up the page
  const { id: projectId } = router.query
  const { layers, projects } = useStore({ projectId })

  // useEffect(() => {
  //   layersEndRef.current.scrollIntoView({
  //     block: 'start',
  //     behavior: 'smooth',
  //   })
  // }, [layers])

  // redirect to public project when current project is deleted
  useEffect(() => {
    if (!projects.some((project) => project.id === Number(projectId))) {
      router.push('/projects/1')
    }
  }, [projects, projectId])

  return <App project={projects.find((project) => project.id === Number(projectId))} />

  // Render the projects and layers
  return (
    <Layout projects={projects} activeProjectId={projectId}>
      {/* <Project /> */}
    </Layout>
  )
}

export default ProjectsPage
