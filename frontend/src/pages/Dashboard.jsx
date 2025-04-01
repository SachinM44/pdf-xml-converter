import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { conversionService, API_URL } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import XmlViewer from '../components/XmlViewer';
import Button from '../components/Button';


export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef();
  const lastConversionRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        loadMoreConversions();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, isLoadingMore]);
  const [selectedConversion, setSelectedConversion] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadConversions();
  }, [user, navigate]);

  const loadConversions = async () => {
    try {
      setLoading(true);
      const data = await conversionService.getHistory();
      setConversions(data);
      setHasMore(data.length === 10); // Assuming 10 items per page
      setPage(1);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/login');
      } else {
        toast.error('Failed to load conversion history');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMoreConversions = async () => {
    if (isLoadingMore || !hasMore) return;
    
    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const data = await conversionService.getHistory(nextPage);
      
      if (data.length === 0) {
        setHasMore(false);
        return;
      }

      setConversions(prev => [...prev, ...data]);
      setHasMore(data.length === 10); // Assuming 10 items per page
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more conversions:', error);
      toast.error('Failed to load more conversions');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      toast.error('Please select a valid PDF file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a PDF file');
      return;
    }

    setLoading(true);
    try {
      await conversionService.uploadPDF(selectedFile);
      toast.success('PDF uploaded successfully. Conversion in progress...');
      setSelectedFile(null);
      loadConversions(); // Reload the first page
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to upload PDF');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (conversion) => {
    try {
      if (conversion.status !== 'completed') {
        toast.error('Conversion is not completed yet');
        return;
      }

      const response = await fetch(`${API_URL}/conversions/${conversion._id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = conversion.originalFileName.replace('.pdf', '.xml');
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download the converted file');
    }
  };

  const handlePreview = async (conversion) => {
    try {
      if (conversion.status !== 'completed') {
        toast.error('Conversion is not completed yet');
        return;
      }

      const response = await fetch(`${API_URL}/conversions/${conversion._id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch XML');
      }

      const xml = await response.text();
      setSelectedConversion({ ...conversion, xml });
      setShowPreview(true);
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to load preview');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">PDF to XML Converter</h1>
            </div>
            <div className="flex items-center">
              <span className="mr-4">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Upload PDF</h2>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
              <Button
                onClick={handleUpload}
                disabled={loading || !selectedFile}
                loading={loading}
              >
                Upload
              </Button>
            </div>
          </div>

          {showPreview ? (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">XML Preview</h2>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setShowPreview(false)}
                    variant="secondary"
                  >
                    Back to List
                  </Button>
                  <Button
                    onClick={() => handleDownload(selectedConversion)}
                  >
                    Download XML
                  </Button>
                </div>
              </div>
              <XmlViewer
                xml={selectedConversion.xml}
                fileName={selectedConversion.originalFileName}
              />
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Conversion History</h2>
              <div className="max-h-[600px] overflow-y-auto">
                {conversions.length === 0 ? (
                  <p className="text-gray-500">No conversions yet</p>
                ) : (
                  <div className="space-y-4">
                    {conversions.map((conversion, index) => (
                      <div
                        key={conversion._id}
                        ref={index === conversions.length - 1 ? lastConversionRef : null}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{conversion.originalFileName}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(conversion.createdAt).toLocaleString()}
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              conversion.status === 'completed' ? 'bg-green-100 text-green-800' :
                              conversion.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {conversion.status.charAt(0).toUpperCase() + conversion.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            {conversion.status === 'completed' && (
                              <>
                                <Button
                                  onClick={() => handlePreview(conversion)}
                                  variant="secondary"
                                >
                                  Preview
                                </Button>
                                <Button
                                  onClick={() => handleDownload(conversion)}
                                >
                                  Download
                                </Button>
                              </>
                            )}
                            {conversion.status === 'failed' && (
                              <p className="text-red-600 text-sm">{conversion.error}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoadingMore && (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 