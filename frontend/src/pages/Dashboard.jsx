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

      toast.loading('Downloading XML...');
      
      const blob = await conversionService.downloadXML(conversion._id);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = conversion.originalFileName.replace('.pdf', '.xml');
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.dismiss();
      toast.success('XML downloaded successfully');
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || 'Failed to download the converted file');
    }
  };

  const handlePreview = async (conversion) => {
    try {
      if (conversion.status !== 'completed') {
        toast.error('Conversion is not completed yet');
        return;
      }

      toast.loading('Loading preview...');
      
      try {
        const blob = await conversionService.downloadXML(conversion._id);
        const xmlContent = await blob.text();
        
        setSelectedConversion({ ...conversion, xml: xmlContent });
        setShowPreview(true);
      } catch (error) {
        throw new Error('Could not load preview: ' + (error.message || 'Unknown error'));
      }
      
      toast.dismiss();
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || 'Failed to load preview');
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
        <div className="px-4 sm:px-0">
          {showPreview && selectedConversion ? (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">
                  XML Preview: {selectedConversion.originalFileName}
                </h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-300"
                >
                  Back to List
                </button>
              </div>
              <div className="mt-4 border rounded-lg overflow-auto max-h-[600px] p-4 bg-gray-50">
                <XmlViewer xml={selectedConversion.xml} />
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleDownload(selectedConversion)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Download XML
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Upload PDF</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose a PDF file
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="mr-3"
                    disabled={loading}
                  />
                  <Button
                    onClick={handleUpload}
                    loading={loading}
                    disabled={!selectedFile || loading}
                  >
                    Upload
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!showPreview && (
            <div className="bg-white shadow rounded-lg p-6 mt-6">
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
                                  size="sm"
                                >
                                  Preview
                                </Button>
                                <Button
                                  onClick={() => handleDownload(conversion)}
                                  size="sm"
                                >
                                  Download
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {isLoadingMore && <p className="text-center mt-4">Loading more...</p>}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 