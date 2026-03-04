import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { Home } from './components/Home/Home'
import { PageNotFound } from './components/Home/PageNotFound'
import { ListMovies } from './components/Movie/ListMovies'
//import TableMovies from './components/Movie/TableMovies'
import TableUsers from './components/Auction/TableUsers'
import UserDetail from './components/Auction/UserDetail'
import ListObjects from './components/Auction/ListObjects'
import DetailObject from './components/Auction/DetailObject'
import ListAuction from './components/Auction/ListAuction.jsx'
import DetailAuction from './components/Auction/DetailAuction'
import ListBid from './components/Auction/ListBid'

const rutas = createBrowserRouter([
  {
    element: <Layout/>,
    children: [
      // Ruta principal
      { index: true, element: <Home /> },

      // Ruta comodín (404)
      { path: "*", element: <PageNotFound /> },
       //Rutas componentes
      { path: "movie", element: <ListMovies />},
      { path: "user",      element: <TableUsers /> },
      { path: "auction",     element: <ListAuction /> },
      { path: "auction/:id/bids", element: <ListBid /> },
      { path: "user/:id",  element: <UserDetail /> },
      { path: "object",     element: < ListObjects/> },
      { path: "object/:id", element: <DetailObject /> },
      { path: "auction/:id",      element: <DetailAuction /> },

    ]
  }
])
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={rutas} />
  </StrictMode>,
)
