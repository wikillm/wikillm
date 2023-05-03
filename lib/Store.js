import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
)

/**
 * @param {number} projectId the currently selected Project
 */
export const useStore = (props) => {
  const [projects, setProjects] = useState([])
  const [layers, setLayers] = useState([])
  const [users] = useState(new Map())
  const [newLayer, handleNewLayer] = useState(null)
  const [newProject, handleNewProject] = useState(null)
  const [newOrUpdatedUser, handleNewOrUpdatedUser] = useState(null)
  const [deletedProject, handleDeletedProject] = useState(null)
  const [deletedLayer, handleDeletedLayer] = useState(null)

  // Load initial data and set up listeners
  useEffect(() => {
    // Get Projects
    fetchProjects(setProjects)
    // Listen for new and deleted layers
    const layerListener = supabase
      .channel('public:layers')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'layers' },
        (payload) => handleNewLayer(payload.new)
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'layers' },
        (payload) => handleDeletedLayer(payload.old)
      )
      .subscribe()
    // Listen for changes to our users
    const userListener = supabase
      .channel('public:users')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => handleNewOrUpdatedUser(payload.new)
      )
      .subscribe()
    // Listen for new and deleted projects
    const projectListener = supabase
      .channel('public:projects')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'projects' },
        (payload) => handleNewProject(payload.new)
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'projects' },
        (payload) => handleDeletedProject(payload.old)
      )
      .subscribe()
    // Cleanup on unmount
    return () => {
      supabase.removeProject(supabase.channel(layerListener))
      supabase.removeProject(supabase.channel(userListener))
      supabase.removeProject(supabase.channel(projectListener))
    }
  }, [])

  // Update when the route changes
  useEffect(() => {
    if (props?.projectId > 0) {
      
      fetchLayers(props.projectId, (layers) => {
        layers.forEach((x) => users.set(x.user_id, x.author))
        setLayers(layers)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.projectId])

  // New layer received from Postgres
  useEffect(() => {
    if (newLayer && newLayer.project_id === Number(props.projectId)) {
      const handleAsync = async () => {
        let authorId = newLayer.user_id
        if (!users.get(authorId)) await fetchUser(authorId, (user) => handleNewOrUpdatedUser(user))
        setLayers(layers.concat(newLayer))
      }
      handleAsync()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newLayer])

  // Deleted layer received from postgres
  useEffect(() => {
    if (deletedLayer) setLayers(layers.filter((layer) => layer.id !== deletedLayer.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedLayer])

  // New project received from Postgres
  useEffect(() => {
    if (newProject) setProjects(projects.concat(newProject))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newProject])

  // Deleted project received from postgres
  useEffect(() => {
    if (deletedProject) setProjects(projects.filter((project) => project.id !== deletedProject.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedProject])

  // New or updated user received from Postgres
  useEffect(() => {
    if (newOrUpdatedUser) users.set(newOrUpdatedUser.id, newOrUpdatedUser)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newOrUpdatedUser])

  return {
    // We can export computed values here to map the authors to each layer
    layers: layers.map((x) => ({ ...x, author: users.get(x.user_id) })),
    projects: projects !== null ? projects.sort((a, b) => a.slug.localeCompare(b.slug)) : [],
    users,
  }
}

/**
 * Fetch all projects
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchProjects = async (setState) => {
  try {
    let { data } = await supabase.from('projects').select('*')
    if (setState) setState(data)
    return data
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch a single user
 * @param {number} userId
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchUser = async (userId, setState) => {
  try {
    let { data } = await supabase.from('users').select(`*`).eq('id', userId)
    let user = data[0]
    if (setState) setState(user)
    return user
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch all roles for the current user
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchUserRoles = async (setState) => {
  try {
    let { data } = await supabase.from('user_roles').select(`*`)
    if (setState) setState(data)
    return data
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Fetch all layers and their authors
 * @param {number} projectId
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchLayers = async (projectId, setState) => {
  try {
    let { data } = await supabase
      .from('layers')
      .select(`*, author:user_id(*)`)
      .eq('project_id', projectId)
      .order('inserted_at', { ascending: true })
    if (setState) setState(data)
    return data
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Insert a new project into the DB
 * @param {string} slug The project name
 * @param {number} user_id The project creator
 */
export const addProject = async (slug, user_id) => {
  try {
    let { data } = await supabase.from('projects').insert([{ slug, created_by: user_id }]).select()
    return data
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Update a new project into the DB
 * @param {string} slug The project name
 * @param {number} user_id The project creator
 */
export const updateProject = async (config, user_id) => {
  try {
    let { data } = await supabase.from('projects').update([{ config, created_by: user_id }]).select()
    return data
  } catch (error) {
    console.log('error', error)
  }
}

const schema= {
  gpt_templates:{

  },
  gpt_projects: {
    config: {

      layers: [{
        name: '',
        each: "",
        
  
      }]
    }
  }
}



/**
 * Insert a new layer into the DB
 * @param {string} layer The layer text
 * @param {number} project_id
 * @param {number} user_id The author
 */
export const addLayer = async (layer, project_id, user_id) => {
  try {
    let { data } = await supabase.from('layers').insert([{ layer, project_id, user_id }]).select()
    return data
  } catch (error) {
    console.log('error', error)
  }
}


/**
 * Delete a project from the DB
 * @param {number} project_id
 */
export const deleteProject = async (project_id) => {
  try {
    let { data } = await supabase.from('projects').delete().match({ id: project_id })
    return data
  } catch (error) {
    console.log('error', error)
  }
}

/**
 * Delete a layer from the DB
 * @param {number} layer_id
 */
export const deleteLayer = async (layer_id) => {
  try {
    let { data } = await supabase.from('layers').delete().match({ id: layer_id })
    return data
  } catch (error) {
    console.log('error', error)
  }
}
