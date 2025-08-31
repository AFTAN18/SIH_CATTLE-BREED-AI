import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Database, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  FileText,
  Users,
  Settings,
  Shield,
  Activity,
  BarChart3,
  Calendar,
  MapPin,
  Tag,
  User,
  Phone,
  Home,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data for data management
const mockData = {
  animalRegistrations: [
    {
      id: 1,
      tagNumber: 'CB001',
      breed: 'Gir',
      age: 3,
      weight: 450,
      sex: 'Female',
      healthStatus: 'Healthy',
      ownerName: 'Rajesh Patel',
      phoneNumber: '+91 98765 43210',
      location: 'Gujarat',
      status: 'validated',
      createdAt: '2024-01-15',
      lastUpdated: '2024-01-20'
    },
    {
      id: 2,
      tagNumber: 'CB002',
      breed: 'Sahiwal',
      age: 2,
      weight: 380,
      sex: 'Male',
      healthStatus: 'Healthy',
      ownerName: 'Priya Sharma',
      phoneNumber: '+91 87654 32109',
      location: 'Rajasthan',
      status: 'pending',
      createdAt: '2024-01-18',
      lastUpdated: '2024-01-19'
    },
    {
      id: 3,
      tagNumber: 'CB003',
      breed: 'Murrah',
      age: 4,
      weight: 520,
      sex: 'Female',
      healthStatus: 'Under Treatment',
      ownerName: 'Amit Kumar',
      phoneNumber: '+91 76543 21098',
      location: 'Haryana',
      status: 'needsReview',
      createdAt: '2024-01-20',
      lastUpdated: '2024-01-21'
    },
    {
      id: 4,
      tagNumber: 'CB004',
      breed: 'Jaffarabadi',
      age: 1,
      weight: 280,
      sex: 'Male',
      healthStatus: 'Healthy',
      ownerName: 'Sita Devi',
      phoneNumber: '+91 65432 10987',
      location: 'Gujarat',
      status: 'validated',
      createdAt: '2024-01-22',
      lastUpdated: '2024-01-22'
    },
    {
      id: 5,
      tagNumber: 'CB005',
      breed: 'Red Sindhi',
      age: 5,
      weight: 480,
      sex: 'Female',
      healthStatus: 'Healthy',
      ownerName: 'Mohan Singh',
      phoneNumber: '+91 54321 09876',
      location: 'Punjab',
      status: 'rejected',
      createdAt: '2024-01-25',
      lastUpdated: '2024-01-26'
    }
  ],
  auditLogs: [
    {
      id: 1,
      action: 'Record Created',
      table: 'animal_registrations',
      recordId: 'CB001',
      userId: 'FLW_001',
      timestamp: '2024-01-15 10:30:00',
      details: 'New animal registration created'
    },
    {
      id: 2,
      action: 'Record Updated',
      table: 'animal_registrations',
      recordId: 'CB002',
      userId: 'FLW_045',
      timestamp: '2024-01-19 14:20:00',
      details: 'Health status updated'
    },
    {
      id: 3,
      action: 'Record Validated',
      table: 'animal_registrations',
      recordId: 'CB001',
      userId: 'ADMIN_001',
      timestamp: '2024-01-20 09:15:00',
      details: 'Record validated by admin'
    },
    {
      id: 4,
      action: 'Bulk Import',
      table: 'animal_registrations',
      recordId: 'BULK_001',
      userId: 'ADMIN_001',
      timestamp: '2024-01-21 16:45:00',
      details: '50 records imported from CSV'
    },
    {
      id: 5,
      action: 'Record Deleted',
      table: 'animal_registrations',
      recordId: 'CB006',
      userId: 'FLW_023',
      timestamp: '2024-01-22 11:30:00',
      details: 'Duplicate record removed'
    }
  ],
  dataQuality: {
    completeness: 94.2,
    accuracy: 91.8,
    consistency: 89.5,
    timeliness: 96.7,
    validity: 93.1,
    overallScore: 93.1
  }
};

