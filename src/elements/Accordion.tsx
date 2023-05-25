export function Accordion() {
  return (
    <div className="flex h-screen flex-col items-stretch justify-center bg-gradient-to-b from-black to-gray-900 p-2 font-sans antialiased sm:flex-row sm:items-center">
      <div className="min-w-md flex w-full max-w-2xl grow flex-col items-stretch sm:h-72 sm:flex-row sm:overflow-hidden">
        <div className="active min-h-14 min-w-14 pane relative m-2 grow cursor-pointer overflow-hidden rounded-3xl transition-all duration-700 ease-in-out">
          <div className="background bg-red-img absolute inset-0 z-10 scale-105 bg-red-500 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-in-out"></div>
          <div className="absolute inset-x-0 bottom-0 z-20 h-1/2 translate-y-1/2 bg-gradient-to-b from-transparent to-black opacity-0 shadow transition-all duration-700 ease-in-out"></div>
          <div className="label absolute bottom-0 left-0 z-30 mb-2 ml-3 flex transition-all duration-700 ease-in-out sm:mb-3 sm:ml-2">
            <div className="icon mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-red-500">
              <i className="fas fa-walking"></i>
            </div>
            <div className="content flex flex-col justify-center whitespace-pre leading-tight text-white">
              <div className="relative translate-x-8 font-bold opacity-0 transition-all duration-700 ease-in-out">
                Imagine
              </div>
              <div className="relative translate-x-8 opacity-0 transition-all delay-100 duration-700 ease-in-out">
                Chase your dreams
              </div>
            </div>
          </div>
        </div>
        <div className="active min-h-14 min-w-14 pane relative m-2 grow cursor-pointer overflow-hidden rounded-3xl transition-all duration-700 ease-in-out">
          <div className="background bg-yellow-img absolute inset-0 z-10 scale-105 bg-yellow-500 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-in-out"></div>
          <div className="absolute inset-x-0 bottom-0 z-20 h-1/2 translate-y-1/2 bg-gradient-to-b from-transparent to-black opacity-0 shadow transition-all duration-700 ease-in-out"></div>
          <div className="label absolute bottom-0 left-0 z-30 mb-2 ml-3 flex transition-all duration-700 ease-in-out sm:mb-3 sm:ml-2">
            <div className="icon mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-yellow-500">
              <i className="fas fa-apple-alt"></i>
            </div>
            <div className="content flex flex-col justify-center whitespace-pre leading-tight text-white">
              <div className="relative translate-x-8 font-bold opacity-0 transition-all duration-700 ease-in-out">
                Build
              </div>
              <div className="relative translate-x-8 opacity-0 transition-all delay-100 duration-700 ease-in-out">
                Realize your vision
              </div>
            </div>
          </div>
        </div>
        <div className="undefined min-h-14 min-w-14 pane relative m-2 grow cursor-pointer overflow-hidden rounded-3xl transition-all duration-700 ease-in-out">
          <div className="background bg-green-img absolute inset-0 z-10 scale-105 bg-green-500 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-in-out"></div>
          <div className="absolute inset-x-0 bottom-0 z-20 h-1/2 translate-y-1/2 bg-gradient-to-b from-transparent to-black opacity-0 shadow transition-all duration-700 ease-in-out"></div>
          <div className="label absolute bottom-0 left-0 z-30 mb-2 ml-3 flex transition-all duration-700 ease-in-out sm:mb-3 sm:ml-2">
            <div className="icon mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-green-500">
              <i className="fas fa-tree"></i>
            </div>
            <div className="content flex flex-col justify-center whitespace-pre leading-tight text-white">
              <div className="relative translate-x-8 font-bold opacity-0 transition-all duration-700 ease-in-out">
                Explore
              </div>
              <div className="relative translate-x-8 opacity-0 transition-all delay-100 duration-700 ease-in-out">
                Discover the world
              </div>
            </div>
          </div>
        </div>
        <div className="undefined min-h-14 min-w-14 pane relative m-2 grow cursor-pointer overflow-hidden rounded-3xl transition-all duration-700 ease-in-out">
          <div className="background bg-blue-img absolute inset-0 z-10 scale-105 bg-blue-500 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-in-out"></div>
          <div className="absolute inset-x-0 bottom-0 z-20 h-1/2 translate-y-1/2 bg-gradient-to-b from-transparent to-black opacity-0 shadow transition-all duration-700 ease-in-out"></div>
          <div className="label absolute bottom-0 left-0 z-30 mb-2 ml-3 flex transition-all duration-700 ease-in-out sm:mb-3 sm:ml-2">
            <div className="icon mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-blue-500">
              <i className="fas fa-tint"></i>
            </div>
            <div className="content flex flex-col justify-center whitespace-pre leading-tight text-white">
              <div className="relative translate-x-8 font-bold opacity-0 transition-all duration-700 ease-in-out">
                Adapt
              </div>
              <div className="relative translate-x-8 opacity-0 transition-all delay-100 duration-700 ease-in-out">
                Embrace the times
              </div>
            </div>
          </div>
        </div>
        <div className="undefined min-h-14 min-w-14 pane relative m-2 grow cursor-pointer overflow-hidden rounded-3xl transition-all duration-700 ease-in-out">
          <div className="background bg-purple-img absolute inset-0 z-10 scale-105 bg-purple-500 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-in-out"></div>
          <div className="absolute inset-x-0 bottom-0 z-20 h-1/2 translate-y-1/2 bg-gradient-to-b from-transparent to-black opacity-0 shadow transition-all duration-700 ease-in-out"></div>
          <div className="label absolute bottom-0 left-0 z-30 mb-2 ml-3 flex transition-all duration-700 ease-in-out sm:mb-3 sm:ml-2">
            <div className="icon mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-purple-500">
              <i className="fas fa-palette"></i>
            </div>
            <div className="content flex flex-col justify-center whitespace-pre leading-tight text-white">
              <div className="relative translate-x-8 font-bold opacity-0 transition-all duration-700 ease-in-out">
                Inspire
              </div>
              <div className="relative translate-x-8 opacity-0 transition-all delay-100 duration-700 ease-in-out">
                Share your potential
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
