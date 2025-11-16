// AcademyReportPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Chip,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  FormGroup,
  FormControlLabel,
  IconButton,
  Tooltip,
  TablePagination,
} from '@mui/material';
import {
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
} from '@mui/icons-material';
import { API_URL } from '../../config';
import axios from "axios";
import { toast } from "react-hot-toast";

const AcademyReportPage = () => {
  // State management
  const [filters, setFilters] = useState({
    eventStatus: '',
    eventCategory: '',
    eventType: '',
    academy: '',
    partner: '',
    player: '',
    gender: '',
    dateFrom: '',
    dateTo: '',
  });
  const [selectedFields, setSelectedFields] = useState({
    // Player fields
    playerName: true,
    playerTnBaId: true,
    playerDob: false,
    playerGender: true,
    // Academy & Location fields
    academyName: true,
    district: true,
    place: true,
    // Event fields
    eventCategory: true,
    eventType: true,
    eventStatus: true,
    registrationDate: false,
    // Payment fields
    paymentStatus: true,
    paymentAmount: false,
    paymentApp: false,
    // Partner fields
    partnerName: true,
    partnerTnBaId: false,
    partnerAcademy: false,
    partnerDistrict: false,
    partnerPlace: false,
    partnerGender: false,
  });
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Available options for filters
  const filterOptions = {
    eventStatus: ['pending', 'approved', 'rejected'],
    eventCategory: ['Under 09', 'Under 11', 'Under 13', 'Under 15', 'Under 17', 'Under 19'],
    eventType: ['singles', 'doubles', 'mixed doubles'],
    paymentStatus: ['Paid', 'Failed', 'Pending'],
    gender: ['male', 'female'],
  };

  // Field configuration for table headers
  const fieldConfig = {
    playerName: { label: 'PLAYER NAME', key: 'playerName' },
    playerTnBaId: { label: 'TNBA ID', key: 'playerTnBaId' },
    playerDob: { label: 'DOB', key: 'playerDob' },
    playerGender: { label: 'GENDER', key: 'playerGender' },
    academyName: { label: 'ACADEMY', key: 'academyName' },
    district: { label: 'DISTRICT', key: 'district' },
    place: { label: 'PLACE', key: 'place' },
    eventCategory: { label: 'CATEGORY', key: 'eventCategory' },
    eventType: { label: 'EVENT TYPE', key: 'eventType' },
    eventStatus: { label: 'EVENT STATUS', key: 'eventStatus' },
    registrationDate: { label: 'REG DATE', key: 'registrationDate' },
    paymentStatus: { label: 'PAYMENT STATUS', key: 'paymentStatus' },
    paymentAmount: { label: 'PAYMENT AMOUNT', key: 'paymentAmount' },
    paymentApp: { label: 'PAYMENT APP', key: 'paymentApp' },
    partnerName: { label: 'PARTNER NAME', key: 'partnerName' },
    partnerTnBaId: { label: 'PARTNER TNBA ID', key: 'partnerTnBaId' },
    partnerAcademy: { label: 'PARTNER ACADEMY', key: 'partnerAcademy' },
    partnerDistrict: { label: 'PARTNER DISTRICT', key: 'partnerDistrict' },
    partnerPlace: { label: 'PARTNER PLACE', key: 'partnerPlace' },
    partnerGender: { label: 'PARTNER GENDER', key: 'partnerGender' },
  };

  // Helper function to format gender for display
  const formatGenderDisplay = (gender) => {
    if (!gender) return 'N/A';
    return gender === 'male' ? 'Boys' : 'Girls';
  };

  // Helper function to format gender for export
  const formatGenderExport = (gender) => {
    if (!gender) return 'N/A';
    return gender === 'male' ? 'Boys' : 'Girls';
  };

  // Fetch report data using getFilteredEventsForReport API
  const fetchReportData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Build query parameters from filters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          // Map filter names to API parameter names
          const apiParam = mapFilterToApiParam(key);
          if (apiParam) params.append(apiParam, value);
        }
      });

      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/v2/academy/entry/admin/academy-export-report?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const data = response.data.data || [];
        console.log("Academy Report Data:", data);
        
        setReportData(data);
        setFilteredData(data);
        toast.success(`Loaded ${data.length} academy entries`);
      } else {
        setError(response.data.msg || 'Failed to fetch academy report data');
        toast.error(response.data.msg || 'Failed to fetch academy report data');
      }
    } catch (err) {
      console.error('Fetch academy report error:', err);
      const errorMsg = err.response?.data?.msg || 'Failed to fetch academy report data';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Map frontend filter names to API parameter names
  const mapFilterToApiParam = (filterName) => {
    const mapping = {
      eventStatus: 'status',
      eventCategory: 'category',
      eventType: 'type',
      academy: 'academy',
      partner: 'partner',
      player: 'player',
      gender: 'gender',
      dateFrom: 'startDate',
      dateTo: 'endDate'
    };
    return mapping[filterName] || filterName;
  };

  // Apply table filters locally
  const applyTableFilters = () => {
    let filtered = [...reportData];

    // Apply event status filter
    if (filters.eventStatus) {
      filtered = filtered.filter(event => 
        event.eventStatus === filters.eventStatus
      );
    }

    // Apply event category filter
    if (filters.eventCategory) {
      filtered = filtered.filter(event => 
        event.eventCategory === filters.eventCategory
      );
    }

    // Apply event type filter
    if (filters.eventType) {
      filtered = filtered.filter(event => 
        event.eventType === filters.eventType
      );
    }

    // Apply gender filter
    if (filters.gender) {
      filtered = filtered.filter(event => 
        event.player?.gender === filters.gender
      );
    }

    // Apply academy filter
    if (filters.academy) {
      filtered = filtered.filter(event => 
        event.Academy?.academyName?.toLowerCase().includes(filters.academy.toLowerCase())
      );
    }

    // Apply player filter
    if (filters.player) {
      filtered = filtered.filter(event => 
        event.player?.fullName?.toLowerCase().includes(filters.player.toLowerCase())
      );
    }

    // Apply partner filter
    if (filters.partner) {
      filtered = filtered.filter(event => 
        event.partner?.fullName?.toLowerCase().includes(filters.partner.toLowerCase())
      );
    }

    // Apply date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.registrationDate);
        const fromDate = new Date(filters.dateFrom);
        return eventDate >= fromDate;
      });
    }

    if (filters.dateTo) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.registrationDate);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        return eventDate <= toDate;
      });
    }

    setFilteredData(filtered);
    setPage(0);
  };

  // Export to CSV
  const exportToCSV = () => {
    setExporting(true);
    try {
      const data = prepareExportData();
      if (data.length === 0) {
        toast.error('No data to export');
        setExporting(false);
        return;
      }

      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generateFilename('csv');
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('CSV exported successfully');
    } catch (err) {
      const errorMsg = 'Export error: ' + err.message;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setExporting(false);
    }
  };

  // Export to Excel
  const exportToExcel = async () => {
    setExporting(true);
    try {
      const data = prepareExportData();
      if (data.length === 0) {
        toast.error('No data to export');
        setExporting(false);
        return;
      }

      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'AcademyEntries');
      
      // Auto-size columns
      const colWidths = Object.keys(data[0]).map(key => ({
        wch: Math.max(...data.map(row => String(row[key] || '').length), key.length)
      }));
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, generateFilename('xlsx'));
      toast.success('Excel file exported successfully');
    } catch (err) {
      const errorMsg = 'Export error: ' + err.message;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setExporting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB');
    } catch (error) {
      return 'N/A';
    }
  };

  // Prepare data for export
  const prepareExportData = () => {
    return filteredData.map((event, index) => {
      const row = { 'S.NO': index + 1 };
      
      // Player Information
      if (selectedFields.playerName) {
        // Format PLAYER NAME based on event type
        if (event.eventType === 'singles') {
          // Singles format: Player Name only
          row['PLAYER NAME'] = event.player?.fullName || 'N/A';
        } else {
          // Doubles/Mixed Doubles format: Player Name - Partner Name
          const partnerName = event.partner?.fullName || 'N/A';
          row['PLAYER NAME'] = `${event.player?.fullName || 'N/A'} - ${partnerName}`;
        }
      }
      
      if (selectedFields.playerTnBaId) {
        row['TNBA ID'] = event.player?.tnbaId || 'N/A';
      }
      
      if (selectedFields.playerDob) {
        row['DOB'] = formatDate(event.player?.dob) || 'N/A';
      }

      if (selectedFields.playerGender) {
        row['GENDER'] = formatGenderExport(event.player?.gender) || 'N/A';
      }
      
      // Academy Information
      if (selectedFields.academyName) {
        row['ACADEMY'] = event.Academy?.academyName || 'N/A';
      }
      
      if (selectedFields.district) {
        row['DISTRICT'] = event.player?.district || 'N/A';
      }
      
      if (selectedFields.place) {
        row['PLACE'] = event.player?.place || 'N/A';
      }
      
      // Event Information
      if (selectedFields.eventCategory) {
        row['CATEGORY'] = event.eventCategory || 'N/A';
      }
      
      if (selectedFields.eventType) {
        row['EVENT TYPE'] = event.eventType || 'N/A';
      }
      
      if (selectedFields.eventStatus) {
        row['EVENT STATUS'] = event.eventStatus || 'N/A';
      }
      
      if (selectedFields.registrationDate) {
        row['REGISTRATION DATE'] = formatDate(event.registrationDate) || 'N/A';
      }
      
      // Payment Information
      if (selectedFields.paymentStatus) {
        row['PAYMENT STATUS'] = event.payment?.status || 'N/A';
      }
      
      if (selectedFields.paymentAmount) {
        row['PAYMENT AMOUNT'] = event.payment?.paymentAmount || 'N/A';
      }
      
      if (selectedFields.paymentApp) {
        row['PAYMENT APP'] = event.paymentProof?.paymentApp || 'N/A';
      }
      
      // Partner Information (only for doubles/mixed)
      if (selectedFields.partnerName && event.eventType !== 'singles') {
        row['PARTNER NAME'] = event.partner?.fullName || 'N/A';
      }
      
      if (selectedFields.partnerTnBaId && event.eventType !== 'singles') {
        row['PARTNER TNBA ID'] = event.partner?.TnBaId || 'N/A';
      }
      
      if (selectedFields.partnerAcademy && event.eventType !== 'singles') {
        row['PARTNER ACADEMY'] = event.partner?.academyName || 'N/A';
      }
      
      if (selectedFields.partnerDistrict && event.eventType !== 'singles') {
        row['PARTNER DISTRICT'] = event.partner?.district || 'N/A';
      }
      
      if (selectedFields.partnerPlace && event.eventType !== 'singles') {
        row['PARTNER PLACE'] = event.partner?.place || 'N/A';
      }

      if (selectedFields.partnerGender && event.eventType !== 'singles') {
        row['PARTNER GENDER'] = formatGenderExport(event.partner?.gender) || 'N/A';
      }
      
      return row;
    });
  };

  // Generate filename based on filters
  const generateFilename = (extension) => {
    const date = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const category = filters.eventCategory ? filters.eventCategory.replace(' ', '') : 'All';
    const type = filters.eventType ? 
      filters.eventType.charAt(0).toUpperCase() + filters.eventType.slice(1).replace(' ', '') : 'All';
    const gender = filters.gender ? formatGenderExport(filters.gender) : 'All';
    
    return `Academy${gender}${category}${type}Report-${date}.${extension}`;
  };

  // Handle filter changes
  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Handle field selection changes
  const handleFieldToggle = (field) => (event) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      eventStatus: '',
      eventCategory: '',
      eventType: '',
      academy: '',
      partner: '',
      player: '',
      gender: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  // Select all fields
  const selectAllFields = () => {
    const allFields = {};
    Object.keys(selectedFields).forEach(key => {
      allFields[key] = true;
    });
    setSelectedFields(allFields);
  };

  // Deselect all fields
  const deselectAllFields = () => {
    const noFields = {};
    Object.keys(selectedFields).forEach(key => {
      noFields[key] = false;
    });
    setSelectedFields(noFields);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get cell value based on field key
  const getCellValue = (event, fieldKey) => {
    switch (fieldKey) {
      case 'playerName':
        return event.player?.fullName || 'N/A';
      case 'playerTnBaId':
        return event.player?.tnbaId || 'N/A';
      case 'playerDob':
        return formatDate(event.player?.dob) || 'N/A';
      case 'playerGender':
        return formatGenderDisplay(event.player?.gender) || 'N/A';
      case 'academyName':
        return event.Academy?.academyName || 'N/A';
      case 'district':
        return event.player?.district || 'N/A';
      case 'place':
        return event.player?.place || 'N/A';
      case 'eventCategory':
        return event.eventCategory || 'N/A';
      case 'eventType':
        return event.eventType || 'N/A';
      case 'eventStatus':
        return event.eventStatus || 'N/A';
      case 'registrationDate':
        return formatDate(event.registrationDate) || 'N/A';
      case 'paymentStatus':
        return event.payment?.status || 'N/A';
      case 'paymentAmount':
        return event.payment?.paymentAmount || 'N/A';
      case 'paymentApp':
        return event.paymentProof?.paymentApp || 'N/A';
      case 'partnerName':
        return event.eventType !== 'singles' ? (event.partner?.fullName || 'N/A') : 'N/A';
      case 'partnerTnBaId':
        return event.eventType !== 'singles' ? (event.partner?.TnBaId || 'N/A') : 'N/A';
      case 'partnerAcademy':
        return event.eventType !== 'singles' ? (event.partner?.academyName || 'N/A') : 'N/A';
      case 'partnerDistrict':
        return event.eventType !== 'singles' ? (event.partner?.district || 'N/A') : 'N/A';
      case 'partnerPlace':
        return event.eventType !== 'singles' ? (event.partner?.place || 'N/A') : 'N/A';
      case 'partnerGender':
        return event.eventType !== 'singles' ? (formatGenderDisplay(event.partner?.gender) || 'N/A') : 'N/A';
      default:
        return 'N/A';
    }
  };

  // Render cell content based on field type
  const renderCellContent = (event, fieldKey, value) => {
    switch (fieldKey) {
      case 'eventType':
        return (
          <Chip
            label={value}
            size="small"
            color={
              value === 'singles' ? 'default' :
              value === 'doubles' ? 'primary' : 'secondary'
            }
            variant="outlined"
          />
        );
      case 'eventStatus':
        return (
          <Chip
            label={value}
            size="small"
            color={
              value === 'approved' ? 'success' :
              value === 'pending' ? 'warning' : 'error'
            }
            variant="outlined"
          />
        );
      case 'paymentStatus':
        return (
          <Chip
            label={value}
            size="small"
            color={
              value === 'Paid' ? 'success' :
              value === 'Pending' ? 'warning' : 'error'
            }
            variant="outlined"
          />
        );
      case 'playerName':
        return (
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {value}
            </Typography>
            {event.eventType !== 'singles' && event.partner?.fullName && (
              <Typography variant="caption" color="text.secondary">
                + {event.partner.fullName}
              </Typography>
            )}
          </Box>
        );
      case 'playerGender':
      case 'partnerGender':
        const rawGender = fieldKey === 'playerGender' ? event.player?.gender : event.partner?.gender;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {rawGender === 'female' ? (
              <FemaleIcon color="secondary" fontSize="small" />
            ) : rawGender === 'male' ? (
              <MaleIcon color="primary" fontSize="small" />
            ) : null}
            <Typography variant="body2">
              {value}
            </Typography>
          </Box>
        );
      default:
        return value;
    }
  };

  // Get selected table columns
  const getTableColumns = () => {
    const columns = [
      { key: 'sno', label: 'S.NO', alwaysShow: true }
    ];

    // Add selected fields as columns
    Object.entries(selectedFields).forEach(([field, isSelected]) => {
      if (isSelected && fieldConfig[field]) {
        columns.push({
          key: field,
          label: fieldConfig[field].label,
          fieldKey: fieldConfig[field].key
        });
      }
    });

    return columns;
  };

  // Apply filters when they change
  useEffect(() => {
    if (reportData.length > 0) {
      applyTableFilters();
    }
  }, [filters, reportData]);

  // Initial data load
  useEffect(() => {
    fetchReportData();
  }, []);

  // Get paginated data
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const tableColumns = getTableColumns();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Academy Entries Report
      </Typography>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Filters Card */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterIcon sx={{ mr: 1 }} />
              Filters
              {getActiveFilterCount() > 0 && (
                <Chip 
                  label={`${getActiveFilterCount()} active`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <Tooltip title="Clear all filters">
              <IconButton 
                onClick={clearFilters} 
                disabled={getActiveFilterCount() === 0}
                color="primary"
              >
                <ClearIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Grid container spacing={2}>
            {/* Event Status */}
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <TextField
                fullWidth
                select
                label="Event Status"
                value={filters.eventStatus}
                onChange={handleFilterChange('eventStatus')}
                size="small"
              >
                <MenuItem value="">All Status</MenuItem>
                {filterOptions.eventStatus.map(status => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Event Category */}
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <TextField
                fullWidth
                select
                label="Event Category"
                value={filters.eventCategory}
                onChange={handleFilterChange('eventCategory')}
                size="small"
              >
                <MenuItem value="">All Categories</MenuItem>
                {filterOptions.eventCategory.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Event Type */}
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <TextField
                fullWidth
                select
                label="Event Type"
                value={filters.eventType}
                onChange={handleFilterChange('eventType')}
                size="small"
              >
                <MenuItem value="">All Types</MenuItem>
                {filterOptions.eventType.map(type => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Gender Filter */}
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <TextField
                fullWidth
                select
                label="Gender"
                value={filters.gender}
                onChange={handleFilterChange('gender')}
                size="small"
              >
                <MenuItem value="">All Genders</MenuItem>
                {filterOptions.gender.map(gender => (
                  <MenuItem key={gender} value={gender}>
                    {gender === 'male' ? 'Boys' : 'Girls'}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Academy */}
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <TextField
                fullWidth
                label="Academy"
                value={filters.academy}
                onChange={handleFilterChange('academy')}
                placeholder="Enter academy"
                size="small"
              />
            </Grid>

            {/* Player */}
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <TextField
                fullWidth
                label="Player"
                value={filters.player}
                onChange={handleFilterChange('player')}
                placeholder="Enter player name"
                size="small"
              />
            </Grid>

            {/* Partner */}
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <TextField
                fullWidth
                label="Partner"
                value={filters.partner}
                onChange={handleFilterChange('partner')}
                placeholder="Enter partner name"
                size="small"
              />
            </Grid>

            {/* Date From */}
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <TextField
                fullWidth
                label="From Date"
                type="date"
                value={filters.dateFrom}
                onChange={handleFilterChange('dateFrom')}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>

            {/* Date To */}
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <TextField
                fullWidth
                label="To Date"
                type="date"
                value={filters.dateTo}
                onChange={handleFilterChange('dateTo')}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  onClick={fetchReportData}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                  fullWidth
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Field Selection Card */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Select Fields to Export
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" onClick={selectAllFields}>
                Select All
              </Button>
              <Button size="small" onClick={deselectAllFields}>
                Deselect All
              </Button>
            </Box>
          </Box>
          
          <Grid container spacing={3}>
            {/* Player Fields */}
            <Grid item xs={12} md={6} lg={3}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Player Information
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFields.playerName}
                      onChange={handleFieldToggle('playerName')}
                    />
                  }
                  label="Player Name"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFields.playerTnBaId}
                      onChange={handleFieldToggle('playerTnBaId')}
                    />
                  }
                  label="TnBa ID"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFields.playerDob}
                      onChange={handleFieldToggle('playerDob')}
                    />
                  }
                  label="Date of Birth"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFields.playerGender}
                      onChange={handleFieldToggle('playerGender')}
                    />
                  }
                  label="Gender"
                />
              </FormGroup>
            </Grid>

            {/* Academy & Location */}
            <Grid item xs={12} md={6} lg={3}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Player Other Details
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFields.academyName}
                      onChange={handleFieldToggle('academyName')}
                    />
                  }
                  label="Academy Name"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFields.district}
                      onChange={handleFieldToggle('district')}
                    />
                  }
                  label="District"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFields.place}
                      onChange={handleFieldToggle('place')}
                    />
                  }
                  label="Place"
                />
              </FormGroup>
            </Grid>

            {/* Event Information */}
            <Grid item xs={12} md={6} lg={3}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Event Information
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFields.eventCategory}
                      onChange={handleFieldToggle('eventCategory')}
                    />
                  }
                  label="Event Category"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFields.eventType}
                      onChange={handleFieldToggle('eventType')}
                    />
                  }
                  label="Event Type"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFields.eventStatus}
                      onChange={handleFieldToggle('eventStatus')}
                    />
                  }
                  label="Event Status"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFields.registrationDate}
                      onChange={handleFieldToggle('registrationDate')}
                    />
                  }
                  label="Registration Date"
                />
              </FormGroup>
            </Grid>

            {/* Payment & Partner */}
            <Grid item xs={12} md={6} lg={3}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Payment & Partner
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFields.paymentStatus}
                      onChange={handleFieldToggle('paymentStatus')}
                    />
                  }
                  label="Payment Status"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFields.paymentAmount}
                      onChange={handleFieldToggle('paymentAmount')}
                    />
                  }
                  label="Payment Amount"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFields.paymentApp}
                      onChange={handleFieldToggle('paymentApp')}
                    />
                  }
                  label="Payment App"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFields.partnerName}
                      onChange={handleFieldToggle('partnerName')}
                    />
                  }
                  label="Partner Name"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFields.partnerTnBaId}
                      onChange={handleFieldToggle('partnerTnBaId')}
                    />
                  }
                  label="Partner TnBa ID"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFields.partnerAcademy}
                      onChange={handleFieldToggle('partnerAcademy')}
                    />
                  }
                  label="Partner Academy"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFields.partnerDistrict}
                      onChange={handleFieldToggle('partnerDistrict')}
                    />
                  }
                  label="Partner District"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFields.partnerPlace}
                      onChange={handleFieldToggle('partnerPlace')}
                    />
                  }
                  label="Partner Place"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFields.partnerGender}
                      onChange={handleFieldToggle('partnerGender')}
                    />
                  }
                  label="Partner Gender"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Export Buttons & Data Summary */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={exporting ? <CircularProgress size={20} /> : <DownloadIcon />}
            onClick={exportToCSV}
            disabled={exporting || filteredData.length === 0}
            color="success"
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button
            variant="contained"
            startIcon={exporting ? <CircularProgress size={20} /> : <DownloadIcon />}
            onClick={exportToExcel}
            disabled={exporting || filteredData.length === 0}
            color="primary"
          >
            {exporting ? 'Exporting...' : 'Export Excel'}
          </Button>
        </Box>
        
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          {filteredData.length} records found {reportData.length !== filteredData.length && 
            `(filtered from ${reportData.length} total)`
          }
        </Typography>
      </Box>

      {/* Data Preview with Table */}
      <Card sx={{ boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Data Preview ({tableColumns.length - 1} columns selected)
          </Typography>
          
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {tableColumns.map((column) => (
                    <TableCell key={column.key}>
                      <strong>{column.label}</strong>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((row, index) => (
                  <TableRow key={`${row.eventId}-${index}`} hover>
                    {tableColumns.map((column) => (
                      <TableCell key={column.key}>
                        {column.key === 'sno' ? (
                          <strong>{page * rowsPerPage + index + 1}</strong>
                        ) : (
                          renderCellContent(row, column.key, getCellValue(row, column.key))
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Table Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ borderTop: '1px solid', borderColor: 'divider' }}
          />

          {filteredData.length === 0 && !loading && (
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ p: 3, textAlign: 'center' }}
            >
              No academy entries found matching your filters.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AcademyReportPage;