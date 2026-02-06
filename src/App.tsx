import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CreationLayout } from './features/creation/CreationLayout';
import { EmployeeList } from './features/employees/EmployeeList';
import './styles/reset.css';
import './styles/variables.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/creation" element={<CreationLayout />} />
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/" element={<Navigate to="/employees" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