const DataManagement = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState('registrations');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  const getStatusBadge = (status) => {
    const statusConfig = {
      validated: { variant: 'default', icon: CheckCircle },
      pending: { variant: 'secondary', icon: AlertCircle },
      needsReview: { variant: 'secondary', icon: AlertCircle },
      rejected: { variant: 'destructive', icon: XCircle },
      flagged: { variant: 'destructive', icon: AlertCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const filteredRecords = mockData.animalRegistrations.filter(record => {
    const matchesSearch = 
      record.tagNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRecords(currentRecords.map(record => record.id));
    } else {
      setSelectedRecords([]);
    }
  };

  const handleSelectRecord = (recordId, checked) => {
    if (checked) {
      setSelectedRecords([...selectedRecords, recordId]);
    } else {
      setSelectedRecords(selectedRecords.filter(id => id !== recordId));
    }
  };

  const handleBulkAction = (action) => {
    console.log(`Performing ${action} on ${selectedRecords.length} records`);
    // In real implementation, this would call the API
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('dataManagement.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('dataManagement.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            {t('dataManagement.importData')}
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t('dataManagement.exportData')}
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t('dataManagement.addRecord')}
          </Button>
        </div>
      </div>

      {/* Data Quality Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dataManagement.qualityScore')}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.dataQuality.overallScore}%</div>
              <p className="text-xs text-muted-foreground">
                Overall data quality
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dataManagement.completeness')}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.dataQuality.completeness}%</div>
              <p className="text-xs text-muted-foreground">
                Complete records
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dataManagement.accuracy')}
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.dataQuality.accuracy}%</div>
              <p className="text-xs text-muted-foreground">
                Accurate data
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dataManagement.consistency')}
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.dataQuality.consistency}%</div>
              <p className="text-xs text-muted-foreground">
                Consistent format
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dataManagement.timeliness')}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.dataQuality.timeliness}%</div>
              <p className="text-xs text-muted-foreground">
                Up-to-date data
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dataManagement.validity')}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.dataQuality.validity}%</div>
              <p className="text-xs text-muted-foreground">
                Valid records
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="registrations">{t('dataManagement.animalRegistrations')}</TabsTrigger>
          <TabsTrigger value="validation">{t('dataManagement.dataValidation')}</TabsTrigger>
          <TabsTrigger value="bulk">{t('dataManagement.bulkOperations')}</TabsTrigger>
          <TabsTrigger value="audit">{t('dataManagement.auditLogs')}</TabsTrigger>
        </TabsList>

        <TabsContent value="registrations" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder={t('common.search')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('dataManagement.allRecords')}</SelectItem>
                    <SelectItem value="validated">{t('dataManagement.validated')}</SelectItem>
                    <SelectItem value="pending">{t('dataManagement.pending')}</SelectItem>
                    <SelectItem value="needsReview">{t('dataManagement.needsReview')}</SelectItem>
                    <SelectItem value="rejected">{t('dataManagement.rejected')}</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  {t('common.filter')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedRecords.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {selectedRecords.length} {t('dataManagement.selected')} {t('dataManagement.records')}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('validate')}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t('dataManagement.bulkValidate')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('export')}>
                      <Download className="w-4 h-4 mr-2" />
                      {t('dataManagement.bulkExport')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('delete')}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('dataManagement.bulkDelete')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Records Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                {t('dataManagement.animalRegistrations')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRecords.length === currentRecords.length && currentRecords.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>{t('animalProfile.tagNumber')}</TableHead>
                    <TableHead>{t('identification.breed')}</TableHead>
                    <TableHead>{t('animalProfile.age')}</TableHead>
                    <TableHead>{t('animalProfile.sex')}</TableHead>
                    <TableHead>{t('animalProfile.healthStatus')}</TableHead>
                    <TableHead>{t('animalProfile.ownerName')}</TableHead>
                    <TableHead>{t('animalProfile.location')}</TableHead>
                    <TableHead>{t('dataManagement.validationStatus')}</TableHead>
                    <TableHead className="w-20">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRecords.includes(record.id)}
                          onCheckedChange={(checked) => handleSelectRecord(record.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{record.tagNumber}</TableCell>
                      <TableCell>{record.breed}</TableCell>
                      <TableCell>{record.age} {t('animalProfile.age')}</TableCell>
                      <TableCell>{record.sex}</TableCell>
                      <TableCell>{record.healthStatus}</TableCell>
                      <TableCell>{record.ownerName}</TableCell>
                      <TableCell>{record.location}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length} records
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm">
                    {t('dataManagement.page')} {currentPage} {t('dataManagement.of')} {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t('dataManagement.dataValidation')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {t('dataManagement.validationPlaceholder')}
                </p>
                <p className="text-sm text-gray-500">
                  {t('dataManagement.validationDesc')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                {t('dataManagement.bulkOperations')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {t('dataManagement.bulkPlaceholder')}
                </p>
                <p className="text-sm text-gray-500">
                  {t('dataManagement.bulkDesc')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                {t('dataManagement.auditLogs')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Record ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockData.auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>{log.table}</TableCell>
                      <TableCell>{log.recordId}</TableCell>
                      <TableCell>{log.userId}</TableCell>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell>{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataManagement;
