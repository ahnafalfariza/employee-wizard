import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/Button/Button';
import { EmployeeTable } from './EmployeeTable';
import { basicInfoService } from '../../services/basicInfoService';
import { detailsService } from '../../services/detailsService';
import type { Employee, Role } from '../../types';
import styles from './EmployeeList.module.css';

const ITEMS_PER_PAGE = 10;

export const EmployeeList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewRole: Role = (searchParams.get('role') as Role) || 'admin';

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const setViewRole = (role: Role) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('role', role);
      return next;
    });
  };

  useEffect(() => {
    const fetchTotalCount = async () => {
      try {
        const allBasicInfo = await basicInfoService.getAll();
        const count = allBasicInfo.length;
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      } catch (error) {
        console.error('Error fetching total count:', error);
      }
    };
    fetchTotalCount();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [currentPage]);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      // Fetch both APIs in parallel
      const [basicInfoData, detailsData] = await Promise.all([
        basicInfoService.getPaginated(currentPage, ITEMS_PER_PAGE),
        detailsService.getAll(),
      ]);

      // Merge data by employeeId (primary key)
      // If details don't exist for a basicInfo entry, that's fine - just merge what exists
      const merged: Employee[] = basicInfoData.map((basic) => {
        const detail = detailsData.find(
          (d) => d.employeeId === basic.employeeId
        );
        return {
          ...basic,
          ...detail,
        } as Employee;
      });

      setEmployees(merged);
    } catch (error) {
      console.error('Error fetching employees:', error);
      alert('Failed to load employees. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.employeeListContainer}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Employee List</h1>
          <div className={styles.roleToggle} role="tablist" aria-label="View as role">
            <button
              type="button"
              role="tab"
              aria-selected={viewRole === 'admin'}
              className={viewRole === 'admin' ? styles.roleTabActive : styles.roleTab}
              onClick={() => setViewRole('admin')}
            >
              Admin
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewRole === 'ops'}
              className={viewRole === 'ops' ? styles.roleTabActive : styles.roleTab}
              onClick={() => setViewRole('ops')}
            >
              Ops
            </button>
          </div>
        </div>
        {viewRole === 'admin' && (
          <Button onClick={() => navigate(`/creation?role=${viewRole}`)}>
            + Add Employee
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading employees...</div>
      ) : employees.length === 0 ? (
        <div className={styles.empty}>
          <p>No employees found.</p>
          <Button onClick={() => navigate(`/creation?role=${viewRole}`)}>
            Add First Employee
          </Button>
        </div>
      ) : (
        <>
          <EmployeeTable employees={employees} viewRole={viewRole} />
          
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <Button
                variant="secondary"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="secondary"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
