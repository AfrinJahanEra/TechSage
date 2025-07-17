import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/blogUtils';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const ModeratorReports = () => {
  const { api, user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/?status=${filter}`);
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const handleViewBlog = (blogId) => {
    if (!blogId) {
      alert('This blog has been deleted');
      return;
    }
    navigate(`/blog/${blogId}`);
  };

  const handleRejectReport = async (reportId) => {
    confirmAlert({
      title: 'Confirm Approval',
      message: 'Are you sure you want to accept this report?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await api.post(`/reports/${reportId}/approve/`, {
                reviewer_id: user.id
              });
              fetchReports();
              alert('Report accepted successfully');
            } catch (error) {
              console.error('Error approving report:', error);
              alert('Failed to accept report');
            }
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  const handleApproveReport = async (reportId, blogId) => {
    confirmAlert({
      title: 'Confirm Rejection',
      message: 'Are you sure you want to reject this report and delete the blog?',
      buttons: [
        {
          label: 'Yes, Reject',
          onClick: async () => {
            try {
              await api.post(`/reports/${reportId}/reject/`, {
                reviewer_id: user.id
              });
              fetchReports();
              alert('Report rejected and blog deleted');
            } catch (error) {
              console.error('Error rejecting report:', error);
              alert('Failed to reject report');
            }
          }
        },
        {
          label: 'Cancel',
          onClick: () => {}
        }
      ]
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Content Reports</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No {filter} reports found
        </div>
      ) : (
        reports.map((report) => (
          <div key={report.id} className="border rounded-lg p-4 mb-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 
                  className={`font-bold text-lg cursor-pointer hover:text-teal-600 ${
                    !report.blog ? 'text-gray-500' : ''
                  }`}
                  onClick={() => handleViewBlog(report.blog?.id)}
                >
                  {report.blog?.title || 'Deleted Blog'}
                </h3>
                <p className="text-sm text-gray-500">
                  Reported by {report.reported_by?.username || 'Unknown'} on {formatDate(report.created_at)}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                report.status === 'accepted' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {report.status === 'pending' ? 'Pending' : 
                 report.status === 'accepted' ? 'Accepted' : 'Rejected'}
              </span>
            </div>

            <div className="mb-3">
              <p className="font-medium">Reason: {report.reason}</p>
              <p className="text-gray-700">{report.details}</p>
            </div>

            {report.reviewed_by && (
              <p className="text-sm text-gray-500">
                {report.status} by {report.reviewed_by.username} on {formatDate(report.reviewed_at)}
              </p>
            )}

            {filter === 'pending' && (
              <div className="flex space-x-4 mt-4">
                <button
                  onClick={() => handleApproveReport(report.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRejectReport(report.id, report.blog?.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Reject
                </button>
                {report.blog && (
                  <button
                    onClick={() => handleViewBlog(report.blog.id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    View Blog
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ModeratorReports;