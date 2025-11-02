import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Loader2, Search, Filter, ChevronDown, ChevronUp, AlertCircle, FileText, CheckCircle, 
  XCircle, Trash2, ArrowDownToLine, Users, Building, ShieldCheck, Mail, ClipboardList
} from 'lucide-react';

// --- MOCK DATA & API CALL (Simulating the updated backend response) ---

const mockEntries = [
  {
    id: '65f6f3b0e1b1d7d08f7b0f01',
    entryDate: new Date(Date.now() - 86400000 * 5),
    playerName: 'Arjun Reddy',
    playerTnBaId: 'TNBA-00123',
    academy: 'Smash Academy',
    district: 'Chennai',
    eventCount: 3,
    categories: 'Under 15, Under 17',
    types: 'singles, doubles',
    statuses: 'approved, pending',
    detailedEvents: [
      {
        _id: 'e1', category: 'Under 15', type: 'singles', status: 'approved',
        partner: null,
        payment: { status: 'Paid', metadata: { paymentAmount: 500, paymentApp: 'GPay' } },
        ApproverdBy: { name: 'Admin One', email: 'admin@example.com' },
      },
      {
        _id: 'e2', category: 'Under 15', type: 'doubles', status: 'pending',
        partner: { fullname: 'Suresh Kumar', dob: '2010-01-01', TnBaId: 'TNBA-00456', academyName: 'ACE', place: 'Madurai', district: 'Madurai' },
        payment: { status: 'Pending', metadata: { paymentAmount: 500, paymentApp: 'PayTM' } },
        ApproverdBy: null,
      },
      {
        _id: 'e3', category: 'Under 17', type: 'singles', status: 'approved',
        partner: null,
        payment: { status: 'Paid', metadata: { paymentAmount: 600, paymentApp: 'PhonePe' } },
        ApproverdBy: { name: 'Super Admin', email: 'super@example.com' },
      },
    ],
  },
  {
    id: '65f6f3b0e1b1d7d08f7b0f02',
    entryDate: new Date(Date.now() - 86400000 * 2),
    playerName: 'Priya Sharma',
    playerTnBaId: 'TNBA-00789',
    academy: 'Apex Training',
    district: 'Coimbatore',
    eventCount: 4,
    categories: 'Under 19, Under 17',
    types: 'singles, mixed doubles, doubles',
    statuses: 'rejected',
    detailedEvents: [
      {
        _id: 'e4', category: 'Under 19', type: 'singles', status: 'rejected',
        partner: null,
        payment: { status: 'Failed', metadata: { paymentAmount: 700, paymentApp: 'GPay' } },
        ApproverdBy: { name: 'Admin One', email: 'admin@example.com' },
      },
      {
        _id: 'e5', category: 'Under 19', type: 'doubles', status: 'rejected',
        partner: { fullname: 'Vimal Raj', dob: '2008-05-15', TnBaId: 'TNBA-00101', academyName: 'Apex', place: 'Tirupur', district: 'Tirupur' },
        payment: { status: 'Failed', metadata: { paymentAmount: 700, paymentApp: 'GPay' } },
        ApproverdBy: { name: 'Admin One', email: 'admin@example.com' },
      },
      {
        _id: 'e6', category: 'Under 17', type: 'mixed doubles', status: 'rejected',
        partner: { fullname: 'Gopal Krish', dob: '2006-03-20', TnBaId: 'TNBA-00102', academyName: 'Apex', place: 'Coimbatore', district: 'Coimbatore' },
        payment: { status: 'Failed', metadata: { paymentAmount: 700, paymentApp: 'GPay' } },
        ApproverdBy: { name: 'Admin One', email: 'admin@example.com' },
      },
       {
        _id: 'e7', category: 'Under 17', type: 'doubles', status: 'rejected',
        partner: { fullname: 'Gopal Krish', dob: '2006-03-20', TnBaId: 'TNBA-00102', academyName: 'Apex', place: 'Coimbatore', district: 'Coimbatore' },
        payment: { status: 'Failed', metadata: { paymentAmount: 700, paymentApp: 'GPay' } },
        ApproverdBy: { name: 'Admin One', email: 'admin@example.com' },
      },
    ],
  },
];

