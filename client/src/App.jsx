import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom'
import { Home, Public, BaiXe, QuyTrinhKT, PhongCachLy, CongKhuKT, QuanLyGSV, Notification, WTest, Login, QuanLyCamera } from './pages'
import path from './ultils/path'
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, current } = useSelector(state => state.user);

  if (!isLoggedIn) {
    return <Navigate to={path.LOGIN} replace />;
  }

  return children;
};

function App() {

  return (
    <>
      <Routes>
        <Route path={path.LOGIN} element={<Login />} />
        <Route path={path.PUBLIC} element={
          <ProtectedRoute>
            <Public />
          </ProtectedRoute>
        }>
          <Route path={path.HOME} element={<Home />} />
          <Route path={path.CAM__BAI_XE} element={<BaiXe />} />
          <Route path={path.CAM__QT_KHU_TRUNG} element={<QuyTrinhKT />} />
          <Route path={path.CAM__PHONG_CACH_LY} element={<PhongCachLy />} />
          <Route path={path.CAM__CONG_KHU_TRUNG} element={<CongKhuKT />} />
          <Route path={path.NOTIFICATION} element={<Notification />} />
          <Route path={path.ADMIN__MANAGE_GSV} element={<QuanLyGSV />} />
          <Route path={path.ADMIN__MANAGE_CAMERA} element={<QuanLyCamera />} />
          <Route path={path.TEST} element={<WTest />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
