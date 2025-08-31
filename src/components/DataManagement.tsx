import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Database, 
  Upload, 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Filter,
  MoreVertical,
  FileText,
  Users,
  Shield,
  Activity
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import offlineStorage from '@/services/offlineStorage';

interface AnimalRecord {
  id: number;
  breedName: string;
  confidence: number;
  timestamp: string;
  userId: string;
  location?: string;
  status: 'validated' | 'pending' | 'rejected' | 'flagged';
  reviewer?: string;
  notes?: string;
}

const DataManagement: React.FC = () => {
  const { t } = useTranslation();
  const [records, setRecords] = useState<AnimalRecord[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    loadRecords();
    loadStatistics();
  }, []);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const animals = await offlineStorage.getAnimals(100);
      const mockRecords: AnimalRecord[] = animals.map((animal, index) => ({
        id: animal.id || index,
        breedName: animal.breedName,
        confidence: animal.confidence,
        timestamp: animal.timestamp,
        userId: animal.userId,
        location: animal.location ? `${animal.location.latitude.toFixed(4)}, ${animal.location.longitude.toFixed(4)}` : undefined,
        status: ['validated', 'pending', 'rejected', 'flagged'][Math.floor(Math.random() * 4)] as any,
        reviewer: Math.random() > 0.5 ? `Expert_${Math.floor(Math.random() * 100)}` : undefined,
        notes: Math.random() > 0.7 ? 'Additional verification needed' : undefined
      }));
      
      setRecords(mockRecords);
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await offlineStorage.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.breedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.userId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const toggleRecordSelection = (id: number) => {
    setSelectedRecords(prev => 
      prev.includes(id) 
        ? prev.filter(recordId => recordId !== id)
        : [...prev, id]
    );
  };

  const selectAllRecords = () => {
    setSelectedRecords(paginatedRecords.map(record => record.id));
  };

  const deselectAllRecords = () => {
    setSelectedRecords([]);
  };

  const bulkUpdateStatus = async (status: string) => {
    try {
      // Mock bulk update
      setRecords(prev => prev.map(record => 
        selectedRecords.includes(record.id) 
          ? { ...record, status: status as any }
          : record
      ));
      setSelectedRecords([]);
      console.log(`Updated ${selectedRecords.length} records to ${status}`);
    } catch (error) {
      console.error('Bulk update failed:', error);
    }
  };

  const exportData = async (format: 'csv' | 'excel' | 'json') => {
    try {
      const dataToExport = selectedRecords.length > 0 
        ? records.filter(record => selectedRecords.includes(record.id))
        : filteredRecords;
      
      const exportData = {
        records: dataToExport,
        exportDate: new Date().toISOString(),
        totalRecords: dataToExport.length,
        format
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cattle-data-${Date.now()}.${format}`;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      validated: 'default',
      pending: 'secondary',
      rejected: 'destructive',
      flagged: 'outline'
    };
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('dataManagement.title')}</h1>
          <p className="text-gray-600">{t('dataManagement.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={() => exportData('csv')} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => exportData('excel')} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{statistics.totalAnimals}</div>
              <p className="text-sm text-gray-600">Total Animals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{statistics.totalBreeds}</div>
              <p className="text-sm text-gray-600">Breeds Supported</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{statistics.unsyncedCount}</div>
              <p className="text-sm text-gray-600">Pending Sync</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(statistics.storageUsage.percentage)}%
              </div>
              <p className="text-sm text-gray-600">Storage Used</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Data Management Interface */}
      <Tabs defaultValue="records" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="records">Animal Records</TabsTrigger>
          <TabsTrigger value="validation">Data Validation</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        {/* Records Tab */}
        <TabsContent value="records" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by breed, user, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="validated">Validated</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Bulk Actions */}
              {selectedRecords.length > 0 && (
                <div className="flex items-center gap-3 mt-4 p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedRecords.length} records selected
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => bulkUpdateStatus('validated')}>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Validate
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus('rejected')}>
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => exportData('csv')}>
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Records Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Animal Registration Records</CardTitle>
                  <CardDescription>
                    Showing {paginatedRecords.length} of {filteredRecords.length} records
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllRecords}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAllRecords}>
                    Deselect All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading records...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">
                          <Checkbox 
                            checked={selectedRecords.length === paginatedRecords.length}
                            onCheckedChange={(checked) => {
                              if (checked) selectAllRecords();
                              else deselectAllRecords();
                            }}
                          />
                        </th>
                        <th className="text-left p-3">Breed</th>
                        <th className="text-left p-3">Confidence</th>
                        <th className="text-left p-3">User</th>
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRecords.map((record) => (
                        <tr key={record.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <Checkbox 
                              checked={selectedRecords.includes(record.id)}
                              onCheckedChange={() => toggleRecordSelection(record.id)}
                            />
                          </td>
                          <td className="p-3 font-medium">{record.breedName}</td>
                          <td className="p-3">{record.confidence}%</td>
                          <td className="p-3">{record.userId}</td>
                          <td className="p-3">{new Date(record.timestamp).toLocaleDateString()}</td>
                          <td className="p-3">{getStatusBadge(record.status)}</td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost">
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * recordsPerPage) + 1} to {Math.min(currentPage * recordsPerPage, filteredRecords.length)} of {filteredRecords.length} records
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Validation</CardTitle>
              <CardDescription>Validate and ensure data quality across all records</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Data Validation Tools</h3>
              <p className="text-gray-600">Advanced validation tools will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Operations Tab */}
        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Operations</CardTitle>
              <CardDescription>Perform bulk operations on multiple records</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Database className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Bulk Operation Tools</h3>
              <p className="text-gray-600">Bulk operation tools will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage Field Level Workers and their permissions</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">User Management System</h3>
              <p className="text-gray-600">User management tools will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataManagement;
