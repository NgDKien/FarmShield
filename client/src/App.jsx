import React from 'react';
import { Route, Routes } from 'react-router-dom'
import { Home, Public, BaiXe, QuyTrinhKT } from './pages'
import path from './ultils/path'

function App() {

  return (
    <>
      <Routes>
        <Route path={path.PUBLIC} element={<Public />}>
          <Route path={path.HOME} element={<Home />} />
          <Route path={path.CAM__BAI_XE} element={<BaiXe />} />
          <Route path={path.CAM__QT_KHU_TRUNG} element={<QuyTrinhKT />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
