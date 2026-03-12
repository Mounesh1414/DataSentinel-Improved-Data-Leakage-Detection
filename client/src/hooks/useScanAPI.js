import { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

export const useScanAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadAndScan = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axiosInstance.post('/scan/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error scanning file');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getScanResults = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/scan/results', { params: filters });
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching scan results');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getScanDetail = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/scan/results/${id}`);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching scan details');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const quarantineFile = async (id, reason) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.put(`/scan/quarantine/${id}`, { reason });
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error quarantining file');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { uploadAndScan, getScanResults, getScanDetail, quarantineFile, loading, error };
};
