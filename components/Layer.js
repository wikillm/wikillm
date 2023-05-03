import { useContext } from 'react'
import UserContext from '~/lib/UserContext'
import { deleteLayer } from '~/lib/Store'
import TrashIcon from '~/components/TrashIcon'

const Layer = ({ layer }) => {
  const { user, userRoles } = useContext(UserContext)

  return (
    <div className="py-1 flex items-center space-x-2">
      <div className="text-gray-100 w-4">
        {(user?.id === layer.user_id ||
          userRoles.some((role) => ['admin', 'moderator'].includes(role))) && (
          <button onClick={() => deleteLayer(layer.id)}>
            <TrashIcon />
          </button>
        )}
      </div>
      <div>
        <p className="text-blue-700 font-bold">{layer.author.username}</p>
        <p className="text-white">{layer.layer}</p>
      </div>
    </div>
  )
}

export default Layer
