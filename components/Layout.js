import Link from 'next/link'
import { useContext, useEffect, useState } from 'react'
import UserContext from '~/lib/UserContext'
import { addProject, addLayer, deleteProject } from '~/lib/Store'
import TrashIcon from '~/components/TrashIcon'
import React, { Component } from 'react';
import Nodes from './Nodes'

export default function Layout(props) {
  const { signOut, user, userRoles } = useContext(UserContext)

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w-]+/g, '') // Remove all non-word chars
      .replace(/--+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '') // Trim - from end of text
  }

  const newProject = async () => {
    const slug = prompt('Please enter your name')
    if (slug) {
      addProject(slugify(slug), user.id)
    }
  }
  useEffect(() => {
    addLayer({ variables: {} })
  }, [])
  return (
    <main className="main flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <nav
        className="w-64 bg-gray-900 text-gray-100 overflow-scroll "
        style={{ maxWidth: '20%', minWidth: 150, maxHeight: '100vh' }}
      >
        <div className="p-2 ">
          <div className="p-2">
            <button
              className="bg-blue-900 hover:bg-blue-800 text-white py-2 px-4 rounded w-full transition duration-150"
              onClick={() => newProject()}
            >
              New Project
            </button>
          </div>
          <hr className="m-2" />
          <div className="p-2 flex flex-col space-y-2">
            <h6 className="text-xs">{user?.email}</h6>
            <button
              className="bg-blue-900 hover:bg-blue-800 text-white py-2 px-4 rounded w-full transition duration-150"
              onClick={() => signOut()}
            >
              Log out
            </button>
          </div>
          <hr className="m-2" />
          <h4 className="font-bold">Projects</h4>
          <ul className="project-list">
            {props.projects.map((x) => (
              <SidebarItem
                project={x}
                key={x.id}
                isActiveProject={x.id === props.activeProjectId}
                user={user}
                userRoles={userRoles}
              />
            ))}
          </ul>
        </div>
      </nav>

      {/* Layers */}
      <div className="flex-1 bg-gray-800 h-screen">{props.children}
      {/* <Nodes /> */}
      </div>
    </main>
  )
}



const SidebarItem = ({ project, isActiveProject, user, userRoles }) => (
  <>
    <li className="flex items-center justify-between">
      <Link href="/projects/[id]" as={`/projects/${project.id}`}>
        {project.slug}
      </Link>
      {project.id !== 1 && (project.created_by === user?.id || userRoles.includes('admin')) && (
        <button onClick={() => deleteProject(project.id)}>
          <TrashIcon />
        </button>
      )}
    </li>
  </>
)