const mockFetchEntries = () => new Promise(resolve => 
  setTimeout(() => resolve({ success: true, data: mockEntries }), 1000)
);

// --- HELPER COMPONENTS ---

// 1. Status Badge
const StatusBadge = ({ status }) => {
  const statusClasses = useMemo(() => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-700 ring-green-600/20';
      case 'rejected': return 'bg-red-100 text-red-700 ring-red-600/20';
      case 'paid': return 'bg-blue-100 text-blue-700 ring-blue-600/20';
      case 'failed': return 'bg-orange-100 text-orange-700 ring-orange-600/20';
      case 'pending':
      default: return 'bg-yellow-100 text-yellow-700 ring-yellow-600/20';
    }
  }, [status]);

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusClasses} capitalize`}>
      {status}
    </span>
  );
};

// 2. CSV Export
const CSVExport = ({ data, columns, fileName }) => {
  const toCSV = (data) => {
    // Determine headers from columns (using a subset for clarity)
    const headerLabels = columns.map(col => col.header).join(',');
    const headerKeys = columns.map(col => col.accessor);

    // Map data to CSV rows
    const csvRows = data.map(row => {
      return headerKeys.map(key => {
        let value = row[key];
        // Handle complex objects for expansion row (if needed, simplified here)
        if (key === 'detailedEvents') {
          value = JSON.stringify(value);
        }
        // Basic escaping
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });

    return [headerLabels, ...csvRows].join('\n');
  };

  const handleExport = () => {
    const csvString = toCSV(data);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-3 py-2 bg-indigo-500 text-white rounded-xl shadow-lg hover:bg-indigo-600 transition duration-150 text-sm font-medium"
      title="Export all visible data to CSV"
    >
      <ArrowDownToLine className="w-5 h-5" />
      CSV Export
    </button>
  );
};

// 3. DetailCard for Expanded Row
const DetailCard = ({ event }) => {
  // Use status function for icon/color
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending': default: return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-100 flex flex-col md:flex-row gap-4">
      {/* Event Summary */}
      <div className="flex-1 space-y-2 border-b md:border-b-0 md:border-r border-gray-200 pr-4 pb-4 md:pb-0">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-indigo-700">
          <ClipboardList className="w-5 h-5" />
          {event.category} - {event.type.toUpperCase()}
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <DetailItem label="Status" value={<StatusBadge status={event.status} />} />
          <DetailItem label="Reg Date" value={new Date(event.RegistrationDate).toLocaleDateString()} />
        </div>
      </div>

      {/* Partner Details */}
      <div className="flex-1 space-y-2 border-b md:border-b-0 md:border-r border-gray-200 pr-4 pb-4 md:pb-0">
        <h4 className="text-base font-medium text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-500" />
          Partner Details
        </h4>
        {event.partner ? (
          <div className="text-xs text-gray-600 space-y-1">
            <DetailItem label="Name" value={event.partner.fullname} />
            <DetailItem label="TNBA ID" value={event.partner.TnBaId || 'N/A'} />
            <DetailItem label="Academy" value={event.partner.academyName} />
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">N/A (Singles Event)</p>
        )}
      </div>

      {/* Payment & Approval */}
      <div className="flex-1 space-y-2">
        <h4 className="text-base font-medium text-gray-800 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-500" />
          Transaction Status
        </h4>
        <div className="text-xs text-gray-600 space-y-1">
          <DetailItem label="Pay Status" value={<StatusBadge status={event.payment?.status || 'Pending'} />} />
          <DetailItem label="Amount" value={`₹ ${event.payment?.metadata?.paymentAmount || 'N/A'}`} />
          <DetailItem label="Approved By" value={event.ApproverdBy?.name || 'N/A'} />
          <DetailItem label="Admin Email" value={event.ApproverdBy?.email || 'N/A'} />
        </div>
        {/* Bulk Action Buttons (Mocked) */}
        <div className="pt-2 flex gap-2">
            <button className="text-xs text-green-600 hover:text-green-800 font-medium p-1 rounded-md bg-green-50 transition">Approve</button>
            <button className="text-xs text-red-600 hover:text-red-800 font-medium p-1 rounded-md bg-red-50 transition">Reject</button>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-center text-gray-700">
    <span className="font-light text-gray-500">{label}:</span>
    <span className="font-medium">{value}</span>
  </div>
);


// 4. Filter Model Component
const FilterModel = ({ filters, setFilters, availableFilters, onClose }) => {
  const [tempFilters, setTempFilters] = useState(filters);

  const handleToggle = (key, value) => {
    setTempFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-72 origin-top-right bg-white rounded-xl shadow-2xl p-4 z-50 border border-gray-200">
      <h3 className="font-bold text-lg mb-3 text-indigo-700">Filter Entries</h3>
      <div className="space-y-4">
        {Object.entries(availableFilters).map(([key, options]) => (
          <div key={key} className="border-b border-gray-100 pb-3 last:border-b-0">
            <p className="font-medium text-sm mb-2 capitalize text-gray-700">{key.replace('Filter', ' ')}</p>
            <div className="grid grid-cols-2 gap-2">
              {options.map(option => (
                <label key={option} className="flex items-center text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempFilters[key].includes(option)}
                    onChange={() => handleToggle(key, option)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition duration-150"
                  />
                  <span className="ml-2 capitalize truncate">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => { setFilters({}); onClose(); }}
          className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Clear
        </button>
        <button
          onClick={applyFilters}
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Apply
        </button>
      </div>
    </div>
  );
};


// --- MAIN PAGE COMPONENT ---

const EntriesPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [filters, setFilters] = useState({ categoryFilter: [], statusFilter: [] });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Display 10 items per page
  const [isFilterModelOpen, setIsFilterModelOpen] = useState(false);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await mockFetchEntries();
        if (result.success) {
          setData(result.data);
        } else {
          setError('Failed to fetch entries.');
        }
      } catch (err) {
        setError('An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Filtering & Searching ---
  const availableFilters = useMemo(() => {
    const categories = [...new Set(data.flatMap(e => e.detailedEvents.map(d => d.category)))];
    const statuses = [...new Set(data.flatMap(e => e.detailedEvents.map(d => d.status)))];
    return {
      categoryFilter: categories,
      statusFilter: statuses,
    };
  }, [data]);

  const filteredData = useMemo(() => {
    let currentData = data;

    // 1. Apply Search Term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      currentData = currentData.filter(item =>
        item.playerName.toLowerCase().includes(lowerSearch) ||
        item.playerTnBaId.toLowerCase().includes(lowerSearch) ||
        item.academy.toLowerCase().includes(lowerSearch) ||
        item.district.toLowerCase().includes(lowerSearch) ||
        item.categories.toLowerCase().includes(lowerSearch)
      );
    }

    // 2. Apply Category Filter
    if (filters.categoryFilter && filters.categoryFilter.length > 0) {
        currentData = currentData.filter(item => 
            item.detailedEvents.some(event => filters.categoryFilter.includes(event.category))
        );
    }

    // 3. Apply Status Filter
    if (filters.statusFilter && filters.statusFilter.length > 0) {
        currentData = currentData.filter(item => 
            item.detailedEvents.some(event => filters.statusFilter.includes(event.status))
        );
    }

    // Reset pagination to page 1 after filter/search
    setCurrentPage(1); 
    
    return currentData;
  }, [data, searchTerm, filters]);
  
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // --- Pagination Logic ---
  const currentTableData = useMemo(() => {
    const firstItemIndex = (currentPage - 1) * itemsPerPage;
    const lastItemIndex = currentPage * itemsPerPage;
    return filteredData.slice(firstItemIndex, lastItemIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- Row Selection Logic ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = currentTableData.map(item => item.id);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const isAllSelected = currentTableData.length > 0 && selectedRows.length === currentTableData.length;

  // --- Expanded Row Logic ---
  const toggleRowExpansion = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Data Table Columns Definition (Responsive) ---
  const columns = useMemo(() => [
    { header: 'Select', accessor: 'select', cell: (item) => (
      <input
        type="checkbox"
        checked={selectedRows.includes(item.id)}
        onChange={() => handleSelectRow(item.id)}
        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
      />
    ), responsive: 'always' },
    { header: 'Player Name', accessor: 'playerName', responsive: 'always', 
        cell: (item) => (
            <div>
                <p className="font-semibold text-gray-800">{item.playerName}</p>
                <p className="text-xs text-gray-500 sm:hidden">{item.categories}</p>
            </div>
        )
    },
    { header: 'TNBA ID', accessor: 'playerTnBaId', responsive: 'md-up' },
    { header: 'Events', accessor: 'eventCount', responsive: 'sm-up',
        cell: (item) => <StatusBadge status={`${item.eventCount} Events`} /> 
    },
    { header: 'Categories', accessor: 'categories', responsive: 'lg-up' },
    { header: 'Statuses', accessor: 'statuses', responsive: 'md-up',
        cell: (item) => <StatusBadge status={item.statuses.split(', ')[0]} />
    },
    { header: 'District', accessor: 'district', responsive: 'lg-up' },
    { header: 'Entry Date', accessor: 'entryDate', responsive: 'lg-up', 
        cell: (item) => new Date(item.entryDate).toLocaleDateString() 
    },
    { header: 'Details', accessor: 'details', responsive: 'always', cell: (item) => (
        <button
          onClick={() => toggleRowExpansion(item.id)}
          className="p-1 rounded-full text-indigo-600 hover:bg-indigo-50 transition"
          title="Toggle Details"
        >
          {expandedRows[item.id] ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
    ) },
  ], [selectedRows, expandedRows]);


  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <p className="ml-3 text-lg text-gray-600">Loading Entry Data...</p>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-xl">
      <h2 className="font-bold">Error:</h2>
      <p>{error}</p>
    </div>
  );


  // --- Render Functions ---

  const renderFilterModel = () => isFilterModelOpen && (
    <FilterModel
      filters={filters}
      setFilters={setFilters}
      availableFilters={availableFilters}
      onClose={() => setIsFilterModelOpen(false)}
    />
  );

  const renderBulkActions = () => (
    <div className="absolute top-0 left-0 right-0 bg-indigo-50 p-3 rounded-t-xl flex items-center justify-between shadow-md z-10">
      <span className="font-medium text-indigo-700 text-sm">
        {selectedRows.length} item{selectedRows.length !== 1 ? 's' : ''} selected
      </span>
      <div className="flex gap-3">
        <button className="flex items-center gap-1 text-sm text-green-700 hover:text-white hover:bg-green-600 px-3 py-1 rounded-lg transition bg-green-100">
          <CheckCircle className="w-4 h-4" /> Approve Bulk
        </button>
        <button className="flex items-center gap-1 text-sm text-red-700 hover:text-white hover:bg-red-600 px-3 py-1 rounded-lg transition bg-red-100">
          <Trash2 className="w-4 h-4" /> Delete Bulk
        </button>
      </div>
    </div>
  );
  
  return (
    <div className="p-4 md:p-8 bg-white rounded-2xl shadow-xl min-h-[80vh]">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2 border-b pb-2">Tournament Entries (Admin View)</h1>
      <p className="text-gray-500 mb-6">Manage and process all player registration entries.</p>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Player Name, ID, or Academy..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 items-center relative">
          <button
            onClick={() => setIsFilterModelOpen(prev => !prev)}
            className={`flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-xl shadow-sm transition duration-150 text-sm font-medium ${isFilterModelOpen ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            <Filter className="w-5 h-5" />
            Filters
            {filters.categoryFilter.length > 0 || filters.statusFilter.length > 0 ? (
              <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                {filters.categoryFilter.length + filters.statusFilter.length}
              </span>
            ) : null}
          </button>

          <CSVExport 
            data={filteredData} 
            columns={columns.filter(c => c.accessor !== 'select' && c.accessor !== 'details')}
            fileName="tournament_entries"
          />

          {renderFilterModel()}
        </div>
      </div>

      {/* DataTable */}
      <div className="relative overflow-x-auto rounded-xl border border-gray-200 shadow-lg">
        {selectedRows.length > 0 && renderBulkActions()}
        <table className="min-w-full divide-y divide-gray-200 relative">
          
          {/* Table Header */}
          <thead className="bg-gray-50 sticky top-0 z-0">
            <tr>
              <th scope="col" className="p-4 text-left text-xs font-medium text-gray-500 tracking-wider w-12">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </th>
              {columns.filter(c => c.accessor !== 'select').map(col => (
                <th
                  key={col.accessor}
                  scope="col"
                  // Apply responsive classes to headers
                  className={`p-4 text-left text-xs font-medium text-gray-500 tracking-wider 
                             ${col.responsive === 'md-up' ? 'hidden md:table-cell' : ''}
                             ${col.responsive === 'sm-up' ? 'hidden sm:table-cell' : ''}
                             ${col.responsive === 'lg-up' ? 'hidden lg:table-cell' : ''}
                             ${col.responsive === 'always' ? 'table-cell' : ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {currentTableData.length === 0 ? (
                <tr>
                    <td colSpan={columns.length} className="py-10 text-center text-gray-500">
                        No entries found matching your criteria.
                    </td>
                </tr>
            ) : (
                currentTableData.map(item => (
                <React.Fragment key={item.id}>
                  {/* Main Data Row */}
                  <tr className={`hover:bg-indigo-50 transition ${selectedRows.includes(item.id) ? 'bg-indigo-100' : ''}`}>
                    {columns.map(col => (
                      <td 
                        key={col.accessor} 
                        // Apply responsive classes to cells
                        className={`p-4 whitespace-nowrap text-sm text-gray-500 
                                     ${col.responsive === 'md-up' ? 'hidden md:table-cell' : ''}
                                     ${col.responsive === 'sm-up' ? 'hidden sm:table-cell' : ''}
                                     ${col.responsive === 'lg-up' ? 'hidden lg:table-cell' : ''}
                                     ${col.responsive === 'always' ? 'table-cell' : ''}`}
                      >
                        {col.cell ? col.cell(item) : item[col.accessor]}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Expanded Detail Row */}
                  {expandedRows[item.id] && (
                    <tr className="bg-gray-50">
                      <td colSpan={columns.length} className="p-4 border-t border-indigo-200">
                        <div className="space-y-4">
                          <h3 className="font-bold text-lg text-indigo-800 border-b pb-2 flex items-center gap-2">
                            <FileText className="w-5 h-5" /> Detailed Event Submissions ({item.detailedEvents.length})
                          </h3>
                          {item.detailedEvents.map((event, index) => (
                            <DetailCard key={event._id} event={event} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between">
        <div className="text-sm text-gray-700 mb-4 sm:mb-0">
          Showing <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-semibold">{totalItems}</span> results
        </div>
        <nav className="flex space-x-1" aria-label="Pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => paginate(page)}
              disabled={page === currentPage}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 
                ${page === currentPage 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50'
                }`}
            >
              {page}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default EntriesPage;
