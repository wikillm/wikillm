import Layout from '~/components/Layout'
import Layer from '~/components/Layer'
import LayerInput from '~/components/LayerInput'
import { useRouter } from 'next/router'
import { useStore, addLayer } from '~/lib/Store'
import { useContext, useEffect, useRef } from 'react'
import UserContext from '~/lib/UserContext'

const ProjectsPage = (props) => {
  const router = useRouter()
  const { user, authLoaded, signOut } = useContext(UserContext)
  const layersEndRef = useRef(null)

  // Else load up the page
  const { id: projectId } = router.query
  const { layers, projects } = useStore({ projectId })

  useEffect(() => {
    layersEndRef.current.scrollIntoView({
      block: 'start',
      behavior: 'smooth',
    })
  }, [layers])

  // redirect to public project when current project is deleted
  useEffect(() => {
    if (!projects.some((project) => project.id === Number(projectId))) {
      router.push('/projects/1')
    }
  }, [projects, projectId])

  // Render the projects and layers
  return (
    <Layout projects={projects} activeProjectId={projectId}>
      <div className="relative h-screen">
        <div className="Layers h-full pb-16">
          <div className="p-2 overflow-y-auto">
            {layers.map((x) => (
              <Layer key={x.id} layer={x} />
            ))}
            <div ref={layersEndRef} style={{ height: 0 }} />
          </div>
        </div>
        <div className="p-2 absolute bottom-0 left-0 w-full">
          <LayerInput onSubmit={async (text) => addLayer(text, projectId, user.id)} />
        </div>
      </div>
    </Layout>
  )
}

export default ProjectsPage
