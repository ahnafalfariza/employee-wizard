import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { Popover } from '../../components/Popover/Popover';
import type { Employee, Role } from '../../types';
import styles from './EmployeeTable.module.css';

interface EmployeeTableProps {
  employees: Employee[];
  viewRole: Role;
}

function hasUnfilledDetails(employee: Employee): boolean {
  return !employee.employmentType || !employee.officeLocation;
}

export const EmployeeTable = ({ employees, viewRole: _viewRole }: EmployeeTableProps) => {
  const navigate = useNavigate();
  const [activeNotesEmployeeId, setActiveNotesEmployeeId] = useState<string | null>(null);

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Photo</th>
            <th>Name</th>
            <th>Department</th>
            <th>Role</th>
            <th>Location</th>
            <th>Employee ID</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.employeeId || employee.email}>
              <td>
                {employee.photo ? (
                  <img
                    src={employee.photo}
                    alt={employee.fullName}
                    className={styles.photo}
                  />
                ) : (
                  <span className={styles.placeholder}>—</span>
                )}
              </td>
              <td>{employee.fullName || '—'}</td>
              <td>{employee.department || '—'}</td>
              <td>{employee.role || '—'}</td>
              <td>{employee.officeLocation || '—'}</td>
              <td className={styles.employeeId}>{employee.employeeId || '—'}</td>
              <td>
                <Popover
                  trigger={
                    <button type="button" className={styles.notesTrigger}>
                      View notes
                    </button>
                  }
                  open={activeNotesEmployeeId === employee.employeeId}
                  onOpenChange={(open) =>
                    setActiveNotesEmployeeId(open ? employee.employeeId : null)
                  }
                >
                  {employee.notes?.trim() ? employee.notes : 'No notes'}
                </Popover>
              </td>
              <td>
                {hasUnfilledDetails(employee) && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      navigate(`/creation?role=ops&employeeId=${encodeURIComponent(employee.employeeId)}`)
                    }
                  >
                    Fill details
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
