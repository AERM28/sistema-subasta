import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { Home } from './components/Home/Home'
import { PageNotFound } from './components/Home/PageNotFound'

import TableUsers from './components/Auction/TableUsers'
import UserDetail from './components/Auction/UserDetail'
import ListObjects from './components/Auction/ListObjects'
import DetailObject from './components/Auction/DetailObject'
import ListAuction from './components/Auction/ListAuction.jsx'
import DetailAuction from './components/Auction/DetailAuction'
import ListBid from './components/Auction/ListBid'
import EditUser from './components/Auction/EditUser'
import { CreateObjectItem } from './components/Auction/CreateObjectItem'
import { EditObject } from './components/Auction/EditObject'
import { CreateAuction } from './components/Auction/CreateAuction'
import { EditAuction } from './components/Auction/EditAuction'

const rutas = createBrowserRouter([
  {
    element: <Layout/>,
    children: [
      // Ruta principal
      { index: true, element: <Home /> },

      // Ruta comodín (404)
      { path: "*", element: <PageNotFound /> },

      // Usuarios
      { path: "user",              element: <TableUsers /> },
      { path: "user/:id",          element: <UserDetail /> },
      { path: "user/:id/edit",     element: <EditUser /> },

      // Objetos
      { path: "object",            element: <ListObjects /> },
      { path: "object/create",     element: <CreateObjectItem /> },
      { path: "object/:id",        element: <DetailObject /> },
      { path: "object/:id/edit",   element: <EditObject /> },

      // Subastas
      { path: "auction",           element: <ListAuction /> },
      { path: "auction/create",    element: <CreateAuction /> },
      { path: "auction/:id",       element: <DetailAuction /> },
      { path: "auction/:id/edit",  element: <EditAuction /> },
      { path: "auction/:id/bids",  element: <ListBid /> },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={rutas} />
  </StrictMode>,
)