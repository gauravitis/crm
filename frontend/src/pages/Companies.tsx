import React, { useState } from 'react';
import { useCompanies } from '../hooks/useCompanies';
import { Company } from '../types/company';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Switch } from '../components/ui/switch';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { toast } from 'react-toastify';

const defaultCompany: Omit<Company, 'id' | 'createdAt'> = {
  name: '',
  legalName: '',
  shortCode: '',
  address: {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  },
  contactInfo: {
    phone: '',
    email: '',
  },
  taxInfo: {
    gst: '',
    pan: '',
  },
  bankDetails: {
    bankName: '',
    accountNo: '',
    ifscCode: '',
    branchCode: '',
    microCode: '',
    accountType: '',
  },
  branding: {
    primaryColor: '#1F497D',
    sealImageUrl: '',
  },
  active: true,
};

export default function Companies() {
  const { companies, loading, addCompany, updateCompany, deleteCompany } = useCompanies();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<Partial<Company> | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

  const handleAddClick = () => {
    setCurrentCompany({ ...defaultCompany });
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleEditClick = (company: Company) => {
    setCurrentCompany(company);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = async (company: Company) => {
    if (window.confirm(`Are you sure you want to delete ${company.name}?`)) {
      try {
        await deleteCompany(company.id);
      } catch (error) {
        console.error('Error deleting company:', error);
      }
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    if (!currentCompany) return;

    // Handle nested fields
    if (field.includes('.')) {
      const [parentField, childField] = field.split('.');
      setCurrentCompany({
        ...currentCompany,
        [parentField]: {
          ...currentCompany[parentField as keyof Company],
          [childField]: value,
        },
      });
    } else {
      setCurrentCompany({
        ...currentCompany,
        [field]: value,
      });
    }
  };

  const handleSaveCompany = async () => {
    if (!currentCompany?.name) {
      toast.error('Company name is required');
      return;
    }

    if (!currentCompany?.shortCode) {
      toast.error('Short code is required for reference numbers');
      return;
    }

    try {
      if (isEditMode && currentCompany.id) {
        await updateCompany(currentCompany as Company);
      } else {
        await addCompany({
          ...currentCompany as Omit<Company, 'id'>,
          createdAt: new Date().toISOString(),
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  if (loading) {
    return <div className="p-4">Loading companies...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Companies</h1>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" /> Add Company
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="card">Card View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Legal Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.legalName}</TableCell>
                      <TableCell>{company.shortCode}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${company.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {company.active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(company)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(company)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <Card key={company.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{company.name}</CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs ${company.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {company.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-semibold">Legal Name:</span> {company.legalName}
                    </div>
                    <div>
                      <span className="text-sm font-semibold">Code:</span> {company.shortCode}
                    </div>
                    <div>
                      <span className="text-sm font-semibold">GST:</span> {company.taxInfo.gst}
                    </div>
                    <div>
                      <span className="text-sm font-semibold">PAN:</span> {company.taxInfo.pan}
                    </div>
                    <div className="pt-2 flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(company)}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(company)}>
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Company Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Company' : 'Add New Company'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <Tabs defaultValue="basic">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="address">Address & Contact</TabsTrigger>
                <TabsTrigger value="tax">Tax & Banking</TabsTrigger>
                <TabsTrigger value="branding">Branding</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name*</Label>
                    <Input 
                      id="name" 
                      value={currentCompany?.name || ''} 
                      onChange={(e) => handleInputChange('name', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legalName">Legal Name</Label>
                    <Input 
                      id="legalName" 
                      value={currentCompany?.legalName || ''} 
                      onChange={(e) => handleInputChange('legalName', e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shortCode">Short Code (for reference numbers)*</Label>
                    <Input 
                      id="shortCode" 
                      value={currentCompany?.shortCode || ''} 
                      onChange={(e) => handleInputChange('shortCode', e.target.value)} 
                    />
                    <p className="text-xs text-gray-500">E.g., CBL for Chembio Lifesciences</p>
                  </div>
                  <div className="space-y-2 flex items-center">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={currentCompany?.active || false} 
                        onCheckedChange={(checked) => handleInputChange('active', checked)} 
                      />
                      <Label>Active</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="address" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Textarea 
                    id="street" 
                    value={currentCompany?.address?.street || ''} 
                    onChange={(e) => handleInputChange('address.street', e.target.value)} 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city" 
                      value={currentCompany?.address?.city || ''} 
                      onChange={(e) => handleInputChange('address.city', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input 
                      id="state" 
                      value={currentCompany?.address?.state || ''} 
                      onChange={(e) => handleInputChange('address.state', e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input 
                      id="postalCode" 
                      value={currentCompany?.address?.postalCode || ''} 
                      onChange={(e) => handleInputChange('address.postalCode', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input 
                      id="country" 
                      value={currentCompany?.address?.country || 'India'} 
                      onChange={(e) => handleInputChange('address.country', e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      value={currentCompany?.contactInfo?.phone || ''} 
                      onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={currentCompany?.contactInfo?.email || ''} 
                      onChange={(e) => handleInputChange('contactInfo.email', e.target.value)} 
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="tax" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gst">GST Number</Label>
                    <Input 
                      id="gst" 
                      value={currentCompany?.taxInfo?.gst || ''} 
                      onChange={(e) => handleInputChange('taxInfo.gst', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pan">PAN Number</Label>
                    <Input 
                      id="pan" 
                      value={currentCompany?.taxInfo?.pan || ''} 
                      onChange={(e) => handleInputChange('taxInfo.pan', e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <h3 className="font-medium mb-2">Bank Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input 
                        id="bankName" 
                        value={currentCompany?.bankDetails?.bankName || ''} 
                        onChange={(e) => handleInputChange('bankDetails.bankName', e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountNo">Account Number</Label>
                      <Input 
                        id="accountNo" 
                        value={currentCompany?.bankDetails?.accountNo || ''} 
                        onChange={(e) => handleInputChange('bankDetails.accountNo', e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="ifscCode">IFSC Code</Label>
                      <Input 
                        id="ifscCode" 
                        value={currentCompany?.bankDetails?.ifscCode || ''} 
                        onChange={(e) => handleInputChange('bankDetails.ifscCode', e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branchCode">Branch Code</Label>
                      <Input 
                        id="branchCode" 
                        value={currentCompany?.bankDetails?.branchCode || ''} 
                        onChange={(e) => handleInputChange('bankDetails.branchCode', e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="microCode">Micro Code</Label>
                      <Input 
                        id="microCode" 
                        value={currentCompany?.bankDetails?.microCode || ''} 
                        onChange={(e) => handleInputChange('bankDetails.microCode', e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountType">Account Type</Label>
                      <Input 
                        id="accountType" 
                        value={currentCompany?.bankDetails?.accountType || ''} 
                        onChange={(e) => handleInputChange('bankDetails.accountType', e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="branding" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color (for headers)</Label>
                  <div className="flex space-x-2">
                    <input 
                      type="color"
                      id="primaryColor" 
                      value={currentCompany?.branding?.primaryColor || '#1F497D'} 
                      onChange={(e) => handleInputChange('branding.primaryColor', e.target.value)} 
                      className="h-10 w-10"
                    />
                    <Input 
                      value={currentCompany?.branding?.primaryColor || '#1F497D'} 
                      onChange={(e) => handleInputChange('branding.primaryColor', e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sealImageUrl">Company Seal Image</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <Input
                      id="sealImageUrl"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          if (file.size > 1024 * 1024) {
                            toast.error("Image size should be less than 1MB");
                            return;
                          }
                          
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            // Store as base64 data URL
                            handleInputChange('branding.sealImageUrl', reader.result as string);
                            toast.success("Company seal uploaded successfully!");
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {currentCompany?.branding?.sealImageUrl && (
                      <div className="flex flex-col space-y-2">
                        <div className="text-sm text-gray-500">Current seal:</div>
                        <div className="bg-gray-100 p-4 rounded-md flex flex-col items-center">
                          <img 
                            src={currentCompany.branding.sealImageUrl} 
                            alt="Company Seal" 
                            className="h-24 border rounded p-1 bg-white" 
                          />
                          <div className="text-xs text-gray-500 mt-2">
                            This seal will appear on all quotations generated for {currentCompany.name}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-fit text-red-500 hover:bg-red-50"
                          onClick={() => {
                            handleInputChange('branding.sealImageUrl', '');
                            toast.info("Company seal removed");
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Remove Seal
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Upload a company seal/stamp image that will appear in your quotation documents.
                    The image should be clear and preferably with a transparent background.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultTerms">Default Terms & Conditions</Label>
                  <Textarea 
                    id="defaultTerms" 
                    value={currentCompany?.defaultTerms || ''} 
                    onChange={(e) => handleInputChange('defaultTerms', e.target.value)} 
                    rows={10}
                  />
                  <p className="text-xs text-gray-500">
                    Company-specific terms & conditions to display in quotations. Leave blank to use system default.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCompany}>
              {isEditMode ? 'Update' : 'Save'} Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 