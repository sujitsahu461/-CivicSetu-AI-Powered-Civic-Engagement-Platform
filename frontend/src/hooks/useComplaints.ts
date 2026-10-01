import { useEffect } from 'react';
import useComplaintStore from '../store/complaintStore';

export function useComplaints(params?: Record<string, any>) {
  const { complaints, selectedComplaint, isLoading, error, fetchComplaints, fetchComplaintById, submitComplaint, updateStatus } = useComplaintStore();

  useEffect(() => {
    fetchComplaints(params);
  }, [JSON.stringify(params)]);

  return {
    complaints,
    selectedComplaint,
    isLoading,
    error,
    refetch: () => fetchComplaints(params),
    fetchComplaintById,
    submitComplaint,
    updateStatus,
  };
}

export default useComplaints;
