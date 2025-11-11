// src/services/api.js

export const submitVisitForm = async (formData) => {
  const endpoint = 'http://localhost:5000/api/kunjungan';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData // Langsung kirim FormData yang sudah ada
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Gagal mengirim data');
    }

    return result;
  } catch (error) {
    console.error('Error during form submission:', error);
    throw error;
  }
};

export const getVisitData = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/kunjungan', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch visit data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get visit data error:', error);
    throw error;
  }
};

// Update status kunjungan WITH REJECTION REASON
export const updateVisitStatus = async (id, status, rejectionReason = null) => {
  try {
    const response = await fetch(`http://localhost:5000/api/kunjungan/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        status,
        rejection_reason: rejectionReason 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update status');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update status error:', error);
    throw error;
  }
};

// Delete kunjungan
export const deleteVisit = async (id) => {
  try {
    const response = await fetch(`http://localhost:5000/api/kunjungan/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete visit');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete visit error:', error);
    throw error;
  }
};

export const loginAPI = async (email, password) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};