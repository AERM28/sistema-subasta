import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { Home } from './components/Home/Home'
import { PageNotFound } from './components/Home/PageNotFound'

import TableUsers from './components/Auction/TableUsers'
import UserDetail from './components/Auction/UserDetail'
import EditUser from './components/Auction/EditUser'

import ListObjects from './components/Auction/ListObjects'
import DetailObject from './components/Auction/DetailObject'
import { CreateObjectItem } from './components/Auction/CreateObjectItem'
import { EditObject } from './components/Auction/EditObject'

import ListAuction from './components/Auction/ListAuction'
import ActiveAuctionList from './components/Auction/ActiveAuctionList'
import CreateBid from './components/Auction/DetailAuction'
import ListBid from './components/Auction/ListBid'
import { CreateAuction } from './components/Auction/CreateAuction'
import { EditAuction } from './components/Auction/EditAuction'
import DetailBid from './components/Auction/DetailBid'

import PaymentList from './components/Auction/PaymentList'
import Login from './User/Login'
import Register from './User/Register'

const rutas = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // Principal
      { index: true, element: <Home /> },
      { path: "*", element: <PageNotFound /> },

      // Usuarios
      { path: "user", element: <TableUsers /> },
      { path: "user/:id", element: <UserDetail /> },
      { path: "user/:id/edit", element: <EditUser /> },

      // Objetos
      { path: "object", element: <ListObjects /> },
      { path: "object/create", element: <CreateObjectItem /> },
      { path: "object/:id", element: <DetailObject /> },
      { path: "object/:id/edit", element: <EditObject /> },

      {
        path: '/user/login',
        element: <Login />
      },
      {
        path: '/user/create',
        element: <Register />
      },

      // Subastas — mantenimiento (vendedor/admin)
      { path: "auction", element: <ListAuction /> },
      { path: "auction/create", element: <CreateAuction /> },
      { path: "auction/detail/:id", element: <DetailBid /> },
      { path: "auction/:id/edit", element: <EditAuction /> },
      { path: "auction/:id/bids", element: <ListBid /> },

      // Subastas — explorar y pujar (comprador)
      { path: "explorar", element: <ActiveAuctionList /> },
      { path: "auction/:id", element: <CreateBid /> },


      { path: "payment", element: <PaymentList /> },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={rutas} />
  </StrictMode>,
)