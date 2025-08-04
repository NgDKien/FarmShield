import React from 'react';
import { Route, Routes } from 'react-router-dom'
import { Home, Public, BaiXe, QuyTrinhKT, PhongCachLy, CongKhuKT, CamQuetMat, QuanLyGSV, Notification, WTest } from './pages'
import path from './ultils/path'

function App() {

  return (
    <>
      <Routes>
        <Route path={path.PUBLIC} element={<Public />}>
          <Route path={path.HOME} element={<Home />} />
          <Route path={path.CAM__BAI_XE} element={<BaiXe />} />
          <Route path={path.CAM__QT_KHU_TRUNG} element={<QuyTrinhKT />} />
          <Route path={path.CAM__PHONG_CACH_LY} element={<PhongCachLy />} />
          <Route path={path.CAM__CONG_KHU_TRUNG} element={<CongKhuKT />} />
          <Route path={path.CAM__QUET_MAT} element={<CamQuetMat />} />
          <Route path={path.NOTIFICATION} element={<Notification />} />
          <Route path={path.ADMIN__MANAGE_GSV} element={<QuanLyGSV />} />
          <Route path={path.TEST} element={<WTest />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
