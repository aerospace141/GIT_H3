import React, { useState, useEffect } from 'react';
import { Users, Lock, Unlock, Trash2, Plus, Edit, X, Search, Filter, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react';

const AdminStudentGroupManagement = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [showModal, setShowModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents();
      fetchGroups();
    } else if (activeTab === 'groups') {
      fetchGroups();
      fetchStudents();
    }
  }, [activeTab]);

  const getAuthHeaders = () => ({
    'Authorization': localStorage.getItem('token'),
    'X-Device-Id': localStorage.getItem('deviceId'),
    'Content-Type': 'application/json'
  });

  const showMessage = (message, type = 'success') => {
    if (type === 'error') {
      setError(message);
      setTimeout(() => setError(null), 5000);
    } else {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 5000);
    }
  };

  // ============ STUDENTS MANAGEMENT ============

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/students`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  const toggleStudentStatus = async (studentId, currentStatus) => {
    try {
      const response = await fetch(`${API_URL}/admin/students/${studentId}/toggle-status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      await response.json();
      fetchStudents();
      showMessage(`Student ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error updating student status:', error);
      showMessage('Error: ' + error.message, 'error');
    }
  };

  const deleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/students/${studentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete student');
      }

      fetchStudents();
      showMessage('Student deleted successfully');
    } catch (error) {
      console.error('Error deleting student:', error);
      showMessage('Error: ' + error.message, 'error');
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      (student.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesGroup = selectedGroup === 'all' || student.group === selectedGroup || student.class === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  // ============ GROUPS MANAGEMENT ============

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/groups`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }
      
      const data = await response.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      showMessage('Error fetching groups: ' + error.message, 'error');
      setGroups([]);
    }
  };

  const createOrUpdateGroup = async () => {
    if (!formData.name || !formData.name.trim()) {
      showMessage('Please enter a group name', 'error');
      return;
    }

    try {
      const url = editingId 
        ? `${API_URL}/admin/groups/${editingId}`
        : `${API_URL}/admin/groups`;
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description?.trim() || ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${editingId ? 'update' : 'create'} group`);
      }

      await response.json();
      fetchGroups();
      setShowModal(null);
      setFormData({});
      setEditingId(null);
      showMessage(`Group ${editingId ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving group:', error);
      showMessage('Error: ' + error.message, 'error');
    }
  };

  const deleteGroup = async (groupId, groupName) => {
    if (!window.confirm(`Delete group "${groupName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/groups/${groupId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete group');
      }

      fetchGroups();
      showMessage('Group deleted successfully');
    } catch (error) {
      console.error('Error deleting group:', error);
      showMessage('Error: ' + error.message, 'error');
    }
  };

  const startEditGroup = (group) => {
    setFormData({ 
      name: group.name || '', 
      description: group.description || '' 
    });
    setEditingId(group._id);
    setShowModal('editGroup');
  };

  // Add students to group
  const addStudentsToGroup = async (groupId) => {
    if (selectedStudentIds.length === 0) {
      showMessage('Please select at least one student', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/groups/${groupId}/add-students`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ studentIds: selectedStudentIds })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add students');
      }

      const result = await response.json();
      fetchGroups();
      fetchStudents();
      setSelectedStudentIds([]);
      setShowModal(null);
      showMessage(result.message || 'Students added to group successfully');
    } catch (error) {
      console.error('Error adding students:', error);
      showMessage('Error: ' + error.message, 'error');
    }
  };

  // Remove student from group
  const removeStudentFromGroup = async (groupId, studentId) => {
    if (!window.confirm('Remove this student from the group?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/groups/${groupId}/students/${studentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove student');
      }

      fetchGroups();
      fetchStudents();
      showMessage('Student removed from group');
    } catch (error) {
      console.error('Error removing student:', error);
      showMessage('Error: ' + error.message, 'error');
    }
  };

  // ============ UI COMPONENTS ============

  const MessageAlert = ({ type, message }) => {
    if (!message) return null;
    
    const isError = type === 'error';
    return (
      <div className={`asgm__alert ${isError ? 'asgm__alert--error' : 'asgm__alert--success'}`}>
        {isError ? (
          <AlertCircle className="asgm__alert-icon" size={20} />
        ) : (
          <CheckCircle className="asgm__alert-icon" size={20} />
        )}
        <p className="asgm__alert-text">{message}</p>
      </div>
    );
  };

  const StudentsList = () => (
    <div className="asgm__content-section">
      <MessageAlert type="error" message={error} />
      <MessageAlert type="success" message={success} />

      <div className="asgm__filter-card">
        <div className="asgm__filter-row">
          <div className="asgm__search-wrapper">
            <Search className="asgm__search-icon" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="asgm__search-input"
            />
          </div>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="asgm__select"
          >
            <option value="all">All Groups</option>
            {groups.map(group => (
              <option key={group._id} value={group.name}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        <p className="asgm__filter-count">
          Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> students
        </p>
      </div>

      {filteredStudents.length > 0 ? (
        <div className="asgm__table-card">
          <div className="asgm__table-wrapper">
            <table className="asgm__table">
              <thead className="asgm__table-head">
                <tr>
                  <th className="asgm__table-th">Student Name</th>
                  <th className="asgm__table-th">Email</th>
                  <th className="asgm__table-th">Group</th>
                  <th className="asgm__table-th">Status</th>
                  <th className="asgm__table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="asgm__table-body">
                {filteredStudents.map(student => (
                  <tr key={student._id} className="asgm__table-row">
                    <td className="asgm__table-td">
                      <div className="asgm__student-name">
                        {student.firstName} {student.lastName}
                      </div>
                    </td>
                    <td className="asgm__table-td asgm__table-email">{student.email}</td>
                    <td className="asgm__table-td">
                      <span className="asgm__badge asgm__badge--group">
                        {student.group || student.class || 'Unassigned'}
                      </span>
                    </td>
                    <td className="asgm__table-td">
                      <span className={`asgm__badge ${
                        student.isActive !== false
                          ? 'asgm__badge--active' 
                          : 'asgm__badge--disabled'
                      }`}>
                        {student.isActive !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="asgm__table-td">
                      <div className="asgm__action-buttons">
                        <button
                          onClick={() => toggleStudentStatus(student._id, student.isActive !== false)}
                          className={`asgm__icon-button ${
                            student.isActive !== false
                              ? 'asgm__icon-button--warning'
                              : 'asgm__icon-button--success'
                          }`}
                          title={student.isActive !== false ? 'Disable' : 'Enable'}
                        >
                          {student.isActive !== false ? <Lock size={18} /> : <Unlock size={18} />}
                        </button>
                        <button
                          onClick={() => deleteStudent(student._id)}
                          className="asgm__icon-button asgm__icon-button--danger"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="asgm__empty-state">
          <Users size={48} className="asgm__empty-icon" />
          <p className="asgm__empty-text">No students found</p>
        </div>
      )}
    </div>
  );

  const GroupsList = () => {
    const getGroupStudents = (groupId) => {
      const group = groups.find(g => g._id === groupId);
      if (!group) return [];
      return students.filter(s => s.group === group.name || s.class === group.name);
    };

    return (
      <div className="asgm__content-section">
        <MessageAlert type="error" message={error} />
        <MessageAlert type="success" message={success} />

        <button
          onClick={() => {
            setFormData({ name: '', description: '' });
            setEditingId(null);
            setShowModal('createGroup');
          }}
          className="asgm__primary-button"
        >
          <Plus size={20} />
          Create New Group
        </button>

        {groups.length > 0 ? (
          <div className="asgm__groups-list">
            {groups.map(group => {
              const groupStudents = getGroupStudents(group._id);
              const isExpanded = expandedGroup === group._id;

              return (
                <div key={group._id} className="asgm__group-card">
                  {/* Group Header */}
                  <div className="asgm__group-header">
                    <div className="asgm__group-info">
                      <div className="asgm__group-title-section">
                        <h3 className="asgm__group-title">{group.name}</h3>
                        <p className="asgm__group-description">
                          {group.description || <span className="asgm__group-no-desc">No description</span>}
                        </p>
                        <div className="asgm__group-stats">
                          <div className="asgm__group-stat">
                            <Users size={16} className="asgm__stat-icon" />
                            <span className="asgm__stat-text">
                              <strong>{groupStudents.length}</strong> students
                            </span>
                          </div>
                          {group.avgScore !== undefined && (
                            <div className="asgm__group-stat">
                              <span className="asgm__stat-label">Avg Score: </span>
                              <span className="asgm__stat-value">{group.avgScore}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="asgm__group-actions">
                        <button
                          onClick={() => startEditGroup(group)}
                          className="asgm__icon-button asgm__icon-button--primary"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => deleteGroup(group._id, group.name)}
                          className="asgm__icon-button asgm__icon-button--danger"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Expand Button */}
                    <button
                      onClick={() => setExpandedGroup(isExpanded ? null : group._id)}
                      className="asgm__expand-button"
                    >
                      <ChevronDown size={16} className={`asgm__expand-icon ${isExpanded ? 'asgm__expand-icon--rotated' : ''}`} />
                      {isExpanded ? 'Hide Students' : 'Show Students'} ({groupStudents.length})
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="asgm__group-expanded">
                      {/* Add Students Button */}
                      <div className="asgm__group-add-section">
                        <button
                          onClick={() => {
                            setSelectedStudentIds([]);
                            setShowModal(`addStudents-${group._id}`);
                          }}
                          className="asgm__success-button"
                        >
                          <Plus size={18} />
                          Add Students to Group
                        </button>
                      </div>

                      {/* Students List */}
                      {groupStudents.length > 0 ? (
                        <div className="asgm__group-students-table">
                          <table className="asgm__table">
                            <thead className="asgm__table-head asgm__table-head--secondary">
                              <tr>
                                <th className="asgm__table-th">Student Name</th>
                                <th className="asgm__table-th">Email</th>
                                <th className="asgm__table-th">Status</th>
                                <th className="asgm__table-th">Action</th>
                              </tr>
                            </thead>
                            <tbody className="asgm__table-body">
                              {groupStudents.map(student => (
                                <tr key={student._id} className="asgm__table-row">
                                  <td className="asgm__table-td asgm__student-name">
                                    {student.firstName} {student.lastName}
                                  </td>
                                  <td className="asgm__table-td asgm__table-email">{student.email}</td>
                                  <td className="asgm__table-td">
                                    <span className={`asgm__badge asgm__badge--small ${
                                      student.isActive !== false
                                        ? 'asgm__badge--active'
                                        : 'asgm__badge--disabled'
                                    }`}>
                                      {student.isActive !== false ? 'Active' : 'Disabled'}
                                    </span>
                                  </td>
                                  <td className="asgm__table-td">
                                    <button
                                      onClick={() => removeStudentFromGroup(group._id, student._id)}
                                      className="asgm__text-button asgm__text-button--danger"
                                    >
                                      Remove
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="asgm__empty-group-students">
                          No students in this group yet
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="asgm__empty-state">
            <Filter size={48} className="asgm__empty-icon" />
            <p className="asgm__empty-text">No groups created yet</p>
          </div>
        )}
      </div>
    );
  };

  const GroupModal = ({ isEdit = false }) => (
    <div className="asgm__modal-overlay">
      <div className="asgm__modal-card asgm__modal-card--medium">
        <div className="asgm__modal-header">
          <h3 className="asgm__modal-title">
            {isEdit ? 'Edit Group' : 'Create New Group'}
          </h3>
          <button
            onClick={() => {
              setShowModal(null);
              setFormData({});
              setEditingId(null);
            }}
            className="asgm__modal-close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="asgm__modal-body">
          <div className="asgm__form-group">
            <label className="asgm__form-label">
              Group Name <span className="asgm__required">*</span>
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Class 10-A"
              className="asgm__form-input"
            />
          </div>

          <div className="asgm__form-group">
            <label className="asgm__form-label">
              Description (Optional)
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter group description..."
              rows="3"
              className="asgm__form-textarea"
            />
          </div>
        </div>

        <div className="asgm__modal-footer">
          <button
            onClick={createOrUpdateGroup}
            className="asgm__modal-button asgm__modal-button--primary"
          >
            {isEdit ? 'Update' : 'Create'}
          </button>
          <button
            onClick={() => {
              setShowModal(null);
              setFormData({});
              setEditingId(null);
            }}
            className="asgm__modal-button asgm__modal-button--secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const AddStudentsModal = ({ groupId }) => {
    const availableStudents = students.filter(s => {
      const group = groups.find(g => g._id === groupId);
      return !(s.group === group?.name || s.class === group?.name);
    });

    return (
      <div className="asgm__modal-overlay">
        <div className="asgm__modal-card asgm__modal-card--large">
          <div className="asgm__modal-header">
            <h3 className="asgm__modal-title">Add Students to Group</h3>
            <button
              onClick={() => {
                setShowModal(null);
                setSelectedStudentIds([]);
              }}
              className="asgm__modal-close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="asgm__modal-scroll-body">
            {availableStudents.length > 0 ? (
              <div className="asgm__student-list">
                {availableStudents.map(student => (
                  <label key={student._id} className="asgm__student-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(student._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudentIds([...selectedStudentIds, student._id]);
                        } else {
                          setSelectedStudentIds(selectedStudentIds.filter(id => id !== student._id));
                        }
                      }}
                      className="asgm__checkbox-input"
                    />
                    <div className="asgm__student-info">
                      <p className="asgm__student-checkbox-name">{student.firstName} {student.lastName}</p>
                      <p className="asgm__student-checkbox-email">{student.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="asgm__empty-modal">
                All students are already assigned to groups
              </div>
            )}
          </div>

          <div className="asgm__modal-footer">
            <button
              onClick={() => addStudentsToGroup(groupId)}
              className="asgm__modal-button asgm__modal-button--success"
              disabled={selectedStudentIds.length === 0}
            >
              Add {selectedStudentIds.length} Student{selectedStudentIds.length !== 1 ? 's' : ''}
            </button>
            <button
              onClick={() => {
                setShowModal(null);
                setSelectedStudentIds([]);
              }}
              className="asgm__modal-button asgm__modal-button--secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="asgm__container">
      <div className="asgm__inner">
        <div className="asgm__header">
          <h1 className="asgm__title">Student & Group Management</h1>
          <p className="asgm__subtitle">Manage student access and organize them into groups</p>
        </div>

        <div className="asgm__tabs">
          <button
            onClick={() => setActiveTab('students')}
            className={`asgm__tab ${activeTab === 'students' ? 'asgm__tab--active' : ''}`}
          >
            <Users size={20} />
            Students ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`asgm__tab ${activeTab === 'groups' ? 'asgm__tab--active' : ''}`}
          >
            <Filter size={20} />
            Groups ({groups.length})
          </button>
        </div>

        {loading ? (
          <div className="asgm__loading">
            <div className="asgm__loading-spinner"></div>
            <p className="asgm__loading-text">Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === 'students' && <StudentsList />}
            {activeTab === 'groups' && <GroupsList />}
          </>
        )}
      </div>

      {showModal === 'createGroup' && <GroupModal isEdit={false} />}
      {showModal === 'editGroup' && <GroupModal isEdit={true} />}
      {showModal?.startsWith('addStudents-') && (
        <AddStudentsModal groupId={showModal.replace('addStudents-', '')} />
      )}

      <style jsx>{`
        .asgm__container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .asgm__inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem;
        }

        .asgm__header {
          margin-bottom: 2rem;
        }

        .asgm__title {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 0.5rem;
          letter-spacing: -0.025em;
          background: linear-gradient(135deg, #1f2937, #374151);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .asgm__subtitle {
          color: #6b7280;
          margin: 0;
          font-size: 1rem;
          font-weight: 500;
        }

        .asgm__tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid rgba(226, 232, 240, 0.8);
        }

        .asgm__tab {
          padding: 1rem 0.75rem;
          font-weight: 600;
          font-size: 0.95rem;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
          margin-bottom: -2px;
        }

        .asgm__tab:hover {
          color: #374151;
        }

        .asgm__tab--active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .asgm__content-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .asgm__alert {
          border-radius: 14px;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border: 1px solid;
          backdrop-filter: blur(20px);
          animation: asgm-slide-down 0.3s ease;
        }

        .asgm__alert--error {
          background: linear-gradient(135deg, rgba(254, 242, 242, 0.95), rgba(254, 226, 226, 0.95));
          border-color: rgba(252, 165, 165, 0.5);
          box-shadow: 0 4px 20px rgba(239, 68, 68, 0.15);
        }

        .asgm__alert--success {
          background: linear-gradient(135deg, rgba(236, 253, 245, 0.95), rgba(209, 250, 229, 0.95));
          border-color: rgba(167, 243, 208, 0.5);
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15);
        }

        .asgm__alert-icon {
          flex-shrink: 0;
        }

        .asgm__alert--error .asgm__alert-icon {
          color: #dc2626;
        }

        .asgm__alert--success .asgm__alert-icon {
          color: #059669;
        }

        .asgm__alert-text {
          margin: 0;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .asgm__alert--error .asgm__alert-text {
          color: #991b1b;
        }

        .asgm__alert--success .asgm__alert-text {
          color: #065f46;
        }

        .asgm__filter-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 25px rgba(0, 0, 0, 0.05);
        }

        .asgm__filter-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .asgm__search-wrapper {
          flex: 1;
          min-width: 250px;
          position: relative;
        }

        .asgm__search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }

        .asgm__search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border: 2px solid transparent;
          background: linear-gradient(135deg, #ffffff, #f9fafb);
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.3s;
          color: #1f2937;
          font-weight: 500;
        }

        .asgm__search-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .asgm__search-input::placeholder {
          color: #9ca3af;
        }

        .asgm__select {
          padding: 0.75rem 1rem;
          border: 2px solid transparent;
          background: linear-gradient(135deg, #ffffff, #f9fafb);
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 500;
          color: #1f2937;
          cursor: pointer;
          transition: all 0.3s;
        }

        .asgm__select:focus {
          outline: none;
          border-color: #3b82f6;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .asgm__filter-count {
          margin: 0;
          color: #6b7280;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .asgm__filter-count strong {
          color: #1f2937;
          font-weight: 700;
        }

        .asgm__table-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 25px rgba(0, 0, 0, 0.05);
        }

        .asgm__table-wrapper {
          overflow-x: auto;
        }

        .asgm__table {
          width: 100%;
          border-collapse: collapse;
        }

        .asgm__table-head {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border-bottom: 2px solid rgba(226, 232, 240, 0.8);
        }

        .asgm__table-head--secondary {
          background: linear-gradient(135deg, #f9fafb, #f3f4f6);
        }

        .asgm__table-th {
          padding: 1rem 1.5rem;
          text-align: left;
          font-size: 0.875rem;
          font-weight: 700;
          color: #374151;
          letter-spacing: 0.025em;
          text-transform: uppercase;
        }

        .asgm__table-body {
          background: rgba(255, 255, 255, 0.7);
        }

        .asgm__table-row {
          border-bottom: 1px solid rgba(226, 232, 240, 0.6);
          transition: all 0.2s;
        }

        .asgm__table-row:hover {
          background: linear-gradient(135deg, rgba(243, 244, 246, 0.8), rgba(249, 250, 251, 0.8));
        }

        .asgm__table-td {
          padding: 1.25rem 1.5rem;
          color: #374151;
          font-size: 0.95rem;
        }

        .asgm__student-name {
          font-weight: 600;
          color: #1f2937;
        }

        .asgm__table-email {
          color: #6b7280;
        }

        .asgm__badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.025em;
        }

        .asgm__badge--small {
          padding: 0.375rem 0.75rem;
          font-size: 0.8rem;
        }

        .asgm__badge--group {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          color: #1e40af;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .asgm__badge--active {
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          color: #065f46;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .asgm__badge--disabled {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #991b1b;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .asgm__action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .asgm__icon-button {
          padding: 0.625rem;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .asgm__icon-button--warning {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          color: #92400e;
        }

        .asgm__icon-button--warning:hover {
          background: linear-gradient(135deg, #fde68a, #fcd34d);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
        }

        .asgm__icon-button--success {
          background: linear-gradient(135deg, #d1fae5, #a7f3d0);
          color: #065f46;
        }

        .asgm__icon-button--success:hover {
          background: linear-gradient(135deg, #a7f3d0, #6ee7b7);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .asgm__icon-button--danger {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #991b1b;
        }

        .asgm__icon-button--danger:hover {
          background: linear-gradient(135deg, #fecaca, #fca5a5);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }

        .asgm__icon-button--primary {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          color: #1e40af;
        }

        .asgm__icon-button--primary:hover {
          background: linear-gradient(135deg, #bfdbfe, #93c5fd);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .asgm__empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 16px;
        }

        .asgm__empty-icon {
          margin: 0 auto 1rem;
          color: #d1d5db;
        }

        .asgm__empty-text {
          color: #6b7280;
          font-size: 1rem;
          font-weight: 500;
          margin: 0;
        }

        .asgm__primary-button {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 0.875rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
        }

        .asgm__primary-button:hover {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }

        .asgm__success-button {
          background: linear-gradient(135deg, #10b981, #047857);
          color: white;
          padding: 0.875rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
        }

        .asgm__success-button:hover {
          background: linear-gradient(135deg, #059669, #065f46);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        }

        .asgm__groups-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .asgm__group-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 25px rgba(0, 0, 0, 0.05);
          transition: all 0.3s;
        }

        .asgm__group-card:hover {
          box-shadow: 0 8px 35px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .asgm__group-header {
          padding: 2rem;
        }

        .asgm__group-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1.5rem;
        }

        .asgm__group-title-section {
          flex: 1;
        }

        .asgm__group-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 0.5rem;
          letter-spacing: -0.025em;
        }

        .asgm__group-description {
          color: #6b7280;
          font-size: 0.95rem;
          margin: 0 0 1rem;
          line-height: 1.5;
        }

        .asgm__group-no-desc {
          color: #d1d5db;
          font-style: italic;
        }

        .asgm__group-stats {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .asgm__group-stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .asgm__stat-icon {
          color: #6b7280;
        }

        .asgm__stat-text {
          color: #374151;
        }

        .asgm__stat-text strong {
          font-weight: 700;
          color: #1f2937;
        }

        .asgm__stat-label {
          color: #6b7280;
        }

        .asgm__stat-value {
          font-weight: 700;
          color: #1f2937;
        }

        .asgm__group-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .asgm__expand-button {
          margin-top: 1.5rem;
          background: none;
          border: none;
          color: #3b82f6;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.375rem;
          transition: all 0.3s;
          padding: 0.5rem 0;
        }

        .asgm__expand-button:hover {
          color: #1d4ed8;
        }

        .asgm__expand-icon {
          transition: transform 0.3s;
        }

        .asgm__expand-icon--rotated {
          transform: rotate(180deg);
        }

        .asgm__group-expanded {
          border-top: 1px solid rgba(226, 232, 240, 0.8);
          background: linear-gradient(135deg, #fafbfc, #f8fafc);
        }

        .asgm__group-add-section {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
        }

        .asgm__group-students-table {
          overflow-x: auto;
        }

        .asgm__empty-group-students {
          padding: 2rem;
          text-align: center;
          color: #9ca3af;
          font-weight: 500;
        }

        .asgm__text-button {
          background: none;
          border: none;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
        }

        .asgm__text-button--danger {
          color: #dc2626;
        }

        .asgm__text-button--danger:hover {
          color: #991b1b;
          background: rgba(239, 68, 68, 0.1);
        }

        .asgm__modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: asgm-fade-in 0.3s ease;
        }

        .asgm__modal-card {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
          animation: asgm-scale-in 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .asgm__modal-card--medium {
          max-width: 500px;
        }

        .asgm__modal-card--large {
          max-width: 700px;
          max-height: 600px;
        }

        .asgm__modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 2rem 1.5rem;
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
        }

        .asgm__modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .asgm__modal-close {
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .asgm__modal-close:hover {
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
        }

        .asgm__modal-body {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .asgm__modal-scroll-body {
          flex: 1;
          overflow-y: auto;
          border-top: 1px solid rgba(226, 232, 240, 0.8);
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
        }

        .asgm__form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .asgm__form-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
        }

        .asgm__required {
          color: #ef4444;
        }

        .asgm__form-input,
        .asgm__form-textarea {
          padding: 0.875rem 1rem;
          border: 2px solid rgba(226, 232, 240, 0.8);
          background: #ffffff;
          border-radius: 12px;
          font-size: 0.95rem;
          color: #1f2937;
          font-weight: 500;
          transition: all 0.3s;
          font-family: inherit;
        }

        .asgm__form-input:focus,
        .asgm__form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .asgm__form-textarea {
          resize: none;
        }

        .asgm__modal-footer {
          display: flex;
          gap: 0.75rem;
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, #fafbfc, #f8fafc);
        }

        .asgm__modal-button {
          flex: 1;
          padding: 0.875rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .asgm__modal-button--primary {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
        }

        .asgm__modal-button--primary:hover {
          background: linear-gradient(135deg, #2563eb, #1e40af);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
        }

        .asgm__modal-button--success {
          background: linear-gradient(135deg, #10b981, #047857);
          color: white;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
        }

        .asgm__modal-button--success:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669, #065f46);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
        }

        .asgm__modal-button--success:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .asgm__modal-button--secondary {
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          color: #374151;
        }

        .asgm__modal-button--secondary:hover {
          background: linear-gradient(135deg, #e5e7eb, #d1d5db);
        }

        .asgm__student-list {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .asgm__student-checkbox {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }

        .asgm__student-checkbox:hover {
          background: linear-gradient(135deg, #f9fafb, #f3f4f6);
          border-color: rgba(226, 232, 240, 0.8);
        }

        .asgm__checkbox-input {
          width: 1.125rem;
          height: 1.125rem;
          border-radius: 6px;
          cursor: pointer;
          accent-color: #3b82f6;
        }

        .asgm__student-info {
          flex: 1;
        }

        .asgm__student-checkbox-name {
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.25rem;
          font-size: 0.95rem;
        }

        .asgm__student-checkbox-email {
          color: #6b7280;
          margin: 0;
          font-size: 0.875rem;
        }

        .asgm__empty-modal {
          padding: 3rem 1.5rem;
          text-align: center;
          color: #9ca3af;
          font-weight: 500;
        }

        .asgm__loading {
          text-align: center;
          padding: 4rem 2rem;
        }

        .asgm__loading-spinner {
          display: inline-block;
          width: 48px;
          height: 48px;
          border: 4px solid rgba(59, 130, 246, 0.2);
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: asgm-spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        .asgm__loading-text {
          color: #6b7280;
          font-weight: 500;
          margin: 0;
        }

        @keyframes asgm-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes asgm-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes asgm-scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes asgm-slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1024px) {
          .asgm__inner {
            padding: 1.25rem;
          }

          .asgm__title {
            font-size: 1.75rem;
          }

          .asgm__table-th,
          .asgm__table-td {
            padding: 1rem;
          }
        }

        @media (max-width: 768px) {
          .asgm__inner {
            padding: 1rem;
          }

          .asgm__title {
            font-size: 1.5rem;
          }

          .asgm__subtitle {
            font-size: 0.9rem;
          }

          .asgm__filter-row {
            flex-direction: column;
          }

          .asgm__search-wrapper {
            min-width: 100%;
          }

          .asgm__tabs {
            gap: 0.5rem;
          }

          .asgm__tab {
            font-size: 0.875rem;
            padding: 0.875rem 0.5rem;
          }

          .asgm__group-info {
            flex-direction: column;
          }

          .asgm__group-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .asgm__table-wrapper {
            overflow-x: scroll;
          }

          .asgm__table {
            min-width: 600px;
          }

          .asgm__modal-card--large {
            max-height: 80vh;
          }
        }

        @media (max-width: 480px) {
          .asgm__inner {
            padding: 0.75rem;
          }

          .asgm__header {
            margin-bottom: 1.5rem;
          }

          .asgm__title {
            font-size: 1.25rem;
          }

          .asgm__filter-card,
          .asgm__group-header,
          .asgm__group-add-section {
            padding: 1rem;
          }

          .asgm__modal-header,
          .asgm__modal-body,
          .asgm__modal-footer {
            padding: 1.25rem;
          }

          .asgm__primary-button,
          .asgm__success-button {
            width: 100%;
            justify-content: center;
          }

          .asgm__action-buttons {
            flex-direction: column;
            width: 100%;
          }

          .asgm__icon-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminStudentGroupManagement;