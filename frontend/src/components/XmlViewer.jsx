import React, { useState, useRef } from 'react';
import Button from './Button';

const XmlViewer = ({ xml, fileName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('all');
  const viewerRef = useRef(null);

  // Parse XML string into a DOM object
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, 'text/xml');
  const pages = xmlDoc.getElementsByTagName('page');
  const totalPages = pages.length;

  // Filter content based on search term and type
  const filterContent = (content) => {
    if (!searchTerm) return true;
    return content.toLowerCase().includes(searchTerm.toLowerCase());
  };

  const getFilteredContent = () => {
    const page = pages[currentPage - 1];
    if (!page) return [];

    const elements = Array.from(page.children);
    return elements.filter(element => {
      if (filterType !== 'all' && element.tagName.toLowerCase() !== filterType) {
        return false;
      }
      return filterContent(element.textContent);
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      viewerRef.current?.scrollTo(0, 0);
    }
  };

  const highlightText = (text) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.split(regex).map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search in document..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <select
            value={filterType}
            onChange={handleFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Content</option>
            <option value="header">Headers</option>
            <option value="paragraph">Paragraphs</option>
            <option value="list">Lists</option>
            <option value="table">Tables</option>
          </select>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="secondary"
            >
              Previous
            </Button>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="secondary"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <div 
        ref={viewerRef}
        className="prose max-w-none overflow-y-auto max-h-[600px] p-4 border border-gray-200 rounded-lg"
      >
        {getFilteredContent().map((element, index) => {
          const tagName = element.tagName.toLowerCase();
          const content = element.textContent;
          
          switch (tagName) {
            case 'header':
              return (
                <h2 key={index} className="text-xl font-bold mt-4 mb-2">
                  {highlightText(content)}
                </h2>
              );
            case 'paragraph':
              return (
                <p key={index} className="mb-4">
                  {highlightText(content)}
                </p>
              );
            case 'list':
              return (
                <ul key={index} className="list-disc pl-4 mb-4">
                  {Array.from(element.children).map((item, i) => (
                    <li key={i} className="mb-2">
                      {highlightText(item.textContent)}
                    </li>
                  ))}
                </ul>
              );
            case 'table':
              return (
                <div key={index} className="overflow-x-auto mb-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <tbody>
                      {Array.from(element.children).map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                          {Array.from(row.children).map((cell, j) => (
                            <td key={j} className="px-4 py-2 border">
                              {highlightText(cell.textContent)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};

export default XmlViewer; 